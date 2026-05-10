// ===== Yemen Safe - Mock Data =====
// This file contains all mock data for the application.
// When the database is connected, replace these with API calls.
// Version: 2.1.0 | Updated: 2026

const MockData = {
    // === Users ===
    users: [
        { id: 1, name: 'أحمد محمد العامري', username: 'ahmed', password: '123456', role: 'safety_officer', avatar: 'أع', email: 'ahmed@yemenia.com', phone: '+967 771 234 567', employeeId: 'EMP-1001' },
        { id: 2, name: 'محمد علي الحداد', username: 'mohammed', password: '123456', role: 'operations_manager', avatar: 'مح', email: 'mohammed@yemenia.com', phone: '+967 772 345 678', employeeId: 'EMP-1002' },
        { id: 3, name: 'عبدالله صالح النعمان', username: 'abdullah', password: '123456', role: 'field_employee', avatar: 'عن', email: 'abdullah@yemenia.com', phone: '+967 773 456 789', employeeId: 'EMP-1003' },
        { id: 4, name: 'خالد حسن المقطري', username: 'khaled', password: '123456', role: 'field_supervisor', avatar: 'خم', email: 'khaled@yemenia.com', phone: '+967 774 567 890', employeeId: 'EMP-1004' },
        { id: 5, name: 'سامي أحمد الوصابي', username: 'sami', password: '123456', role: 'maintenance_team', avatar: 'سو', email: 'sami@yemenia.com', phone: '+967 775 678 901', employeeId: 'EMP-1005' },
        { id: 6, name: 'ياسر عبدالرحمن الشرعبي', username: 'yaser', password: '123456', role: 'medic', avatar: 'يش', email: 'yaser@yemenia.com', phone: '+967 776 789 012', employeeId: 'EMP-1006' },
    ],

    // === Role Labels ===
    roles: {
        'admin': { label: 'مدير النظام', color: '#e74c3c', icon: 'fas fa-crown' },
        'operations_manager': { label: 'مدير العمليات', color: '#0055a5', icon: 'fas fa-chart-line' },
        'safety_officer': { label: 'ضابط السلامة', color: '#003366', icon: 'fas fa-shield-alt' },
        'field_supervisor': { label: 'المشرف الميداني', color: '#f39c12', icon: 'fas fa-user-tie' },
        'field_employee': { label: 'موظف الساحة', color: '#27ae60', icon: 'fas fa-hard-hat' },
        'maintenance_team': { label: 'فريق الصيانة', color: '#e67e22', icon: 'fas fa-wrench' },
        'medic': { label: 'المسعف الطبي', color: '#e74c3c', icon: 'fas fa-first-aid' },
    },

    // === Role Permissions ===
    // pages: which pages each role can access
    // actions: what each role can do
    permissions: {
        'admin': {
            isAdmin: true,
            pages: ['dashboard.html', 'incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'reports.html', 'notifications.html', 'settings.html'],
            actions: ['view_all', 'create_incident', 'edit_incident', 'delete_incident', 'change_status', 'approve_report', 'close_incident', 'manage_users', 'export_reports', 'view_settings', 'assign_tasks'],
            incidentTypes: 'all',
            description: 'صلاحيات كاملة - إدارة النظام وجميع الوظائف',
        },
        'operations_manager': {
            isAdmin: true,
            pages: ['dashboard.html', 'incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'reports.html', 'notifications.html', 'settings.html'],
            actions: ['view_all', 'create_incident', 'edit_incident', 'delete_incident', 'change_status', 'approve_incident', 'reject_incident', 'approve_report', 'close_incident', 'manage_users', 'export_reports', 'print_reports', 'view_settings', 'assign_tasks'],
            incidentTypes: 'all',
            description: 'صلاحيات كاملة - إدارة العمليات والموافقة على التقارير وإغلاق الحوادث',
        },
        'safety_officer': {
            isAdmin: false,
            pages: ['dashboard.html', 'incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'reports.html', 'notifications.html', 'settings.html'],
            actions: ['view_all', 'create_incident', 'edit_incident', 'change_status', 'review_incident', 'forward_incident', 'convert_to_risk', 'close_incident', 'investigate'],
            incidentTypes: 'all',
            description: 'مراجعة الحوادث وإحالتها للمدير والتحقيق وتحويلها لسجل المخاطر',
        },
        'field_supervisor': {
            isAdmin: false,
            pages: ['dashboard.html', 'incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'notifications.html', 'settings.html'],
            actions: ['view_all', 'create_incident', 'change_status', 'assign_tasks'],
            incidentTypes: 'all',
            description: 'متابعة الاستجابة الأولية وتعيين الفرق وتحديث حالات الحوادث',
        },
        'field_employee': {
            isAdmin: false,
            pages: ['incidents.html', 'ground-report.html', 'risks.html', 'notifications.html', 'settings.html'],
            actions: ['create_incident', 'view_own'],
            incidentTypes: 'all',
            description: 'تسجيل الحوادث الميدانية وإرفاق الصور فقط',
        },
        'maintenance_team': {
            isAdmin: false,
            pages: ['incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'notifications.html', 'settings.html'],
            actions: ['view_assigned', 'change_status'],
            incidentTypes: ['equipment', 'electrical', 'environmental'],
            description: 'عرض المهام المعينة وتحديث حالة الإصلاح',
        },
        'medic': {
            isAdmin: false,
            pages: ['incidents.html', 'incident-detail.html', 'ground-report.html', 'risks.html', 'notifications.html', 'settings.html'],
            actions: ['view_assigned', 'create_incident', 'change_status'],
            incidentTypes: ['human'],
            description: 'الاستجابة للإصابات وتسجيل الحالات الصحية',
        },
    },

    // === Incident Types ===
    incidentTypes: [
        { id: 'aircraft', label: 'حوادث الطائرات', icon: 'fas fa-plane', color: '#e74c3c', cssClass: 'aircraft' },
        { id: 'equipment', label: 'المعدات', icon: 'fas fa-cogs', color: '#f39c12', cssClass: 'equipment' },
        { id: 'human', label: 'البشرية', icon: 'fas fa-user-injured', color: '#17a2b8', cssClass: 'human' },
        { id: 'operational', label: 'التشغيلية', icon: 'fas fa-clock', color: '#0066cc', cssClass: 'operational' },
        { id: 'environmental', label: 'البيئية', icon: 'fas fa-leaf', color: '#27ae60', cssClass: 'environmental' },
        { id: 'security', label: 'الأمنية', icon: 'fas fa-lock', color: '#cc2229', cssClass: 'security' },
        { id: 'electrical', label: 'الكهربائية', icon: 'fas fa-bolt', color: '#e67e22', cssClass: 'electrical' },
        { id: 'weather', label: 'المناخية', icon: 'fas fa-cloud-rain', color: '#3498db', cssClass: 'weather' },
    ],

    // === Priority Labels ===
    priorities: {
        'critical': { label: 'حرج', cssClass: 'critical', icon: 'fas fa-exclamation-triangle' },
        'urgent': { label: 'عاجل', cssClass: 'urgent', icon: 'fas fa-exclamation-circle' },
        'normal': { label: 'عادي', cssClass: 'normal', icon: 'fas fa-info-circle' },
        'low': { label: 'منخفض', cssClass: 'low', icon: 'fas fa-arrow-down' },
    },

    // === Status Labels ===
    statuses: {
        'new': { label: 'جديد', cssClass: 'new', icon: 'fas fa-plus-circle' },
        'pending_review': { label: 'بانتظار المراجعة', cssClass: 'investigating', icon: 'fas fa-user-clock' },
        'pending_approval': { label: 'بانتظار موافقة المدير', cssClass: 'responding', icon: 'fas fa-clipboard-check' },
        'returned': { label: 'معاد للمراجعة', cssClass: 'new', icon: 'fas fa-undo' },
        'investigating': { label: 'قيد التحقيق', cssClass: 'investigating', icon: 'fas fa-search' },
        'responding': { label: 'قيد الاستجابة', cssClass: 'responding', icon: 'fas fa-running' },
        'resolved': { label: 'تم الحل', cssClass: 'resolved', icon: 'fas fa-check-circle' },
        'closed': { label: 'مغلق', cssClass: 'closed', icon: 'fas fa-times-circle' },
    },

    // === Locations ===
    locations: [
        'المدرج الرئيسي',
        'ساحة الطائرات - بوابة 1',
        'ساحة الطائرات - بوابة 2',
        'ساحة الطائرات - بوابة 3',
        'صالة المغادرة',
        'صالة الوصول',
        'مبنى الركاب الرئيسي',
        'منطقة الشحن',
        'مستودع الوقود',
        'ورشة الصيانة',
        'برج المراقبة',
        'مواقف السيارات',
        'بوابة الدخول الرئيسية',
        'منطقة تحميل الأمتعة',
    ],

    // === Incidents ===
    incidents: [
        {
            id: 'INC-2026-001',
            title: 'تصادم مركبة نقل أمتعة بجناح طائرة',
            type: 'aircraft',
            priority: 'critical',
            status: 'investigating',
            location: 'ساحة الطائرات - بوابة 2',
            date: '2026-03-07',
            time: '08:30',
            reporter: 'عبدالله صالح النعمان',
            assignedTo: 'أحمد محمد العامري',
            description: 'اصطدمت مركبة نقل الأمتعة بالجناح الأيمن للطائرة A320 أثناء عملية التحميل، مما أدى إلى خدوش ظاهرة على سطح الجناح.',
            actions: ['تم إيقاف الرحلة مؤقتاً', 'تم استدعاء فريق الصيانة', 'تم التقاط صور للأضرار', 'جاري فحص هيكل الجناح'],
        },
        {
            id: 'INC-2026-002',
            title: 'عطل في نظام سير الأمتعة',
            type: 'equipment',
            priority: 'urgent',
            status: 'responding',
            location: 'منطقة تحميل الأمتعة',
            date: '2026-03-06',
            time: '10:15',
            reporter: 'محمد علي الحداد',
            assignedTo: 'سامي أحمد الوصابي',
            description: 'توقف نظام سير الأمتعة في المنطقة الرئيسية مما أدى إلى تأخير تحميل الأمتعة لثلاث رحلات.',
            actions: ['تم التحويل إلى النظام اليدوي', 'فريق الصيانة يعمل على الإصلاح'],
        },
        {
            id: 'INC-2026-003',
            title: 'إصابة عامل أثناء تفريغ حاوية شحن',
            type: 'human',
            priority: 'urgent',
            status: 'resolved',
            location: 'منطقة الشحن',
            date: '2026-03-05',
            time: '14:45',
            reporter: 'خالد حسن المقطري',
            assignedTo: 'ياسر عبدالرحمن الشرعبي',
            description: 'سقطت حاوية شحن صغيرة على قدم أحد العمال أثناء التفريغ، مما أدى إلى إصابة متوسطة.',
            actions: ['تم تقديم الإسعافات الأولية', 'تم نقل المصاب للمستشفى', 'تم فحص معدات التفريغ'],
        },
        {
            id: 'INC-2026-004',
            title: 'تأخير رحلة بسبب عطل فني',
            type: 'operational',
            priority: 'normal',
            status: 'closed',
            location: 'ساحة الطائرات - بوابة 1',
            date: '2026-03-05',
            time: '06:20',
            reporter: 'محمد علي الحداد',
            assignedTo: 'أحمد محمد العامري',
            description: 'تأخرت رحلة IY-601 إلى القاهرة بمدة ساعتين بسبب عطل في نظام الملاحة.',
            actions: ['تم إبلاغ الركاب', 'تم الإصلاح بنجاح', 'أقلعت الرحلة بتأخر ساعتين'],
        },
        {
            id: 'INC-2026-005',
            title: 'تسرب وقود من صهريج تزويد',
            type: 'environmental',
            priority: 'critical',
            status: 'resolved',
            location: 'مستودع الوقود',
            date: '2026-03-04',
            time: '11:00',
            reporter: 'عبدالله صالح النعمان',
            assignedTo: 'سامي أحمد الوصابي',
            description: 'تم اكتشاف تسرب وقود من أحد صهاريج التزويد في منطقة مستودع الوقود.',
            actions: ['تم إخلاء المنطقة فوراً', 'تم احتواء التسرب', 'تم تنظيف المنطقة', 'تم فحص جميع الصهاريج'],
        },
        {
            id: 'INC-2026-006',
            title: 'محاولة دخول غير مصرح بها',
            type: 'security',
            priority: 'critical',
            status: 'closed',
            location: 'بوابة الدخول الرئيسية',
            date: '2026-03-04',
            time: '22:30',
            reporter: 'خالد حسن المقطري',
            assignedTo: 'أحمد محمد العامري',
            description: 'تم رصد شخص يحاول الدخول إلى منطقة الساحة بدون تصريح أمني.',
            actions: ['تم إيقاف الشخص', 'تم إبلاغ الأمن', 'تم التحقق من الهوية', 'تم تحويله للجهات المختصة'],
        },
        {
            id: 'INC-2026-007',
            title: 'انقطاع كهرباء في صالة المغادرة',
            type: 'electrical',
            priority: 'urgent',
            status: 'resolved',
            location: 'صالة المغادرة',
            date: '2026-03-04',
            time: '15:10',
            reporter: 'سامي أحمد الوصابي',
            assignedTo: 'سامي أحمد الوصابي',
            description: 'انقطاع مفاجئ في التيار الكهربائي في الجناح الشرقي من صالة المغادرة.',
            actions: ['تم تشغيل المولد الاحتياطي', 'تم إصلاح العطل خلال 45 دقيقة'],
        },
        {
            id: 'INC-2026-008',
            title: 'عاصفة رملية تعيق الرؤية',
            type: 'weather',
            priority: 'urgent',
            status: 'closed',
            location: 'المدرج الرئيسي',
            date: '2026-03-03',
            time: '13:00',
            reporter: 'محمد علي الحداد',
            assignedTo: 'أحمد محمد العامري',
            description: 'عاصفة رملية شديدة أدت إلى انخفاض مدى الرؤية إلى أقل من 500 متر.',
            actions: ['تم تعليق جميع الرحلات مؤقتاً', 'تم إبلاغ جميع الطواقم', 'استؤنفت العمليات بعد 3 ساعات'],
        },
        {
            id: 'INC-2026-009',
            title: 'سقوط أحد الركاب في صالة الوصول',
            type: 'human',
            priority: 'normal',
            status: 'closed',
            location: 'صالة الوصول',
            date: '2026-03-02',
            time: '09:40',
            reporter: 'ياسر عبدالرحمن الشرعبي',
            assignedTo: 'ياسر عبدالرحمن الشرعبي',
            description: 'سقط أحد الركاب المسنين بسبب أرضية مبللة في صالة الوصول.',
            actions: ['تم تقديم الإسعافات الأولية', 'تم تنظيف وتجفيف الأرضية', 'تم وضع لافتات تحذيرية'],
        },
        {
            id: 'INC-2026-010',
            title: 'عطل في جهاز فحص الأمتعة',
            type: 'security',
            priority: 'urgent',
            status: 'new',
            location: 'مبنى الركاب الرئيسي',
            date: '2026-03-06',
            time: '07:00',
            reporter: 'خالد حسن المقطري',
            assignedTo: 'سامي أحمد الوصابي',
            description: 'تعطل جهاز الفحص الأمني X-Ray رقم 2 في مدخل المبنى الرئيسي.',
            actions: ['تم تحويل الركاب للجهاز الآخر', 'تم طلب قطع غيار'],
        },
        {
            id: 'INC-2026-011',
            title: 'احتكاك بين مركبتي خدمة أرضية',
            type: 'equipment',
            priority: 'normal',
            status: 'investigating',
            location: 'ساحة الطائرات - بوابة 3',
            date: '2026-03-05',
            time: '16:30',
            reporter: 'عبدالله صالح النعمان',
            assignedTo: 'خالد حسن المقطري',
            description: 'احتكاك بسيط بين مركبة جر وشاحنة تموين أثناء المناورة في منطقة البوابة 3.',
            actions: ['تم فحص المركبتين', 'أضرار طفيفة فقط'],
        },
        {
            id: 'INC-2026-012',
            title: 'تسرب مياه في ورشة الصيانة',
            type: 'environmental',
            priority: 'low',
            status: 'responding',
            location: 'ورشة الصيانة',
            date: '2026-03-06',
            time: '12:00',
            reporter: 'سامي أحمد الوصابي',
            assignedTo: 'سامي أحمد الوصابي',
            description: 'تسرب مياه من أنبوب مكسور في سقف ورشة الصيانة.',
            actions: ['تم تغطية المعدات الحساسة', 'يجري إصلاح الأنبوب'],
        },
    ],

    // === Dashboard Stats ===
    dashboardStats: {
        todayIncidents: 12,
        weekIncidents: 67,
        monthIncidents: 245,
        closureRate: 94,
        avgResponseTime: 4.2,
        avgResponseTarget: 5,
        closureRateTarget: 90,
        dataAccuracy: 97,
        dataAccuracyTarget: 95,
        userSatisfaction: 4.6,
        satisfactionTarget: 4.5,
    },

    // === Notifications ===
    notifications: [
        { id: 1, type: 'incident', title: 'حادث جديد - INC-2026-010', message: 'تم الإبلاغ عن عطل في جهاز فحص الأمتعة', time: 'منذ 5 دقائق', read: false, icon: 'fas fa-exclamation-triangle', color: '#e74c3c' },
        { id: 2, type: 'update', title: 'تحديث حالة - INC-2026-001', message: 'تم تحويل الحادث إلى "قيد التحقيق"', time: 'منذ 15 دقيقة', read: false, icon: 'fas fa-sync-alt', color: '#f39c12' },
        { id: 3, type: 'assignment', title: 'مهمة جديدة', message: 'تم تعيينك للتحقيق في حادث INC-2026-001', time: 'منذ 30 دقيقة', read: false, icon: 'fas fa-user-check', color: '#0066cc' },
        { id: 4, type: 'resolved', title: 'تم حل الحادث - INC-2026-005', message: 'تم إغلاق حادث تسرب الوقود بنجاح', time: 'منذ ساعة', read: true, icon: 'fas fa-check-circle', color: '#27ae60' },
        { id: 5, type: 'system', title: 'تحديث النظام', message: 'تم تحديث النظام إلى الإصدار 2.1.0', time: 'منذ ساعتين', read: true, icon: 'fas fa-cog', color: '#6c757d' },
        { id: 6, type: 'alert', title: 'تنبيه - زيادة الحوادث', message: 'ارتفاع ملحوظ في حوادث المعدات هذا الأسبوع', time: 'منذ 3 ساعات', read: true, icon: 'fas fa-chart-line', color: '#e67e22' },
        { id: 7, type: 'incident', title: 'حادث جديد - INC-2026-012', message: 'تسرب مياه في ورشة الصيانة', time: 'أمس 12:00', read: true, icon: 'fas fa-exclamation-triangle', color: '#17a2b8' },
        { id: 8, type: 'resolved', title: 'تم حل الحادث - INC-2026-007', message: 'تم إصلاح الانقطاع الكهربائي في صالة المغادرة', time: 'أمس 16:00', read: true, icon: 'fas fa-check-circle', color: '#27ae60' },
    ],

    // === Activity Log ===
    activityLog: [
        { text: 'تم الإبلاغ عن حادث جديد في ساحة الطائرات', time: 'منذ 5 دقائق', color: 'red' },
        { text: 'أحمد العامري بدأ التحقيق في INC-2026-001', time: 'منذ 15 دقيقة', color: 'blue' },
        { text: 'تم حل حادث تسرب الوقود INC-2026-005', time: 'منذ ساعة', color: 'green' },
        { text: 'سامي الوصابي يعمل على إصلاح سير الأمتعة', time: 'منذ ساعتين', color: 'orange' },
        { text: 'تم إغلاق حادث العاصفة الرملية INC-2026-008', time: 'منذ 3 ساعات', color: 'green' },
        { text: 'تم تحديث نظام الإشعارات بنجاح', time: 'منذ 4 ساعات', color: 'blue' },
    ],

    // === Monthly Chart Data ===
    monthlyData: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        incidents: [45, 38, 52, 41, 35, 48, 55, 42, 39, 50, 58, 67],
        resolved: [42, 36, 48, 39, 34, 45, 51, 40, 37, 47, 54, 63],
    },

    // === Type Distribution ===
    typeDistribution: {
        labels: ['طائرات', 'معدات', 'بشرية', 'تشغيلية', 'بيئية', 'أمنية', 'كهربائية', 'مناخية'],
        data: [15, 22, 18, 25, 8, 12, 10, 6],
        colors: ['#e74c3c', '#f39c12', '#17a2b8', '#0066cc', '#27ae60', '#cc2229', '#e67e22', '#3498db'],
    },

    // === Risk Matrix & Labels ===
    riskCategories: {
        'Acceptable': { label: 'مقبول (Acceptable)', cssClass: 'status-closed', tooltip: 'خطر مقبول ضمنيا' },
        'Reviewable': { label: 'مقبول مع المراجعة', cssClass: 'status-investigating', tooltip: 'مقبول بشروط التخفيف' },
        'Intolerable': { label: 'غير مقبول (Intolerable)', cssClass: 'priority-critical', tooltip: 'يجب اتخاذ إجراء فوري' },
    },

    // === Risks Registry (April 2025) ===
    risks: [
        {
            id: 'RSK-001',
            event: 'عطل فني في باص نقل الركاب رقم 67',
            hazard: 'تلف الكليب الخاص بتخزين الماء',
            consequence: 'تسرب مياه (انزلاق)، تأخر في التحميل',
            initialProb: '3',
            initialSev: 'C',
            initialRating: '3C',
            initialCategory: 'Reviewable',
            existingControls: '',
            mitigation: 'إصلاح الكليب، مراجعة إجراءات الصيانة، فحص الباصات الأخرى',
            newControls: 'تحديث جداول الصيانة، توفير حافلة احتياطية، تدريب السائقين',
            residualProb: '2',
            residualSev: 'C',
            residualRating: '2C',
            residualCategory: 'Acceptable',
            status: 'مفتوح',
            ownership: 'فريق الصيانة'
        },
        {
            id: 'RSK-002',
            event: 'تحميل حاويات ذات عيوب من صغيرة لمتوسطة',
            hazard: 'استخدام حاويات معيوبة',
            consequence: 'إمكانية تعلقها في الطائرة، تأخير العمل',
            initialProb: '3',
            initialSev: 'C',
            initialRating: '3C',
            initialCategory: 'Reviewable',
            existingControls: '',
            mitigation: 'متابعة مسؤولي الحاويات لإصلاح المتضرر منها',
            newControls: '',
            residualProb: '2',
            residualSev: 'E',
            residualRating: '2E',
            residualCategory: 'Acceptable',
            status: 'مغلق',
            ownership: 'المشرف الميداني'
        },
        {
            id: 'RSK-003',
            event: 'تسريع العمال لسير الأمتعة لتعجيل الإنزال',
            hazard: 'سوء استخدام سير العفش',
            consequence: 'سقوط العفش، الحاق الضرر بالطائرة',
            initialProb: '3',
            initialSev: 'C',
            initialRating: '3C',
            initialCategory: 'Reviewable',
            existingControls: '',
            mitigation: 'توعية المشغل أو العامل بخطورة ذلك',
            newControls: '',
            residualProb: '2',
            residualSev: 'C',
            residualRating: '2C',
            residualCategory: 'Acceptable',
            status: 'قيد التنفيذ',
            ownership: 'ضابط السلامة'
        },
        {
            id: 'RSK-004',
            event: 'وجود مخلفات (FOD) بالقرب من المحركات',
            hazard: 'أحجار أو علب بقرب المحرك',
            consequence: 'اضرار كبيرة للمحرك، تهديد للسلامة',
            initialProb: '5',
            initialSev: 'B',
            initialRating: '5B',
            initialCategory: 'Intolerable',
            existingControls: '',
            mitigation: 'تنظيف المرسى ومحيط الطائرة بشكل دوري',
            newControls: '',
            residualProb: '3',
            residualSev: 'E',
            residualRating: '3E',
            residualCategory: 'Acceptable',
            status: 'مفتوح',
            ownership: 'موظف الساحة'
        },
        {
            id: 'RSK-005',
            event: 'عدم ارتداء السترة العاكسة أثناء العمل الليلي',
            hazard: 'عدم الالتزام بمعدات السلامة الشخصية',
            consequence: 'خطر الدهس أو الاصطدام بالمركبات',
            initialProb: '4',
            initialSev: 'C',
            initialRating: '4C',
            initialCategory: 'Intolerable',
            existingControls: 'توفير سترات عاكسة',
            mitigation: 'تشديد الرقابة على ارتداء معدات السلامة الشخصية، فرض عقوبات على المخالفين',
            newControls: 'تركيب كاميرات مراقبة ليلية',
            residualProb: '2',
            residualSev: 'C',
            residualRating: '2C',
            residualCategory: 'Acceptable',
            status: 'قيد التنفيذ',
            ownership: 'المشرف الميداني'
        },
        {
            id: 'RSK-006',
            event: 'إهمال الصيانة الدورية للعربات الأرضية',
            hazard: 'غياب جداول الصيانة الوقائية',
            consequence: 'أعطال مفاجئة، تأخير الرحلات، إصابات محتملة',
            initialProb: '4',
            initialSev: 'C',
            initialRating: '4C',
            initialCategory: 'Intolerable',
            existingControls: '',
            mitigation: 'إعداد جداول صيانة وقائية شهرية لجميع المركبات',
            newControls: 'نظام تنبيهات آلي لمواعيد الصيانة',
            residualProb: '2',
            residualSev: 'C',
            residualRating: '2C',
            residualCategory: 'Acceptable',
            status: 'مفتوح',
            ownership: 'فريق الصيانة'
        },
        {
            id: 'RSK-007',
            event: 'عدم تأمين الحاويات في عنبر الشحن',
            hazard: 'حاويات غير مثبتة بشكل صحيح',
            consequence: 'انزلاق الحمولة أثناء الطيران، خلل في توازن الطائرة',
            initialProb: '3',
            initialSev: 'D',
            initialRating: '3D',
            initialCategory: 'Intolerable',
            existingControls: 'فحص بصري قبل الإقلاع',
            mitigation: 'تدريب العاملين على إجراءات التثبيت الصحيحة',
            newControls: 'قائمة فحص إلزامية قبل كل رحلة',
            residualProb: '2',
            residualSev: 'D',
            residualRating: '2D',
            residualCategory: 'Reviewable',
            status: 'قيد التنفيذ',
            ownership: 'ضابط السلامة'
        },
        {
            id: 'RSK-008',
            event: 'استخدام درج المسافرين بدون فرامل',
            hazard: 'عدم تثبيت الدرج بالفرامل عند الاستخدام',
            consequence: 'انزلاق الدرج، سقوط الركاب',
            initialProb: '3',
            initialSev: 'C',
            initialRating: '3C',
            initialCategory: 'Reviewable',
            existingControls: 'تدريب المشغلين',
            mitigation: 'إضافة فحص الفرامل ضمن قائمة التشغيل',
            newControls: '',
            residualProb: '2',
            residualSev: 'C',
            residualRating: '2C',
            residualCategory: 'Acceptable',
            status: 'مغلق',
            ownership: 'المشرف الميداني'
        },
        {
            id: 'RSK-009',
            event: 'الاستعجال في العمل أثناء هطول الأمطار',
            hazard: 'أرضية زلقة + استعجال العمال',
            consequence: 'انزلاقات، سقوط أمتعة، إصابات',
            initialProb: '4',
            initialSev: 'B',
            initialRating: '4B',
            initialCategory: 'Reviewable',
            existingControls: '',
            mitigation: 'تعليق العمل أثناء الهطول الغزيرة، توفير معدات مقاومة للانزلاق',
            newControls: 'بروتوكول طقس سيء (Bad Weather SOP)',
            residualProb: '2',
            residualSev: 'B',
            residualRating: '2B',
            residualCategory: 'Acceptable',
            status: 'مفتوح',
            ownership: 'ضابط السلامة'
        },
        {
            id: 'RSK-010',
            event: 'غياب الأقماع التحذيرية حول الطائرة',
            hazard: 'عدم وضع الأقماع والحواجز التحذيرية',
            consequence: 'دخول مركبات غير مصرح لها، اصطدام بالطائرة',
            initialProb: '3',
            initialSev: 'C',
            initialRating: '3C',
            initialCategory: 'Reviewable',
            existingControls: 'توفير أقماع',
            mitigation: 'إلزام وضع الأقماع قبل بدء أي عملية تحميل',
            newControls: 'إضافة بند في قائمة الفحص',
            residualProb: '1',
            residualSev: 'C',
            residualRating: '1C',
            residualCategory: 'Acceptable',
            status: 'مغلق',
            ownership: 'موظف الساحة'
        }
    ],
};

// === Helper Functions ===

function getIncidentById(id) {
    return MockData.incidents.find(inc => inc.id === id);
}

function getIncidentsByStatus(status) {
    return MockData.incidents.filter(inc => inc.status === status);
}

function getIncidentsByType(type) {
    return MockData.incidents.filter(inc => inc.type === type);
}

function getIncidentsByPriority(priority) {
    return MockData.incidents.filter(inc => inc.priority === priority);
}

function getUnreadNotifications() {
    return MockData.notifications.filter(n => !n.read);
}

function getTypeLabel(typeId) {
    const type = MockData.incidentTypes.find(t => t.id === typeId);
    return type ? type.label : typeId;
}

function getStatusLabel(statusId) {
    return MockData.statuses[statusId] ? MockData.statuses[statusId].label : statusId;
}

function getPriorityLabel(priorityId) {
    return MockData.priorities[priorityId] ? MockData.priorities[priorityId].label : priorityId;
}

function getRoleLabel(roleId) {
    return MockData.roles[roleId] ? MockData.roles[roleId].label : roleId;
}

// === Session Management ===
function getCurrentUser() {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// === Permission Helpers ===

function getUserPermissions(user) {
    if (!user) return null;
    return MockData.permissions[user.role] || null;
}

function canAccessPage(user, page) {
    const perms = getUserPermissions(user);
    if (!perms) return false;
    return perms.pages.includes(page);
}

function hasPermission(user, action) {
    const perms = getUserPermissions(user);
    if (!perms) return false;
    return perms.actions.includes(action);
}

function isAdmin(user) {
    const perms = getUserPermissions(user);
    if (!perms) return false;
    return perms.isAdmin === true;
}

function canViewIncidentType(user, incidentType) {
    const perms = getUserPermissions(user);
    if (!perms) return false;
    if (perms.incidentTypes === 'all') return true;
    return perms.incidentTypes.includes(incidentType);
}

function getRedirectPage(user) {
    const perms = getUserPermissions(user);
    if (!perms) return 'index.html';
    return perms.pages[0] || 'index.html';
}

function checkPageAccess(user) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'index.html') return true;
    if (!canAccessPage(user, currentPage)) {
        window.location.href = getRedirectPage(user);
        return false;
    }
    return true;
}

function getFilteredIncidents(user) {
    const perms = getUserPermissions(user);
    if (!perms) return [];

    let incidents = MockData.incidents;

    // Filter by incident type for restricted roles
    if (perms.incidentTypes !== 'all') {
        incidents = incidents.filter(inc => perms.incidentTypes.includes(inc.type));
    }

    // Filter to only assigned incidents for some roles
    if (perms.actions.includes('view_assigned') && !perms.actions.includes('view_all')) {
        incidents = incidents.filter(inc => inc.assignedTo === user.name || inc.reporter === user.name);
    }

    // Filter to own incidents only
    if (perms.actions.includes('view_own') && !perms.actions.includes('view_all') && !perms.actions.includes('view_assigned')) {
        incidents = incidents.filter(inc => inc.reporter === user.name);
    }

    return incidents;
}

