// PhoneVerse — Main Application
const App = {
  currentPage: 'home',
  currentPhoneId: null,

  init() {
    this.setupRouter();
    this.setupSearch();
    this.setupTheme();
    this.setupNavbar();
    this.updateFavCount();
    this.updateFooter();
    this.handleRoute();
    console.log('PhoneVerse App initialized!');
  },

  // === Router ===
  setupRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    const page = parts[0];
    const param = parts[1];

    this.currentPage = page;
    this.currentPhoneId = param;
    this.renderCurrentPage();
    this.updateActiveNav(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateTo(route) {
    location.hash = route;
  },

  renderCurrentPage() {
    const main = document.getElementById('mainContent');
    if (!main) return;

    PriceChartManager.destroyAll();

    switch (this.currentPage) {
      case 'home':
        main.innerHTML = HomePage.render();
        break;
      case 'catalog':
        main.innerHTML = CatalogPage.render();
        CatalogPage.init();
        break;
      case 'phone':
        main.innerHTML = DetailPage.render(this.currentPhoneId);
        setTimeout(() => DetailPage.init(), 100);
        break;
      case 'compare':
        main.innerHTML = ComparePage.render();
        setTimeout(() => ComparePage.init(), 100);
        break;
      case 'tracker':
        main.innerHTML = TrackerPage.render();
        setTimeout(() => TrackerPage.init(), 100);
        break;
      case 'favorites':
        main.innerHTML = FavoritesPage.render();
        break;
      default:
        main.innerHTML = HomePage.render();
    }
  },

  updateActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
  },

  // === Search ===
  setupSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) { results.classList.remove('show'); return; }
      const phones = DataService.searchPhones(query);
      if (phones.length === 0) {
        results.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--text-muted)">لا توجد نتائج</div>';
      } else {
        results.innerHTML = phones.map(p => `
          <div class="search-result-item" onclick="App.navigateTo('phone/${p.id}'); document.getElementById('searchResults').classList.remove('show'); document.getElementById('globalSearch').value='';">
            <div class="sr-img">${getPhoneImageSmall(p)}</div>
            <div class="sr-info">
              <h4>${p.brand} ${p.model}</h4>
              <p>$${p.price} · ${p.specs.ram}GB · ${p.specs.storage}GB</p>
            </div>
          </div>`).join('');
      }
      results.classList.add('show');
    });

    input.addEventListener('focus', () => { if (input.value.length >= 2) results.classList.add('show'); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) results.classList.remove('show');
    });
  },

  // === Theme ===
  setupTheme() {
    const saved = localStorage.getItem('pv_theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    this.updateThemeIcon(saved);

    document.getElementById('themeToggle').addEventListener('click', () => {
      const current = document.documentElement.dataset.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('pv_theme', next);
      this.updateThemeIcon(next);
    });
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  },

  // === Navbar ===
  setupNavbar() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('show'));
      });
    }

    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    });
  },

  // === Favorites ===
  toggleFav(id) {
    DataService.toggleFavorite(id);
    this.updateFavCount();
    const isFav = DataService.isFavorite(id);
    this.showToast(isFav ? 'تمت الإضافة للمفضلة ❤️' : 'تمت الإزالة من المفضلة', 'success');

    // Update card buttons
    document.querySelectorAll(`.phone-card[data-id="${id}"] .card-action-btn:first-child`).forEach(btn => {
      btn.classList.toggle('favorited', isFav);
    });
  },

  updateFavCount() {
    const count = DataService.getFavorites().length;
    const el = document.getElementById('favCount');
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline' : 'none';
    }
  },

  // === Compare ===
  toggleCompare(id) {
    const result = DataService.toggleCompare(id);
    if (result === null) {
      this.showToast('الحد الأقصى 3 هواتف للمقارنة', 'error');
      return;
    }
    const inCompare = DataService.isInCompare(id);
    this.showToast(inCompare ? 'تمت الإضافة للمقارنة ⚖️' : 'تمت الإزالة من المقارنة', 'success');

    document.querySelectorAll(`.phone-card[data-id="${id}"] .card-action-btn:last-child`).forEach(btn => {
      btn.classList.toggle('in-compare', inCompare);
    });
  },

  // === Toast ===
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // === Footer ===
  updateFooter() {
    const stats = DataService.getStats();
    const el = document.getElementById('footerStats');
    if (el) {
      el.innerHTML = `
        <div class="footer-stat">📱 <span>${stats.totalPhones}</span> هاتف</div>
        <div class="footer-stat">🏢 <span>${stats.totalBrands}</span> علامة تجارية</div>
        <div class="footer-stat">💰 <span>$${stats.minPrice}</span> — <span>$${stats.maxPrice}</span></div>
        <div class="footer-stat">📈 <span>${stats.gainers}</span> مرتفع · 📉 <span>${stats.losers}</span> منخفض</div>`;
    }
  },

  // === Welcome Modal ===
  showWelcome() {
    const seen = localStorage.getItem('pv_welcome_seen');
    if (!seen) {
      const modal = document.getElementById('welcomeModal');
      if (modal) modal.style.display = 'flex';
    }
  },

  closeWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('pv_welcome_seen', 'true');
  }
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  // Show welcome modal for first-time users
  setTimeout(() => App.showWelcome(), 500);
});

