// =====================================================
// UI HELPERS — إثراء FinVault
// =====================================================

// SKELETON LOADING
window.renderSkeleton = function renderSkeleton(pageId) {
    const skeletons = {
        'dashboard': `
            <div class="space-y-6">
                <div class="skeleton h-16 w-full rounded-2xl opacity-60"></div>
                <div class="skeleton h-56 w-full rounded-3xl"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="skeleton h-32 w-full rounded-2xl"></div>
                    <div class="skeleton h-32 w-full rounded-2xl"></div>
                </div>
                <div class="skeleton h-72 w-full rounded-2xl"></div>
                <div class="skeleton h-48 w-full rounded-2xl"></div>
            </div>`,
        'wallet': `
            <div class="space-y-6">
                <div class="skeleton h-64 w-full rounded-3xl"></div>
                <div class="grid grid-cols-3 gap-3">
                    <div class="skeleton h-24 w-full rounded-2xl"></div>
                    <div class="skeleton h-24 w-full rounded-2xl"></div>
                    <div class="skeleton h-24 w-full rounded-2xl"></div>
                </div>
                <div class="space-y-3">
                    <div class="skeleton h-16 w-full rounded-xl"></div>
                    <div class="skeleton h-16 w-full rounded-xl"></div>
                    <div class="skeleton h-16 w-full rounded-xl"></div>
                </div>
            </div>`,
        'analytics': `
            <div class="space-y-6">
                <div class="skeleton h-10 w-48 rounded-xl opacity-40"></div>
                <div class="skeleton h-80 w-full rounded-3xl"></div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="skeleton h-28 w-full rounded-2xl"></div>
                    <div class="skeleton h-28 w-full rounded-2xl"></div>
                    <div class="skeleton h-28 w-full rounded-2xl"></div>
                </div>
            </div>`,
        'default': `
            <div class="space-y-6">
                <div class="skeleton h-10 w-64 rounded-xl opacity-40"></div>
                <div class="skeleton h-48 w-full rounded-2xl"></div>
                <div class="skeleton h-32 w-full rounded-2xl"></div>
                <div class="space-y-2">
                    <div class="skeleton h-16 w-full rounded-xl"></div>
                    <div class="skeleton h-16 w-full rounded-xl"></div>
                </div>
            </div>`
    };
    return skeletons[pageId] || skeletons['default'];
};

window.showLoadingState = function showLoadingState(pageId) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return null;

    const existing = document.getElementById('global-skeleton');
    if (existing) existing.remove();

    const skeletonDiv = document.createElement('div');
    skeletonDiv.id = 'global-skeleton';
    skeletonDiv.className = 'p-4 md:p-8 animate-fade-in';
    skeletonDiv.innerHTML = renderSkeleton(pageId);

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    mainContent.appendChild(skeletonDiv);
    return skeletonDiv;
};

// MODALS
window.showModal = function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
};

window.closeModal = function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
    const confirmBtnWrap = document.getElementById("confirm-btn-wrap");
    if (confirmBtnWrap) confirmBtnWrap.style.display = "";
};

// SECURE confirm — accepts plain text only by default
window.showConfirm = function showConfirm(title, message, callback) {
    document.getElementById("confirm-title").textContent = title;
    // Use textContent to prevent XSS injection
    document.getElementById("confirm-message").textContent = message;
    showModal("confirm-modal");
    window.onConfirmExecute = callback;
};

// HTML variant — only call when content is trusted/sanitized
window.showConfirmHTML = function showConfirmHTML(title, htmlContent, callback) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-message").innerHTML = htmlContent;
    showModal("confirm-modal");
    window.onConfirmExecute = callback;
};

window.executeConfirmed = function executeConfirmed() {
    closeModal("confirm-modal");
    if (window.onConfirmExecute) {
        window.onConfirmExecute();
        window.onConfirmExecute = null;
    }
};

window.showSuccess = function showSuccess(title, message) {
    document.getElementById("success-title").textContent = title;
    document.getElementById("success-message").textContent = message;
    showModal("success-modal");
    createConfetti();
};

window.showToast = function showToast(title, message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    document.getElementById("toast-title").textContent = title;
    document.getElementById("toast-message").textContent = message;
    toast.classList.add("show");
    if (type === 'error') toast.classList.add('toast-error');
    else toast.classList.remove('toast-error');
    setTimeout(() => toast.classList.remove("show"), 3000);
};

window.createConfetti = function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "vw";
        c.style.backgroundColor = ["#d0bcff", "#4cd7f6", "#ffb869", "#10b981", "#f43f5e"][Math.floor(Math.random() * 5)];
        c.style.animationDelay = Math.random() * 2 + "s";
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3000);
    }
};

