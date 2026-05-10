-- ===================================
-- Yemen Safe - Database Schema
-- نظام يمن سيف - قاعدة البيانات
-- ===================================

CREATE DATABASE IF NOT EXISTS `yemen_safe` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `yemen_safe`;

-- === جدول الأدوار ===
CREATE TABLE `roles` (
    `id` VARCHAR(50) PRIMARY KEY,
    `label` VARCHAR(100) NOT NULL,
    `color` VARCHAR(20) DEFAULT '#666',
    `icon` VARCHAR(50) DEFAULT 'fas fa-user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- === جدول المستخدمين ===
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` VARCHAR(20) UNIQUE,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150),
    `phone` VARCHAR(20),
    `role_id` VARCHAR(50) NOT NULL,
    `avatar` VARCHAR(10) DEFAULT '',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB;

-- === جدول الصلاحيات ===
CREATE TABLE `permissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
    UNIQUE KEY `unique_role_action` (`role_id`, `action`)
) ENGINE=InnoDB;

-- === جدول صفحات الصلاحيات ===
CREATE TABLE `role_pages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` VARCHAR(50) NOT NULL,
    `page` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB;

-- === جدول أنواع الحوادث ===
CREATE TABLE `incident_types` (
    `id` VARCHAR(50) PRIMARY KEY,
    `label` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(50),
    `color` VARCHAR(20),
    `css_class` VARCHAR(50)
) ENGINE=InnoDB;

