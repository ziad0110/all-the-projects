// =====================================================
// TELECOM SELECTOR
// =====================================================
window.selectTelecom = function selectTelecom(btn, provider) {
    document.querySelectorAll('.telecom-btn').forEach(b => {
        b.classList.remove('active', 'bg-purple-500/20', 'border', 'border-purple-500/30');
    });
    if (btn) {
        btn.classList.add('active', 'bg-purple-500/20', 'border', 'border-purple-500/30');
        btn.dataset.provider = provider;
    }
};
