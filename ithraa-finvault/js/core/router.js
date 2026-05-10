// =====================================================
// CORE STATE & ROUTER — إثراء FinVault
// =====================================================
window.currentPin = "";
window.balanceVisible = false;
window.cardsVisible = false;
window.currentFilter = "all";
window.currentTransferTab = "menu";
window.quizCurrent = 0;
window.quizScore = 0;
window.roundupEnabled = false;
window.charts = {
    dashboard: null, pie: null, line: null, bar: null,
    heatmap: null, radarPrediction: null
};

// Cache for fetched HTML fragments (lazy-loading + caching)
window._pageCache = {};

window.navigateTo = async function navigateTo(pageId) {
    try {
        const skeleton = showLoadingState(pageId);
        window.scrollTo(0, 0);
        document.querySelector('.main-content')?.scrollTo(0, 0);

        // Update active nav items
        document.querySelectorAll(".sidebar-item, .bottom-nav-item").forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("onclick")?.includes(`'${pageId}'`)) {
                item.classList.add("active");
            }
        });

        // Use cache if available, otherwise fetch
        let htmlContent = window._pageCache[pageId];
        if (!htmlContent) {
            const htmlPath = `./js/features/${pageId}/${pageId}.html`;
            const response = await fetch(htmlPath);
            if (!response.ok) throw new Error(`فشل في تحميل الصفحة`);
            htmlContent = await response.text();
            window._pageCache[pageId] = htmlContent;
        }

        // Render immediately (no fake delay)
        if (skeleton) skeleton.remove();

        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = htmlContent;
        }

        // Update page title
        const titles = {
            'dashboard': ['الرئيسية', 'نظرة عامة على حسابك'],
            'wallet': ['المحفظة', 'إدارة بطاقاتك وعملياتك'],
            'transfers': ['التحويلات', 'أرسل واطلب الأموال'],
            'bills': ['الفواتير', 'مدفوعاتك القادمة'],
            'budget': ['الميزانية', 'خطط لمستقبلك المالي'],
            'analytics': ['التحليلات', 'تقارير مفصلة عن نموك'],
            'ai-chat': ['المستشار الذكي', 'نصائح مالية مخصصة لك'],
            'rewards': ['المكافآت', 'استبدل نقاطك بمزايا حصرية'],
            'education': ['التثقيف المالي', 'طور مهاراتك المالية'],
            'security': ['الأمان', 'حماية خصوصيتك وبياناتك'],
            'cashflow-radar': ['رادار التدفق النقدي', 'توقعات ذكية لسيولتك المالية'],
            'escrow': ['الضمان الذكي', 'دفعات آمنة بنظام المراحل'],
            'subscriptions': ['الاشتراكات', 'اختر الباقة المناسبة لك'],
            'vault': ['الحصالة الذكية', 'ادخر بانضباط واقفل أموالك']
        };

        if (titles[pageId]) {
            const titleEl = document.getElementById("page-title");
            const subtitleEl = document.getElementById("page-subtitle");
            if (titleEl) titleEl.textContent = titles[pageId][0];
            if (subtitleEl) subtitleEl.textContent = titles[pageId][1];
        }

        if (appContainer && appContainer.firstElementChild) {
            appContainer.firstElementChild.classList.add('active');
            appContainer.firstElementChild.style.display = 'block';
        }

        // Initialize page
        const inits = {
            'dashboard': window.initDashboard,
            'wallet': window.initWallet,
            'bills': window.initBills,
            'budget': window.initBudget,
            'analytics': window.initAnalytics,
            'security': window.initSecurity,
            'rewards': window.initRewards,
            'education': window.initEducation,
            'vault': window.initVault,
            'cashflow-radar': window.initCashflowRadar,
            'escrow': window.initEscrow,
            'subscriptions': window.initSubscriptions,
            'transfers': window.initTransfersPage,
            'ai-chat': window.initFinVisionAI
        };

        if (inits[pageId]) {
            try { inits[pageId](); } catch (e) { console.error('Error in init for', pageId, e); }
        }

        // Log activity
        if (typeof logActivity === 'function') {
            logActivity('تصفح صفحة', titles[pageId] ? titles[pageId][0] : pageId);
        }
    } catch (e) {
        console.error("Navigation error:", e);
        const skeleton = document.getElementById('global-skeleton');
        if (skeleton) skeleton.remove();
        showToast("خطأ", "فشل في تحميل الصفحة. يرجى المحاولة لاحقاً.", "error");
    }
};
