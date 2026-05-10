<?php
/**
 * Yemen Safe - API الإشعارات
 * Notifications API
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        listNotifications();
        break;
    case 'PUT':
        if ($action === 'read_all') markAllRead();
        elseif ($id) markRead($id);
        else jsonResponse(['error' => 'يرجى تحديد الإشعار'], 400);
        break;
    case 'DELETE':
        if ($id) deleteNotification($id);
        else jsonResponse(['error' => 'يرجى تحديد الإشعار'], 400);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function listNotifications() {
    requireAuth();
    $db = getDB();

    $type = $_GET['type'] ?? '';
    $sql = "SELECT * FROM notifications";
    $params = [];

    if ($type && $type !== 'all') {
        $sql .= " WHERE type = ?";
        $params[] = $type;
    }

    $sql .= " ORDER BY created_at DESC LIMIT 50";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $notifications = $stmt->fetchAll();
    $unread = $db->query("SELECT COUNT(*) FROM notifications WHERE is_read = 0")->fetchColumn();

    jsonResponse(['notifications' => $notifications, 'unread_count' => $unread]);
}

function markRead($id) {
    requireAuth();
    $db = getDB();
    $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true]);
}

function markAllRead() {
    requireAuth();
    $db = getDB();
    $db->exec("UPDATE notifications SET is_read = 1");
    jsonResponse(['success' => true, 'message' => 'تم تعليم جميع الإشعارات كمقروءة']);
}

function deleteNotification($id) {
    requireAuth();
    $db = getDB();
    $db->prepare("DELETE FROM notifications WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'تم حذف الإشعار']);
}
