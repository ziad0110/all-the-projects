// =====================================================
// BALANCE HELPERS — Single source of truth
// =====================================================
// IMPORTANT FIX: All balance changes go through addTransaction()
// which BOTH updates AppData.user.balance AND inserts a transaction.
// getAvailableBalance() simply READS the current balance — no recalculation.

window.addTransaction = function addTransaction(tx) {
    // Apply balance change (income increases, expense/transfer decreases)
    if (typeof tx.amount === 'number') {
        AppData.user.balance += tx.amount;
        // Round to 2 decimal places to avoid floating-point drift
        AppData.user.balance = Math.round(AppData.user.balance * 100) / 100;
    }
    // Defaults
    if (!tx.id) tx.id = Date.now() + Math.floor(Math.random() * 1000);
    if (!tx.date) tx.date = new Date().toISOString().split('T')[0];
    if (!tx.color) tx.color = tx.amount >= 0 ? 'emerald' : 'rose';

    AppData.transactions.unshift(tx);

    // Notify listeners
    if (typeof markStateDirty === 'function') markStateDirty();
    if (typeof addNotification === 'function' && tx.notify !== false) {
        const sign = tx.amount >= 0 ? '+' : '-';
        addNotification(tx.title || 'عملية جديدة', `${sign}${Math.abs(tx.amount).toLocaleString()} ${getCurrency()}`,
            tx.icon || 'fa-info-circle', tx.color);
    }
    return tx;
};

// READ-ONLY balance getter — does NOT recalculate
window.getAvailableBalance = function getAvailableBalance() {
    return Number(AppData.user.balance) || 0;
};

window.getLockedInEscrow = function getLockedInEscrow() {
    return AppData.escrowContracts
        .filter(c => c.status !== 'completed')
        .reduce((total, c) => {
            const released = c.milestones.filter(m => m.status === 'approved').reduce((a, m) => a + m.amount, 0);
            return total + (c.totalAmount - released);
        }, 0);
};

window.getLockedInVaults = function getLockedInVaults() {
    return AppData.vaults.filter(v => v.isLocked).reduce((a, v) => a + v.currentAmount, 0);
};

// Total worth = available + savings (escrow is owed to others)
window.getTotalBalance = function getTotalBalance() {
    return getAvailableBalance() + getLockedInVaults();
};

// Outstanding bridge finance debt
window.getOutstandingDebt = function getOutstandingDebt() {
    if (!AppData.bridgeFinanceLoans) return 0;
    return AppData.bridgeFinanceLoans
        .filter(l => l.status === 'active')
        .reduce((a, l) => a + l.totalDue, 0);
};

window.updateBalance = function updateBalance() {
    const cur = getCurrency();
    const mainEl = document.getElementById('main-balance');
    const walletEl = document.getElementById('wallet-balance');
    const total = getTotalBalance();
    const available = getAvailableBalance();

    if (mainEl) {
        mainEl.textContent = balanceVisible
            ? total.toLocaleString('en', { minimumFractionDigits: 2 }) + ' ' + cur
            : '**** ' + cur;
        const eye = document.getElementById("balance-eye");
        if (eye) eye.className = balanceVisible ? "fas fa-eye text-xs" : "fas fa-eye-slash text-xs";
    }
    if (walletEl) {
        walletEl.textContent = available.toLocaleString('en', { minimumFractionDigits: 2 }) + ' ' + cur;
    }

    if (typeof updateDashboardStats === 'function') updateDashboardStats();

    const lockedBadge = document.getElementById('locked-funds-info');
    const escrowLocked = getLockedInEscrow();
    const vaultLocked = getLockedInVaults();
    const debt = getOutstandingDebt();
    if (lockedBadge) {
        if (escrowLocked > 0 || vaultLocked > 0 || debt > 0) {
            const parts = [];
            if (vaultLocked > 0) parts.push(`حصالات: ${vaultLocked.toLocaleString()}`);
            if (escrowLocked > 0) parts.push(`ضمان: ${escrowLocked.toLocaleString()}`);
            if (debt > 0) parts.push(`دين: ${debt.toLocaleString()}`);
            lockedBadge.innerHTML = `<i class="fas fa-lock text-[10px] text-amber-400"></i> ${escapeHtml(parts.join(' | '))} ${escapeHtml(cur)}`;
            lockedBadge.style.display = 'flex';
        } else {
            lockedBadge.style.display = 'none';
        }
    }
};

