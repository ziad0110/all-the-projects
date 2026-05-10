// =====================================================
// CORE DATA & UTILITIES — إثراء FinVault
// =====================================================

// --- HTML Escape utility (XSS protection) ---
window.escapeHtml = function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// --- Safe error handler (does NOT leak details to users) ---
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('[إثراء] خطأ غير متوقع:', { msg, url, lineNo, columnNo, error });
    return false;
};
window.addEventListener('unhandledrejection', function (e) {
    console.error('[إثراء] Promise rejection:', e.reason);
});

// --- Currency helpers ---
window.getCurrency = function getCurrency() {
    return (window.AppData && AppData.user && AppData.user.currency) || 'ر.س';
};
window.formatCurrency = function formatCurrency(amount, currency) {
    const cur = currency || getCurrency();
    const num = Number(amount) || 0;
    return num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + cur;
};
window.formatAmount = function formatAmount(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('en') + ' ' + getCurrency();
};

// =====================================================
// APP DATA
// =====================================================
window.AppData = {
    user: {
        name: "أحمد آل سعود",
        email: "ahmed.alsaud@email.com",
        phone: "+966 50 123 4567",
        tier: "gold",
        balance: 24850.00,
        pin: "1234",
        points: 2450,
        currency: "ر.س",
        countryCode: "+966",
        plan: "free",
        zakatHawlStart: null,
        zakatLastPaidYear: null,
        linkedBanks: []
    },

    cards: [
        { id: 1, name: "بطاقة الراتب", number: "4523 9921 5012 4582", expiry: "12/28", type: "visa", balance: 18500.00, color: "gradient-primary", isDefault: true, isVisible: false },
        { id: 2, name: "بطاقة التوفير", number: "5241 8301 2743 7891", expiry: "09/27", type: "mastercard", balance: 6350.00, color: "credit-card-gold", isDefault: false, isVisible: false },
        { id: 3, name: "بطاقة الاستثمار", number: "3742 8593 0028 1234", expiry: "03/29", type: "amex", balance: 0.00, color: "credit-card-black", isDefault: false, isVisible: false }
    ],

    transactions: [
        { id: 1, title: "راتب الشهر", amount: 15000, type: "income", category: "راتب", date: "2026-04-01", icon: "fa-money-bill-wave", color: "emerald" },
        { id: 2, title: "سوبرماركت", amount: -342.50, type: "expense", category: "تسوق", date: "2026-04-02", icon: "fa-shopping-cart", color: "purple" },
        { id: 3, title: "فاتورة الكهرباء", amount: -245.00, type: "expense", category: "فواتير", date: "2026-04-03", icon: "fa-bolt", color: "amber" },
        { id: 4, title: "تحويل إلى محمد", amount: -500, type: "transfer", category: "تحويل", date: "2026-04-04", icon: "fa-paper-plane", color: "cyan" },
        { id: 5, title: "مطعم", amount: -128.00, type: "expense", category: "طعام", date: "2026-04-05", icon: "fa-utensils", color: "rose" },
        { id: 6, title: "محطة الوقود", amount: -180.00, type: "expense", category: "مواصلات", date: "2026-04-06", icon: "fa-gas-pump", color: "orange" },
        { id: 7, title: "اشتراك بث ترفيهي", amount: -45.00, type: "expense", category: "ترفيه", date: "2026-04-07", icon: "fa-play", color: "red" },
        { id: 8, title: "استرداد نقدي", amount: 120, type: "income", category: "استرداد", date: "2026-04-08", icon: "fa-undo", color: "emerald" },
        { id: 9, title: "صيدلية", amount: -89.50, type: "expense", category: "صحة", date: "2026-04-09", icon: "fa-pills", color: "blue" },
        { id: 10, title: "تحويل من سارة", amount: 300, type: "income", category: "تحويل", date: "2026-04-10", icon: "fa-hand-holding-usd", color: "emerald" },
        { id: 11, title: "فاتورة الماء", amount: -95.00, type: "expense", category: "فواتير", date: "2026-04-11", icon: "fa-tint", color: "cyan" },
        { id: 12, title: "مقهى", amount: -32.00, type: "expense", category: "طعام", date: "2026-04-12", icon: "fa-coffee", color: "amber" },
        { id: 13, title: "تسوق إلكتروني", amount: -567.00, type: "expense", category: "تسوق", date: "2026-04-13", icon: "fa-shopping-bag", color: "purple" },
        { id: 14, title: "اشتراك جيم", amount: -299.00, type: "expense", category: "رياضة", date: "2026-04-14", icon: "fa-dumbbell", color: "orange" },
        { id: 15, title: "عائد استثمار", amount: 450, type: "income", category: "استثمار", date: "2026-04-15", icon: "fa-chart-line", color: "emerald" }
    ],

    bills: [
        { id: 1, title: "فاتورة الكهرباء", amount: 245.00, dueDate: "2026-04-25", category: "كهرباء", icon: "fa-bolt", color: "amber", paid: false },
        { id: 2, title: "فاتورة الماء", amount: 95.00, dueDate: "2026-04-28", category: "ماء", icon: "fa-tint", color: "cyan", paid: false },
        { id: 3, title: "اشتراك الإنترنت", amount: 299.00, dueDate: "2026-04-30", category: "إنترنت", icon: "fa-wifi", color: "purple", paid: false },
        { id: 4, title: "فاتورة الجوال", amount: 208.50, dueDate: "2026-04-20", category: "جوال", icon: "fa-mobile-alt", color: "blue", paid: true },
        { id: 5, title: "رسوم البلدية", amount: 450.00, dueDate: "2026-04-15", category: "بلدية", icon: "fa-building", color: "gray", paid: true }
    ],

    goals: [
        { id: 1, title: "سيارة جديدة", target: 120000, current: 45000, icon: "fa-car", color: "purple", deadline: "ديسمبر 2026" },
        { id: 2, title: "رحلة دبي", target: 15000, current: 8750, icon: "fa-plane", color: "cyan", deadline: "أغسطس 2026" },
        { id: 3, title: "صندوق الطوارئ", target: 50000, current: 32000, icon: "fa-shield-alt", color: "emerald", deadline: "مستمر" },
        { id: 4, title: "دورة ماجستير", target: 80000, current: 12000, icon: "fa-graduation-cap", color: "amber", deadline: "سبتمبر 2027" }
    ],

    budgetCategories: [
        { name: "طعام ومطاعم", spent: 0, limit: 2500, icon: "fa-utensils", color: "rose" },
        { name: "تسوق", spent: 0, limit: 4000, icon: "fa-shopping-bag", color: "purple" },
        { name: "مواصلات", spent: 0, limit: 1200, icon: "fa-car", color: "orange" },
        { name: "فواتير", spent: 0, limit: 1000, icon: "fa-file-invoice", color: "amber" },
        { name: "ترفيه", spent: 0, limit: 800, icon: "fa-gamepad", color: "pink" },
        { name: "صحة", spent: 0, limit: 1000, icon: "fa-heartbeat", color: "red" },
        { name: "تحويلات", spent: 0, limit: 3000, icon: "fa-exchange-alt", color: "cyan" },
        { name: "ادخار", spent: 0, limit: 5000, icon: "fa-piggy-bank", color: "emerald" },
        { name: "أخرى", spent: 0, limit: 1500, icon: "fa-ellipsis-h", color: "gray" }
    ],

    rewards: [
        { id: 1, title: "خصم 20% - متجر شريك", points: 500, icon: "fa-shopping-cart", color: "emerald", partner: "متجر شريك" },
        { id: 2, title: "قسيمة 50 ر.س - مقهى", points: 300, icon: "fa-coffee", color: "amber", partner: "مقهى شريك", cashValue: 50 },
        { id: 3, title: "تذكرة سينما مجانية", points: 400, icon: "fa-film", color: "purple", partner: "سينما شريكة", cashValue: 50 },
        { id: 4, title: "خصم 15% - متجر إلكتروني", points: 250, icon: "fa-shopping-bag", color: "cyan", partner: "متجر شريك" },
        { id: 5, title: "ليلة فندقية مجانية", points: 2000, icon: "fa-hotel", color: "pink", partner: "فندق شريك", cashValue: 400 },
        { id: 6, title: "كاش باك 100 ر.س", points: 1000, icon: "fa-money-bill", color: "emerald", partner: "إثراء", cashValue: 100 }
    ],

    pointsHistory: [
        { title: "شراء بالبطاقة", points: 34, date: "2026-04-02", type: "earn" },
        { title: "دفع فاتورة الكهرباء", points: 12, date: "2026-04-03", type: "earn" },
        { title: "استبدال قسيمة", points: -300, date: "2026-04-05", type: "redeem" },
        { title: "تحويل إلى محمد", points: 5, date: "2026-04-04", type: "earn" },
        { title: "مكافأة الأسبوع", points: 100, date: "2026-04-07", type: "bonus" }
    ],

    activities: [
        { action: "تسجيل دخول", device: "iPhone 15 Pro", location: "الرياض، السعودية", time: "منذ 5 دقائق", icon: "fa-mobile-alt", color: "purple" },
        { action: "تحويل مالي", device: "iPhone 15 Pro", location: "الرياض، السعودية", time: "منذ 2 ساعة", icon: "fa-exchange-alt", color: "cyan" },
        { action: "تغيير PIN", device: "Web Browser", location: "الرياض، السعودية", time: "أمس", icon: "fa-key", color: "amber" },
        { action: "تسجيل دخول", device: "MacBook Pro", location: "الرياض، السعودية", time: "أمس", icon: "fa-laptop", color: "purple" },
        { action: "دفع فاتورة", device: "iPhone 15 Pro", location: "الرياض، السعودية", time: "2026-04-15", icon: "fa-file-invoice", color: "emerald" }
    ],

    articles: [
        { id: 1, title: "كيف تبدأ الاستثمار بمبلغ بسيط", excerpt: "تعلم أساسيات الاستثمار وكيفية بناء محفظة متنوعة...", readTime: "5 دقائق", category: "استثمار", image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=250&fit=crop", body: "الاستثمار ليس حكراً على الأغنياء. يمكنك البدء بمبلغ صغير من خلال صناديق المؤشرات منخفضة التكلفة. القاعدة الذهبية: ابدأ مبكراً، استثمر بانتظام، ونوّع محفظتك. حتى 100 ريال شهرياً يمكن أن تنمو إلى مبلغ كبير على مدى 30 سنة بفضل الفائدة المركبة." },
        { id: 2, title: "10 نصائح للتوفير الفعال", excerpt: "استراتيجيات عملية لتقليل النفقات وزيادة الادخار...", readTime: "4 دقائق", category: "توفير", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop", body: "1) ضع ميزانية شهرية. 2) ادفع نفسك أولاً (ادخر قبل الإنفاق). 3) راجع اشتراكاتك. 4) قارن الأسعار. 5) تجنب الديون الاستهلاكية. 6) أعد التفاوض على الفواتير. 7) اشتر بقائمة. 8) راقب تقدمك أسبوعياً." },
        { id: 3, title: "فهم معدل الفائدة المركب", excerpt: "كيف تعمل الفائدة المركبة ولماذا هي قوية...", readTime: "6 دقائق", category: "تعليم", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop", body: "الفائدة المركبة تعني أن العوائد التي تكسبها تعود لتولّد عوائد إضافية. مثال: 10,000 ريال بمعدل 8% سنوياً تصبح بعد 10 سنوات ≈ 21,589 ريال، وبعد 30 سنة ≈ 100,627 ريال." },
        { id: 4, title: "التخطيط للتقاعد المبكر", excerpt: "خطوات عملية للاستقلال المالي...", readTime: "8 دقائق", category: "تقاعد", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop", body: "قاعدة 25x: المبلغ المطلوب للتقاعد = مصروفك السنوي × 25. خطوات: قلّل نفقاتك، ادخر بانتظام، استثمر في صناديق منخفضة التكلفة، ابنِ مصادر دخل سلبية." }
    ],

    quizQuestions: [
        { question: "ما هو أفضل مكان للاحتفاظ بصندوق الطوارئ؟", options: ["حساب توفير عالي العائد", "الأسهم", "العملات الرقمية", "تحت الوسادة"], correct: 0 },
        { question: "كم يجب أن يكون صندوق الطوارئ؟", options: ["راتب شهر واحد", "3-6 أشهر من النفقات", "سنة كاملة", "لا يوجد حد محدد"], correct: 1 },
        { question: "ما هو التنويع في الاستثمار؟", options: ["وضع كل المال في سهم واحد", "توزيع الاستثمارات على أصول مختلفة", "الاحتفاظ بالنقد فقط", "الاستثمار في بلد واحد"], correct: 1 },
        { question: "ما هي الفائدة المركبة؟", options: ["فائدة على الأصل فقط", "فائدة على الأصل والفوائد السابقة", "رسوم بنكية", "ضريبة على الربح"], correct: 1 },
        { question: "ما هو معدل الدين المقبول؟", options: ["50% من الدخل", "30% من الدخل", "70% من الدخل", "90% من الدخل"], correct: 1 }
    ],

    vaults: [
        { id: 1, name: "حصالة السفر ✈️", targetAmount: 15000, currentAmount: 8750, durationMonths: 6, createdAt: "2026-01-15", isLocked: true },
        { id: 2, name: "سيارة الأحلام 🚗", targetAmount: 120000, currentAmount: 45000, durationMonths: 12, createdAt: "2025-10-01", isLocked: true },
        { id: 3, name: "صندوق الطوارئ 🛡️", targetAmount: 50000, currentAmount: 32000, durationMonths: 24, createdAt: "2025-06-01", isLocked: true }
    ],

    subscriptions: [
        { name: "بث ترفيهي", amount: 45, lastUsed: "2026-04-20", status: "active" },
        { name: "اشتراك جيم", amount: 299, lastUsed: "2026-02-10", status: "active" },
        { name: "بث موسيقي", amount: 27, lastUsed: "2026-04-22", status: "active" },
        { name: "تطبيق توصيل", amount: 35, lastUsed: "2026-03-01", status: "active" }
    ],

    escrowContracts: [
        { id: 1, title: "تصميم هوية بصرية", clientName: "أحمد آل سعود", freelancerName: "سارة المصمّمة",
          totalAmount: 5000, status: "in-progress", createdAt: "2026-04-10",
          milestones: [
            { id: 1, title: "تسليم المقترحات الأولية", amount: 1500, status: "approved", submittedAt: "2026-04-15", approvedAt: "2026-04-16" },
            { id: 2, title: "تسليم التصميم النهائي", amount: 2000, status: "in-progress", submittedAt: null, approvedAt: null },
            { id: 3, title: "تسليم ملفات المصدر", amount: 1500, status: "pending", submittedAt: null, approvedAt: null }
          ], ratings: [] },
        { id: 2, title: "تطوير تطبيق جوال", clientName: "شركة تقنية", freelancerName: "أحمد آل سعود",
          totalAmount: 15000, status: "in-progress", createdAt: "2026-04-01",
          milestones: [
            { id: 1, title: "تسليم الواجهات UI/UX", amount: 3000, status: "approved", submittedAt: "2026-04-08", approvedAt: "2026-04-09" },
            { id: 2, title: "برمجة الواجهة الأمامية", amount: 5000, status: "review", submittedAt: "2026-04-20", approvedAt: null },
            { id: 3, title: "ربط الـ API", amount: 4000, status: "pending", submittedAt: null, approvedAt: null },
            { id: 4, title: "الاختبار والتسليم النهائي", amount: 3000, status: "pending", submittedAt: null, approvedAt: null }
          ], ratings: [] },
        { id: 3, title: "كتابة محتوى تسويقي", clientName: "أحمد آل سعود", freelancerName: "نورة الكاتبة",
          totalAmount: 3000, status: "completed", createdAt: "2026-03-15",
          milestones: [
            { id: 1, title: "كتابة 10 مقالات", amount: 1500, status: "approved", submittedAt: "2026-03-25", approvedAt: "2026-03-26" },
            { id: 2, title: "كتابة محتوى السوشال ميديا", amount: 1500, status: "approved", submittedAt: "2026-04-05", approvedAt: "2026-04-06" }
          ], ratings: [{ rating: 5, comment: "عمل ممتاز", date: "2026-04-07" }] }
    ],

    notifications: [
        { id: 1, title: "تم استلام الراتب", message: "تم إضافة 15,000 ر.س إلى حسابك", time: "اليوم، 09:00 ص", icon: "fa-money-bill-wave", color: "emerald", read: false },
        { id: 2, title: "فاتورة مستحقة", message: "تنبيه: فاتورة الكهرباء (245 ر.س) مستحقة غداً", time: "اليوم، 11:30 ص", icon: "fa-bolt", color: "amber", read: false },
        { id: 3, title: "نقاط مكافأة", message: "لقد حصلت على 500 نقطة إضافية", time: "أمس، 08:15 م", icon: "fa-gift", color: "purple", read: true },
        { id: 4, title: "أمان الحساب", message: "تم تسجيل دخول جديد", time: "أمس، 02:40 م", icon: "fa-shield-alt", color: "blue", read: true },
        { id: 5, title: "تنبيه الميزانية", message: "تجاوزت 90% من ميزانية التسوق", time: "منذ يومين", icon: "fa-exclamation-triangle", color: "rose", read: true }
    ],

    outgoingTransfers: [
        { id: 'TRX-20260401-001', type: 'local', recipientName: 'محمد عبدالله', recipientIban: 'SA4420000001234567891234', bank: 'الراجحي', amount: 500, currency: 'SAR', purpose: 'سداد دين', notes: '', status: 'completed', date: '2026-04-01', fee: 0 },
        { id: 'TRX-20260403-002', type: 'local', recipientName: 'فاطمة أحمد', recipientIban: 'SA5510000002345678901234', bank: 'الأهلي', amount: 1200, currency: 'SAR', purpose: 'إيجار', notes: 'إيجار شهر أبريل', status: 'completed', date: '2026-04-03', fee: 0 },
        { id: 'TRX-20260410-003', type: 'international', recipientName: 'John Smith', recipientIban: 'GB29NWBK60161331926819', swift: 'NWBKGB2L', bank: 'Natwest Bank', bankAddress: 'London, UK', amount: 3750, currency: 'GBP', exchangeRate: 4.73, fee: 25, status: 'completed', date: '2026-04-10' },
        { id: 'TRX-20260420-004', type: 'local', recipientName: 'عبدالرحمن سعيد', recipientIban: 'SA3380000003456789012345', bank: 'الرياض', amount: 800, currency: 'SAR', purpose: 'هدية', notes: '', status: 'pending', date: '2026-04-20', fee: 0 },
        { id: 'TRX-20260422-005', type: 'international', recipientName: 'Ahmed Hassan', recipientIban: 'EG380019000500000000263180002', swift: 'NBEGEGCX', bank: 'National Bank of Egypt', bankAddress: 'Cairo, Egypt', amount: 5000, currency: 'EGP', exchangeRate: 0.077, fee: 25, status: 'in-progress', date: '2026-04-22' },
        { id: 'TRX-20260425-006', type: 'local', recipientName: 'سارة المالكي', recipientIban: 'SA6640000004567890123456', bank: 'الراجحي', amount: 350, currency: 'SAR', purpose: 'تسوق', notes: '', status: 'rejected', date: '2026-04-25', fee: 0, rejectionReason: 'رقم IBAN غير صحيح' }
    ],

    incomingTransfers: [
        { id: 'RCV-20260401-001', type: 'local', senderName: 'شركة التقنية المتقدمة', amount: 15000, currency: 'SAR', date: '2026-04-01', status: 'completed', referenceId: 'REF-98761' },
        { id: 'RCV-20260405-002', type: 'local', senderName: 'سارة المالكي', amount: 300, currency: 'SAR', date: '2026-04-05', status: 'completed', referenceId: 'REF-98762' },
        { id: 'RCV-20260410-003', type: 'international', senderName: 'Global Tech Inc.', country: 'الولايات المتحدة', amount: 2500, currency: 'USD', date: '2026-04-10', status: 'completed', referenceId: 'REF-INT-4401' },
        { id: 'RCV-20260415-004', type: 'local', senderName: 'عمر الحربي', amount: 450, currency: 'SAR', date: '2026-04-15', status: 'completed', referenceId: 'REF-98763' },
        { id: 'RCV-20260420-005', type: 'international', senderName: 'Ali Reza Trading', country: 'الإمارات', amount: 1800, currency: 'AED', date: '2026-04-20', status: 'pending', referenceId: 'REF-INT-4402' },
        { id: 'RCV-20260425-006', type: 'local', senderName: 'محمد العتيبي', amount: 1200, currency: 'SAR', date: '2026-04-25', status: 'in-progress', referenceId: 'REF-98764' }
    ],

    moneyRequests: [
        { id: 'REQ-001', requesterName: 'سارة المالكي', amount: 500, currency: 'SAR', date: '2026-04-20', status: 'pending', note: 'مبلغ العشاء' },
        { id: 'REQ-002', requesterName: 'محمد عبدالله', amount: 1500, currency: 'SAR', date: '2026-04-22', status: 'pending', note: 'حصتك من الرحلة' },
        { id: 'REQ-003', requesterName: 'فاطمة أحمد', amount: 200, currency: 'SAR', date: '2026-04-18', status: 'accepted', note: 'ثمن الهدية' },
        { id: 'REQ-004', requesterName: 'خالد السعيد', amount: 3000, currency: 'SAR', date: '2026-04-15', status: 'rejected', note: 'سلفة مؤقتة' }
    ],

    bridgeFinanceLoans: [],
    walletCoupons: [],

    // Internal users directory (for internal transfers — emulates a backend lookup)
    internalUsers: [
        { id: 'user-001', phone: '+966501234567', email: 'mohammed@example.com', name: 'محمد عبدالله', verified: true },
        { id: 'user-002', phone: '+966509876543', email: 'sara@example.com', name: 'سارة المالكي', verified: true },
        { id: 'user-003', phone: '+966555111222', email: 'fatima@example.com', name: 'فاطمة أحمد', verified: true },
        { id: 'user-004', phone: '+966533445566', email: 'omar@example.com', name: 'عمر الحربي', verified: false }
    ],

    notifications: [
        { id: 1, title: "تحويل مستلم", message: "استلمت 1,200 ر.س من محمد العتيبي", time: "منذ 10 دقائق", read: false, icon: "fa-arrow-down", color: "emerald" },
        { id: 2, title: "تنبيه الميزانية", message: "لقد تجاوزت 80% من ميزانية التسوق", time: "منذ ساعة", read: false, icon: "fa-exclamation-triangle", color: "amber" },
        { id: 3, title: "دخول جديد", message: "تم تسجيل دخول جديد من متصفح Chrome", time: "أمس", read: true, icon: "fa-shield-alt", color: "blue" }
    ]
};

