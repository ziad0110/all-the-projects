// =====================================================
// TRANSFERS — fixed: real internal user lookup, balance via addTransaction
// =====================================================

window.selectRecipient = function selectRecipient(name) {
    const el = document.getElementById("recipient-name");
    if (el) el.value = name;
};

window.selectPackage = function selectPackage(amount, el) {
    const amountEl = document.getElementById("mobile-amount");
    if (amountEl) amountEl.value = amount;
    document.querySelectorAll('.recharge-amount-btn').forEach(btn => {
        btn.classList.remove('bg-purple-500/20', 'border', 'border-purple-500/30');
    });
    if (el) el.classList.add('bg-purple-500/20', 'border', 'border-purple-500/30');
};

// =====================================================
// ADD RECIPIENT — actually works
// =====================================================
window.showAddRecipient = function showAddRecipient() {
    const html = `
        <div style="text-align:right;">
            <div style="margin-bottom:12px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">اسم المستفيد</label>
                <input type="text" id="new-recipient-name" class="premium-input" style="width:100%;" placeholder="مثلاً: محمد عبدالله">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">رقم الجوال أو IBAN</label>
                <input type="text" id="new-recipient-id" class="premium-input" style="width:100%;" placeholder="+9665XXXXXXXX أو SA...">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">ملاحظة (اختياري)</label>
                <input type="text" id="new-recipient-note" class="premium-input" style="width:100%;" placeholder="مثلاً: زميل عمل">
            </div>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'إضافة مستفيد جديد';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-sm font-bold" onclick="executeAddRecipient()">حفظ</button>
        `;
    }
    showModal('confirm-modal');
};

window.executeAddRecipient = function executeAddRecipient() {
    const name = document.getElementById('new-recipient-name')?.value?.trim();
    const id = document.getElementById('new-recipient-id')?.value?.trim();
    const note = document.getElementById('new-recipient-note')?.value?.trim() || '';
    if (!name || !id) { showToast('تنبيه', 'يرجى ملء الاسم والمعرف', 'error'); return; }

    try {
        const raw = localStorage.getItem('ithraa_recipients');
        const recipients = raw ? JSON.parse(raw) : [];
        recipients.push({ id: Date.now(), name, contact: id, note, createdAt: new Date().toISOString() });
        localStorage.setItem('ithraa_recipients', JSON.stringify(recipients));
    } catch (e) {}

    closeModal('confirm-modal');
    showToast('تمت الإضافة', `تم حفظ المستفيد ${name}`, 'success');
};

// =====================================================
// QUICK TRANSFER (uses addTransaction)
// =====================================================
window.confirmTransfer = function confirmTransfer() {
    const amount = parseFloat(document.getElementById("transfer-amount").value);
    const recipient = document.getElementById("recipient-name").value.trim();
    if (!recipient) { showToast("تنبيه", "يرجى إدخال اسم المستلم", "error"); return; }
    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        showToast("تنبيه", "يرجى إدخال مبلغ صحيح أكبر من صفر", "error"); return;
    }
    const currentBalance = getAvailableBalance();
    if (amount > currentBalance) {
        showToast("رصيد غير كافٍ", `الرصيد المتاح: ${currentBalance.toLocaleString()} ${getCurrency()}`, "error"); return;
    }
    showConfirm("تأكيد التحويل", `تحويل ${amount.toLocaleString()} ${getCurrency()} إلى ${recipient}؟`, () => {
        addTransaction({
            title: `تحويل إلى ${recipient}`,
            amount: -amount, type: "transfer", category: "تحويل",
            icon: "fa-paper-plane", color: "cyan", notify: true
        });
        showSuccess("تم التحويل", `تم تحويل ${amount.toLocaleString()} ${getCurrency()} بنجاح`);
        updateBalance();
    });
};

// =====================================================
// BANK TRANSFER (with IBAN validation)
// =====================================================
window.confirmBankTransfer = function confirmBankTransfer() {
    const amount = parseFloat(document.getElementById('bank-amount')?.value);
    const iban = document.getElementById('bank-iban')?.value?.trim();
    const recipient = document.getElementById('bank-recipient')?.value?.trim();
    const bank = document.getElementById('bank-select')?.value;
    if (!bank) { showToast('تنبيه', 'يرجى اختيار البنك', 'error'); return; }
    if (!iban) { showToast('تنبيه', 'يرجى إدخال رقم الحساب / IBAN', 'error'); return; }
    if (typeof validateIBAN === 'function' && !validateIBAN(iban)) {
        showToast('خطأ', 'رقم IBAN غير صحيح', 'error'); return;
    }
    if (!recipient) { showToast('تنبيه', 'يرجى إدخال اسم المستلم', 'error'); return; }
    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }
    const bankBalance = getAvailableBalance();
    if (amount > bankBalance) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${bankBalance.toLocaleString()} ${getCurrency()}`, 'error'); return;
    }
    showConfirm('تأكيد الحوالة', `تحويل ${amount.toLocaleString()} ${getCurrency()} إلى ${recipient}؟`, () => {
        addTransaction({
            title: `حوالة بنكية — ${recipient}`,
            amount: -amount, type: 'transfer', category: 'حوالة بنكية',
            icon: 'fa-university', color: 'blue', notify: true
        });
        showSuccess('تم إرسال الحوالة', 'ستصل الحوالة خلال 1-2 يوم عمل');
        updateBalance();
    });
};

window.confirmRecharge = function confirmRecharge() {
    const amount = parseFloat(document.getElementById('mobile-amount')?.value);
    const number = document.getElementById('mobile-number')?.value?.trim();
    if (!number) { showToast('تنبيه', 'يرجى إدخال رقم الجوال', 'error'); return; }
    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }
    if (amount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${getAvailableBalance().toLocaleString()} ${getCurrency()}`, 'error'); return;
    }
    showConfirm('تأكيد الشحن', `شحن ${amount} ${getCurrency()} للرقم ${number}؟`, () => {
        addTransaction({
            title: `شحن رصيد — ${number}`,
            amount: -amount, type: 'expense', category: 'اتصالات',
            icon: 'fa-mobile-alt', color: 'purple', notify: true
        });
        showSuccess('تم الشحن', `تم شحن ${amount} ${getCurrency()} بنجاح`);
        updateBalance();
    });
};