-- === جدول الحوادث ===
CREATE TABLE `incidents` (
    `id` VARCHAR(20) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type_id` VARCHAR(50) NOT NULL,
    `priority` ENUM('critical', 'urgent', 'normal', 'low') DEFAULT 'normal',
    `status` ENUM('new', 'investigating', 'responding', 'resolved', 'closed') DEFAULT 'new',
    `location` VARCHAR(200),
    `date` DATE NOT NULL,
    `time` TIME NOT NULL,
    `reporter` VARCHAR(100),
    `assigned_to` VARCHAR(100),
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`type_id`) REFERENCES `incident_types`(`id`)
) ENGINE=InnoDB;

-- === جدول صور الحوادث ===
CREATE TABLE `incident_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `incident_id` VARCHAR(20) NOT NULL,
    `image_path` VARCHAR(500) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- === جدول إجراءات الحوادث ===
CREATE TABLE `incident_actions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `incident_id` VARCHAR(20) NOT NULL,
    `action_text` TEXT NOT NULL,
    `created_by` VARCHAR(100),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- === جدول الإشعارات ===
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT,
    `type` VARCHAR(50) DEFAULT 'system',
    `icon` VARCHAR(50) DEFAULT 'fas fa-bell',
    `color` VARCHAR(20) DEFAULT '#666',
    `user_id` INT,
    `is_read` TINYINT(1) DEFAULT 0,
    `time` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- === جدول سجل الأنشطة ===
CREATE TABLE `activity_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` TEXT NOT NULL,
    `color` VARCHAR(20) DEFAULT 'primary',
    `user_id` INT,
    `time` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- === جدول إعدادات النظام ===
CREATE TABLE `system_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- إدخال البيانات الافتراضية
-- ===================================

-- الأدوار
INSERT INTO `roles` (`id`, `label`, `color`, `icon`) VALUES
('admin', 'مدير النظام', '#e74c3c', 'fas fa-crown'),
('safety_officer', 'ضابط السلامة', '#0066cc', 'fas fa-shield-alt'),
('ops_manager', 'مدير العمليات', '#2ecc71', 'fas fa-cogs'),
('maint_supervisor', 'مشرف الصيانة', '#f39c12', 'fas fa-wrench'),
('crew_member', 'عضو طاقم', '#9b59b6', 'fas fa-user-tie'),
('ground_staff', 'موظف أرضي', '#1abc9c', 'fas fa-users');

-- المستخدمين (كلمة المرور مشفرة بـ password_hash)
INSERT INTO `users` (`employee_id`, `username`, `password`, `name`, `email`, `phone`, `role_id`, `avatar`) VALUES
('EMP-1001', 'admin', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'المدير العام', 'admin@yemenia.com', '777000001', 'admin', 'م.ع'),
('EMP-1002', 'ahmed', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'أحمد محمد السعيدي', 'ahmed@yemenia.com', '777000002', 'safety_officer', 'أ.م'),
('EMP-1003', 'omar', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'عمر علي الحداد', 'omar@yemenia.com', '777000003', 'ops_manager', 'ع.ع'),
('EMP-1004', 'fatima', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'فاطمة عبدالله ناصر', 'fatima@yemenia.com', '777000004', 'maint_supervisor', 'ف.ع'),
('EMP-1005', 'ali', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'علي سالم المقطري', 'ali@yemenia.com', '777000005', 'crew_member', 'ع.س'),
('EMP-1006', 'sara', '$2y$10$8K1IuO0uBJcRAJYhZ.CJxeR3tRz2y1H8mF5kQ5W5R9v5bN3M5Y5V6', 'سارة حسين العمري', 'sara@yemenia.com', '777000006', 'ground_staff', 'س.ح');

-- الصلاحيات
INSERT INTO `permissions` (`role_id`, `action`) VALUES
('admin', 'view_all'), ('admin', 'create_incident'), ('admin', 'edit_incident'), ('admin', 'delete_incident'),
('admin', 'change_status'), ('admin', 'assign_tasks'), ('admin', 'manage_users'), ('admin', 'view_reports'),
('safety_officer', 'view_all'), ('safety_officer', 'create_incident'), ('safety_officer', 'edit_incident'),
('safety_officer', 'change_status'), ('safety_officer', 'assign_tasks'), ('safety_officer', 'view_reports'),
('ops_manager', 'view_all'), ('ops_manager', 'create_incident'), ('ops_manager', 'change_status'), ('ops_manager', 'view_reports'),
('maint_supervisor', 'view_assigned'), ('maint_supervisor', 'create_incident'), ('maint_supervisor', 'change_status'),
('crew_member', 'view_own'), ('crew_member', 'create_incident'),
('ground_staff', 'view_own'), ('ground_staff', 'create_incident');

-- صفحات الصلاحيات
INSERT INTO `role_pages` (`role_id`, `page`) VALUES
('admin', 'dashboard.html'), ('admin', 'incidents.html'), ('admin', 'reports.html'), ('admin', 'notifications.html'), ('admin', 'settings.html'),
('safety_officer', 'dashboard.html'), ('safety_officer', 'incidents.html'), ('safety_officer', 'reports.html'), ('safety_officer', 'notifications.html'), ('safety_officer', 'settings.html'),
('ops_manager', 'dashboard.html'), ('ops_manager', 'incidents.html'), ('ops_manager', 'reports.html'), ('ops_manager', 'notifications.html'), ('ops_manager', 'settings.html'),
('maint_supervisor', 'incidents.html'), ('maint_supervisor', 'notifications.html'), ('maint_supervisor', 'settings.html'),
('crew_member', 'incidents.html'), ('crew_member', 'notifications.html'), ('crew_member', 'settings.html'),
('ground_staff', 'incidents.html'), ('ground_staff', 'notifications.html'), ('ground_staff', 'settings.html');

-- أنواع الحوادث
INSERT INTO `incident_types` (`id`, `label`, `icon`, `color`, `css_class`) VALUES
('fire', 'حريق', 'fas fa-fire', '#e74c3c', 'type-fire'),
('mechanical', 'عطل ميكانيكي', 'fas fa-cogs', '#f39c12', 'type-mechanical'),
('security', 'أمني', 'fas fa-shield-alt', '#3498db', 'type-security'),
('medical', 'طبي', 'fas fa-heartbeat', '#e91e63', 'type-medical'),
('weather', 'جوي', 'fas fa-cloud-rain', '#00bcd4', 'type-weather'),
('ground', 'أرضي', 'fas fa-road', '#795548', 'type-ground'),
('bird_strike', 'اصطدام طيور', 'fas fa-dove', '#ff9800', 'type-bird'),
('fod', 'أجسام غريبة', 'fas fa-exclamation-triangle', '#9c27b0', 'type-fod');

-- بيانات حوادث نموذجية
INSERT INTO `incidents` (`id`, `title`, `type_id`, `priority`, `status`, `location`, `date`, `time`, `reporter`, `assigned_to`, `description`) VALUES
('INC-2024-001', 'إنذار حريق في المحرك الأيمن', 'fire', 'critical', 'resolved', 'مطار عدن الدولي', '2024-12-15', '08:30:00', 'أحمد محمد السعيدي', 'عمر علي الحداد', 'تم رصد إنذار حريق في المحرك الأيمن للطائرة رقم 7O-ADA أثناء التشغيل'),
('INC-2024-002', 'عطل في نظام الهبوط', 'mechanical', 'urgent', 'investigating', 'مطار صنعاء الدولي', '2024-12-14', '14:20:00', 'فاطمة عبدالله ناصر', 'فاطمة عبدالله ناصر', 'إنذار عطل في نظام الهبوط للطائرة 7O-ADC'),
('INC-2024-003', 'محاولة دخول غير مصرح', 'security', 'urgent', 'responding', 'مطار عدن الدولي', '2024-12-13', '22:45:00', 'علي سالم المقطري', 'أحمد محمد السعيدي', 'رصد شخص يحاول الدخول لمنطقة محظورة'),
('INC-2024-004', 'حالة إغماء راكب', 'medical', 'normal', 'resolved', 'رحلة IY-601', '2024-12-12', '11:15:00', 'سارة حسين العمري', 'علي سالم المقطري', 'إغماء راكب على متن الرحلة'),
('INC-2024-005', 'رياح شديدة تؤثر على الهبوط', 'weather', 'urgent', 'closed', 'مطار سيئون', '2024-12-11', '16:00:00', 'عمر علي الحداد', 'عمر علي الحداد', 'رياح عرضية شديدة تتجاوز الحدود المسموحة'),
('INC-2024-006', 'تسرب وقود من الخزان', 'mechanical', 'critical', 'new', 'مطار عدن الدولي', '2024-12-10', '09:00:00', 'فاطمة عبدالله ناصر', '', 'اكتشاف تسرب وقود من الخزان الرئيسي'),
('INC-2024-007', 'اصطدام طائر أثناء الإقلاع', 'bird_strike', 'normal', 'resolved', 'مطار صنعاء الدولي', '2024-12-09', '07:30:00', 'أحمد محمد السعيدي', 'أحمد محمد السعيدي', 'اصطدام طائر بمحرك الطائرة أثناء الإقلاع'),
('INC-2024-008', 'وجود جسم غريب على المدرج', 'fod', 'normal', 'closed', 'مطار عدن الدولي', '2024-12-08', '13:45:00', 'سارة حسين العمري', 'سارة حسين العمري', 'العثور على قطعة معدنية على المدرج الرئيسي');

-- إشعارات نموذجية
INSERT INTO `notifications` (`title`, `message`, `type`, `icon`, `color`, `is_read`, `time`) VALUES
('حادث جديد مسجل', 'تم تسجيل حادث حريق في مطار عدن', 'incident', 'fas fa-fire', '#e74c3c', 0, 'منذ 5 دقائق'),
('تحديث حالة حادث', 'تم تحديث حالة INC-2024-002 إلى قيد التحقيق', 'update', 'fas fa-sync', '#3498db', 0, 'منذ 15 دقيقة'),
('مهمة جديدة', 'تم تعيينك كمسؤول عن حادث INC-2024-003', 'assignment', 'fas fa-user-plus', '#2ecc71', 0, 'منذ 30 دقيقة'),
('حادث تم حله', 'تم حل حادث INC-2024-004 بنجاح', 'resolved', 'fas fa-check-circle', '#27ae60', 1, 'منذ ساعة'),
('تنبيه نظام', 'يرجى تحديث كلمة المرور الخاصة بك', 'system', 'fas fa-cog', '#95a5a6', 1, 'منذ ساعتين');

-- إعدادات النظام
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('language', 'ar'),
('timezone', 'Asia/Aden'),
('auto_escalation', '1'),
('auto_backup', '1'),
('system_version', '2.1.0');
