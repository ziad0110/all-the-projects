// =====================================================
// NEW TRANSFERS SYSTEM — IBAN/SWIFT validated, balance-correct
// =====================================================

// --- IBAN MOD-97 checksum (real ISO 13616 validation) ---
window.validateIBANChecksum = function validateIBANChecksum(iban) {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (cleaned.length < 15 || cleaned.length > 34) return false;
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

    // Move first 4 chars to end
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    // Replace letters with numbers (A=10, B=11, ..., Z=35)
    let numeric = '';
    for (const ch of rearranged) {
        if (/[A-Z]/.test(ch)) numeric += (ch.charCodeAt(0) - 55).toString();
        else numeric += ch;
    }
    // Compute mod 97 in chunks (numbers can exceed Number precision)
    let remainder = 0;
    for (let i = 0; i < numeric.length; i += 7) {
        remainder = parseInt(remainder.toString() + numeric.substr(i, 7), 10) % 97;
    }
    return remainder === 1;
};

window.validateIBAN = function validateIBAN(iban) {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (cleaned.length < 15 || cleaned.length > 34) return false;
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;
    // Run full checksum
    return validateIBANChecksum(cleaned);
};

window.validateSaudiIBAN = function validateSaudiIBAN(iban) {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^SA\d{22}$/.test(cleaned)) return false;
    return validateIBANChecksum(cleaned);
};

// SWIFT/BIC validation — format check only
// Note: there is no public free database of valid BICs we can validate against
// without a backend; format check is what real banks do at the entry stage too.
window.validateSWIFT = function validateSWIFT(swift) {
    const cleaned = swift.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned);
};

// --- Reference ID generator ---
window.generateRefId = function generateRefId(prefix) {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(AppData.outgoingTransfers.length + 1).padStart(3, '0');
    return `${prefix}-${date}-${seq}`;
};

// --- Status helpers ---
const statusLabels = {
    'pending': { text: 'قيد الانتظار', icon: '⏳', bg: 'bg-amber-500/20 text-amber-400' },
    'in-progress': { text: 'قيد التنفيذ', icon: '🔄', bg: 'bg-blue-500/20 text-blue-400' },
    'completed': { text: 'مكتملة', icon: '✅', bg: 'bg-emerald-500/20 text-emerald-400' },
    'rejected': { text: 'مرفوضة', icon: '❌', bg: 'bg-rose-500/20 text-rose-400' },
    'cancelled': { text: 'ملغاة', icon: '🚫', bg: 'bg-gray-500/20 text-gray-400' },
    'accepted': { text: 'مقبول', icon: '✅', bg: 'bg-emerald-500/20 text-emerald-400' }
};

window.getStatusBadge = function getStatusBadge(status) {
    const s = statusLabels[status] || statusLabels['pending'];
    return `<span class="text-[10px] px-2 py-0.5 rounded-full ${s.bg}">${s.icon} ${escapeHtml(s.text)}</span>`;
};

