<?php
/**
 * Yemen Safe - API الحوادث
 * Incidents CRUD API
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) getIncident($id);
        else listIncidents();
        break;
    case 'POST':
        createIncident();
        break;
    case 'PUT':
        if ($id) updateIncident($id);
        else jsonResponse(['error' => 'يرجى تحديد رقم الحادث'], 400);
        break;
    case 'DELETE':
        if ($id) deleteIncident($id);
        else jsonResponse(['error' => 'يرجى تحديد رقم الحادث'], 400);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function listIncidents() {
    $userId = requireAuth();
    $db = getDB();

    // الحصول على صلاحيات المستخدم
    $user = $db->prepare("SELECT * FROM users WHERE id = ?")->execute([$userId]);
    $user = $db->prepare("SELECT * FROM users WHERE id = ?");
    $user->execute([$userId]);
    $user = $user->fetch();

    $permsStmt = $db->prepare("SELECT action FROM permissions WHERE role_id = ?");
    $permsStmt->execute([$user['role_id']]);
    $perms = $permsStmt->fetchAll(PDO::FETCH_COLUMN);

    // بناء الاستعلام حسب الصلاحيات
    $sql = "SELECT i.*, it.label as type_label, it.icon as type_icon, it.color as type_color
            FROM incidents i JOIN incident_types it ON it.id = i.type_id";
    $params = [];

    if (in_array('view_all', $perms)) {
        // يمكنه رؤية جميع الحوادث
    } elseif (in_array('view_assigned', $perms)) {
        $sql .= " WHERE (i.assigned_to = ? OR i.reporter = ?)";
        $params = [$user['name'], $user['name']];
    } elseif (in_array('view_own', $perms)) {
        $sql .= " WHERE i.reporter = ?";
        $params = [$user['name']];
    }

    // فلاتر اختيارية
    $filters = [];
    if (!empty($_GET['type'])) { $filters[] = "i.type_id = ?"; $params[] = $_GET['type']; }
    if (!empty($_GET['status'])) { $filters[] = "i.status = ?"; $params[] = $_GET['status']; }
    if (!empty($_GET['priority'])) { $filters[] = "i.priority = ?"; $params[] = $_GET['priority']; }
    if (!empty($_GET['from'])) { $filters[] = "i.date >= ?"; $params[] = $_GET['from']; }
    if (!empty($_GET['to'])) { $filters[] = "i.date <= ?"; $params[] = $_GET['to']; }
    if (!empty($_GET['search'])) {
        $filters[] = "(i.title LIKE ? OR i.id LIKE ? OR i.location LIKE ?)";
        $s = '%' . $_GET['search'] . '%';
        $params = array_merge($params, [$s, $s, $s]);
    }

    if (!empty($filters)) {
        $sql .= (strpos($sql, 'WHERE') !== false ? ' AND ' : ' WHERE ') . implode(' AND ', $filters);
    }

    $sql .= " ORDER BY i.created_at DESC";

    // ترقيم الصفحات
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = intval($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;

    // العدد الإجمالي
    $countSql = preg_replace('/SELECT .* FROM/', 'SELECT COUNT(*) FROM', $sql);
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    $sql .= " LIMIT $limit OFFSET $offset";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $incidents = $stmt->fetchAll();

    // إضافة الصور لكل حادث
    foreach ($incidents as &$inc) {
        $imgStmt = $db->prepare("SELECT image_path FROM incident_images WHERE incident_id = ?");
        $imgStmt->execute([$inc['id']]);
        $inc['images'] = $imgStmt->fetchAll(PDO::FETCH_COLUMN);

        $actStmt = $db->prepare("SELECT action_text FROM incident_actions WHERE incident_id = ? ORDER BY created_at");
        $actStmt->execute([$inc['id']]);
        $inc['actions'] = $actStmt->fetchAll(PDO::FETCH_COLUMN);
    }

    jsonResponse([
        'incidents' => $incidents,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit)
    ]);
}

function getIncident($id) {
    requireAuth();
    $db = getDB();

    $stmt = $db->prepare("
        SELECT i.*, it.label as type_label, it.icon as type_icon, it.color as type_color
        FROM incidents i JOIN incident_types it ON it.id = i.type_id
        WHERE i.id = ?
    ");
    $stmt->execute([$id]);
    $incident = $stmt->fetch();

    if (!$incident) jsonResponse(['error' => 'الحادث غير موجود'], 404);

    // الصور
    $imgStmt = $db->prepare("SELECT image_path FROM incident_images WHERE incident_id = ?");
    $imgStmt->execute([$id]);
    $incident['images'] = $imgStmt->fetchAll(PDO::FETCH_COLUMN);

    // الإجراءات
    $actStmt = $db->prepare("SELECT * FROM incident_actions WHERE incident_id = ? ORDER BY created_at");
    $actStmt->execute([$id]);
    $incident['actions'] = $actStmt->fetchAll();

    jsonResponse($incident);
}

function createIncident() {
    requirePermission('create_incident');
    $data = getRequestBody();
    $db = getDB();

    $required = ['title', 'type', 'priority', 'location'];
    foreach ($required as $field) {
        if (empty($data[$field])) jsonResponse(['error' => "حقل $field مطلوب"], 400);
    }

    // توليد رقم حادث جديد
    $countStmt = $db->query("SELECT COUNT(*) FROM incidents");
    $count = $countStmt->fetchColumn() + 1;
    $id = 'INC-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

    $stmt = $db->prepare("
        INSERT INTO incidents (id, title, type_id, priority, status, location, date, time, reporter, assigned_to, description)
        VALUES (?, ?, ?, ?, 'new', ?, CURDATE(), CURTIME(), ?, ?, ?)
    ");
    $stmt->execute([
        $id, $data['title'], $data['type'], $data['priority'],
        $data['location'], $data['reporter'] ?? '', $data['assigned_to'] ?? '', $data['description'] ?? ''
    ]);

    // حفظ الصور إذا وُجدت
    if (!empty($data['images'])) {
        foreach ($data['images'] as $img) {
            if (strpos($img, 'data:image') === 0) {
                $filename = $id . '_' . uniqid() . '.jpg';
                $filepath = UPLOAD_DIR . $filename;
                $imgData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $img));
                file_put_contents($filepath, $imgData);
                $db->prepare("INSERT INTO incident_images (incident_id, image_path) VALUES (?, ?)")
                   ->execute([$id, 'backend/uploads/' . $filename]);
            }
        }
    }

    jsonResponse(['success' => true, 'message' => "تم تسجيل الحادث $id بنجاح", 'id' => $id], 201);
}

function updateIncident($id) {
    requirePermission('edit_incident');
    $data = getRequestBody();
    $db = getDB();

    $stmt = $db->prepare("SELECT id FROM incidents WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonResponse(['error' => 'الحادث غير موجود'], 404);

    $fields = [];
    $params = [];
    $allowed = ['title', 'priority', 'status', 'location', 'assigned_to', 'description'];

    foreach ($allowed as $field) {
        if (isset($data[$field])) {
            $dbField = $field === 'type' ? 'type_id' : $field;
            $fields[] = "$dbField = ?";
            $params[] = $data[$field];
        }
    }

    if (isset($data['type'])) {
        $fields[] = "type_id = ?";
        $params[] = $data['type'];
    }

    if (!empty($fields)) {
        $params[] = $id;
        $db->prepare("UPDATE incidents SET " . implode(', ', $fields) . " WHERE id = ?")
           ->execute($params);
    }

    // إضافة إجراء إذا وُجد
    if (!empty($data['action_note'])) {
        $db->prepare("INSERT INTO incident_actions (incident_id, action_text, created_by) VALUES (?, ?, ?)")
           ->execute([$id, $data['action_note'], $data['updated_by'] ?? '']);
    }

    jsonResponse(['success' => true, 'message' => 'تم تحديث الحادث بنجاح']);
}

function deleteIncident($id) {
    requirePermission('delete_incident');
    $db = getDB();

    $stmt = $db->prepare("SELECT id FROM incidents WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonResponse(['error' => 'الحادث غير موجود'], 404);

    $db->prepare("DELETE FROM incidents WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'تم حذف الحادث بنجاح']);
}
