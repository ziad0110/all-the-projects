// =====================================================
// DEPOSIT & WITHDRAW — uses unified addTransaction()
// =====================================================

function sanitizeAmount(val) {
    const num = parseFloat(val);
    if (!num || isNaN(num) || num <= 0 || !isFinite(num)) return null;
    if (num > 999999999) return null;
    return Math.round(num * 100) / 100;
}

window.confirmWalletDeposit = function confirmWalletDeposit() {
    const amount = sanitizeAmount(document.getElementById('deposit-wallet-amount')?.value);
    if (!amount) { showToast('تنبيه', 'يرجى إدخال مبلغ صحيح أكبر من صفر', 'error'); return; }

    // Determine fee based on selected method
    const activeMethod = document.querySelector('.deposit-method-btn.active');
    const isCredit = activeMethod && activeMethod.getAttribute('onclick')?.includes('credit');
    const fee = isCredit ? Math.round(amount * 0.025 * 100) / 100 : 0;
    const net = Math.round((amount - fee) * 100) / 100;

    closeModal('deposit-wallet-modal');
    const cur = getCurrency();
    showConfirm('تأكيد الإيداع',
        `سيتم إيداع ${net.toLocaleString()} ${cur} في محفظتك${fee > 0 ? ` (رسوم: ${fee} ${cur})` : ''}`,
        () => {
            // Net amount goes to balance via addTransaction
            addTransaction({
                title: 'إيداع في المحفظة',
                amount: net,
                type: 'income',
                category: 'إيداع',
                icon: 'fa-download',
                color: 'emerald',
                notify: true
            });
            // Record fee as separate expense
            if (fee > 0) {
                addTransaction({
                    title: 'رسوم إيداع (بطاقة ائتمان)',
                    amount: -fee,
                    type: 'expense',
                    category: 'أخرى',
                    icon: 'fa-percent',
                    color: 'amber',
                    notify: false
                });
            }
            showSuccess('تم الإيداع', `تم إيداع ${net.toLocaleString()} ${cur} بنجاح`);
            updateBalance();
            const el = document.getElementById('deposit-wallet-amount'); if (el) el.value = '';
        });
};

window.confirmWithdraw = function confirmWithdraw() {
    const amount = sanitizeAmount(document.getElementById('withdraw-amount')?.value);
    if (!amount) { showToast('تنبيه', 'يرجى إدخال مبلغ صحيح أكبر من صفر', 'error'); return; }
    const cur = getCurrency();
    const available = getAvailableBalance();
    if (amount > available) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${available.toLocaleString()} ${cur}`, 'error'); return;
    }
    closeModal('withdraw-modal');
    showConfirm('تأكيد السحب', `سيتم سحب ${amount.toLocaleString()} ${cur} لحسابك البنكي`, () => {
        // FIX: type 'transfer' (not 'expense') so it doesn't pollute expense stats
        addTransaction({
            title: 'سحب إلى الحساب البنكي',
            amount: -amount,
            type: 'transfer',
            category: 'سحب',
            icon: 'fa-upload',
            color: 'rose',
            notify: true
        });
        showSuccess('تم السحب', `سيصل ${amount.toLocaleString()} ${cur} لحسابك خلال 1-3 ساعات عمل`);
        updateBalance();
        const el = document.getElementById('withdraw-amount'); if (el) el.value = '';
    });
};
