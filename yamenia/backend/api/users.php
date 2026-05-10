<?php
/**
 * Yemen Safe - API المستخدمين
 * Users CRUD API
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) getUser($id);
        else listUsers();
        break;
    case 'POST':
        createUser();
        break;
    case 'PUT':
        if ($id) updateUser($id);
        else jsonResponse(['error' => 'يرجى تحديد المستخدم'], 400);
        break;
    case 'DELETE':
        if ($id) deleteUser($id);
        else jsonResponse(['error' => 'يرجى تحديد المستخدم'], 400);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function listUsers() {
    requirePermission('manage_users');
    $db = getDB();

    $stmt = $db->query("
        SELECT u.id, u.username, u.name, u.email, u.phone, u.role_id, u.avatar, u.status, u.created_at,
               r.label as role_label, r.color as role_color, r.icon as role_icon
        FROM users u JOIN roles r ON r.id = u.role_id
        ORDER BY u.created_at DESC
    ");

    jsonResponse(['users' => $stmt->fetchAll()]);
}

function getUser($id) {
    requireAuth();
    $db = getDB();

    $stmt = $db->prepare("
        SELECT u.id, u.username, u.name, u.email, u.phone, u.role_id, u.avatar, u.status,
               r.label as role_label, r.color as role_color
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
    ");
    $stmt->execute([$id]);
    $user = $stmt->fetch();

    if (!$user) jsonResponse(['error' => 'المستخدم غير موجود'], 404);
    jsonResponse($user);
}

function createUser() {
    requirePermission('manage_users');
    $data = getRequestBody();
    $db = getDB();

    $required = ['username', 'password', 'name', 'role_id'];
    foreach ($required as $f) {
        if (empty($data[$f])) jsonResponse(['error' => "حقل $f مطلوب"], 400);
    }

    // التحقق من عدم تكرار اسم المستخدم
    $check = $db->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$data['username']]);
    if ($check->fetch()) jsonResponse(['error' => 'اسم المستخدم موجود بالفعل'], 400);

    $hashedPass = password_hash($data['password'], PASSWORD_DEFAULT);

    $stmt = $db->prepare("
        INSERT INTO users (username, password, name, email, phone, role_id, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['username'], $hashedPass, $data['name'],
        $data['email'] ?? '', $data['phone'] ?? '',
        $data['role_id'], $data['avatar'] ?? ''
    ]);

    jsonResponse(['success' => true, 'message' => 'تم إنشاء المستخدم بنجاح', 'id' => $db->lastInsertId()], 201);
}

function updateUser($id) {
    $currentUserId = requireAuth();
    $db = getDB();

    // يمكن للمستخدم تعديل نفسه أو المسؤول تعديل الآخرين
    if ($id != $currentUserId) {
        requirePermission('manage_users');
    }

    $data = getRequestBody();
    $fields = [];
    $params = [];

    $allowed = ['name', 'email', 'phone', 'avatar', 'status', 'role_id'];
    foreach ($allowed as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = ?";
            $params[] = $data[$f];
        }
    }

    // تغيير كلمة المرور
    if (!empty($data['new_password'])) {
        if ($id == $currentUserId && !empty($data['current_password'])) {
            $user = $db->prepare("SELECT password FROM users WHERE id = ?");
            $user->execute([$id]);
            $user = $user->fetch();
            if (!password_verify($data['current_password'], $user['password']) && $data['current_password'] !== $user['password']) {
                jsonResponse(['error' => 'كلمة المرور الحالية غير صحيحة'], 400);
            }
        }
        $fields[] = "password = ?";
        $params[] = password_hash($data['new_password'], PASSWORD_DEFAULT);
    }

    if (empty($fields)) jsonResponse(['error' => 'لا توجد بيانات للتحديث'], 400);

    $params[] = $id;
    $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")
       ->execute($params);

    jsonResponse(['success' => true, 'message' => 'تم تحديث البيانات بنجاح']);
}

function deleteUser($id) {
    $currentUserId = requirePermission('manage_users');
    if ($id == $currentUserId) jsonResponse(['error' => 'لا يمكنك حذف حسابك الخاص'], 400);

    $db = getDB();
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonResponse(['error' => 'المستخدم غير موجود'], 404);

    $db->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'تم حذف المستخدم بنجاح']);
}
