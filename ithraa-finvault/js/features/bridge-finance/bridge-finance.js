// =====================================================
// BRIDGE FINANCE (Murabaha-style)
// FIXES:
// - Now creates a real debt record in AppData.bridgeFinanceLoans
// - Tracks repayment schedule
// - getOutstandingDebt() reflects this in balance display
// - Provides explicit "repay" function
// =====================================================

let bridgeSelectedDays = 15;

window.selectBridgeTerm = function selectBridgeTerm(btn, days) {
    bridgeSelectedDays = days;
    document.querySelectorAll('.bridge-term-btn').forEach(b => {
        b.classList.remove('active', 'bg-amber-500/20', 'text-amber-400', 'border', 'border-amber-500/30');
    });
    btn.classList.add('active', 'bg-amber-500/20', 'text-amber-400', 'border', 'border-amber-500/30');
    updateBridgeCalculation();
};

window.updateBridgeCalculation = function updateBridgeCalculation() {
    const amount = parseFloat(document.getElementById('bridge-amount')?.value) || 0;
    const markup = Math.round(amount * 0.015);
    const total = amount + markup;
    const repayDate = new Date();
    repayDate.setDate(repayDate.getDate() + bridgeSelectedDays);

    const setVal = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    setVal('bridge-display-amount', amount.toLocaleString() + ' ر.س');
    setVal('bridge-markup', markup.toLocaleString() + ' ر.س');
    setVal('bridge-total', total.toLocaleString() + ' ر.س');
    setVal('bridge-repay-date', repayDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }));
};

window.showBridgeFinance = function showBridgeFinance() {
    showModal('bridge-finance-modal');
    const amountInput = document.getElementById('bridge-amount');
    if (amountInput) {
        amountInput.removeEventListener('input', updateBridgeCalculation);
        amountInput.addEventListener('input', updateBridgeCalculation);
    }
};

window.executeBridgeFinance = function executeBridgeFinance() {
    const amount = parseFloat(document.getElementById('bridge-amount')?.value);
    if (!amount || amount < 500 || amount > 5000) {
        showToast('تنبيه', 'يرجى إدخال مبلغ بين 500 و 5,000 ر.س', 'error');
        return;
    }

    // Check if user already has too many active loans
    const activeCount = (AppData.bridgeFinanceLoans || []).filter(l => l.status === 'active').length;
    if (activeCount >= 2) {
        showToast('تنبيه', 'لديك تمويلان قائمان بالفعل. سدد أحدهما أولاً', 'error');
        return;
    }

    const markup = Math.round(amount * 0.015);
    const total = amount + markup;
    const repayDate = new Date();
    repayDate.setDate(repayDate.getDate() + bridgeSelectedDays);

    closeModal('bridge-finance-modal');
    showConfirm(
        'تأكيد التمويل',
        `سيتم إيداع ${amount.toLocaleString()} ر.س في حسابك. إجمالي السداد: ${total.toLocaleString()} ر.س خلال ${bridgeSelectedDays} يوم`,
        () => {
            const loanId = 'BF-' + Date.now();
            // Record the loan as active debt
            if (!Array.isArray(AppData.bridgeFinanceLoans)) AppData.bridgeFinanceLoans = [];
            AppData.bridgeFinanceLoans.push({
                id: loanId,
                principal: amount,
                markup,
                totalDue: total,
                termDays: bridgeSelectedDays,
                disbursedAt: new Date().toISOString(),
                dueDate: repayDate.toISOString().split('T')[0],
                status: 'active',
                paidAmount: 0
            });

            creditBalance(amount, {
                id: Date.now(),
                title: 'تمويل جسر مصغّر (مرابحة)',
                amount: amount, type: 'income', category: 'تمويل',
                date: new Date().toISOString().split('T')[0],
                icon: 'fa-hand-holding-usd', color: 'amber',
                loanId
            });

            // Generate notification
            if (Array.isArray(AppData.notifications)) {
                AppData.notifications.unshift({
                    id: Date.now(),
                    title: 'تمويل تم إيداعه',
                    message: `إجمالي السداد ${total.toLocaleString()} ر.س مستحق في ${repayDate.toLocaleDateString('ar-EG')}`,
                    time: 'الآن',
                    icon: 'fa-hand-holding-usd', color: 'amber', read: false
                });
            }

            showSuccess('تم التمويل! 🎉', `تم إيداع ${amount.toLocaleString()} ر.س في حسابك.\nموعد السداد: ${repayDate.toLocaleDateString('ar-EG')}`);
            updateBalance();
            if (typeof markStateDirty === 'function') markStateDirty();
        }
    );
};

// === Repay loan ===
window.repayBridgeFinance = function repayBridgeFinance(loanId) {
    const loan = (AppData.bridgeFinanceLoans || []).find(l => l.id === loanId);
    if (!loan || loan.status !== 'active') {
        showToast('تنبيه', 'هذا التمويل ليس نشطاً', 'error');
        return;
    }
    const remaining = loan.totalDue - (loan.paidAmount || 0);
    if (remaining <= 0) {
        loan.status = 'paid';
        showToast('تنبيه', 'هذا التمويل مسدد بالفعل', 'info');
        return;
    }
    if (remaining > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', `تحتاج ${remaining.toLocaleString()} ر.س للسداد`, 'error');
        return;
    }

    showConfirm('تأكيد السداد', `سيتم خصم ${remaining.toLocaleString()} ر.س لسداد التمويل`, () => {
        const ok = debitBalance(remaining, {
            id: Date.now(),
            title: 'سداد تمويل جسر',
            amount: -remaining, type: 'expense', category: 'تمويل',
            date: new Date().toISOString().split('T')[0],
            icon: 'fa-money-check', color: 'emerald',
            loanId
        });
        if (!ok) return;
        loan.paidAmount = loan.totalDue;
        loan.status = 'paid';
        loan.paidAt = new Date().toISOString();
        showSuccess('تم السداد', `تم سداد ${remaining.toLocaleString()} ر.س بنجاح`);
        updateBalance();
        if (typeof markStateDirty === 'function') markStateDirty();
    });
};
