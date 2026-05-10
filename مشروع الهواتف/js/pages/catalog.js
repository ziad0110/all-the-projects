// PhoneVerse — Catalog Page
const CatalogPage = {
  currentPage: 1,
  itemsPerPage: 24,
  currentSort: 'price-low',
  filteredPhones: [],
  viewMode: 'grid',

  render() {
    this.filteredPhones = DataService.getAllPhones();
    return `<div class="page" id="catalogPage">
      <div class="catalog-layout">
        <aside class="catalog-sidebar" id="catalogSidebar"></aside>
        <div class="catalog-main">
          <div class="active-filters" id="activeFilters"></div>
          <div class="catalog-toolbar">
            <div class="catalog-count">عرض <span id="catalogCount">${this.filteredPhones.length}</span> هاتف</div>
            <div class="catalog-sort">
              <label>ترتيب:</label>
              <select id="catalogSort" onchange="CatalogPage.changeSort(this.value)">
                <option value="price-low">السعر: الأقل</option>
                <option value="price-high">السعر: الأعلى</option>
                <option value="name">الاسم</option>
                <option value="rating">التقييم</option>
                <option value="change-up">الأكثر ارتفاعاً</option>
                <option value="change-down">الأكثر انخفاضاً</option>
              </select>
              <div class="view-toggles">
                <button class="view-toggle-btn active" id="gridViewBtn" onclick="CatalogPage.setView('grid')"><i class="fas fa-th-large"></i></button>
                <button class="view-toggle-btn" id="listViewBtn" onclick="CatalogPage.setView('list')"><i class="fas fa-list"></i></button>
              </div>
            </div>
          </div>
          <div class="phones-grid" id="catalogGrid"></div>
          <div id="catalogPagination"></div>
        </div>
      </div>
    </div>`;
  },

  init() {
    FilterPanel.render('catalogSidebar', (filters) => this.onFilter(filters));
    this.updateGrid();
  },

  onFilter(filters) {
    this.filteredPhones = DataService.filterPhones(filters);
    this.filteredPhones = DataService.sortPhones(this.filteredPhones, this.currentSort);
    this.currentPage = 1;
    this.updateGrid();
    this.updateActiveFilters(filters);
  },

  changeSort(sort) {
    this.currentSort = sort;
    this.filteredPhones = DataService.sortPhones(this.filteredPhones, sort);
    this.currentPage = 1;
    this.updateGrid();
  },

  setView(mode) {
    this.viewMode = mode;
    const grid = document.getElementById('catalogGrid');
    document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
    if (grid) { grid.className = mode === 'list' ? 'phones-grid phones-list' : 'phones-grid'; }
  },

  updateGrid() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const pagePhones = this.filteredPhones.slice(start, start + this.itemsPerPage);
    const grid = document.getElementById('catalogGrid');
    const count = document.getElementById('catalogCount');
    const pag = document.getElementById('catalogPagination');
    if (count) count.textContent = this.filteredPhones.length;
    if (grid) {
      if (pagePhones.length === 0) {
        grid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>لا توجد نتائج</h3><p>حاول تغيير الفلاتر</p></div>';
      } else {
        grid.innerHTML = pagePhones.map(p => createPhoneCard(p)).join('');
        if (this.viewMode === 'list') grid.classList.add('phones-list');
      }
    }
    if (pag) pag.innerHTML = createPagination(this.filteredPhones.length, this.currentPage, this.itemsPerPage, 'CatalogPage.goToPage');
  },

  goToPage(page) {
    this.currentPage = page;
    this.updateGrid();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  },

  updateActiveFilters(filters) {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    const tags = [];
    if (filters.brands) filters.brands.forEach(b => tags.push(`<span class="active-filter-tag">${b} <i class="fas fa-times remove" onclick="FilterPanel.clearAll()"></i></span>`));
    if (filters.category) tags.push(`<span class="active-filter-tag">${filters.category === 'flagship' ? 'رائد' : filters.category === 'midrange' ? 'متوسط' : 'اقتصادي'} <i class="fas fa-times remove" onclick="FilterPanel.clearAll()"></i></span>`);
    if (filters.ram) filters.ram.forEach(r => tags.push(`<span class="active-filter-tag">${r}GB RAM <i class="fas fa-times remove" onclick="FilterPanel.clearAll()"></i></span>`));
    if (filters.storage) filters.storage.forEach(s => tags.push(`<span class="active-filter-tag">${s}GB <i class="fas fa-times remove" onclick="FilterPanel.clearAll()"></i></span>`));
    container.innerHTML = tags.join('');
  }
};
