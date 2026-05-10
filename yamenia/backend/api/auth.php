<?php
/**
 * Yemen Safe - API المصادقة
 * Authentication API: login, logout, session
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        handleLogin();
        break;

    case 'logout':
        handleLogout();
        break;

    case 'session':
        getSession();
        break;

    default:
        jsonResponse(['error' => 'إجراء غير معروف'], 400);
}

function handleLogin() {
    $data = getRequestBody();
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';

    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'يرجى إدخال اسم المستخدم وكلمة المرور'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.*, r.label as role_label, r.color as role_color, r.icon as role_icon
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.username = ? AND u.status = 'active'
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['error' => 'اسم المستخدم غير موجود'], 401);
    }

    // التحقق من كلمة المرور (دعم النص العادي للتوافق + bcrypt)
    $validPassword = false;
    if (password_verify($password, $user['password'])) {
        $validPassword = true;
    } elseif ($user['password'] === $password) {
        // توافق مع كلمات المرور القديمة ثم تحديثها
        $validPassword = true;
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$hashed, $user['id']]);
    }

    if (!$validPassword) {
        jsonResponse(['error' => 'كلمة المرور غير صحيحة'], 401);
    }

    // التحقق من الدور إذا تم تحديده
    if (!empty($role) && $user['role_id'] !== $role) {
        jsonResponse(['error' => 'الدور المحدد لا يتطابق مع حسابك'], 401);
    }

    // الحصول على الصلاحيات
    $permsStmt = $db->prepare("SELECT action FROM permissions WHERE role_id = ?");
    $permsStmt->execute([$user['role_id']]);
    $permissions = $permsStmt->fetchAll(PDO::FETCH_COLUMN);

    $pagesStmt = $db->prepare("SELECT page FROM role_pages WHERE role_id = ?");
    $pagesStmt->execute([$user['role_id']]);
    $pages = $pagesStmt->fetchAll(PDO::FETCH_COLUMN);

    // إنشاء الجلسة
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role_id'];

    // إرجاع بيانات المستخدم (بدون كلمة المرور)
    unset($user['password']);
    $user['permissions'] = $permissions;
    $user['pages'] = $pages;

    jsonResponse([
        'success' => true,
        'message' => 'تم تسجيل الدخول بنجاح',
        'user' => $user
    ]);
}

function handleLogout() {
    session_start();
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'تم تسجيل الخروج بنجاح']);
}

function getSession() {
    session_start();
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['authenticated' => false]);
    }

    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.name, u.email, u.phone, u.role_id, u.avatar,
               r.label as role_label, r.color as role_color
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        session_destroy();
        jsonResponse(['authenticated' => false]);
    }

    $permsStmt = $db->prepare("SELECT action FROM permissions WHERE role_id = ?");
    $permsStmt->execute([$user['role_id']]);
    $user['permissions'] = $permsStmt->fetchAll(PDO::FETCH_COLUMN);

    $pagesStmt = $db->prepare("SELECT page FROM role_pages WHERE role_id = ?");
    $pagesStmt->execute([$user['role_id']]);
    $user['pages'] = $pagesStmt->fetchAll(PDO::FETCH_COLUMN);

    jsonResponse(['authenticated' => true, 'user' => $user]);
}