window.updateDashboardStats = function updateDashboardStats() {
    const cur = getCurrency();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthTx = AppData.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((a, t) => a + Math.abs(t.amount), 0);
    // Exclude savings/transfers from "expenses" stat to avoid double-counting
    const totalExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((a, t) => a + Math.abs(t.amount), 0);

    const incomeEl = document.getElementById('dash-income');
    const expenseEl = document.getElementById('dash-expense');
    if (incomeEl) incomeEl.textContent = totalIncome.toLocaleString() + ' ' + cur;
    if (expenseEl) expenseEl.textContent = totalExpense.toLocaleString() + ' ' + cur;

    const monthLabel = document.getElementById('dash-month-label');
    if (monthLabel) {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        monthLabel.textContent = months[currentMonth] + ' ' + currentYear;
    }

    const unpaidCount = AppData.bills.filter(b => !b.paid).length;
    const billsBadge = document.getElementById('sidebar-bills-badge');
    if (billsBadge) billsBadge.textContent = unpaidCount;
    const mobileBillsBadge = document.getElementById('mobile-bills-badge');
    if (mobileBillsBadge) mobileBillsBadge.textContent = unpaidCount;

    const billsCountEl = document.getElementById('bills-pending-count');
    const billsTotalEl = document.getElementById('bills-pending-total');
    if (billsCountEl) billsCountEl.textContent = `${unpaidCount} فواتير تنتظر الدفع`;
    if (billsTotalEl) {
        const unpaidTotal = AppData.bills.filter(b => !b.paid).reduce((a, b) => a + b.amount, 0);
        billsTotalEl.textContent = unpaidTotal.toLocaleString() + ' ' + cur;
    }

    const pointsEl = document.getElementById('rewards-points');
    if (pointsEl) pointsEl.textContent = AppData.user.points.toLocaleString() + ' نقطة';
};

window.toggleBalance = function toggleBalance() {
    balanceVisible = !balanceVisible;
    const cur = getCurrency();
    const el = document.getElementById("main-balance");
    const eye = document.getElementById("balance-eye");
    if (!el) return;
    if (balanceVisible) {
        el.textContent = getTotalBalance().toLocaleString("en", { minimumFractionDigits: 2 }) + " " + cur;
        if (eye) eye.className = "fas fa-eye text-xs";
    } else {
        el.textContent = "**** " + cur;
        if (eye) eye.className = "fas fa-eye-slash text-xs";
    }
};

// =====================================================
// NOTIFICATIONS HELPER (real, not static)
// =====================================================
window.addNotification = function addNotification(title, message, icon, color) {
    if (!AppData.notifications) AppData.notifications = [];
    const now = new Date();
    const time = `اليوم، ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    AppData.notifications.unshift({
        id: Date.now(),
        title: title,
        message: message,
        time: time,
        icon: icon || 'fa-bell',
        color: color || 'purple',
        read: false
    });
    // Keep only most recent 30
    if (AppData.notifications.length > 30) AppData.notifications = AppData.notifications.slice(0, 30);

    // Update badge if rendered
    const badge = document.getElementById('notifications-badge');
    if (badge) {
        const unreadCount = AppData.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount > 0 ? unreadCount : '';
        badge.style.display = unreadCount > 0 ? '' : 'none';
    }
};

// =====================================================
// ACTIVITY LOG HELPER (real, not static)
// =====================================================
window.logActivity = function logActivity(action, detail) {
    if (!AppData.activities) AppData.activities = [];
    const now = new Date();
    const ua = navigator.userAgent;
    let device = 'متصفح ويب';
    if (/iPhone/.test(ua)) device = 'iPhone';
    else if (/iPad/.test(ua)) device = 'iPad';
    else if (/Android/.test(ua)) device = 'Android';
    else if (/Mac/.test(ua)) device = 'Mac';
    else if (/Windows/.test(ua)) device = 'Windows';

    AppData.activities.unshift({
        action: action,
        device: device,
        location: 'حسب IP المتصفح',
        time: now.toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        icon: 'fa-circle-info',
        color: 'cyan',
        detail: detail || ''
    });
    if (AppData.activities.length > 50) AppData.activities = AppData.activities.slice(0, 50);
};