window.showTransactionDetails = function showTransactionDetails(txId) {
    const tx = AppData.transactions.find(t => t.id == txId);
    if (!tx) return;

    const color = tx.color || 'gray';
    const cur = getCurrency();

    const iconEl = document.getElementById("tx-modal-icon");
    const bgEl = document.getElementById("tx-modal-bg");
    if (iconEl) iconEl.className = "fas " + tx.icon + " text-" + color + "-400 text-2xl";
    if (bgEl) bgEl.className = "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-" + color + "-500/20 shadow-inner";

    document.getElementById("tx-modal-title").textContent = tx.title;
    const amountEl = document.getElementById("tx-modal-amount");
    if (amountEl) {
        amountEl.textContent = (tx.type === 'income' ? '+' : '-') + Math.abs(tx.amount).toLocaleString() + ' ' + cur;
        amountEl.className = "text-3xl font-bold mb-2 tracking-wide " + (tx.type === 'income' ? "text-emerald-400" : "text-rose-400");
    }
    document.getElementById("tx-modal-category").textContent = tx.category;
    document.getElementById("tx-modal-date").textContent = tx.date;
    document.getElementById("tx-modal-ref").textContent = "TRX-" + tx.id;

    showModal("transaction-details-modal");
};

// THEME
window.toggleTheme = function toggleTheme() {
    const body = document.body;
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");
    try { localStorage.setItem('ithraa_theme', isLight ? 'light' : 'dark'); } catch (e) {}

    const mobileIcon = document.getElementById("mobile-theme-icon");
    const moreIcon = document.getElementById("more-theme-icon");
    const desktopIcon = document.getElementById("theme-icon");
    const iconClass = isLight ? "fa-sun" : "fa-moon";
    if (mobileIcon) mobileIcon.className = `fas ${iconClass} text-sm`;
    if (moreIcon) moreIcon.className = `fas ${iconClass} text-gray-400`;
    if (desktopIcon) desktopIcon.className = `fas ${iconClass} w-6`;

    // Delay chart re-renders to allow CSS transitions to complete smoothly
    setTimeout(() => {
        try {
            if (document.getElementById('page-analytics')?.classList.contains('active') && typeof initAnalytics === 'function') initAnalytics();
            if (document.getElementById('page-dashboard')?.classList.contains('active') && typeof initDashboardChart === 'function') initDashboardChart();
        } catch (e) { console.error(e); }
    }, 150);

    showToast(isLight ? "الوضع النهاري" : "الوضع الليلي", isLight ? "تم تفعيل المظهر الفاتح" : "تم تفعيل المظهر الداكن");
};

// Restore saved theme on load
try {
    if (localStorage.getItem('ithraa_theme') === 'light') {
        document.body.classList.add('light-mode');
    }
} catch (e) {}

window.showMoreMenu = function showMoreMenu() {
    const menu = document.getElementById("more-menu");
    if (menu) {
        menu.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
};

window.closeMoreMenu = function closeMoreMenu() {
    const menu = document.getElementById("more-menu");
    if (menu) {
        menu.classList.add("hidden");
        document.body.style.overflow = "";
    }
};

// Transfer tabs (kept here for backward compatibility — calls into transfers.js handlers)
window.setTransferTab = function setTransferTab(tab, prevTab = 'menu') {
    window.currentTransferTab = tab;
    document.querySelectorAll(".transfer-content").forEach(c => c.classList.add("hidden"));
    const target = document.getElementById(`transfer-${tab}`);
    if (target) target.classList.remove("hidden");

    const backNav = document.getElementById("transfers-back-nav");
    if (backNav) {
        backNav.classList.toggle("hidden", tab === 'menu');
        const backBtn = backNav.querySelector('button');
        if (backBtn) {
            // Use a function to avoid immediate execution
            backBtn.onclick = () => setTransferTab(prevTab);
        }
    }

    // Defer renders
    setTimeout(() => {
        if (tab === 'local-receive' && typeof renderLocalIncoming === 'function') renderLocalIncoming();
        if (tab === 'intl-receive' && typeof renderIntlIncoming === 'function') renderIntlIncoming();
        if (tab === 'status' && typeof renderTransferStatus === 'function') renderTransferStatus();
        if (tab === 'requests' && typeof renderMoneyRequests === 'function') renderMoneyRequests();
    }, 30);
};

// Render transactions wrapper — fixes "renderTransactions is not defined" silent failure
window.renderTransactions = function renderTransactions() {
    if (typeof renderRecentTransactions === 'function') {
        try { renderRecentTransactions(); } catch (e) {}
    }
    if (typeof renderWalletTransactions === 'function') {
        try { renderWalletTransactions(); } catch (e) {}
    }
};

// Common copyToClipboard with modern fallback
window.copyToClipboard = function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => _legacyCopy(text));
    } else {
        _legacyCopy(text);
    }
};
function _legacyCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(el);
}
