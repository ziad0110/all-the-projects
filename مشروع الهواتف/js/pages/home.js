// PhoneVerse — Home Page (User-Friendly Redesign)
const HomePage = {
  render() {
    const stats = DataService.getStats();
    const featured = DataService.getFeatured(4);
    const gainers = DataService.getTopGainers(5);
    const losers = DataService.getTopLosers(5);
    const brands = DataService.getBrands();

    return `<div class="page" id="homePage">
      <!-- Welcome Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>ابحث عن <span>هاتفك المثالي</span></h1>
          <p>أدخل ميزانيتك أو اختر ما تبحث عنه — ونحن نساعدك في العثور على أفضل هاتف يناسبك</p>
          
          <!-- Quick Budget Picker -->
          <div class="quick-budget">
            <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-secondary)">
              <i class="fas fa-wallet"></i> ما هي ميزانيتك؟
            </h3>
            <div class="budget-options">
              <button class="budget-btn" onclick="App.navigateTo('catalog'); setTimeout(() => { document.getElementById('priceMax').value='200'; FilterPanel.applyFilters(); }, 300);">
                <span class="budget-icon">💰</span>
                <span class="budget-label">اقتصادي</span>
                <span class="budget-range">أقل من $200</span>
              </button>
              <button class="budget-btn" onclick="App.navigateTo('catalog'); setTimeout(() => { document.getElementById('priceMin').value='200'; document.getElementById('priceMax').value='500'; FilterPanel.applyFilters(); }, 300);">
                <span class="budget-icon">⭐</span>
                <span class="budget-label">متوسط</span>
                <span class="budget-range">$200 — $500</span>
              </button>
              <button class="budget-btn" onclick="App.navigateTo('catalog'); setTimeout(() => { document.getElementById('priceMin').value='500'; document.getElementById('priceMax').value='1000'; FilterPanel.applyFilters(); }, 300);">
                <span class="budget-icon">🔥</span>
                <span class="budget-label">متقدم</span>
                <span class="budget-range">$500 — $1000</span>
              </button>
              <button class="budget-btn" onclick="App.navigateTo('catalog'); setTimeout(() => { document.getElementById('priceMin').value='1000'; FilterPanel.applyFilters(); }, 300);">
                <span class="budget-icon">👑</span>
                <span class="budget-label">رائد</span>
                <span class="budget-range">أكثر من $1000</span>
              </button>
            </div>
          </div>

          <div class="hero-stats">
            <div class="hero-stat"><div class="stat-num">${stats.totalPhones}+</div><div class="stat-label">هاتف في قاعدة البيانات</div></div>
            <div class="hero-stat"><div class="stat-num">${stats.totalBrands}</div><div class="stat-label">علامة تجارية</div></div>
          </div>
        </div>
      </section>

      <!-- How to Use Section -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-question-circle"></i> كيف تستخدم التطبيق؟</h2>
        </div>
        <div class="how-to-grid">
          <div class="how-to-card" onclick="App.navigateTo('catalog')">
            <div class="how-to-num">1</div>
            <div class="how-to-icon"><i class="fas fa-filter"></i></div>
            <h3>فلتر واختر</h3>
            <p>حدد الرام، التخزين، البراند، والسعر — ونعرض لك الهواتف المناسبة</p>
          </div>
          <div class="how-to-card" onclick="App.navigateTo('compare')">
            <div class="how-to-num">2</div>
            <div class="how-to-icon"><i class="fas fa-balance-scale"></i></div>
            <h3>قارن الهواتف</h3>
            <p>اختر حتى 3 هواتف وقارن مواصفاتها وأسعارها جنبًا إلى جنب</p>
          </div>
          <div class="how-to-card" onclick="App.navigateTo('tracker')">
            <div class="how-to-num">3</div>
            <div class="how-to-icon"><i class="fas fa-chart-line"></i></div>
            <h3>تتبع الأسعار</h3>
            <p>شاهد ارتفاع وانخفاض الأسعار كأسهم البورصة — واعرف أفضل وقت للشراء</p>
          </div>
          <div class="how-to-card" onclick="App.navigateTo('favorites')">
            <div class="how-to-num">4</div>
            <div class="how-to-icon"><i class="fas fa-heart"></i></div>
            <h3>احفظ المفضلة</h3>
            <p>أضف الهواتف التي أعجبتك إلى المفضلة وارجع إليها بسهولة</p>
          </div>
        </div>
      </section>

      <!-- Smart Categories -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-magic"></i> أنا أبحث عن...</h2>
        </div>
        <div class="smart-cats-grid">
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'minCamera\\'][data-value=\\'108\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-camera" style="color:#f59e0b"></i>
            <span>أفضل كاميرا</span>
          </button>
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'minBattery\\'][data-value=\\'5500\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-battery-full" style="color:#34d399"></i>
            <span>أطول بطارية</span>
          </button>
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'ram\\'][data-value=\\'12\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-gamepad" style="color:#f87171"></i>
            <span>أفضل للألعاب</span>
          </button>
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'foldable\\'][data-value=\\'true\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-tablet-alt" style="color:#a78bfa"></i>
            <span>هواتف قابلة للطي</span>
          </button>
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'fiveG\\'][data-value=\\'true\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-signal" style="color:#60a5fa"></i>
            <span>يدعم 5G</span>
          </button>
          <button class="smart-cat" onclick="App.navigateTo('catalog'); setTimeout(() => { document.querySelectorAll('[data-filter=\\'category\\'][data-value=\\'budget\\']').forEach(e=>e.click()); }, 300);">
            <i class="fas fa-tags" style="color:#22d3ee"></i>
            <span>أرخص الهواتف</span>
          </button>
        </div>
      </section>

      <!-- Featured Phones -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-star"></i> هواتف مميزة لهذا الشهر</h2>
          <a class="btn btn-secondary btn-sm" onclick="App.navigateTo('catalog')">عرض الكل <i class="fas fa-arrow-left"></i></a>
        </div>
        <div class="phones-grid">${featured.map(p => createPhoneCard(p)).join('')}</div>
      </section>

      <!-- Price Movers -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-chart-line"></i> تحركات الأسعار اليوم</h2>
          <a class="btn btn-secondary btn-sm" onclick="App.navigateTo('tracker')">المزيد <i class="fas fa-arrow-left"></i></a>
        </div>
        <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:0.9rem">
          <i class="fas fa-info-circle"></i> الأسعار تتغير يومياً مثل أسعار الأسهم — 🟢 ارتفع سعره | 🔴 انخفض سعره
        </p>
        <div class="movers-grid">
          <div class="mover-section">
            <div class="mover-header gainers"><i class="fas fa-arrow-up"></i> ارتفع سعرها مؤخراً</div>
            ${gainers.map((p, i) => `<div class="mover-item" onclick="App.navigateTo('phone/${p.id}')">
              <span class="mover-rank">${i + 1}</span>
              ${getPhoneImageSmall(p)}
              <div class="mover-info"><div class="mover-name">${p.model}</div><div class="mover-brand">${p.brand}</div></div>
              <div class="mover-price"><div class="current">$${p.price}</div><div class="change price-up">▲ ${Math.abs(p.priceChangePercent)}%</div></div>
            </div>`).join('')}
          </div>
          <div class="mover-section">
            <div class="mover-header losers"><i class="fas fa-arrow-down"></i> انخفض سعرها — فرصة للشراء!</div>
            ${losers.map((p, i) => `<div class="mover-item" onclick="App.navigateTo('phone/${p.id}')">
              <span class="mover-rank">${i + 1}</span>
              ${getPhoneImageSmall(p)}
              <div class="mover-info"><div class="mover-name">${p.model}</div><div class="mover-brand">${p.brand}</div></div>
              <div class="mover-price"><div class="current">$${p.price}</div><div class="change price-down">▼ ${Math.abs(p.priceChangePercent)}%</div></div>
            </div>`).join('')}
          </div>
        </div>
      </section>

      <!-- Brands -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-building"></i> تصفح حسب العلامة التجارية</h2>
        </div>
        <p style="color:var(--text-secondary);margin-bottom:1rem;font-size:0.9rem">
          <i class="fas fa-hand-pointer"></i> اضغط على أي براند لرؤية جميع هواتفه
        </p>
        <div class="brands-grid">
          ${brands.map(b => `<div class="brand-card" onclick="App.navigateTo('catalog'); setTimeout(() => FilterPanel.setActiveBrand('${b.name}'), 200);">
            <div class="brand-icon" style="width:40px;height:40px;border-radius:10px;background:${BRAND_COLORS[b.name]};display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.2rem;font-family:var(--font-en)">${b.name.charAt(0)}</div>
            <div class="brand-name">${b.name}</div>
            <div class="brand-count">${b.count} هاتف</div>
          </div>`).join('')}
        </div>
      </section>
    </div>`;
  }
};
