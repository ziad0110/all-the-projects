// =====================================================
// AUTO-SAVE (Radar → Vault) — module-scope safe persistence
// =====================================================
window.autoSaveEnabled = false;
window.autoSavePercent = 10;

// Load saved settings immediately
try {
    const saved = JSON.parse(localStorage.getItem('ithraa_autosave') || '{}');
    if (typeof saved.enabled === 'boolean') window.autoSaveEnabled = saved.enabled;
    if (typeof saved.percent === 'number') window.autoSavePercent = saved.percent;
} catch (e) {}

window.toggleAutoSave = function toggleAutoSave(el) {
    window.autoSaveEnabled = !window.autoSaveEnabled;
    if (el) el.classList.toggle('active');

    if (window.autoSaveEnabled) {
        showToast('تم التفعيل ✅', `الادخار التلقائي مفعّل — سيُدّخر ${window.autoSavePercent}% من الراتب تلقائياً`, 'success');
    } else {
        showToast('تم الإيقاف', 'تم إيقاف الادخار التلقائي', 'info');
    }
    try { localStorage.setItem('ithraa_autosave', JSON.stringify({ enabled: window.autoSaveEnabled, percent: window.autoSavePercent })); } catch (e) {}
};

window.changeAutoSavePercent = function changeAutoSavePercent(value) {
    window.autoSavePercent = parseInt(value) || 10;
    try { localStorage.setItem('ithraa_autosave', JSON.stringify({ enabled: window.autoSaveEnabled, percent: window.autoSavePercent })); } catch (e) {}

    const previewEl = document.getElementById('autosave-preview');
    if (previewEl) {
        // Use REAL average monthly income from transactions
        const last90 = new Date(); last90.setDate(last90.getDate() - 90);
        const recent = AppData.transactions.filter(t => t.amount > 0 && t.type === 'income' && new Date(t.date) >= last90);
        const total = recent.reduce((a, t) => a + t.amount, 0);
        const avgMonthly = recent.length > 0 ? Math.round(total / 3) : 15200;
        const saveAmount = Math.round(avgMonthly * window.autoSavePercent / 100);
        previewEl.textContent = `≈ ${saveAmount.toLocaleString()} ${getCurrency()} / شهرياً`;
    }
};

window.executeAutoSave = function executeAutoSave() {
    if (!window.autoSaveEnabled) return;
    if (AppData.vaults.length === 0) {
        showToast('تنبيه', 'أنشئ حصالة أولاً لتفعيل الادخار التلقائي', 'error'); return;
    }
    // Use average monthly income
    const last90 = new Date(); last90.setDate(last90.getDate() - 90);
    const recent = AppData.transactions.filter(t => t.amount > 0 && t.type === 'income' && new Date(t.date) >= last90);
    const total = recent.reduce((a, t) => a + t.amount, 0);
    const avgMonthly = recent.length > 0 ? Math.round(total / 3) : 15200;
    const saveAmount = Math.round(avgMonthly * window.autoSavePercent / 100);

    if (saveAmount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', 'لا يمكن تنفيذ الادخار التلقائي حالياً', 'error'); return;
    }

    const vault = AppData.vaults[0];
    vault.currentAmount += saveAmount;
    addTransaction({
        title: `ادخار تلقائي → ${vault.name}`,
        amount: -saveAmount, type: 'expense', category: 'ادخار',
        icon: 'fa-robot', color: 'emerald', notify: true
    });
    showSuccess('ادخار تلقائي ✅', `تم ادخار ${saveAmount.toLocaleString()} ${getCurrency()} في "${vault.name}"`);
    updateBalance();
};
