// =====================================================
// WALLET — with real filter menu, link bank persistence
// =====================================================
window.initWallet = function initWallet() {
    updateBalance();
    renderWalletTransactions();
    updateWalletStats();
};

window.rechargeDemoBalance = function rechargeDemoBalance() {
    showConfirm("شحن الرصيد التجريبي", "هل تريد إضافة 50,000 ر.س لتجربة وظائف التطبيق؟", () => {
        const amount = 50000;
        addTransaction({
            title: "شحن رصيد تجريبي",
            amount: amount,
            type: "income",
            category: "أخرى",
            icon: "fa-magic",
            color: "amber",
            notify: true
        });
        showSuccess("تم الشحن بنجاح", "تمت إضافة 50,000 ر.س إلى محفظتك. استمتع بتجربة باقي الوظائف!");
        if (typeof updateBalance === 'function') updateBalance();
        if (typeof renderWalletTransactions === 'function') renderWalletTransactions();
        if (typeof updateWalletStats === 'function') updateWalletStats();
    });
};

window.renderWalletTransactions = function renderWalletTransactions() {
    const container = document.getElementById("wallet-transactions");
    if (!container) return;
    const cur = getCurrency();
    const search = document.getElementById("transaction-search")?.value || "";

    let filtered = AppData.transactions;
    if (currentFilter !== "all") filtered = filtered.filter(t => t.type === currentFilter);
    if (search) filtered = filtered.filter(t =>
        (t.title || '').includes(search) || (t.category || '').includes(search)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-500"><i class="fas fa-search text-2xl mb-2"></i><p class="text-sm">لا توجد عمليات مطابقة</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(t => {
        const color = t.color || 'gray';
        return `
        <div class="transaction-item flex items-center justify-between p-4 rounded-xl glass cursor-pointer hover:bg-white/5 transition" onclick="showTransactionDetails('${t.id}')">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center">
                    <i class="fas ${t.icon} text-${color}-400"></i>
                </div>
                <div>
                    <p class="font-semibold">${escapeHtml(t.title)}</p>
                    <p class="text-xs text-gray-400">${escapeHtml(t.category)} • ${escapeHtml(t.date)}</p>
                </div>
            </div>
            <span class="font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}">
                ${t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()} ${escapeHtml(cur)}
            </span>
        </div>`;
    }).join("");
};

window.filterTransactions = function filterTransactions() { renderWalletTransactions(); };

window.setFilter = function setFilter(el, filter) {
    currentFilter = filter;
    document.querySelectorAll("#filter-tags button").forEach(btn => {
        btn.classList.remove("bg-ethereal-violet/20", "text-ethereal-violet");
        btn.classList.add("glass");
    });
    if (el) {
        el.classList.remove("glass");
        el.classList.add("bg-ethereal-violet/20", "text-ethereal-violet");
    }
    renderWalletTransactions();
};

window.showAddCardModal = function showAddCardModal() { showModal("add-card-modal"); };

window.addCard = function addCard() {
    closeModal("add-card-modal");
    showSuccess("تمت الإضافة", "تم إضافة البطاقة بنجاح (تجريبي)");
};

