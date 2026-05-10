// =====================================================
// SIDEBAR ACCORDION
// =====================================================
window.toggleSubmenu = function toggleSubmenu(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = document.getElementById('icon-' + id.split('-')[1]);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
    } else {
        el.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
    }
};