// =====================================================
// BUDGET CATEGORY MAPPING
// =====================================================
window._budgetCategoryMap = {
    'طعام': 'طعام ومطاعم', 'مطاعم': 'طعام ومطاعم',
    'تسوق': 'تسوق',
    'مواصلات': 'مواصلات',
    'فواتير': 'فواتير', 'كهرباء': 'فواتير', 'ماء': 'فواتير', 'إنترنت': 'فواتير', 'جوال': 'فواتير', 'بلدية': 'فواتير',
    'اتصالات': 'فواتير', 'شحن رصيد': 'فواتير',
    'ترفيه': 'ترفيه',
    'صحة': 'صحة', 'رياضة': 'صحة',
    'تحويل': 'تحويلات', 'حوالة': 'تحويلات', 'حوالة بنكية': 'تحويلات', 'حوالة دولية': 'تحويلات',
    'ادخار': 'ادخار',
    'استرداد': 'أخرى', 'زكاة': 'أخرى', 'سحب': 'أخرى', 'تمويل': 'أخرى', 'إيداع': 'أخرى', 'سداد تمويل': 'أخرى'
};

// Override unshift to trigger budget UI re-render only (calculation done in renderBudgetCategories)
const _origUnshift = AppData.transactions.unshift;
AppData.transactions.unshift = function (...args) {
    const result = _origUnshift.apply(this, args);
    const container = document.getElementById("budget-categories");
    if (container && typeof renderBudgetCategories === 'function') {
        try { renderBudgetCategories(); } catch (e) { /* ignore */ }
    }
    if (typeof markStateDirty === 'function') markStateDirty();
    return result;
};

