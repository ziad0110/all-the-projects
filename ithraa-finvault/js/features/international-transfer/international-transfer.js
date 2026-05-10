// =====================================================
// INTERNATIONAL TRANSFER — legacy form, now delegates to new system
// =====================================================
// NOTE: The newer/canonical implementation is in new-transfers-system.js.
// This file is kept for the older form (intl-amount/intl-recipient/intl-country)
// but uses the same unified balance & rate logic.

window.updateExchangePreview = function updateExchangePreview() {
    const amount = parseFloat(document.getElementById('intl-amount')?.value) || 0;
    const currency = document.getElementById('intl-currency')?.value || 'USD';
    const rate = (typeof getExchangeRate === 'function') ? getExchangeRate(currency) : 3.75;

    const rateEl = document.getElementById('exchange-rate');
    if (rateEl) rateEl.textContent = rate;
    const labelEl = document.getElementById('exchange-rate-label');
    if (labelEl) labelEl.textContent = `ر.س / 1 ${currency}`;

    const converted = (amount / rate).toFixed(2);
    const convEl = document.getElementById('intl-converted');
    if (convEl) convEl.textContent = `${converted} ${currency}`;
};

window.confirmIntlTransfer = function confirmIntlTransfer() {
    const amount = parseFloat(document.getElementById('intl-amount')?.value);
    const recipient = document.getElementById('intl-recipient')?.value?.trim();
    const country = document.getElementById('intl-country')?.value;
    if (!amount || !recipient || !country) {
        showToast('تنبيه', 'يرجى ملء جميع الحقول', 'error'); return;
    }
    if (amount <= 0) {
        showToast('تنبيه', 'يرجى إدخال مبلغ موجب', 'error'); return;
    }
    const fee = 25;
    const total = amount + fee;
    if (total > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${getAvailableBalance().toLocaleString()} ${getCurrency()}`, 'error'); return;
    }
    showConfirm('تأكيد الحوالة الدولية', `المبلغ: ${amount.toLocaleString()} + رسوم: ${fee} = ${total.toLocaleString()} ر.س`, () => {
        addTransaction({
            title: `حوالة دولية — ${recipient}`,
            amount: -total, type: 'transfer', category: 'حوالة دولية',
            icon: 'fa-globe', color: 'indigo', notify: true
        });
        showSuccess('تم إرسال الحوالة الدولية', `ستصل خلال 1-2 يوم عمل. الرسوم: ${fee} ر.س`);
        updateBalance();
    });
};