// =====================================================
// FILTER MENU — actually works
// =====================================================
window.toggleFilterMenu = function toggleFilterMenu() {
    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:12px;">تصفية حسب النوع:</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                <button class="filter-pill" onclick="applyFilter('all')"><i class="fas fa-list ml-1"></i> الكل</button>
                <button class="filter-pill" onclick="applyFilter('income')"><i class="fas fa-arrow-down ml-1 text-emerald-400"></i> دخل</button>
                <button class="filter-pill" onclick="applyFilter('expense')"><i class="fas fa-arrow-up ml-1 text-rose-400"></i> مصروف</button>
                <button class="filter-pill" onclick="applyFilter('transfer')"><i class="fas fa-exchange-alt ml-1 text-cyan-400"></i> تحويل</button>
            </div>
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:8px;">تصفية حسب الفئة:</p>
            <select id="filter-category-select" class="premium-input" style="width:100%;margin-bottom:10px;" onchange="applyCategoryFilter(this.value)">
                <option value="">جميع الفئات</option>
                ${[...new Set(AppData.transactions.map(t => t.category))].map(c => `<option>${escapeHtml(c)}</option>`).join('')}
            </select>
        </div>
        <style>
            .filter-pill { padding:10px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.05); cursor:pointer; font-size:0.8rem; transition: all 0.2s; color: inherit; }
            .filter-pill:hover { background:rgba(255,255,255,0.08); }
        </style>
    `;
    document.getElementById('confirm-title').textContent = 'تصفية المعاملات';
    document.getElementById('confirm-message').innerHTML = html;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');
};

window.applyFilter = function applyFilter(filter) {
    currentFilter = filter;
    closeModal('confirm-modal');
    renderWalletTransactions();
    showToast('تم', `تم تطبيق التصفية: ${filter === 'all' ? 'الكل' : filter}`, 'info');
};

window.applyCategoryFilter = function applyCategoryFilter(cat) {
    if (!cat) { closeModal('confirm-modal'); renderWalletTransactions(); return; }
    const search = document.getElementById('transaction-search');
    if (search) search.value = cat;
    closeModal('confirm-modal');
    renderWalletTransactions();
};

window.showTransferModal = function showTransferModal() { navigateTo('transfers'); };

window.updateWalletStats = function updateWalletStats() {
    const txs = AppData.transactions;
    const income = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.amount < 0 && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const transfers = txs.filter(t => t.type === 'transfer').length;
    const incomeEl = document.getElementById('wallet-stat-income');
    const expenseEl = document.getElementById('wallet-stat-expense');
    const transfersEl = document.getElementById('wallet-stat-transfers');
    if (incomeEl) incomeEl.textContent = '+' + income.toLocaleString();
    if (expenseEl) expenseEl.textContent = '-' + expense.toLocaleString();
    if (transfersEl) transfersEl.textContent = transfers;
};

// =====================================================
// TRANSFERS PAGE INIT
// =====================================================
window.initTransfersPage = function initTransfersPage() {
    const totalSent = AppData.outgoingTransfers.reduce((s, t) => s + t.amount, 0);
    const totalReceived = AppData.incomingTransfers.reduce((s, t) => s + t.amount, 0);
    const pendingCount = AppData.outgoingTransfers.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
    const sentEl = document.getElementById('transfers-total-sent');
    const recvEl = document.getElementById('transfers-total-received');
    const pendEl = document.getElementById('transfers-pending-count');
    if (sentEl) sentEl.textContent = totalSent.toLocaleString();
    if (recvEl) recvEl.textContent = totalReceived.toLocaleString();
    if (pendEl) pendEl.textContent = pendingCount;

    const bankSelect = document.getElementById('local-send-bank');
    if (bankSelect) {
        const countryCode = AppData.user.countryCode || '+966';
        let banks = [];
        if (countryCode === '+966') banks = ['مصرف الراجحي', 'البنك الأهلي السعودي', 'بنك الرياض', 'مصرف الإنماء', 'بنك البلاد'];
        else if (countryCode === '+20') banks = ['البنك الأهلي المصري', 'بنك مصر', 'CIB', 'بنك القاهرة', 'بنك الإسكندرية'];
        else if (countryCode === '+971') banks = ['بنك الإمارات دبي الوطني', 'بنك أبوظبي الأول', 'بنك المشرق'];
        else if (countryCode === '+962') banks = ['البنك العربي', 'بنك الإسكان', 'بنك الاتحاد'];
        else banks = ['البنك الوطني الأول', 'البنك التجاري', 'مصرف التنمية'];

        bankSelect.innerHTML = '<option value="">اختر البنك</option>' +
            banks.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    }
    setTransferTab(currentTransferTab);
};

// =====================================================
// DEPOSIT/WITHDRAW MODALS
// =====================================================
window.showDepositModal = function showDepositModal() {
    showModal('deposit-wallet-modal');
    const activeBtn = document.querySelector('.deposit-method-btn.active');
    if (activeBtn) selectDepositMethod(activeBtn, 'apple');
};

window.showWithdrawModal = function showWithdrawModal() {
    const available = getAvailableBalance();
    const el = document.getElementById('withdraw-available');
    if (el) el.textContent = available.toLocaleString('en', { minimumFractionDigits: 2 }) + ' ' + getCurrency();
    showModal('withdraw-modal');
    const activeBtn = document.querySelector('.withdraw-dest-btn.active');
    if (activeBtn) selectWithdrawDest(activeBtn, 'bank');
};

// =====================================================
// LINK BANK — saves to AppData.user.linkedBanks
// =====================================================
window.showLinkBankModal = function showLinkBankModal() {
    const bankSelect = document.getElementById('link-bank-select');
    if (bankSelect) {
        const countryCode = AppData.user.countryCode || '+966';
        let banks = [];
        if (countryCode === '+966') banks = ['مصرف الراجحي', 'البنك الأهلي السعودي', 'بنك الرياض', 'مصرف الإنماء', 'بنك البلاد', 'بنك ساب'];
        else if (countryCode === '+20') banks = ['البنك الأهلي المصري', 'بنك مصر', 'CIB', 'بنك القاهرة'];
        else if (countryCode === '+971') banks = ['بنك الإمارات دبي الوطني', 'بنك أبوظبي الأول', 'بنك المشرق'];
        else banks = ['البنك الوطني', 'البنك التجاري'];

        bankSelect.innerHTML = '<option value="">اختر البنك...</option>' +
            banks.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    }
    showModal("link-bank-modal");
};

window.confirmLinkBank = function confirmLinkBank() {
    const btn = document.getElementById('btn-link-bank');
    const select = document.getElementById('link-bank-select');
    const ibanEl = document.getElementById('link-bank-iban');
    const iban = ibanEl ? ibanEl.value.trim() : '';

    if (select && !select.value) { showToast('تنبيه', 'يرجى اختيار البنك', 'error'); return; }
    if (iban && typeof validateIBAN === 'function' && !validateIBAN(iban)) {
        showToast('خطأ', 'رقم IBAN غير صحيح', 'error'); return;
    }

    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> جاري التحقق من البنك...`;
    }

    setTimeout(() => {
        if (btn) {
            btn.innerHTML = `<i class="fas fa-shield-alt ml-2"></i> توثيق الحساب...`;
        }
        setTimeout(() => {
            if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
            const bankName = select.value;
            const last4 = iban ? iban.slice(-4) : Math.floor(1000 + Math.random() * 9000);
            const masked = iban ? iban.slice(0, 4) + ' **** **** ' + last4 : 'SA88 **** **** ' + last4;

            // PERSIST the linked bank
            if (!AppData.user.linkedBanks) AppData.user.linkedBanks = [];
            const newBank = {
                id: 'bank-' + Date.now(),
                bankName,
                iban: iban || '',
                maskedIban: masked,
                linkedAt: new Date().toISOString()
            };
            AppData.user.linkedBanks.push(newBank);
            if (typeof markStateDirty === 'function') markStateDirty();
            if (typeof logActivity === 'function') logActivity('ربط حساب بنكي', bankName);

            closeModal("link-bank-modal");
            showSuccess("تم الربط بنجاح", `تم ربط حساب ${bankName} بمحفظتك`);
        }, 1200);
    }, 1200);
};
