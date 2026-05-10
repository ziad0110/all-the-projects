// PhoneVerse — Compare Page
const ComparePage = {
  searchModal: false,
  activeSlot: null,

  render() {
    const compareList = DataService.getCompareList();
    const phones = compareList.map(id => DataService.getPhoneById(id)).filter(Boolean);

    let slotsHtml = '';
    for (let i = 0; i < 3; i++) {
      if (phones[i]) {
        slotsHtml += `<div class="compare-slot filled">
          ${getPhoneImageHTML(phones[i])}
          <div class="slot-phone-name">${phones[i].brand} ${phones[i].model}</div>
          <div class="slot-phone-price">$${phones[i].price}</div>
          <div class="remove-btn" onclick="ComparePage.removePhone(${phones[i].id})"><i class="fas fa-times"></i> إزالة</div>
        </div>`;
      } else {
        slotsHtml += `<div class="compare-slot" onclick="ComparePage.openSearch(${i})">
          <div class="slot-icon"><i class="fas fa-plus-circle"></i></div>
          <div class="slot-text">اختر هاتف للمقارنة</div>
        </div>`;
      }
    }

    let tableHtml = '';
    if (phones.length >= 2) {
      const specs = [
        { label: 'السعر', key: 'price', fn: p => '$' + p.price, best: 'min' },
        { label: 'المعالج', key: 'processor', fn: p => p.specs.processor },
        { label: 'الرام', key: 'ram', fn: p => p.specs.ram + 'GB', best: 'max' },
        { label: 'التخزين', key: 'storage', fn: p => (p.specs.storage >= 1024 ? '1TB' : p.specs.storage + 'GB'), best: 'max' },
        { label: 'الكاميرا', key: 'camera', fn: p => p.specs.camera + 'MP', best: 'max' },
        { label: 'البطارية', key: 'battery', fn: p => p.specs.battery + 'mAh', best: 'max' },
        { label: 'الشاشة', key: 'screen', fn: p => p.specs.screen + '"', best: 'max' },
        { label: 'نوع الشاشة', key: 'screenType', fn: p => p.specs.screenType },
        { label: 'النظام', key: 'os', fn: p => p.specs.os },
        { label: '5G', key: 'fiveG', fn: p => p.specs.fiveG ? '✅' : '❌' },
        { label: 'NFC', key: 'nfc', fn: p => p.specs.nfc ? '✅' : '❌' },
        { label: 'التقييم', key: 'rating', fn: p => p.rating + ' / 5', best: 'max' },
        { label: 'تغير السعر', key: 'priceChange', fn: p => (p.priceChange >= 0 ? '▲' : '▼') + ' ' + Math.abs(p.priceChangePercent) + '%' },
      ];

      tableHtml = `<div class="compare-table-wrap"><table class="compare-table">
        <thead><tr><th>المواصفة</th>${phones.map(p => `<th>${p.brand}<br>${p.model}</th>`).join('')}</tr></thead>
        <tbody>${specs.map(s => {
          let vals = phones.map(p => s.fn(p));
          let bestIdx = -1;
          if (s.best) {
            const numVals = phones.map(p => {
              if (s.key === 'price') return p.price;
              if (s.key === 'rating') return p.rating;
              return p.specs[s.key] || 0;
            });
            bestIdx = s.best === 'max' ? numVals.indexOf(Math.max(...numVals)) : numVals.indexOf(Math.min(...numVals));
          }
          return `<tr><td>${s.label}</td>${vals.map((v, i) => `<td class="${i === bestIdx ? 'winner' : ''}">${v}</td>`).join('')}</tr>`;
        }).join('')}</tbody>
      </table></div>

      <div class="chart-container" style="margin-top:2rem">
        <h3 style="margin-bottom:1rem"><i class="fas fa-chart-line"></i> مقارنة الأسعار</h3>
        <div class="chart-canvas-wrap"><canvas id="comparePriceChart"></canvas></div>
      </div>`;
    }

    return `<div class="page compare-page">
      <div class="compare-header">
        <h1><i class="fas fa-balance-scale"></i> مقارنة الهواتف</h1>
        <p>اختر حتى 3 هواتف لمقارنتها جنبًا إلى جنب</p>
      </div>
      <div class="compare-slots">${slotsHtml}</div>
      ${tableHtml}
    </div>`;
  },

  init() {
    const compareList = DataService.getCompareList();
    const phones = compareList.map(id => DataService.getPhoneById(id)).filter(Boolean);
    if (phones.length >= 2) {
      PriceChartManager.createMulti('comparePriceChart', phones);
    }
  },

  removePhone(id) {
    DataService.toggleCompare(id);
    App.renderCurrentPage();
  },

  openSearch(slot) {
    this.activeSlot = slot;
    const allPhones = DataService.getAllPhones();
    const modal = document.createElement('div');
    modal.className = 'compare-search-modal';
    modal.id = 'compareSearchModal';
    modal.innerHTML = `<div class="compare-search-content">
      <h3>اختر هاتف للمقارنة</h3>
      <input type="text" id="compareSearchInput" placeholder="ابحث عن هاتف..." oninput="ComparePage.filterSearch(this.value)">
      <div class="compare-search-list" id="compareSearchList">
        ${allPhones.slice(0, 30).map(p => `<div class="compare-search-item" onclick="ComparePage.selectPhone(${p.id})">
          ${getPhoneImageSmall(p)}
          <div><strong>${p.brand} ${p.model}</strong><br><small style="color:var(--text-muted)">$${p.price}</small></div>
        </div>`).join('')}
      </div>
      <button class="btn btn-secondary" style="width:100%;margin-top:1rem" onclick="ComparePage.closeSearch()">إلغاء</button>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('compareSearchInput').focus();
  },

  filterSearch(query) {
    const results = query.length >= 2 ? DataService.searchPhones(query) : DataService.getAllPhones().slice(0, 30);
    document.getElementById('compareSearchList').innerHTML = results.map(p => `<div class="compare-search-item" onclick="ComparePage.selectPhone(${p.id})">
      ${getPhoneImageSmall(p)}
      <div><strong>${p.brand} ${p.model}</strong><br><small style="color:var(--text-muted)">$${p.price}</small></div>
    </div>`).join('');
  },

  selectPhone(id) {
    DataService.toggleCompare(id);
    this.closeSearch();
    App.renderCurrentPage();
  },

  closeSearch() {
    const modal = document.getElementById('compareSearchModal');
    if (modal) modal.remove();
  }
};
