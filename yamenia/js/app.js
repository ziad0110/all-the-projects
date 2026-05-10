// ===== Yemen Safe - Main App Logic =====

document.addEventListener('DOMContentLoaded', function () {
    const user = requireAuth();
    if (!user) return;

    // Check if user can access current page
    if (!checkPageAccess(user)) return;

    initializeSidebar(user);
    initializeHeader(user);
    initializeMobileMenu();
    initializeTooltips();
    applyRolePermissions(user);
    showRoleBanner(user);
    initFAB(user);
});

// === Sidebar with Role-Based Access ===
function initializeSidebar(user) {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Hide nav links for pages user can't access
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const page = link.getAttribute('data-page');

        // Check if user can access this page
        if (!canAccessPage(user, page)) {
            link.style.display = 'none';
            return;
        }

        if (page === currentPage) {
            link.classList.add('active');
        }
        link.addEventListener('click', function (e) {
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Unread notifications count
    const unread = getUnreadNotifications();
    const notifBadges = document.querySelectorAll('.notif-count');
    notifBadges.forEach(badge => {
        badge.textContent = unread.length;
        if (unread.length === 0) badge.style.display = 'none';
    });
}

// === Apply Role Permissions to UI ===
function applyRolePermissions(user) {
    // Hide "create incident" button for roles without that permission
    if (!hasPermission(user, 'create_incident')) {
        document.querySelectorAll('[onclick*="openNewIncidentModal"]').forEach(el => el.style.display = 'none');
    }

    // Hide "manage users" button for non-admins
    if (!isAdmin(user)) {
        document.querySelectorAll('[onclick*="manage_users"], .admin-only').forEach(el => el.style.display = 'none');
    }

    // Hide export/print buttons — ONLY operations_manager can print/export
    if (!hasPermission(user, 'print_reports')) {
        document.querySelectorAll('.export-section').forEach(el => el.style.display = 'none');
        document.querySelectorAll('[onclick*="window.print"], [onclick*="exportPDF"], [onclick*="exportCSV"], [onclick*="printReport"], .print-btn').forEach(el => el.style.display = 'none');
    }

    // Show admin badge
    if (isAdmin(user)) {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && !headerTitle.querySelector('.admin-badge')) {
            headerTitle.innerHTML += ' <span class="admin-badge" style="background:linear-gradient(135deg,#cc2229,#e74c3c);color:#fff;font-size:11px;padding:2px 8px;border-radius:20px;margin-right:8px;font-weight:700;">مدير</span>';
        }
    }
}

// === Role Banner ===
function showRoleBanner(user) {
    const perms = getUserPermissions(user);
    if (!perms) return;
    const roleInfo = MockData.roles[user.role];
    if (!roleInfo) return;

    const banner = document.createElement('div');
    banner.className = 'role-banner';
    banner.style.background = `${roleInfo.color}10`;
    banner.style.border = `1px solid ${roleInfo.color}30`;
    banner.style.color = roleInfo.color;
    banner.innerHTML = `
        <i class="${roleInfo.icon}"></i>
        <span><strong>${roleInfo.label}</strong> — ${perms.description}</span>
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent && mainContent.firstChild) {
        mainContent.insertBefore(banner, mainContent.firstChild);
    }
}

// === Header ===
function initializeHeader(user) {
    // Set user info
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = getRoleLabel(user.role);
    if (userAvatarEl) userAvatarEl.textContent = user.avatar;

    // Notification bell
    const notifBtn = document.querySelector('.notif-btn');
    if (notifBtn) {
        const unread = getUnreadNotifications();
        const badge = notifBtn.querySelector('.badge');
        if (badge) {
            badge.textContent = unread.length;
            if (unread.length === 0) badge.style.display = 'none';
        }
    }

    // Search functionality with visual dropdown
    const searchInput = document.querySelector('.header-search input');
    if (searchInput) {
        // Create search results dropdown
        const searchContainer = searchInput.closest('.header-search');
        searchContainer.style.position = 'relative';
        const dropdown = document.createElement('div');
        dropdown.className = 'search-results-dropdown';
        dropdown.style.cssText = `
            position:absolute; top:100%; right:0; left:0; background:var(--white); border:1px solid var(--border-light);
            border-radius:0 0 var(--radius-lg) var(--radius-lg); box-shadow:var(--shadow-lg); max-height:320px; overflow-y:auto;
            z-index:999; display:none;
        `;
        searchContainer.appendChild(dropdown);

        searchInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();
            if (query.length >= 2) {
                const results = MockData.incidents.filter(inc =>
                    inc.title.toLowerCase().includes(query) ||
                    inc.id.toLowerCase().includes(query) ||
                    inc.location.includes(query)
                ).slice(0, 8);

                if (results.length > 0) {
                    dropdown.innerHTML = results.map(inc => {
                        const type = MockData.incidentTypes.find(t => t.id === inc.type);
                        const statusInfo = MockData.statuses[inc.status];
                        return `<a href="incident-detail.html?id=${inc.id}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border-light);text-decoration:none;color:var(--text-primary);transition:background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='transparent'">
                            <div style="width:32px;height:32px;border-radius:8px;background:${type.color}15;color:${type.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="${type.icon}" style="font-size:14px;"></i></div>
                            <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${inc.title}</div><div style="font-size:11px;color:var(--text-muted);">${inc.id} • ${inc.location}</div></div>
                            <span class="badge-status ${statusInfo.cssClass}" style="font-size:10px;padding:2px 8px;flex-shrink:0;">${statusInfo.label}</span>
                        </a>`;
                    }).join('');
                    dropdown.style.display = 'block';
                } else {
                    dropdown.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;"><i class="fas fa-search" style="font-size:24px;display:block;margin-bottom:8px;"></i>لا توجد نتائج</div>';
                    dropdown.style.display = 'block';
                }
            } else {
                dropdown.style.display = 'none';
            }
        });

        searchInput.addEventListener('blur', function () {
            setTimeout(() => { dropdown.style.display = 'none'; }, 200);
        });
        searchInput.addEventListener('focus', function () {
            if (this.value.trim().length >= 2) dropdown.style.display = 'block';
        });
    }
}

// === Mobile Menu ===
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });

        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }
}

// === Tooltips ===
function initializeTooltips() {
    document.querySelectorAll('[title]').forEach(el => {
        const text = el.getAttribute('title');
        if (!text) return;
        el.removeAttribute('title');
        el.setAttribute('data-tooltip', text);

        el.addEventListener('mouseenter', function (e) {
            const tip = document.createElement('div');
            tip.className = 'custom-tooltip';
            tip.textContent = text;
            tip.style.cssText = `
                position:fixed; background:var(--gray-900); color:#fff; font-size:12px;
                padding:6px 12px; border-radius:6px; z-index:10000; pointer-events:none;
                white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.2);
                animation:tooltipFadeIn 0.15s ease;
            `;
            document.body.appendChild(tip);
            const rect = el.getBoundingClientRect();
            tip.style.top = (rect.top - tip.offsetHeight - 8) + 'px';
            tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + 'px';
            el._tooltip = tip;
        });

        el.addEventListener('mouseleave', function () {
            if (el._tooltip) { el._tooltip.remove(); el._tooltip = null; }
        });
    });

    // Inject tooltip animation
    if (!document.getElementById('tooltip-style')) {
        const style = document.createElement('style');
        style.id = 'tooltip-style';
        style.textContent = `@keyframes tooltipFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`;
        document.head.appendChild(style);
    }
}

// === Toast Notifications ===
function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle', 
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// === Number Animation ===
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('ar-EG');
    }, 16);
}

function animatePercentage(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '%';
    }, 16);
}

// === Format Date ===
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(dateStr, timeStr) {
    return `${formatDate(dateStr)} - ${timeStr}`;
}

// === Generate Sidebar HTML ===
function getSidebarHTML() {
    return `
    <div class="sidebar" id="sidebar">
        <div class="sidebar-logo">
            <div class="sidebar-logo-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div class="sidebar-logo-text">
                <h2>يمن سيف</h2>
                <span>YEMEN SAFE</span>
            </div>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-section">
                <div class="nav-section-title">القائمة الرئيسية</div>
                <a class="nav-link" data-page="dashboard.html">
                    <i class="fas fa-th-large"></i>
                    <span>لوحة التحكم</span>
                </a>
                <a class="nav-link" data-page="incidents.html">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>إدارة الحوادث</span>
                    <span class="nav-badge notif-count">3</span>
                </a>
                <a class="nav-link" data-page="risks.html">
                    <i class="fas fa-shield-virus"></i>
                    <span>سجل المخاطر</span>
                </a>
                <a class="nav-link" data-page="reports.html">
                    <i class="fas fa-chart-bar"></i>
                    <span>التقارير</span>
                </a>
                <a class="nav-link" data-page="notifications.html">
                    <i class="fas fa-bell"></i>
                    <span>الإشعارات</span>
                    <span class="nav-badge notif-count">3</span>
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">الإدارة</div>
                <a class="nav-link" data-page="settings.html">
                    <i class="fas fa-cog"></i>
                    <span>الإعدادات</span>
                </a>
            </div>
        </nav>

        <div class="sidebar-footer">
            <a class="nav-link" id="logoutBtn" href="#">
                <i class="fas fa-sign-out-alt"></i>
                <span>تسجيل الخروج</span>
            </a>
        </div>
    </div>
    <div class="sidebar-overlay"></div>
    `;
}

// === Generate Header HTML ===
function getHeaderHTML(pageTitle, pageSubtitle) {
    return `
    <header class="top-header">
        <div class="header-right">
            <button class="mobile-menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open'); document.querySelector('.sidebar-overlay').classList.toggle('active');">
                <i class="fas fa-bars"></i>
            </button>
            <div>
                <div class="header-title">${pageTitle}</div>
                <div class="header-subtitle">${pageSubtitle}</div>
            </div>
        </div>
        <div class="header-left">
            <div class="header-search">
                <input type="text" placeholder="بحث عن حادث، موقع..." data-original-placeholder="بحث عن حادث، موقع...">
                <i class="fas fa-search"></i>
            </div>
            <a href="notifications.html" class="header-icon-btn notif-btn">
                <i class="fas fa-bell"></i>
                <span class="badge notif-count">3</span>
            </a>
            <div class="header-user">
                <div class="user-avatar"></div>
                <div class="user-info">
                    <span class="user-name">المستخدم</span>
                    <span class="user-role">الدور</span>
                </div>
            </div>
        </div>
    </header>
    `;
}

// === LocalStorage Persistence ===
function saveDataToStorage() {
    try {
        localStorage.setItem('yemensafe_incidents', JSON.stringify(MockData.incidents));
        localStorage.setItem('yemensafe_notifications', JSON.stringify(MockData.notifications));
        localStorage.setItem('yemensafe_risks', JSON.stringify(MockData.risks));
    } catch (e) { console.warn('Storage save failed:', e); }
}

function loadDataFromStorage() {
    try {
        const incidents = localStorage.getItem('yemensafe_incidents');
        if (incidents) MockData.incidents = JSON.parse(incidents);
        const notifications = localStorage.getItem('yemensafe_notifications');
        if (notifications) MockData.notifications = JSON.parse(notifications);
        const risks = localStorage.getItem('yemensafe_risks');
        if (risks) MockData.risks = JSON.parse(risks);
    } catch (e) { console.warn('Storage load failed:', e); }
}

// === Loading States ===
function showLoading(containerId, type = 'spinner') {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (type === 'skeleton-cards') {
        el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">${'<div class="skeleton skeleton-card"></div>'.repeat(4)}</div>`;
    } else if (type === 'skeleton-table') {
        el.innerHTML = '<div class="skeleton skeleton-row"></div>'.repeat(5);
    } else if (type === 'skeleton-chart') {
        el.innerHTML = '<div class="skeleton skeleton-chart"></div>';
    } else {
        el.innerHTML = '<div class="content-loading"><div class="loading-spinner"></div><div class="loading-text">جاري التحميل...</div></div>';
    }
}

function hideLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el && el.querySelector('.content-loading, .skeleton')) {
        el.innerHTML = '';
    }
}

function showPageLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'pageLoader';
    overlay.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">جاري تحميل الصفحة...</div>';
    document.body.appendChild(overlay);
}

function hidePageLoading() {
    const overlay = document.getElementById('pageLoader');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 400);
    }
}

// === Theme Settings ===
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('yemensafe_theme', newTheme);

    // Sync toggle switch if present
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = (newTheme === 'dark');
}

function initTheme() {
    const savedTheme = localStorage.getItem('yemensafe_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = (savedTheme === 'dark');
    });
}

// Run init functions
initTheme();
loadDataFromStorage();

// === Live Clock ===
function initLiveClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timeEl = clockEl.querySelector('.clock-time');
        const dateEl = clockEl.querySelector('.clock-date');

        if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('ar-EG', options);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// === Floating Action Button (FAB) ===
function initFAB(user) {
    if (!user) return;
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    const fabHTML = `
    <div class="fab-container" id="fabContainer">
        <div class="fab-menu">
            ${hasPermission(user, 'create_incident') ? `
            <div class="fab-action" onclick="window.location.href='incidents.html'">
                <span class="fab-action-label">تسجيل حادث</span>
                <div class="fab-action-btn" style="background:var(--accent-500);"><i class="fas fa-exclamation-triangle"></i></div>
            </div>` : ''}
            <div class="fab-action" onclick="window.location.href='notifications.html'">
                <span class="fab-action-label">الإشعارات</span>
                <div class="fab-action-btn" style="background:var(--warning-500);"><i class="fas fa-bell"></i></div>
            </div>
            <div class="fab-action" onclick="toggleTheme()">
                <span class="fab-action-label">تبديل المظهر</span>
                <div class="fab-action-btn" style="background:var(--gray-700);"><i class="fas fa-moon"></i></div>
            </div>
        </div>
        <button class="fab-btn" onclick="document.getElementById('fabContainer').classList.toggle('open')">
            <i class="fas fa-plus"></i>
        </button>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', fabHTML);
}
