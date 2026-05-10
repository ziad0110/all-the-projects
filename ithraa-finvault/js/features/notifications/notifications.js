// =====================================================
// NOTIFICATIONS — render real notifications, mark as read
// =====================================================

window.showNotifications = function showNotifications() {
    if (typeof showModal === 'function') {
        showModal('notifications-modal');
        renderNotifications();
    } else {
        const modal = document.getElementById('notifications-modal');
        if (modal) modal.classList.remove('hidden');
    }
};

window.renderNotifications = function renderNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;
    
    if (!AppData.notifications || AppData.notifications.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-500 text-sm py-12">لا توجد إشعارات حالياً</p>';
        updateNotificationBadges(0);
        return;
    }

    const unreadCount = AppData.notifications.filter(n => !n.read).length;
    
    // Update List
    list.innerHTML = AppData.notifications.map(n => `
        <div class="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${n.read ? 'opacity-60' : 'bg-purple-500/5 border border-purple-500/10 shadow-sm'} hover:bg-white/5 cursor-pointer group" onclick="markNotificationRead(${n.id})">
            <div class="w-12 h-12 rounded-xl bg-${n.color || 'purple'}-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <i class="fas ${n.icon} text-${n.color || 'purple'}-400 text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                    <p class="font-bold text-sm ${n.read ? 'text-gray-400' : 'text-white'}">${escapeHtml(n.title)}</p>
                    <p class="text-[10px] text-gray-500">${escapeHtml(n.time)}</p>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">${escapeHtml(n.message)}</p>
            </div>
            ${!n.read ? '<div class="w-2.5 h-2.5 rounded-full bg-ethereal-violet shadow-[0_0_10px_rgba(139,92,246,0.5)] flex-shrink-0 mt-2"></div>' : ''}
        </div>
    `).join('');

    // Update Modal Header Text
    const countEl = document.getElementById('notifications-count');
    if (countEl) {
        countEl.textContent = unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة';
    }

    updateNotificationBadges(unreadCount);
};

window.updateNotificationBadges = function updateNotificationBadges(count) {
    const badges = ['mobile-notif-badge', 'desktop-notif-badge'];
    badges.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    });
};

window.markNotificationRead = function markNotificationRead(id) {
    const n = AppData.notifications.find(x => x.id === id);
    if (n) { 
        n.read = true; 
        renderNotifications();
        if (typeof markStateDirty === 'function') markStateDirty();
    }
};

window.markAllNotificationsAsRead = function markAllNotificationsAsRead() {
    if (!AppData.notifications) return;
    AppData.notifications.forEach(n => n.read = true);
    renderNotifications();
    if (typeof showToast === 'function') {
        showToast('تم التحديث', 'تم تعليم جميع الإشعارات كمقروءة', 'success');
    }
    if (typeof markStateDirty === 'function') markStateDirty();
};

// Auto-init badges on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderNotifications, 1000);
});
