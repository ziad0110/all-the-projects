// PhoneVerse — Phone Detail Page
const DetailPage = {
  currentPhone: null,
  currentTimeRange: 'all',

  render(phoneId) {
    const phone = DataService.getPhoneById(phoneId);
    if (!phone) return '<div class="page"><div class="no-results"><h3>الهاتف غير موجود</h3></div></div>';
    this.currentPhone = phone;
    const isFav = DataService.isFavorite(phone.id);
    const changeClass = phone.priceChange >= 0 ? 'price-up' : 'price-down';
    const changeIcon = phone.priceChange >= 0 ? '▲' : '▼';
    const similar = DataService.getSimilarPhones(phone, 4);
    const prices = phone.priceHistory.map(p => p.price);
    const minP = Math.min(...prices), maxP = Math.max(...prices), avgP = Math.round(prices.reduce((a,b) => a+b, 0) / prices.length);

    return `<div class="page detail-page">
      <div class="detail-back" onclick="history.back()"><i class="fas fa-arrow-right"></i> رجوع</div>
      <div class="detail-header">
        <div class="detail-image">${getPhoneImageHTML(phone, 'lg')}</div>
        <div class="detail-info">
          <div class="detail-brand">${phone.brand}</div>
          <h1>${phone.model}</h1>
          <div class="phone-card-badge ${phone.category === 'flagship' ? 'badge-flagship' : phone.category === 'midrange' ? 'badge-midrange' : 'badge-budget'}" style="display:inline-block;margin-top:0.5rem">
            ${phone.category === 'flagship' ? '🏆 رائد' : phone.category === 'midrange' ? '⭐ متوسط' : '💰 اقتصادي'}
          </div>
          <div class="detail-price-section">
            <div class="detail-price">$${phone.price}</div>
            <span class="detail-price-change ${changeClass}">${changeIcon} ${Math.abs(phone.priceChangePercent)}%</span>
            <div class="detail-price-stats">
              <div class="price-stat"><div class="label">أقل سعر</div><div class="value" style="color:var(--green)">$${minP}</div></div>
              <div class="price-stat"><div class="label">أعلى سعر</div><div class="value" style="color:var(--red)">$${maxP}</div></div>
              <div class="price-stat"><div class="label">المتوسط</div><div class="value">$${avgP}</div></div>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn ${isFav ? 'btn-primary' : 'btn-secondary'}" onclick="App.toggleFav(${phone.id}); DetailPage.render(${phone.id}); App.renderCurrentPage();">
              <i class="fas fa-heart"></i> ${isFav ? 'في المفضلة' : 'أضف للمفضلة'}
            </button>
            <button class="btn btn-secondary" onclick="App.toggleCompare(${phone.id})">
              <i class="fas fa-balance-scale"></i> مقارنة
            </button>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3><i class="fas fa-chart-line"></i> تاريخ السعر</h3>
          <div class="chart-timerange">
            <button class="time-btn" onclick="DetailPage.setTimeRange('7d')">7 أيام</button>
            <button class="time-btn" onclick="DetailPage.setTimeRange('30d')">30 يوم</button>
            <button class="time-btn" onclick="DetailPage.setTimeRange('90d')">90 يوم</button>
            <button class="time-btn active" onclick="DetailPage.setTimeRange('all')">الكل</button>
          </div>
        </div>
        <div class="chart-canvas-wrap"><canvas id="detailPriceChart"></canvas></div>
      </div>

      <div class="specs-section">
        <h2><i class="fas fa-microchip"></i> المواصفات الكاملة</h2>
        <div class="specs-grid">
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-microchip"></i> المعالج</div><div class="spec-card-value">${phone.specs.processor}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-memory"></i> الرام</div><div class="spec-card-value">${phone.specs.ram}GB</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-hdd"></i> التخزين</div><div class="spec-card-value">${phone.specs.storage >= 1024 ? '1TB' : phone.specs.storage + 'GB'}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-camera"></i> الكاميرا</div><div class="spec-card-value">${phone.specs.camera}MP</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-battery-full"></i> البطارية</div><div class="spec-card-value">${phone.specs.battery}mAh</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-mobile-alt"></i> الشاشة</div><div class="spec-card-value">${phone.specs.screen}" ${phone.specs.screenType}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-cog"></i> النظام</div><div class="spec-card-value">${phone.specs.os}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-weight-hanging"></i> الوزن</div><div class="spec-card-value">${phone.specs.weight}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-signal"></i> 5G</div><div class="spec-card-value">${phone.specs.fiveG ? '✅ نعم' : '❌ لا'}</div></div>
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-wifi"></i> NFC</div><div class="spec-card-value">${phone.specs.nfc ? '✅ نعم' : '❌ لا'}</div></div>
          ${phone.specs.foldable ? '<div class="spec-card"><div class="spec-card-title"><i class="fas fa-tablet-alt"></i> قابل للطي</div><div class="spec-card-value">✅ نعم</div></div>' : ''}
          <div class="spec-card"><div class="spec-card-title"><i class="fas fa-star"></i> التقييم</div><div class="spec-card-value">${phone.rating} / 5</div></div>
        </div>
      </div>
      ${phone.ramOptions.length > 1 || phone.storageOptions.length > 1 ? `
      <div class="specs-section">
        <h2><i class="fas fa-layer-group"></i> الإصدارات المتوفرة</h2>
        <div class="filter-options" style="margin-top:0.5rem">
          ${phone.ramOptions.map(r => `<span class="filter-chip">${r}GB RAM</span>`).join('')}
          ${phone.storageOptions.map(s => `<span class="filter-chip">${s >= 1024 ? '1TB' : s + 'GB'}</span>`).join('')}
        </div>
      </div>` : ''}
      ${similar.length ? `
      <div class="specs-section">
        <h2><i class="fas fa-th-large"></i> هواتف مشابهة</h2>
        <div class="phones-grid">${similar.map(p => createPhoneCard(p)).join('')}</div>
      </div>` : ''}
    </div>`;
  },

  init() {
    if (this.currentPhone) {
      const history = PriceChartManager.filterByTimeRange(this.currentPhone.priceHistory, this.currentTimeRange);
      PriceChartManager.create('detailPriceChart', history, { showPoints: true, showAxis: true });
    }
  },

  setTimeRange(range) {
    this.currentTimeRange = range;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if (this.currentPhone) {
      const history = PriceChartManager.filterByTimeRange(this.currentPhone.priceHistory, range);
      PriceChartManager.create('detailPriceChart', history, { showPoints: true, showAxis: true });
    }
  }
};