// =====================================================
// LOCAL TRANSFER (outgoing)
// =====================================================
window.confirmLocalSend = function confirmLocalSend() {
    const recipient = document.getElementById('local-send-recipient')?.value?.trim();
    const iban = document.getElementById('local-send-iban')?.value?.trim();
    const bank = document.getElementById('local-send-bank')?.value;
    const amount = parseFloat(document.getElementById('local-send-amount')?.value);
    const purpose = document.getElementById('local-send-purpose')?.value;
    const notes = document.getElementById('local-send-notes')?.value?.trim() || '';

    if (!recipient) { showToast('تنبيه', 'يرجى إدخال اسم المستفيد', 'error'); return; }
    if (!iban) { showToast('تنبيه', 'يرجى إدخال رقم IBAN', 'error'); return; }
    if (!validateSaudiIBAN(iban)) {
        showToast('خطأ', 'رقم IBAN غير صحيح (يجب أن يبدأ بـ SA ويجتاز فحص checksum)', 'error');
        return;
    }
    if (!bank) { showToast('تنبيه', 'يرجى اختيار البنك المستلم', 'error'); return; }
    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }
    if (amount > 1000000) { showToast('تنبيه', 'الحد الأقصى للحوالة المحلية 1,000,000', 'error'); return; }

    const localBalance = getAvailableBalance();
    if (amount > localBalance) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${localBalance.toLocaleString()} ${getCurrency()}`, 'error');
        return;
    }
    if (!purpose) { showToast('تنبيه', 'يرجى اختيار الغرض من التحويل', 'error'); return; }

    const refId = generateRefId('TRX');
    showConfirm('تأكيد الحوالة المحلية', `تحويل ${amount.toLocaleString()} ${getCurrency()} إلى ${recipient} (${bank})؟`, () => {
        const transfer = {
            id: refId, type: 'local', recipientName: recipient, recipientIban: iban,
            bank: bank, amount: amount, currency: 'SAR', purpose: purpose, notes: notes,
            status: 'pending', date: new Date().toISOString().split('T')[0], fee: 0
        };
        AppData.outgoingTransfers.unshift(transfer);
        // FIX: Use addTransaction (single source of truth for balance)
        addTransaction({
            title: `حوالة محلية — ${recipient}`,
            amount: -amount, type: 'transfer', category: 'حوالة بنكية',
            icon: 'fa-paper-plane', color: 'blue',
            refId: refId, notify: true
        });
        showSuccess('تم إرسال الحوالة', `الرقم المرجعي: ${refId}\nستصل خلال دقائق`);
        updateBalance();
        ['local-send-recipient', 'local-send-iban', 'local-send-amount', 'local-send-notes'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const bankEl = document.getElementById('local-send-bank'); if (bankEl) bankEl.value = '';
        const purposeEl = document.getElementById('local-send-purpose'); if (purposeEl) purposeEl.value = '';
    });
};

window.renderLocalIncoming = function renderLocalIncoming() {
    const container = document.getElementById('local-incoming-list');
    if (!container) return;
    const local = AppData.incomingTransfers.filter(t => t.type === 'local');
    if (local.length === 0) {
        container.innerHTML = '<div class="glass-card rounded-2xl p-8 text-center"><i class="fas fa-inbox text-3xl text-gray-600 mb-3"></i><p class="text-gray-400 text-sm">لا توجد حوالات واردة</p></div>';
        return;
    }
    container.innerHTML = local.map(t => `
        <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <i class="fas fa-arrow-down text-emerald-400"></i>
                </div>
                <div>
                    <p class="font-semibold text-sm">${escapeHtml(t.senderName)}</p>
                    <p class="text-[10px] text-gray-400">${escapeHtml(t.date)} • ${escapeHtml(t.referenceId)}</p>
                </div>
            </div>
            <div class="text-left">
                <p class="font-bold text-emerald-400">+${t.amount.toLocaleString()} ${escapeHtml(t.currency === 'SAR' ? 'ر.س' : t.currency)}</p>
                ${getStatusBadge(t.status)}
            </div>
        </div>
    `).join('');
};

// =====================================================
// INTERNATIONAL TRANSFER
// =====================================================
// NOTE: rates are demo-only. In production, fetch from a real FX API
// (e.g. Open Exchange Rates / exchangerate-api). We provide a getter
// so this is easy to swap.
window._exchangeRatesCache = {
    USD: 3.75, EUR: 4.08, GBP: 4.73, AED: 1.02, KWD: 12.18,
    EGP: 0.077, YER: 0.015, TRY: 0.11, JOD: 5.29
};
window._exchangeRatesUpdatedAt = null;

window.getExchangeRate = function getExchangeRate(currency) {
    return window._exchangeRatesCache[currency] || 3.75;
};

window.updateIntlSendPreview = function updateIntlSendPreview() {
    const amount = parseFloat(document.getElementById('intl-send-amount')?.value) || 0;
    const currency = document.getElementById('intl-send-currency')?.value || 'USD';
    const rate = getExchangeRate(currency);
    const fee = 25;

    const rateEl = document.getElementById('intl-send-rate');
    if (rateEl) rateEl.textContent = `${rate} ر.س / 1 ${currency}`;
    const conv = (amount / rate).toFixed(2);
    const convEl = document.getElementById('intl-send-converted');
    if (convEl) convEl.textContent = `${conv} ${currency}`;
    const totalEl = document.getElementById('intl-send-total');
    if (totalEl) totalEl.textContent = `${(amount + fee).toLocaleString()} ر.س`;
};

window.confirmIntlSend = function confirmIntlSend() {
    const recipient = document.getElementById('intl-send-recipient')?.value?.trim();
    const iban = document.getElementById('intl-send-iban')?.value?.trim();
    const swift = document.getElementById('intl-send-swift')?.value?.trim();
    const bank = document.getElementById('intl-send-bank')?.value?.trim();
    const bankAddress = document.getElementById('intl-send-bank-address')?.value?.trim();
    const amount = parseFloat(document.getElementById('intl-send-amount')?.value);
    const currency = document.getElementById('intl-send-currency')?.value;

    if (!recipient) { showToast('تنبيه', 'يرجى إدخال اسم المستفيد', 'error'); return; }
    if (!iban) { showToast('تنبيه', 'يرجى إدخال IBAN المستلم', 'error'); return; }
    if (!validateIBAN(iban)) { showToast('خطأ', 'رقم IBAN غير صحيح أو فشل في فحص checksum', 'error'); return; }
    if (!swift) { showToast('تنبيه', 'يرجى إدخال رمز SWIFT/BIC', 'error'); return; }
    if (!validateSWIFT(swift)) { showToast('خطأ', 'تنسيق SWIFT غير صحيح (8 أو 11 حرف)', 'error'); return; }
    if (!bank) { showToast('تنبيه', 'يرجى إدخال اسم البنك', 'error'); return; }
    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }

    const fee = 25;
    const total = amount + fee;
    const intlBalance = getAvailableBalance();
    if (total > intlBalance) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${intlBalance.toLocaleString()} ر.س`, 'error');
        return;
    }

    const rate = getExchangeRate(currency);
    const refId = generateRefId('TRX');
    const converted = (amount / rate).toFixed(2);

    showConfirm('تأكيد الحوالة الدولية', `المبلغ: ${amount.toLocaleString()} + رسوم: ${fee} = ${total.toLocaleString()} ر.س. يستلم ${recipient}: ${converted} ${currency}`, () => {
        const transfer = {
            id: refId, type: 'international', recipientName: recipient, recipientIban: iban,
            swift: swift, bank: bank, bankAddress: bankAddress || '', amount: amount,
            currency: currency, exchangeRate: rate, fee: fee, status: 'in-progress',
            date: new Date().toISOString().split('T')[0]
        };
        AppData.outgoingTransfers.unshift(transfer);
        // FIX: balance updated correctly via addTransaction
        addTransaction({
            title: `حوالة دولية — ${recipient}`,
            amount: -total, type: 'transfer', category: 'حوالة دولية',
            icon: 'fa-globe', color: 'indigo',
            refId: refId, notify: true
        });
        showSuccess('تم إرسال الحوالة الدولية', `الرقم المرجعي: ${refId}\nالرسوم: ${fee} ر.س | وقت التسليم: 1-2 يوم عمل`);
        updateBalance();
        ['intl-send-recipient', 'intl-send-iban', 'intl-send-swift', 'intl-send-bank', 'intl-send-bank-address', 'intl-send-amount'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
    });
};

