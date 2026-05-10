<?php
/**
 * Yemen Safe - API الإعدادات
 * Settings API
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'profile':
        if ($method === 'PUT') updateProfile();
        else getProfile();
        break;
    case 'password':
        changePassword();
        break;
    case 'system':
        if ($method === 'PUT') updateSystemSettings();
        else getSystemSettings();
        break;
    case 'roles':
        getRoles();
        break;
    default:
        getProfile();
}

function getProfile() {
    $userId = requireAuth();
    $db = getDB();

    $stmt = $db->prepare("
        SELECT u.id, u.username, u.name, u.email, u.phone, u.role_id, u.avatar,
               r.label as role_label
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    jsonResponse($stmt->fetch());
}

function updateProfile() {
    $userId = requireAuth();
    $data = getRequestBody();
    $db = getDB();

    $fields = [];
    $params = [];

    foreach (['name', 'email', 'phone'] as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = ?";
            $params[] = $data[$f];
        }
    }

    if (empty($fields)) jsonResponse(['error' => 'لا توجد بيانات للتحديث'], 400);

    $params[] = $userId;
    $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")
       ->execute($params);

    jsonResponse(['success' => true, 'message' => 'تم حفظ التغييرات بنجاح']);
}

function changePassword() {
    $userId = requireAuth();
    $data = getRequestBody();
    $db = getDB();

    if (empty($data['current_password']) || empty($data['new_password'])) {
        jsonResponse(['error' => 'يرجى ملء جميع الحقول'], 400);
    }

    $user = $db->prepare("SELECT password FROM users WHERE id = ?");
    $user->execute([$userId]);
    $user = $user->fetch();

    if (!password_verify($data['current_password'], $user['password']) && $data['current_password'] !== $user['password']) {
        jsonResponse(['error' => 'كلمة المرور الحالية غير صحيحة'], 400);
    }

    if (strlen($data['new_password']) < 4) {
        jsonResponse(['error' => 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'], 400);
    }

    $hashed = password_hash($data['new_password'], PASSWORD_DEFAULT);
    $db->prepare("UPDATE users SET password = ? WHERE id = ?")
       ->execute([$hashed, $userId]);

    jsonResponse(['success' => true, 'message' => 'تم تغيير كلمة المرور بنجاح']);
}

function getSystemSettings() {
    requirePermission('manage_users');
    $db = getDB();

    $stmt = $db->query("SELECT setting_key, setting_value FROM system_settings");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    jsonResponse($settings);
}

function updateSystemSettings() {
    requirePermission('manage_users');
    $data = getRequestBody();
    $db = getDB();

    $stmt = $db->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
                          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

    foreach ($data as $key => $value) {
        $stmt->execute([$key, $value]);
    }

    jsonResponse(['success' => true, 'message' => 'تم حفظ إعدادات النظام']);
}

function getRoles() {
    requireAuth();
    $db = getDB();
    $stmt = $db->query("SELECT * FROM roles ORDER BY id");
    jsonResponse(['roles' => $stmt->fetchAll()]);
}
