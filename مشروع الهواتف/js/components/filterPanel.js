// PhoneVerse — Filter Panel Component
const FilterPanel = {
  currentFilters: {},
  onFilterChange: null,

  render(containerId, callback) {
    this.onFilterChange = callback;
    const brands = DataService.getBrands();
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="filter-panel">
        <div class="filter-header">
          <h3><i class="fas fa-sliders-h"></i> الفلاتر</h3>
          <span class="filter-clear" onclick="FilterPanel.clearAll()">مسح الكل</span>
        </div>
        
        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-building"></i> العلامة التجارية
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options" id="filterBrands">
            ${brands.map(b => `<button class="filter-chip" data-filter="brand" data-value="${b.name}" onclick="FilterPanel.toggle(this)">${b.name} (${b.count})</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-tags"></i> الفئة
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            <button class="filter-chip" data-filter="category" data-value="flagship" onclick="FilterPanel.toggle(this)">🏆 رائد</button>
            <button class="filter-chip" data-filter="category" data-value="midrange" onclick="FilterPanel.toggle(this)">⭐ متوسط</button>
            <button class="filter-chip" data-filter="category" data-value="budget" onclick="FilterPanel.toggle(this)">💰 اقتصادي</button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-memory"></i> الرام (GB)
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            ${[3,4,6,8,12,16,24].map(r => `<button class="filter-chip" data-filter="ram" data-value="${r}" onclick="FilterPanel.toggle(this)">${r}GB</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-hdd"></i> التخزين (GB)
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            ${[32,64,128,256,512,1024].map(s => `<button class="filter-chip" data-filter="storage" data-value="${s}" onclick="FilterPanel.toggle(this)">${s >= 1024 ? '1TB' : s + 'GB'}</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-dollar-sign"></i> السعر
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="price-range-container">
            <div class="price-range-inputs">
              <input type="number" id="priceMin" placeholder="الحد الأدنى" onchange="FilterPanel.updatePrice()">
              <span>—</span>
              <input type="number" id="priceMax" placeholder="الحد الأعلى" onchange="FilterPanel.updatePrice()">
            </div>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-camera"></i> الكاميرا (MP+)
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            ${[12,48,50,64,108,200].map(c => `<button class="filter-chip" data-filter="minCamera" data-value="${c}" onclick="FilterPanel.toggleSingle(this, 'minCamera')">${c}MP+</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-battery-full"></i> البطارية (mAh+)
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            ${[4000,4500,5000,5500,6000].map(b => `<button class="filter-chip" data-filter="minBattery" data-value="${b}" onclick="FilterPanel.toggleSingle(this, 'minBattery')">${b}+</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-cog"></i> مميزات إضافية
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            <button class="filter-chip" data-filter="fiveG" data-value="true" onclick="FilterPanel.toggle(this)">📡 5G</button>
            <button class="filter-chip" data-filter="nfc" data-value="true" onclick="FilterPanel.toggle(this)">📶 NFC</button>
            <button class="filter-chip" data-filter="foldable" data-value="true" onclick="FilterPanel.toggle(this)">📂 قابل للطي</button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title" onclick="FilterPanel.toggleGroup(this)">
            <i class="fas fa-mobile-alt"></i> نظام التشغيل
            <i class="fas fa-chevron-down toggle"></i>
          </div>
          <div class="filter-options">
            <button class="filter-chip" data-filter="os" data-value="Android" onclick="FilterPanel.toggleSingle(this, 'os')">🤖 Android</button>
            <button class="filter-chip" data-filter="os" data-value="iOS" onclick="FilterPanel.toggleSingle(this, 'os')">🍎 iOS</button>
            <button class="filter-chip" data-filter="os" data-value="HarmonyOS" onclick="FilterPanel.toggleSingle(this, 'os')">🟡 HarmonyOS</button>
          </div>
        </div>
      </div>`;
  },

  toggle(el) {
    el.classList.toggle('active');
    this.applyFilters();
  },

  toggleSingle(el, group) {
    const parent = el.parentElement;
    parent.querySelectorAll('.filter-chip').forEach(c => { if (c !== el) c.classList.remove('active'); });
    el.classList.toggle('active');
    this.applyFilters();
  },

  toggleGroup(titleEl) {
    const opts = titleEl.nextElementSibling;
    const icon = titleEl.querySelector('.toggle');
    if (opts) { opts.style.display = opts.style.display === 'none' ? 'flex' : 'none'; }
    if (icon) icon.classList.toggle('collapsed');
  },

  updatePrice() {
    this.applyFilters();
  },

  applyFilters() {
    const filters = {};
    const activeChips = document.querySelectorAll('.filter-chip.active');
    const brands = [], rams = [], storages = [];

    activeChips.forEach(chip => {
      const f = chip.dataset.filter;
      const v = chip.dataset.value;
      if (f === 'brand') brands.push(v);
      else if (f === 'ram') rams.push(parseInt(v));
      else if (f === 'storage') storages.push(parseInt(v));
      else if (f === 'category') filters.category = v;
      else if (f === 'minCamera') filters.minCamera = parseInt(v);
      else if (f === 'minBattery') filters.minBattery = parseInt(v);
      else if (f === 'fiveG') filters.fiveG = true;
      else if (f === 'nfc') filters.nfc = true;
      else if (f === 'foldable') filters.foldable = true;
      else if (f === 'os') filters.os = v;
    });

    if (brands.length) filters.brands = brands;
    if (rams.length) filters.ram = rams;
    if (storages.length) filters.storage = storages;

    const minP = document.getElementById('priceMin');
    const maxP = document.getElementById('priceMax');
    if (minP && minP.value) filters.minPrice = parseInt(minP.value);
    if (maxP && maxP.value) filters.maxPrice = parseInt(maxP.value);

    this.currentFilters = filters;
    if (this.onFilterChange) this.onFilterChange(filters);
  },

  clearAll() {
    document.querySelectorAll('.filter-chip.active').forEach(c => c.classList.remove('active'));
    const minP = document.getElementById('priceMin');
    const maxP = document.getElementById('priceMax');
    if (minP) minP.value = '';
    if (maxP) maxP.value = '';
    this.currentFilters = {};
    if (this.onFilterChange) this.onFilterChange({});
  },

  setActiveBrand(brand) {
    setTimeout(() => {
      const chips = document.querySelectorAll('[data-filter="brand"]');
      chips.forEach(c => { c.classList.toggle('active', c.dataset.value === brand); });
      this.applyFilters();
    }, 100);
  }
};
