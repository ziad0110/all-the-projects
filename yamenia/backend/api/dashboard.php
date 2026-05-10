<?php
/**
 * Yemen Safe - API لوحة التحكم
 * Dashboard Stats API
 */
require_once __DIR__ . '/../config.php';

requireAuth();
$db = getDB();

// إحصائيات عامة
$today = date('Y-m-d');
$weekAgo = date('Y-m-d', strtotime('-7 days'));
$monthAgo = date('Y-m-d', strtotime('-30 days'));

$todayCount = $db->prepare("SELECT COUNT(*) FROM incidents WHERE date = ?");
$todayCount->execute([$today]);

$weekCount = $db->prepare("SELECT COUNT(*) FROM incidents WHERE date >= ?");
$weekCount->execute([$weekAgo]);

$monthCount = $db->prepare("SELECT COUNT(*) FROM incidents WHERE date >= ?");
$monthCount->execute([$monthAgo]);

$totalCount = $db->query("SELECT COUNT(*) FROM incidents")->fetchColumn();
$resolvedCount = $db->query("SELECT COUNT(*) FROM incidents WHERE status IN ('resolved','closed')")->fetchColumn();
$closureRate = $totalCount > 0 ? round(($resolvedCount / $totalCount) * 100) : 0;

// بيانات شهرية للرسم البياني
$monthlyData = ['labels' => [], 'incidents' => [], 'resolved' => []];
for ($m = 1; $m <= 12; $m++) {
    $monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    $monthlyData['labels'][] = $monthNames[$m - 1];

    $year = date('Y');
    $stmt = $db->prepare("SELECT COUNT(*) FROM incidents WHERE MONTH(date) = ? AND YEAR(date) = ?");
    $stmt->execute([$m, $year]);
    $monthlyData['incidents'][] = (int)$stmt->fetchColumn();

    $stmt = $db->prepare("SELECT COUNT(*) FROM incidents WHERE MONTH(date) = ? AND YEAR(date) = ? AND status IN ('resolved','closed')");
    $stmt->execute([$m, $year]);
    $monthlyData['resolved'][] = (int)$stmt->fetchColumn();
}

// توزيع الأنواع
$typeStmt = $db->query("
    SELECT it.label, COUNT(i.id) as count, it.color
    FROM incident_types it
    LEFT JOIN incidents i ON i.type_id = it.id
    GROUP BY it.id
    HAVING count > 0
    ORDER BY count DESC
");
$typeData = $typeStmt->fetchAll();

// آخر الحوادث
$recentStmt = $db->query("
    SELECT i.*, it.label as type_label, it.icon as type_icon, it.color as type_color
    FROM incidents i JOIN incident_types it ON it.id = i.type_id
    ORDER BY i.created_at DESC LIMIT 6
");

// سجل الأنشطة
$activityStmt = $db->query("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10");

jsonResponse([
    'stats' => [
        'todayIncidents' => (int)$todayCount->fetchColumn(),
        'weekIncidents' => (int)$weekCount->fetchColumn(),
        'monthIncidents' => (int)$monthCount->fetchColumn(),
        'closureRate' => $closureRate,
        'totalIncidents' => (int)$totalCount,
        'resolvedIncidents' => (int)$resolvedCount,
    ],
    'monthlyData' => $monthlyData,
    'typeDistribution' => [
        'labels' => array_column($typeData, 'label'),
        'data' => array_map('intval', array_column($typeData, 'count')),
        'colors' => array_column($typeData, 'color'),
    ],
    'recentIncidents' => $recentStmt->fetchAll(),
    'activityLog' => $activityStmt->fetchAll(),
]);