window.renderIntlIncoming = function renderIntlIncoming() {
    const container = document.getElementById('intl-incoming-list');
    if (!container) return;
    const intl = AppData.incomingTransfers.filter(t => t.type === 'international');
    if (intl.length === 0) {
        container.innerHTML = '<div class="glass-card rounded-2xl p-8 text-center"><i class="fas fa-globe text-3xl text-gray-600 mb-3"></i><p class="text-gray-400 text-sm">لا توجد حوالات دولية واردة</p></div>';
        return;
    }
    container.innerHTML = intl.map(t => `
        <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <i class="fas fa-globe-americas text-cyan-400"></i>
                </div>
                <div>
                    <p class="font-semibold text-sm">${escapeHtml(t.senderName)}</p>
                    <p class="text-[10px] text-gray-400">${escapeHtml(t.country || '')} • ${escapeHtml(t.date)} • ${escapeHtml(t.referenceId)}</p>
                </div>
            </div>
            <div class="text-left">
                <p class="font-bold text-emerald-400">+${t.amount.toLocaleString()} ${escapeHtml(t.currency)}</p>
                ${getStatusBadge(t.status)}
            </div>
        </div>
    `).join('');
};

// =====================================================
// TRANSFER STATUS LIST (with filtering)
// =====================================================
let currentStatusFilter = 'all';

