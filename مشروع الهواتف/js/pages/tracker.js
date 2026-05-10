// PhoneVerse — Price Tracker Page
const TrackerPage = {
  selectedPhones: [],
  timeRange: '30d',

  render() {
    const stats = DataService.getStats();
    const gainers = DataService.getTopGainers(10);
    const losers = DataService.getTopLosers(10);

    return `<div class="page tracker-page">
      <div class="tracker-header">
        <h1><i class="fas fa-chart-line"></i> متتبع الأسعار</h1>
        <p style="color:var(--text-secondary);margin-top:0.5rem">تتبع تحركات أسعار الهواتف مثل الأسهم</p>
      </div>

      <div class="tracker-overview">
        <div class="tracker-stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-value">${stats.totalPhones}</div>
          <div class="stat-label">إجمالي الهواتف</div>
        </div>
        <div class="tracker-stat-card">
          <div class="stat-icon" style="color:var(--green)">📈</div>
          <div class="stat-value" style="color:var(--green)">${stats.gainers}</div>
          <div class="stat-label">أسعار مرتفعة</div>
        </div>
        <div class="tracker-stat-card">
          <div class="stat-icon" style="color:var(--red)">📉</div>
          <div class="stat-value" style="color:var(--red)">${stats.losers}</div>
          <div class="stat-label">أسعار منخفضة</div>
        </div>
        <div class="tracker-stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">$${stats.avgPrice}</div>
          <div class="stat-label">متوسط السعر</div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3><i class="fas fa-chart-area"></i> مخطط الأسعار</h3>
          <div class="chart-timerange">
            <button class="time-btn" onclick="TrackerPage.setTime('7d')">7 أيام</button>
            <button class="time-btn active" onclick="TrackerPage.setTime('30d')">30 يوم</button>
            <button class="time-btn" onclick="TrackerPage.setTime('90d')">90 يوم</button>
            <button class="time-btn" onclick="TrackerPage.setTime('all')">الكل</button>
          </div>
        </div>
        <div style="margin-bottom:1rem;display:flex;gap:0.5rem;flex-wrap:wrap" id="trackerSelectedPhones"></div>
        <div style="margin-bottom:1rem">
          <input type="text" id="trackerSearch" placeholder="أضف هاتف للمقارنة..." 
            style="width:100%;padding:0.6rem 1rem;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);outline:none"
            oninput="TrackerPage.onSearch(this.value)">
          <div id="trackerSearchResults" style="max-height:200px;overflow-y:auto"></div>
        </div>
        <div class="chart-canvas-wrap" style="height:350px"><canvas id="trackerChart"></canvas></div>
      </div>

      <div class="movers-grid" style="margin-top:2rem">
        <div class="mover-section">
          <div class="mover-header gainers"><i class="fas fa-arrow-up"></i> الأكثر ارتفاعاً (Top 10)</div>
          ${gainers.map((p, i) => `<div class="mover-item" onclick="App.navigateTo('phone/${p.id}')">
            <span class="mover-rank">${i + 1}</span>
            ${getPhoneImageSmall(p)}
            <div class="mover-info"><div class="mover-name">${p.model}</div><div class="mover-brand">${p.brand}</div></div>
            <div class="mover-price"><div class="current">$${p.price}</div><div class="change price-up">▲ ${Math.abs(p.priceChangePercent)}%</div></div>
          </div>`).join('')}
        </div>
        <div class="mover-section">
          <div class="mover-header losers"><i class="fas fa-arrow-down"></i> الأكثر انخفاضاً (Top 10)</div>
          ${losers.map((p, i) => `<div class="mover-item" onclick="App.navigateTo('phone/${p.id}')">
            <span class="mover-rank">${i + 1}</span>
            ${getPhoneImageSmall(p)}
            <div class="mover-info"><div class="mover-name">${p.model}</div><div class="mover-brand">${p.brand}</div></div>
            <div class="mover-price"><div class="current">$${p.price}</div><div class="change price-down">▼ ${Math.abs(p.priceChangePercent)}%</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  },

  init() {
    if (this.selectedPhones.length === 0) {
      const top3 = DataService.getTopGainers(3);
      this.selectedPhones = top3.map(p => p.id);
    }
    this.updateChart();
    this.updateSelectedDisplay();
  },

  setTime(range) {
    this.timeRange = range;
    document.querySelectorAll('.chart-timerange .time-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    this.updateChart();
  },

  updateChart() {
    const phones = this.selectedPhones.map(id => DataService.getPhoneById(id)).filter(Boolean);
    if (phones.length === 0) return;
    const filteredPhones = phones.map(p => ({
      ...p,
      priceHistory: PriceChartManager.filterByTimeRange(p.priceHistory, this.timeRange)
    }));
    PriceChartManager.createMulti('trackerChart', filteredPhones);
  },

  updateSelectedDisplay() {
    const container = document.getElementById('trackerSelectedPhones');
    if (!container) return;
    const phones = this.selectedPhones.map(id => DataService.getPhoneById(id)).filter(Boolean);
    container.innerHTML = phones.map(p => `<span class="active-filter-tag">${p.brand} ${p.model} <i class="fas fa-times remove" onclick="TrackerPage.removePhone(${p.id})"></i></span>`).join('');
  },

  onSearch(query) {
    const results = DataService.searchPhones(query);
    const container = document.getElementById('trackerSearchResults');
    if (!container) return;
    if (query.length < 2) { container.innerHTML = ''; return; }
    container.innerHTML = results.slice(0, 8).map(p => `<div class="compare-search-item" onclick="TrackerPage.addPhone(${p.id})">
      ${getPhoneImageSmall(p)}
      <div><strong>${p.brand} ${p.model}</strong><br><small style="color:var(--text-muted)">$${p.price}</small></div>
    </div>`).join('');
  },

  addPhone(id) {
    if (!this.selectedPhones.includes(id) && this.selectedPhones.length < 5) {
      this.selectedPhones.push(id);
      this.updateChart();
      this.updateSelectedDisplay();
    }
    document.getElementById('trackerSearch').value = '';
    document.getElementById('trackerSearchResults').innerHTML = '';
  },

  removePhone(id) {
    this.selectedPhones = this.selectedPhones.filter(p => p !== id);
    this.updateChart();
    this.updateSelectedDisplay();
  }
};
