<?php
/**
 * Yemen Safe - إعدادات قاعدة البيانات
 * Database Configuration
 */

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'yemen_safe');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// إعدادات عامة
define('APP_NAME', 'Yemen Safe - يمن سيف');
define('APP_VERSION', '2.1.0');
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// إنشاء مجلد الرفع إذا لم يكن موجوداً
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

/**
 * الاتصال بقاعدة البيانات
 */
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'فشل الاتصال بقاعدة البيانات: ' . $e->getMessage()], 500);
            exit;
        }
    }
    return $pdo;
}

/**
 * إرسال استجابة JSON
 */
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * قراءة body الطلب كـ JSON
 */
function getRequestBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

/**
 * التحقق من المصادقة عبر Session
 */
function requireAuth() {
    session_start();
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['error' => 'غير مصرح - يرجى تسجيل الدخول'], 401);
    }
    return $_SESSION['user_id'];
}

/**
 * التحقق من صلاحية محددة
 */
function requirePermission($action) {
    $userId = requireAuth();
    $db = getDB();

    $stmt = $db->prepare("
        SELECT COUNT(*) FROM permissions p
        JOIN users u ON u.role_id = p.role_id
        WHERE u.id = ? AND p.action = ?
    ");
    $stmt->execute([$userId, $action]);

    if ($stmt->fetchColumn() == 0) {
        jsonResponse(['error' => 'ليس لديك صلاحية لتنفيذ هذا الإجراء'], 403);
    }
    return $userId;
}

// معالجة طلبات OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(204);
    exit;
}
