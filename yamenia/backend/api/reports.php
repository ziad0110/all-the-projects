<?php
/**
 * Yemen Safe - API التقارير
 * Reports & Export API
 */
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? 'stats';

switch ($action) {
    case 'stats':
        getReportStats();
        break;
    case 'export':
        exportCSV();
        break;
    default:
        getReportStats();
}

function getReportStats() {
    requirePermission('view_reports');
    $db = getDB();

    $from = $_GET['from'] ?? date('Y-01-01');
    $to = $_GET['to'] ?? date('Y-12-31');

    $totalStmt = $db->prepare("SELECT COUNT(*) FROM incidents WHERE date BETWEEN ? AND ?");
    $totalStmt->execute([$from, $to]);
    $total = $totalStmt->fetchColumn();

    $resolvedStmt = $db->prepare("SELECT COUNT(*) FROM incidents WHERE date BETWEEN ? AND ? AND status IN ('resolved','closed')");
    $resolvedStmt->execute([$from, $to]);
    $resolved = $resolvedStmt->fetchColumn();

    // توزيع الأولويات
    $priorityStmt = $db->prepare("
        SELECT priority, COUNT(*) as count FROM incidents
        WHERE date BETWEEN ? AND ?
        GROUP BY priority
    ");
    $priorityStmt->execute([$from, $to]);

    // توزيع المواقع
    $locationStmt = $db->prepare("
        SELECT location, COUNT(*) as count FROM incidents
        WHERE date BETWEEN ? AND ?
        GROUP BY location ORDER BY count DESC LIMIT 6
    ");
    $locationStmt->execute([$from, $to]);

    jsonResponse([
        'total' => (int)$total,
        'resolved' => (int)$resolved,
        'closure_rate' => $total > 0 ? round(($resolved / $total) * 100) : 0,
        'priority_distribution' => $priorityStmt->fetchAll(),
        'location_distribution' => $locationStmt->fetchAll(),
        'period' => ['from' => $from, 'to' => $to]
    ]);
}

function exportCSV() {
    requirePermission('view_reports');
    $db = getDB();

    $from = $_GET['from'] ?? date('Y-01-01');
    $to = $_GET['to'] ?? date('Y-12-31');

    $stmt = $db->prepare("
        SELECT i.id, i.title, it.label as type, i.priority, i.status,
               i.location, i.date, i.time, i.reporter, i.assigned_to
        FROM incidents i JOIN incident_types it ON it.id = i.type_id
        WHERE i.date BETWEEN ? AND ?
        ORDER BY i.date DESC
    ");
    $stmt->execute([$from, $to]);
    $incidents = $stmt->fetchAll();

    // أسماء الأولويات والحالات بالعربية
    $priorities = ['critical' => 'حرج', 'urgent' => 'عاجل', 'normal' => 'عادي', 'low' => 'منخفض'];
    $statuses = ['new' => 'جديد', 'investigating' => 'قيد التحقيق', 'responding' => 'قيد الاستجابة', 'resolved' => 'تم الحل', 'closed' => 'مغلق'];

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="yemen_safe_report_' . date('Y-m-d') . '.csv"');

    $output = fopen('php://output', 'w');
    // BOM for Arabic in Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, ['رقم الحادث', 'العنوان', 'النوع', 'الأولوية', 'الحالة', 'الموقع', 'التاريخ', 'الوقت', 'المُبلّغ', 'المسؤول']);

    foreach ($incidents as $inc) {
        fputcsv($output, [
            $inc['id'], $inc['title'], $inc['type'],
            $priorities[$inc['priority']] ?? $inc['priority'],
            $statuses[$inc['status']] ?? $inc['status'],
            $inc['location'], $inc['date'], $inc['time'],
            $inc['reporter'], $inc['assigned_to'] ?: '-'
        ]);
    }

    fclose($output);
    exit;
}