window.filterTransferStatus = function filterTransferStatus(btn, status) {
    currentStatusFilter = status;
    document.querySelectorAll('#status-filter-bar button').forEach(b => {
        b.classList.remove('bg-purple-500/20', 'text-purple-400');
        b.classList.add('glass');
    });
    if (btn) {
        btn.classList.remove('glass');
        btn.classList.add('bg-purple-500/20', 'text-purple-400');
    }
    renderTransferStatus();
};

window.renderTransferStatus = function renderTransferStatus() {
    const container = document.getElementById('transfer-status-list');
    if (!container) return;

    let allTransfers = [
        ...AppData.outgoingTransfers.map(t => ({ ...t, direction: 'out' })),
        ...AppData.incomingTransfers.map(t => ({ ...t, direction: 'in' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (currentStatusFilter !== 'all') {
        allTransfers = allTransfers.filter(t => t.status === currentStatusFilter);
    }

    if (allTransfers.length === 0) {
        container.innerHTML = '<div class="glass-card rounded-2xl p-8 text-center"><i class="fas fa-search text-3xl text-gray-600 mb-3"></i><p class="text-gray-400 text-sm">لا توجد حوالات بهذه الحالة</p></div>';
        return;
    }

    container.innerHTML = allTransfers.map(t => {
        const isOut = t.direction === 'out';
        const name = isOut ? t.recipientName : t.senderName;
        const icon = isOut ? 'fa-arrow-up' : 'fa-arrow-down';
        const iconColor = isOut ? 'rose' : 'emerald';
        const amountSign = isOut ? '-' : '+';
        const amountColor = isOut ? 'text-rose-400' : 'text-emerald-400';
        const typeLabel = t.type === 'local' ? 'محلية' : 'دولية';
        const dirLabel = isOut ? 'صادرة' : 'واردة';

        return `
            <div class="glass-card rounded-2xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-${iconColor}-500/20 flex items-center justify-center">
                            <i class="fas ${icon} text-${iconColor}-400"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-sm">${escapeHtml(name)}</p>
                            <p class="text-[10px] text-gray-400">${escapeHtml(t.id)} • ${escapeHtml(t.date)}</p>
                        </div>
                    </div>
                    <div class="text-left">
                        <p class="font-bold ${amountColor}">${amountSign}${t.amount.toLocaleString()} ${escapeHtml(t.currency === 'SAR' ? 'ر.س' : (t.currency || ''))}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">${dirLabel} ${typeLabel}</span>
                        ${t.fee ? `<span class="text-[10px] text-gray-500">رسوم: ${t.fee} ر.س</span>` : ''}
                    </div>
                    ${getStatusBadge(t.status)}
                </div>
                ${t.rejectionReason ? `<p class="text-[10px] text-rose-400 mt-1">السبب: ${escapeHtml(t.rejectionReason)}</p>` : ''}
            </div>
        `;
    }).join('');
};

// =====================================================
// FIND TRANSFER BY REF — improved
// =====================================================
window.findTransferByRefId = function findTransferByRefId(refId) {
    if (!refId) return null;
    const query = refId.toUpperCase().trim();

    // 1. Search real outgoing transfers
    let found = AppData.outgoingTransfers.find(t => {
        const id = t.id.toUpperCase();
        if (id === query || id.includes(query)) return true;
        const queryNumMatch = query.match(/\d+$/);
        if (queryNumMatch) {
            const idLastPart = id.split('-').pop();
            if (idLastPart && parseInt(queryNumMatch[0]) === parseInt(idLastPart)) return true;
        }
        return false;
    });
    if (found) return found;

    // 2. Search general transactions, return linked outgoing transfer if any
    const txMatch = AppData.transactions.find(t => (`TRX-${t.id}`.toUpperCase() === query || t.id.toString() === query.replace(/\D/g, '')));
    if (txMatch && txMatch.refId) {
        const realTransfer = AppData.outgoingTransfers.find(t => t.id === txMatch.refId);
        if (realTransfer) return realTransfer;
    }
    // No match — return null instead of fake "completed" record
    return null;
};

// =====================================================
// CANCEL TRANSFER — preview + execute
// =====================================================
window.lookupTransferForCancel = function lookupTransferForCancel() {
    const refId = document.getElementById('cancel-ref-id')?.value?.trim();
    const preview = document.getElementById('cancel-transfer-preview');
    if (!refId) { if (preview) preview.classList.add('hidden'); return; }

    const transfer = window.findTransferByRefId(refId);
    if (!transfer) { if (preview) preview.classList.add('hidden'); return; }

    if (preview) {
        preview.classList.remove('hidden');
        document.getElementById('cancel-preview-recipient').textContent = transfer.recipientName || 'عملية بنكية';
        document.getElementById('cancel-preview-amount').textContent = `${transfer.amount.toLocaleString()} ${transfer.currency === 'SAR' ? 'ر.س' : (transfer.currency || '')}`;
        document.getElementById('cancel-preview-date').textContent = transfer.date;
        document.getElementById('cancel-preview-type').textContent = transfer.type === 'local' ? 'محلية' : 'دولية';

        const statusEl = document.getElementById('cancel-preview-status');
        const s = statusLabels[transfer.status];
        if (statusEl && s) {
            statusEl.textContent = `${s.icon} ${s.text}`;
            statusEl.className = `text-xs px-2 py-0.5 rounded-full ${s.bg}`;
        }
    }
};

window.confirmCancelTransfer = function confirmCancelTransfer() {
    const refId = document.getElementById('cancel-ref-id')?.value?.trim();
    const reason = document.getElementById('cancel-reason')?.value;

    if (!refId) { showToast('تنبيه', 'يرجى إدخال الرقم المرجعي', 'error'); return; }
    if (!reason) { showToast('تنبيه', 'يرجى اختيار سبب الإلغاء', 'error'); return; }

    const transfer = window.findTransferByRefId(refId);
    if (!transfer) { showToast('خطأ', 'لا توجد حوالة بهذا الرقم المرجعي', 'error'); return; }
    if (transfer.status === 'completed') { showToast('خطأ', 'لا يمكن إلغاء حوالة مكتملة', 'error'); return; }
    if (transfer.status === 'cancelled') { showToast('تنبيه', 'هذه الحوالة ملغاة بالفعل', 'error'); return; }
    if (transfer.status === 'rejected') { showToast('تنبيه', 'هذه الحوالة مرفوضة بالفعل', 'error'); return; }

    showConfirm('تأكيد الإلغاء', `إلغاء الحوالة ${refId} إلى ${transfer.recipientName}؟ السبب: ${reason}`, () => {
        transfer.status = 'cancelled';
        transfer.cancellationReason = reason;
        const refundAmount = transfer.amount + (transfer.fee || 0);
        addTransaction({
            title: `استرداد — إلغاء حوالة ${refId}`,
            amount: refundAmount, type: 'income', category: 'استرداد',
            icon: 'fa-undo', color: 'emerald',
            refId: refId, notify: true
        });
        showSuccess('تم إلغاء الحوالة', `تم استرداد ${refundAmount.toLocaleString()} ر.س لرصيدك`);
        updateBalance();
        if (typeof renderTransferStatus === 'function') renderTransferStatus();

        const refIdEl = document.getElementById('cancel-ref-id'); if (refIdEl) refIdEl.value = '';
        const reasonEl = document.getElementById('cancel-reason'); if (reasonEl) reasonEl.value = '';
        const preview = document.getElementById('cancel-transfer-preview');
        if (preview) preview.classList.add('hidden');
    });
};

// =====================================================
// MONEY REQUESTS
// =====================================================
window.renderMoneyRequests = function renderMoneyRequests() {
    const container = document.getElementById('money-requests-list');
    if (!container) return;

    if (AppData.moneyRequests.length === 0) {
        container.innerHTML = '<div class="glass-card rounded-2xl p-8 text-center"><i class="fas fa-hand-holding-usd text-3xl text-gray-600 mb-3"></i><p class="text-gray-400 text-sm">لا توجد طلبات استلام</p></div>';
        return;
    }

    container.innerHTML = AppData.moneyRequests.map(r => {
        const isPending = r.status === 'pending';
        const actions = isPending ? `
            <div class="flex gap-2 mt-3 pt-3 border-t border-white/5">
                <button class="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition" onclick="acceptMoneyRequest('${escapeHtml(r.id)}')">
                    <i class="fas fa-check ml-1"></i> قبول
                </button>
                <button class="flex-1 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition" onclick="rejectMoneyRequest('${escapeHtml(r.id)}')">
                    <i class="fas fa-times ml-1"></i> رفض
                </button>
            </div>` : '';

        return `
            <div class="glass-card rounded-2xl p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <i class="fas fa-hand-holding-usd text-amber-400"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-sm">${escapeHtml(r.requesterName)}</p>
                            <p class="text-[10px] text-gray-400">${escapeHtml(r.date)} • ${escapeHtml(r.note || '')}</p>
                        </div>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-amber-400">${r.amount.toLocaleString()} ${escapeHtml(r.currency === 'SAR' ? 'ر.س' : r.currency)}</p>
                        ${getStatusBadge(r.status)}
                    </div>
                </div>
                ${actions}
            </div>
        `;
    }).join('');
};

window.acceptMoneyRequest = function acceptMoneyRequest(reqId) {
    const req = AppData.moneyRequests.find(r => r.id === reqId);
    if (!req) return;
    if (req.amount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', `الرصيد المتاح: ${getAvailableBalance().toLocaleString()} ر.س`, 'error');
        return;
    }
    showConfirm('تأكيد القبول', `تحويل ${req.amount.toLocaleString()} ر.س إلى ${req.requesterName}؟`, () => {
        req.status = 'accepted';
        addTransaction({
            title: `تحويل — طلب من ${req.requesterName}`,
            amount: -req.amount, type: 'transfer', category: 'تحويل',
            icon: 'fa-hand-holding-usd', color: 'amber', notify: true
        });
        showSuccess('تم القبول', `تم تحويل ${req.amount.toLocaleString()} ر.س إلى ${req.requesterName}`);
        updateBalance();
        renderMoneyRequests();
    });
};

window.rejectMoneyRequest = function rejectMoneyRequest(reqId) {
    const req = AppData.moneyRequests.find(r => r.id === reqId);
    if (!req) return;
    showConfirm('تأكيد الرفض', `رفض طلب ${req.requesterName} بمبلغ ${req.amount.toLocaleString()} ر.س؟`, () => {
        req.status = 'rejected';
        showToast('تم الرفض', `تم رفض طلب ${req.requesterName}`, 'info');
        renderMoneyRequests();
    });
};

// =====================================================
// DEPOSIT / WITHDRAW HELPERS (UI only)
// =====================================================
window.selectDepositMethod = function selectDepositMethod(btn, type) {
    document.querySelectorAll('.deposit-method-btn').forEach(b => {
        b.classList.remove('active', 'bg-emerald/20', 'border', 'border-emerald/30');
    });
    if (btn) btn.classList.add('active', 'bg-emerald/20', 'border', 'border-emerald/30');

    const sourceSelect = document.getElementById('deposit-source-select');
    if (sourceSelect) {
        if (type === 'bank') {
            const linked = (AppData.user.linkedBanks || []);
            if (linked.length) {
                sourceSelect.innerHTML = linked.map(b =>
                    `<option value="bank-${escapeHtml(b.id)}">${escapeHtml(b.bankName)} — ${escapeHtml(b.maskedIban)}</option>`
                ).join('');
            } else {
                sourceSelect.innerHTML = `<option value="">لم تربط بنكاً بعد — اربط حساباً أولاً</option>`;
            }
        } else if (type === 'card' || type === 'credit') {
            sourceSelect.innerHTML = AppData.cards.map(c =>
                `<option value="card-${c.id}">${escapeHtml(c.name)} — •••• ${escapeHtml(c.number.slice(-4))}</option>`
            ).join('');
        } else {
            // apple-pay / mada — keep simple
            sourceSelect.innerHTML = `<option value="${type}">${type === 'apple' ? 'Apple Pay' : 'مدى Pay'}</option>`;
        }
    }
    updateDepositFees(type);
};

window.updateDepositFees = function updateDepositFees(type) {
    const amount = parseFloat(document.getElementById('deposit-wallet-amount')?.value) || 0;
    const feeEl = document.getElementById('deposit-fee-amount');
    const netEl = document.getElementById('deposit-net-amount');
    let fee = 0;
    const activeMethod = document.querySelector('.deposit-method-btn.active');
    const methodType = type || (activeMethod && activeMethod.dataset && activeMethod.dataset.type) || '';
    if (methodType === 'credit' || (activeMethod && activeMethod.getAttribute('onclick')?.includes('credit'))) {
        fee = Math.round(amount * 0.025 * 100) / 100;
    }
    if (feeEl) feeEl.textContent = fee > 0 ? `${fee.toFixed(2)} ر.س` : 'مجاناً';
    if (netEl) netEl.textContent = `${(amount - fee).toLocaleString('en', { minimumFractionDigits: 2 })} ر.س`;
};

window.selectWithdrawDest = function selectWithdrawDest(btn, type) {
    document.querySelectorAll('.withdraw-dest-btn').forEach(b => {
        b.classList.remove('active', 'bg-rose-500/10', 'border', 'border-rose-500/20');
    });
    if (btn) btn.classList.add('active', 'bg-rose-500/10', 'border', 'border-rose-500/20');

    const destSelect = document.getElementById('withdraw-dest-select');
    if (destSelect) {
        if (type === 'card') {
            destSelect.innerHTML = AppData.cards.map(c =>
                `<option value="card-${c.id}">${escapeHtml(c.name)} — •••• ${escapeHtml(c.number.slice(-4))}</option>`
            ).join('');
        } else {
            const linked = (AppData.user.linkedBanks || []);
            if (linked.length) {
                destSelect.innerHTML = linked.map(b =>
                    `<option value="bank-${escapeHtml(b.id)}">${escapeHtml(b.bankName)} — ${escapeHtml(b.maskedIban)}</option>`
                ).join('') + '<option value="custom">+ IBAN آخر</option>';
            } else {
                destSelect.innerHTML = `<option value="custom">+ أدخل IBAN يدوياً</option>`;
            }
        }
        destSelect.dispatchEvent(new Event('change'));
    }
    updateWithdrawFees();
};

window.updateWithdrawFees = function updateWithdrawFees() {
    const amount = parseFloat(document.getElementById('withdraw-amount')?.value) || 0;
    const feeEl = document.getElementById('withdraw-fee-display');
    const timeEl = document.getElementById('withdraw-time-display');
    const netEl = document.getElementById('withdraw-net-amount');
    const fee = 0;
    if (feeEl) feeEl.textContent = fee > 0 ? `${fee.toFixed(2)} ر.س` : 'مجاناً';
    if (timeEl) timeEl.textContent = '1-3 ساعات عمل';
    if (netEl) netEl.textContent = `${(amount - fee).toLocaleString('en', { minimumFractionDigits: 2 })} ر.س`;

    const destSelect = document.getElementById('withdraw-dest-select');
    const customIban = document.getElementById('withdraw-custom-iban');
    if (destSelect && customIban) {
        customIban.classList.toggle('hidden', destSelect.value !== 'custom');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const destSelect = document.getElementById('withdraw-dest-select');
    if (destSelect) {
        destSelect.addEventListener('change', () => {
            const customIban = document.getElementById('withdraw-custom-iban');
            if (customIban) customIban.classList.toggle('hidden', destSelect.value !== 'custom');
        });
    }
});
