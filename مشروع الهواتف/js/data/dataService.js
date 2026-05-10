// PhoneVerse — Data Service
const DataService = {
  getAllPhones() { return PHONES_DB; },
  
  getPhoneById(id) { return PHONES_DB.find(p => p.id === parseInt(id)); },
  
  getBrands() {
    const brands = {};
    PHONES_DB.forEach(p => {
      if (!brands[p.brand]) brands[p.brand] = { name: p.brand, brandColor: p.brandColor, count: 0 };
      brands[p.brand].count++;
    });
    return Object.values(brands).sort((a, b) => b.count - a.count);
  },
  
  getPhonesByBrand(brand) { return PHONES_DB.filter(p => p.brand === brand); },
  
  filterPhones(filters = {}) {
    let phones = [...PHONES_DB];
    if (filters.brand) phones = phones.filter(p => p.brand === filters.brand);
    if (filters.brands && filters.brands.length) phones = phones.filter(p => filters.brands.includes(p.brand));
    if (filters.category) phones = phones.filter(p => p.category === filters.category);
    if (filters.ram && filters.ram.length) phones = phones.filter(p => filters.ram.includes(p.specs.ram));
    if (filters.storage && filters.storage.length) phones = phones.filter(p => filters.storage.includes(p.specs.storage));
    if (filters.minPrice) phones = phones.filter(p => p.price >= filters.minPrice);
    if (filters.maxPrice) phones = phones.filter(p => p.price <= filters.maxPrice);
    if (filters.minCamera) phones = phones.filter(p => p.specs.camera >= filters.minCamera);
    if (filters.minBattery) phones = phones.filter(p => p.specs.battery >= filters.minBattery);
    if (filters.os) phones = phones.filter(p => p.specs.os.toLowerCase().includes(filters.os.toLowerCase()));
    if (filters.fiveG) phones = phones.filter(p => p.specs.fiveG);
    if (filters.nfc) phones = phones.filter(p => p.specs.nfc);
    if (filters.foldable) phones = phones.filter(p => p.specs.foldable);
    if (filters.screenType) phones = phones.filter(p => p.specs.screenType === filters.screenType);
    return phones;
  },
  
  searchPhones(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return PHONES_DB.filter(p =>
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.specs.processor.toLowerCase().includes(q)
    ).slice(0, 20);
  },
  
  sortPhones(phones, sortBy = 'price-low') {
    const sorted = [...phones];
    switch (sortBy) {
      case 'price-low': return sorted.sort((a, b) => a.price - b.price);
      case 'price-high': return sorted.sort((a, b) => b.price - a.price);
      case 'name': return sorted.sort((a, b) => a.model.localeCompare(b.model));
      case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
      case 'change-up': return sorted.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
      case 'change-down': return sorted.sort((a, b) => a.priceChangePercent - b.priceChangePercent);
      default: return sorted;
    }
  },
  
  getTopGainers(limit = 10) {
    return [...PHONES_DB].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, limit);
  },
  
  getTopLosers(limit = 10) {
    return [...PHONES_DB].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, limit);
  },
  
  getFeatured(limit = 8) {
    return [...PHONES_DB].filter(p => p.category === 'flagship').sort((a, b) => b.rating - a.rating).slice(0, limit);
  },
  
  getSimilarPhones(phone, limit = 6) {
    return PHONES_DB.filter(p => p.id !== phone.id && p.category === phone.category && Math.abs(p.price - phone.price) < phone.price * 0.3).slice(0, limit);
  },
  
  getStats() {
    const prices = PHONES_DB.map(p => p.price);
    return {
      totalPhones: PHONES_DB.length,
      totalBrands: new Set(PHONES_DB.map(p => p.brand)).size,
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      gainers: PHONES_DB.filter(p => p.priceChange > 0).length,
      losers: PHONES_DB.filter(p => p.priceChange < 0).length,
    };
  },

  // Favorites management
  getFavorites() {
    try { return JSON.parse(localStorage.getItem('pv_favorites') || '[]'); } catch { return []; }
  },
  toggleFavorite(id) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(id);
    if (idx > -1) favs.splice(idx, 1); else favs.push(id);
    localStorage.setItem('pv_favorites', JSON.stringify(favs));
    return favs;
  },
  isFavorite(id) { return this.getFavorites().includes(id); },

  // Compare management
  getCompareList() {
    try { return JSON.parse(localStorage.getItem('pv_compare') || '[]'); } catch { return []; }
  },
  toggleCompare(id) {
    const list = this.getCompareList();
    const idx = list.indexOf(id);
    if (idx > -1) { list.splice(idx, 1); } else { if (list.length >= 3) return null; list.push(id); }
    localStorage.setItem('pv_compare', JSON.stringify(list));
    return list;
  },
  isInCompare(id) { return this.getCompareList().includes(id); },
  clearCompare() { localStorage.setItem('pv_compare', '[]'); },

  getUniqueValues(field) {
    const values = new Set();
    PHONES_DB.forEach(p => { if (p.specs[field] !== undefined) values.add(p.specs[field]); });
    return [...values].sort((a, b) => a - b);
  }
};
