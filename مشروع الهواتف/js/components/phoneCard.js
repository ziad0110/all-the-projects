// PhoneVerse — Phone Card Component
function getPhoneImageHTML(phone, size = 'sm') {
  const letter = phone.brand.charAt(0);
  const gradient = phone.brandColor || BRAND_COLORS[phone.brand] || 'linear-gradient(135deg, #666, #999)';
  if (size === 'lg') {
    return `<div class="phone-img-lg" style="background:${gradient}">
      <div class="phone-screen">
        <span class="phone-brand-letter">${letter}</span>
        <span class="phone-model-label">${phone.model}</span>
      </div>
    </div>`;
  }
  return `<div class="phone-img" style="background:${gradient}">
    <div class="phone-screen">
      <span class="phone-brand-letter">${letter}</span>
      <span class="phone-model-label">${phone.model}</span>
    </div>
  </div>`;
}

function getPhoneImageSmall(phone) {
  const letter = phone.brand.charAt(0);
  const gradient = phone.brandColor || BRAND_COLORS[phone.brand] || 'linear-gradient(135deg, #666, #999)';
  return `<div style="width:36px;height:36px;border-radius:8px;background:${gradient};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;font-family:var(--font-en);flex-shrink:0">${letter}</div>`;
}

function createPhoneCard(phone, options = {}) {
  const isFav = DataService.isFavorite(phone.id);
  const inCompare = DataService.isInCompare(phone.id);
  const catLabel = phone.category === 'flagship' ? 'رائد' : phone.category === 'midrange' ? 'متوسط' : 'اقتصادي';
  const catClass = phone.category === 'flagship' ? 'badge-flagship' : phone.category === 'midrange' ? 'badge-midrange' : 'badge-budget';
  const changeClass = phone.priceChange >= 0 ? 'price-up' : 'price-down';
  const changeIcon = phone.priceChange >= 0 ? '▲' : '▼';

  return `
    <div class="phone-card" data-id="${phone.id}" onclick="App.navigateTo('phone/${phone.id}')">
      <div class="phone-card-header">
        <span class="phone-card-badge ${catClass}">${catLabel}</span>
        <div class="phone-card-actions">
          <button class="card-action-btn ${isFav ? 'favorited' : ''}" onclick="event.stopPropagation(); App.toggleFav(${phone.id})" title="المفضلة">
            <i class="fas fa-heart"></i>
          </button>
          <button class="card-action-btn ${inCompare ? 'in-compare' : ''}" onclick="event.stopPropagation(); App.toggleCompare(${phone.id})" title="مقارنة">
            <i class="fas fa-balance-scale"></i>
          </button>
        </div>
      </div>
      <div class="phone-card-image">
        ${getPhoneImageHTML(phone)}
      </div>
      <div class="phone-card-brand">${phone.brand}</div>
      <div class="phone-card-name">${phone.model}</div>
      <div class="phone-card-price">
        <span class="price-current">$${phone.price}</span>
        <span class="price-change ${changeClass}">${changeIcon} ${Math.abs(phone.priceChangePercent)}%</span>
      </div>
      <div class="phone-card-specs">
        <div class="spec-item"><i class="fas fa-memory"></i> ${phone.specs.ram}GB</div>
        <div class="spec-item"><i class="fas fa-hdd"></i> ${phone.specs.storage}GB</div>
        <div class="spec-item"><i class="fas fa-camera"></i> ${phone.specs.camera}MP</div>
        <div class="spec-item"><i class="fas fa-battery-full"></i> ${phone.specs.battery}mAh</div>
      </div>
    </div>`;
}

function createPhoneGrid(phones, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (phones.length === 0) {
    container.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><h3>لا توجد نتائج</h3><p>حاول تغيير الفلاتر أو البحث بكلمات مختلفة</p></div>`;
    return;
  }
  container.innerHTML = phones.map(p => createPhoneCard(p)).join('');
}

function createPagination(totalItems, currentPage, itemsPerPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return '';
  let html = '<div class="pagination">';
  html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})"><i class="fas fa-chevron-right"></i></button>`;
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  if (start > 1) { html += `<button class="page-btn" onclick="${onPageChange}(1)">1</button>`; if (start > 2) html += '<span style="color:var(--text-muted)">...</span>'; }
  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
  }
  if (end < totalPages) { if (end < totalPages - 1) html += '<span style="color:var(--text-muted)">...</span>'; html += `<button class="page-btn" onclick="${onPageChange}(${totalPages})">${totalPages}</button>`; }
  html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})"><i class="fas fa-chevron-left"></i></button>`;
  html += '</div>';
  return html;
}