// =====================================================
// PERSISTENCE
// =====================================================
window.persistUserState = function persistUserState() {
    try {
        const state = {
            balance: AppData.user.balance,
            points: AppData.user.points,
            zakatHawlStart: AppData.user.zakatHawlStart,
            zakatLastPaidYear: AppData.user.zakatLastPaidYear,
            transactions: AppData.transactions.slice(0, 100),
            bills: AppData.bills,
            vaults: AppData.vaults,
            outgoingTransfers: AppData.outgoingTransfers.slice(0, 50),
            moneyRequests: AppData.moneyRequests,
            escrowContracts: AppData.escrowContracts,
            walletCoupons: AppData.walletCoupons,
            bridgeFinanceLoans: AppData.bridgeFinanceLoans,
            linkedBanks: AppData.user.linkedBanks
        };
        localStorage.setItem('ithraa_state', JSON.stringify(state));
    } catch (e) { console.warn('persistUserState failed:', e); }
};

window.loadUserState = function loadUserState() {
    try {
        const raw = localStorage.getItem('ithraa_state');
        if (!raw) return;
        const s = JSON.parse(raw);
        if (typeof s.balance === 'number') AppData.user.balance = s.balance;
        if (typeof s.points === 'number') AppData.user.points = s.points;
        if (s.zakatHawlStart !== undefined) AppData.user.zakatHawlStart = s.zakatHawlStart;
        if (s.zakatLastPaidYear !== undefined) AppData.user.zakatLastPaidYear = s.zakatLastPaidYear;
        if (Array.isArray(s.transactions) && s.transactions.length) AppData.transactions = s.transactions;
        if (Array.isArray(s.bills)) AppData.bills = s.bills;
        if (Array.isArray(s.vaults)) AppData.vaults = s.vaults;
        if (Array.isArray(s.outgoingTransfers)) AppData.outgoingTransfers = s.outgoingTransfers;
        if (Array.isArray(s.moneyRequests)) AppData.moneyRequests = s.moneyRequests;
        if (Array.isArray(s.escrowContracts)) AppData.escrowContracts = s.escrowContracts;
        if (Array.isArray(s.walletCoupons)) AppData.walletCoupons = s.walletCoupons;
        if (Array.isArray(s.bridgeFinanceLoans)) AppData.bridgeFinanceLoans = s.bridgeFinanceLoans;
        if (Array.isArray(s.linkedBanks)) AppData.user.linkedBanks = s.linkedBanks;
    } catch (e) { console.warn('loadUserState failed:', e); }
};

let _persistTimer = null;
window.markStateDirty = function markStateDirty() {
    if (_persistTimer) return;
    _persistTimer = setTimeout(() => { persistUserState(); _persistTimer = null; }, 1500);
};

window.clearUserState = function clearUserState() {
    try {
        localStorage.removeItem('ithraa_state');
        localStorage.removeItem('ithraa_users');
        localStorage.removeItem('ithraa_session');
        localStorage.removeItem('ithraa_gamification');
        localStorage.removeItem('ithraa_education');
        localStorage.removeItem('ithraa_autosave');
    } catch (e) { }
};

loadUserState();
window.addEventListener('beforeunload', () => persistUserState());
