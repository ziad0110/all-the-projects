// PhoneVerse — Favorites Page
const FavoritesPage = {
  render() {
    const favIds = DataService.getFavorites();
    const phones = favIds.map(id => DataService.getPhoneById(id)).filter(Boolean);

    return `<div class="page favorites-page">
      <div class="favorites-header">
        <h1><i class="fas fa-heart" style="color:var(--red)"></i> المفضلة</h1>
        <p style="color:var(--text-secondary);margin-top:0.5rem">${phones.length} هاتف في المفضلة</p>
      </div>
      ${phones.length === 0 ? `
        <div class="favorites-empty">
          <i class="fas fa-heart"></i>
          <h3>لا توجد هواتف في المفضلة</h3>
          <p>أضف هواتف إلى المفضلة من خلال الضغط على أيقونة القلب</p>
          <button class="btn btn-primary" style="margin-top:1rem" onclick="App.navigateTo('catalog')">
            <i class="fas fa-th-large"></i> تصفح الكتالوج
          </button>
        </div>` : `
        <div class="phones-grid">${phones.map(p => createPhoneCard(p)).join('')}</div>
        <div style="text-align:center;margin-top:2rem">
          <button class="btn btn-secondary" onclick="FavoritesPage.clearAll()">
            <i class="fas fa-trash"></i> مسح الكل
          </button>
        </div>`}
    </div>`;
  },

  clearAll() {
    if (confirm('هل أنت متأكد من مسح جميع المفضلات؟')) {
      localStorage.setItem('pv_favorites', '[]');
      App.updateFavCount();
      App.renderCurrentPage();
      App.showToast('تم مسح المفضلة', 'success');
    }
  }
};