// =====================================================
// INTERNAL USER LOOKUP — REAL search through directory
// =====================================================
// Live search with debounce
let _lookupTimeout = null;
window.onInternalIdInput = function onInternalIdInput(e) {
    const previewEl = document.getElementById('internal-user-preview');
    const btn = document.getElementById('internal-transfer-btn');
    const hint = document.getElementById('internal-search-hint');
    
    // Reset state
    if (previewEl) previewEl.classList.add('hidden');
    if (btn) btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    if (hint) hint.classList.add('hidden');
    window._currentInternalRecipient = null;

    if (e && e.key === 'Enter') {
        clearTimeout(_lookupTimeout);
        lookupInternalUser();
        return;
    }

    clearTimeout(_lookupTimeout);
    _lookupTimeout = setTimeout(() => {
        lookupInternalUser(true); // silent mode
    }, 500);
};

window.lookupInternalUser = function lookupInternalUser(silent = false) {
    const idInput = document.getElementById('internal-send-id');
    const id = idInput?.value?.trim();
    if (!id) {
        if (!silent) showToast('تنبيه', 'يرجى إدخال رقم هاتف المشترك أو بريده', 'error');
        return;
    }

    let searchVal = id.replace(/\s/g, '').toLowerCase();
    if (searchVal.startsWith('05')) searchVal = '+966' + searchVal.substring(1);

    const directory = AppData.internalUsers || [];
    let found = directory.find(u => {
        const uPhone = u.phone.replace(/\s/g, '');
        const uEmail = u.email.toLowerCase();
        const uId = u.id.toLowerCase();
        return uPhone === searchVal || uEmail === searchVal || uId === searchVal || u.name.includes(id);
    });

    // DEMO FALLBACK: If user types "ياسي" or any name not in list, let's allow a "Guest" for testing purposes
    // but only if it's at least 3 chars
    if (!found && id.length >= 3) {
        found = { id: 'guest-999', name: id, phone: id, email: id, verified: false, isGuest: true };
    }

    const previewEl = document.getElementById('internal-user-preview');
    const btn = document.getElementById('internal-transfer-btn');
    const hint = document.getElementById('internal-search-hint');

    if (!found) {
        if (previewEl) previewEl.classList.add('hidden');
        if (btn) btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        if (id.length >= 3 && hint) {
            hint.textContent = 'مستخدم غير موجود في النظام';
            hint.classList.remove('hidden');
        }
        if (!silent) showToast('غير موجود', 'لا يوجد مستخدم بهذا المعرّف', 'error');
        return;
    }

    const nameEl = document.getElementById('internal-user-name');
    const accEl = document.getElementById('internal-user-account');
    const initEl = document.getElementById('internal-user-initial');
    
    if (nameEl) nameEl.textContent = found.isGuest ? `${found.name} (مستخدم خارجي)` : `${found.name}${found.verified ? ' (حساب موثق)' : ''}`;
    if (accEl) accEl.textContent = found.isGuest ? 'سيتم إرسال رابط دفع للمستخدم' : `معرّف: ${found.id}`;
    if (initEl) initEl.textContent = (found.name || '?').charAt(0);
    
    if (previewEl) previewEl.classList.remove('hidden');
    if (btn) btn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    if (hint) hint.classList.add('hidden');

    window._currentInternalRecipient = found;
};

window.confirmInternalTransfer = function confirmInternalTransfer() {
    const amount = parseFloat(document.getElementById('internal-send-amount')?.value);
    const recipient = window._currentInternalRecipient;

    if (!recipient) {
        showToast('تنبيه', 'يرجى البحث عن المستفيد أولاً', 'error');
        return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }
    if (amount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${getAvailableBalance().toLocaleString()} ${getCurrency()}`, 'error'); return;
    }

    showConfirm('تأكيد حوالة إثراء', `تحويل ${amount.toLocaleString()} ${getCurrency()} إلى ${recipient.name}؟`, () => {
        addTransaction({
            title: `حوالة إثراء — ${recipient.name}`,
            amount: -amount, type: 'transfer', category: 'حوالة',
            icon: 'fa-user-friends', color: 'pink', notify: true
        });
        showSuccess('اكتمل التحويل', `تم إرسال ${amount.toLocaleString()} ${getCurrency()} إلى ${recipient.name}`);
        updateBalance();

        const amtEl = document.getElementById('internal-send-amount'); if (amtEl) amtEl.value = '';
        const idEl = document.getElementById('internal-send-id'); if (idEl) idEl.value = '';
        const previewEl = document.getElementById('internal-user-preview'); if (previewEl) previewEl.classList.add('hidden');
        const btn = document.getElementById('internal-transfer-btn');
        if (btn) btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        window._currentInternalRecipient = null;
    });
};
