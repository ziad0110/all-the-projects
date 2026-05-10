// ===== BAYTI APP.JS =====
// Theme
function toggleTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('bayti-theme', t);
  const icon = document.querySelector('[onclick="toggleTheme()"] i');
  if (icon) icon.className = t ? 'fas fa-sun' : 'fas fa-moon';
}
(function () { const t = localStorage.getItem('bayti-theme'); if (t) { document.documentElement.setAttribute('data-theme', t); document.addEventListener('DOMContentLoaded', () => { const icon = document.querySelector('[onclick="toggleTheme()"] i'); if (icon) icon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon' }) } })();

// ===== PRODUCTS DATA & INITIALIZATION =====
const categoryNames = {
  home: 'أدوات منزلية', kitchen: 'أدوات المطبخ', food: 'طعام وبقالة',
  fashion: 'ملابس وأزياء', electronics: 'إلكترونيات', used: 'مستعمل ومجدد',
  beauty: 'عناية شخصية', toys: 'ألعاب وترفيه'
};
const subCategoryNames = {
  furniture: 'أثاث وغرف نوم', decor: 'ديكور وتزيين', lighting: 'إضاءة', storage: 'تخزين وتنظيم',
  garden: 'حدائق ونباتات', bathroom: 'حمامات', cookware: 'أواني طبخ', appliances: 'أجهزة صغيرة',
  serving: 'أدوات تقديم', cutlery: 'سكاكين وأدوات قطع', vegs: 'خضروات وفواكه', meat: 'لحوم ودواجن',
  dairy: 'ألبان وأجبان', canned: 'معلبات ومعجنات', spices: 'توابل وبهارات', drinks: 'مشروبات وعصائر',
  snacks: 'حلويات وسناكات', men: 'ملابس رجالية', women: 'ملابس نسائية', kids: 'ملابس أطفال',
  shoes: 'أحذية', accessories: 'إكسسوارات', phones: 'هواتف ذكية', tablets: 'أجهزة لوحية',
  laptops: 'لابتوبات', tvs: 'تلفزيونات', eacc: 'إكسسوارات إلكترونية',
  ufurniture: 'أثاث مستعمل', uelectronics: 'إلكترونيات مستعملة', uclothes: 'ملابس مستعملة',
  ubooks: 'كتب مستعملة', uother: 'متنوعات', perfume: 'عطور', skincare: 'بشرة',
  haircare: 'شعر', makeup: 'مكياج', kidtoys: 'ألعاب أطفال', videogames: 'ألعاب فيديو', boardgames: 'ألعاب طاولة'
};
window.categoryNames = categoryNames;
window.subCategoryNames = subCategoryNames;

const defaultProducts = [
  { id: 1, name: 'كنبة عصرية 3 مقاعد - قماش فاخر', cat: 'home', sub: 'furniture', price: 2500, oldPrice: 3200, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', seller: 'متجر الأصالة', condition: 'new', rating: 4.5, reviews: 127 },
  { id: 2, name: 'طقم أواني جرانيت 10 قطع', cat: 'kitchen', sub: 'cookware', price: 850, oldPrice: 1100, img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop', seller: 'بيت الطبخ', condition: 'new', rating: 4.8, reviews: 85 },
  { id: 3, name: 'مجموعة بهارات يمنية أصلية', cat: 'food', sub: 'spices', price: 120, img: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&h=300&fit=crop', seller: 'بيت البهارات', condition: 'new', rating: 4.9, reviews: 210 },
  { id: 4, name: 'مكنسة ريبوت ذكية - شفط قوي', cat: 'home', sub: 'appliances', price: 1200, oldPrice: 1500, img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&h=300&fit=crop', seller: 'تكنو لايف', condition: 'new', rating: 4.6, reviews: 45 },
  { id: 5, name: 'خلاط فواكه محمول 500 مل', cat: 'kitchen', sub: 'appliances', price: 75, oldPrice: 95, img: 'https://images.unsplash.com/photo-157022204ea25-1e4d0d04c10e?w=400&h=300&fit=crop', seller: 'سمارت كيتشن', condition: 'new', rating: 4.2, reviews: 32 },
  { id: 6, name: 'طقم فناجين قهوة تراثية 6 قطع', cat: 'kitchen', sub: 'tableware', price: 150, img: 'https://images.unsplash.com/photo-1577968897866-be501c6f8821?w=400&h=300&fit=crop', seller: 'تراثنا', condition: 'new', rating: 4.7, reviews: 58 },
  { id: 7, name: 'عسل سدر ملكي أصلي 1 كجم', cat: 'food', sub: 'honey', price: 350, img: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?w=400&h=300&fit=crop', seller: 'مناحل العز', condition: 'new', rating: 5.0, reviews: 340 },
  { id: 8, name: 'ساعة ذكية مقاومة للماء GPS', cat: 'electronics', sub: 'wearables', price: 550, oldPrice: 700, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', seller: 'ديجيتال ورلد', condition: 'new', rating: 4.5, reviews: 88 },
  { id: 9, name: 'فرن كهربائي مدمج كبير', cat: 'kitchen', sub: 'appliances', price: 1800, oldPrice: 2200, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'سمارت هاوس', condition: 'new', rating: 4.4, reviews: 26 },
  { id: 10, name: 'طقم ملابس أطفال قطن 3 قطع', cat: 'fashion', sub: 'kids', price: 120, img: 'https://images.unsplash.com/photo-1522771935876-0610344d5a99?w=400&h=300&fit=crop', seller: 'عالم الطفل', condition: 'new', rating: 4.8, reviews: 54 },
  { id: 11, name: 'سماعات بلوتوث عازلة للضجيج', cat: 'electronics', sub: 'audio', price: 420, oldPrice: 550, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', seller: 'أوديو برو', condition: 'new', rating: 4.7, reviews: 112 },
  { id: 12, name: 'مجموعة ألعاب تعليمية خشبية', cat: 'toys', sub: 'educational', price: 180, img: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=400&h=300&fit=crop', seller: 'ألعابنا الذكية', condition: 'new', rating: 4.9, reviews: 42 },
  { id: 13, name: 'كريم مرطب للبشرة - فيتامين C', cat: 'care', sub: 'skincare', price: 65, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop', seller: 'ناتشورال بيوتي', condition: 'new', rating: 4.3, reviews: 76 },
  { id: 14, name: 'طاولة طعام خشبية - 6 كراسي', cat: 'home', sub: 'furniture', price: 3800, oldPrice: 4500, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'بيت الأثاث', condition: 'new', rating: 4.6, reviews: 18 },
  { id: 15, name: 'حقيبة ظهر للابتوب مقاومة للماء', cat: 'electronics', sub: 'accessories', price: 140, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', seller: 'موال ستور', condition: 'new', rating: 4.5, reviews: 94 },
  { id: 16, name: 'مكواة بخار عمودية 1500 وات', cat: 'home', sub: 'appliances', price: 280, oldPrice: 350, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'تيفال هاوس', condition: 'new', rating: 4.1, reviews: 29 },
  { id: 17, name: 'زيت زيتون بكر ممتاز 5 لتر', cat: 'food', sub: 'oils', price: 420, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', seller: 'خيرات بلادي', condition: 'new', rating: 4.9, reviews: 156 },
  { id: 18, name: 'تلفزيون ذكي 55 بوصة 4K', cat: 'electronics', sub: 'tv', price: 4500, oldPrice: 5200, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', seller: 'إلكتروكوم', condition: 'new', rating: 4.7, reviews: 63 },
  { id: 19, name: 'طقم عطور عربية فاخرة', cat: 'care', sub: 'perfume', price: 750, img: 'https://images.unsplash.com/photo-1541643600914-78b084681c01?w=400&h=300&fit=crop', seller: 'أريج العود', condition: 'new', rating: 4.8, reviews: 120 },
  { id: 20, name: 'موقد غاز مدمج 5 عيون', cat: 'kitchen', sub: 'appliances', price: 1200, oldPrice: 1450, img: 'https://images.unsplash.com/photo-1548029927-9947a329606f?w=400&h=300&fit=crop', seller: 'بيت غاز', condition: 'new', rating: 4.4, reviews: 21 },
  { id: 21, name: 'ثلاجة سعة 450 لتر - إنفيرتر', cat: 'home', sub: 'appliances', price: 5800, oldPrice: 6500, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'كول سيرفس', condition: 'new', rating: 4.6, reviews: 37 },
  { id: 22, name: 'غسالة الملابس أوتوماتيك 7 كجم', cat: 'home', sub: 'appliances', price: 3400, oldPrice: 3800, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'كلين برو', condition: 'new', rating: 4.5, reviews: 49 },
  { id: 23, name: 'سجادة غزل يدوية - نقش يمني', cat: 'home', sub: 'decor', price: 850, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'فنون تراثية', condition: 'new', rating: 4.8, reviews: 31 },
  { id: 24, name: 'مكينة خياطة - احترافية', cat: 'home', sub: 'appliances', price: 950, oldPrice: 1200, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'عالم الخياطة', condition: 'used', rating: 4.2, reviews: 15 },
  { id: 25, name: 'درون كاميرا 4K احترافية', cat: 'electronics', sub: 'smart_home', price: 2100, oldPrice: 2800, img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&h=300&fit=crop', seller: 'دجيتال لاين', condition: 'new', rating: 4.7, reviews: 22 },
  { id: 26, name: 'مجموعة أواني تقديم حجرية', cat: 'kitchen', sub: 'tableware', price: 320, img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop', seller: 'متحف البيت', condition: 'new', rating: 4.9, reviews: 68 },
  { id: 27, name: 'تمر سكري فاخر - 3 كجم', cat: 'food', sub: 'dates', price: 180, img: 'https://images.unsplash.com/photo-1623945418132-723a1a364184?w=400&h=300&fit=crop', seller: 'تمور اليمن', condition: 'new', rating: 4.9, reviews: 185 },
  { id: 28, name: 'كوفية يمنية - شغل يدوي', cat: 'fashion', sub: 'men', price: 45, img: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&h=300&fit=crop', seller: 'أصالة', condition: 'new', rating: 4.7, reviews: 43 },
  { id: 29, name: 'سرير خشبي مفرد - ممتاز', cat: 'used', sub: 'furniture', price: 1200, oldPrice: 2000, img: 'https://images.unsplash.com/photo-1505691722218-2690333230d2?w=400&h=300&fit=crop', seller: 'مزاد البيت', condition: 'used', rating: 4.0, reviews: 8 },
  { id: 30, name: 'طقم ملاعق فضة - 24 قطعة', cat: 'used', sub: 'kitchen', price: 350, oldPrice: 600, img: 'https://images.unsplash.com/photo-1589729132314-164d398d8afa?w=400&h=300&fit=crop', seller: 'أنتيك البيت', condition: 'used', rating: 4.3, reviews: 12 },
  { id: 31, name: 'لابتوب ديل - مستعمل كالجديد', cat: 'used', sub: 'electronics', price: 1800, oldPrice: 2500, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', seller: 'تكنو باي', condition: 'used', rating: 4.4, reviews: 19 },
  { id: 32, name: 'جرس باب ذكي بكاميرا Wi-Fi', cat: 'electronics', sub: 'smart_home', price: 320, oldPrice: 450, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop', seller: 'سمارت سيكيورتي', condition: 'new', rating: 4.5, reviews: 36 },
  { id: 33, name: 'طقم لحاف شتوي - فرو ناعم', cat: 'home', sub: 'bedding', price: 650, oldPrice: 800, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'عالم النوم', condition: 'new', rating: 4.8, reviews: 75 },
  { id: 34, name: 'سيارة أطفال كهربائية ريموت', cat: 'toys', sub: 'kids_gear', price: 1200, oldPrice: 1500, img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop', seller: 'تويز لاند', condition: 'new', rating: 4.6, reviews: 24 },
  { id: 35, name: 'نظارة شمسية ماركة أصلية', cat: 'fashion', sub: 'accessories', price: 280, oldPrice: 400, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop', seller: 'أوبتكال', condition: 'new', rating: 4.5, reviews: 52 },
  { id: 36, name: 'عجانة كهربائية 1000 وات', cat: 'kitchen', sub: 'appliances', price: 850, oldPrice: 1100, img: 'https://images.unsplash.com/photo-1584622781564-1d9876a1438a?w=400&h=300&fit=crop', seller: 'كيتشن برو', condition: 'new', rating: 4.8, reviews: 41 },
  { id: 37, name: 'تلفزيون سامسونج 40 بوصة - مستعمل', cat: 'used', sub: 'electronics', price: 800, oldPrice: 1500, img: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop', seller: 'بيع واشتري', condition: 'used', rating: 3.9, reviews: 14 },
  { id: 38, name: 'لوحة فنية جدارية - تجريدي', cat: 'home', sub: 'decor', price: 150, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop', seller: 'غاليري', condition: 'new', rating: 4.7, reviews: 28 }
];

// Robust Initialization
(function initProducts() {
  localStorage.removeItem('bayti-products-v1'); // Clean up old keys if any
  const saved = localStorage.getItem('bayti-products');
  if (saved && saved !== 'undefined' && saved !== 'null' && saved.startsWith('[')) {
    try {
      window.productsData = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing productsData:', e);
      window.productsData = defaultProducts;
    }
  } else {
    window.productsData = defaultProducts;
    localStorage.setItem('bayti-products', JSON.stringify(window.productsData));
  }
  if (!Array.isArray(window.productsData) || window.productsData.length === 0) {
    window.productsData = defaultProducts;
  }
})();

function saveProducts() {
  localStorage.setItem('bayti-products', JSON.stringify(window.productsData));
}

// Sidebar
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const m = document.querySelector('.main-content');
  if (s) {
    s.classList.toggle('open');
    s.classList.toggle('closed');
  }
  if (m) {
    m.classList.toggle('full');
  }
  const f = document.querySelector('.footer');
  if (f) {
    f.classList.toggle('full');
  }
}
function toggleSubMenu(e) {
  e.preventDefault();
  const el = e.currentTarget;
  el.classList.toggle('open');
  const sub = el.nextElementSibling;
  if (sub && sub.classList.contains('sub-menu')) sub.classList.toggle('open');
}

// Notifications
function toggleNotifications() { document.getElementById('notifPanel').classList.toggle('open') }
function clearNotifs() { document.querySelector('.notif-list').innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted)">لا توجد إشعارات</p>'; const c = document.getElementById('notifCount'); if (c) c.style.display = 'none' }
document.addEventListener('click', e => { const p = document.getElementById('notifPanel'); if (p && !p.contains(e.target) && !e.target.closest('[onclick*="toggleNotifications"]')) p.classList.remove('open') });

// Hero Slider
let currentSlide = 0;
function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  window.goToSlide = function (n) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  };
  window.nextSlide = function () { goToSlide(currentSlide + 1) };
  window.prevSlide = function () { goToSlide(currentSlide - 1) };
  setInterval(nextSlide, 5000);
}
document.addEventListener('DOMContentLoaded', initSlider);

// Countdown
function updateCountdown() {
  const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59, 999);
  const diff = end - now;
  const h = Math.floor(diff / 36e5), m = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
  const he = document.getElementById('hours'), me = document.getElementById('mins'), se = document.getElementById('secs');
  if (he) he.textContent = String(h).padStart(2, '0');
  if (me) me.textContent = String(m).padStart(2, '0');
  if (se) se.textContent = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000); updateCountdown();

// Cart
let cart = JSON.parse(localStorage.getItem('bayti-cart') || '[]');
function updateCartBadge() { const b = document.getElementById('cartCount'); if (b) { b.textContent = cart.length; b.style.display = cart.length ? 'flex' : 'none' } }
function addToCart(id) {
  const p = window.productsData.find(x => x.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; showToast('تم زيادة الكمية في السلة ✓', 'success') }
  else { cart.push({ id, qty: 1, name: p ? p.name : '', price: p ? p.price : 0, img: p ? p.img : '' }); showToast('تمت الإضافة إلى السلة ✓', 'success') }
  localStorage.setItem('bayti-cart', JSON.stringify(cart));
  updateCartBadge();
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); localStorage.setItem('bayti-cart', JSON.stringify(cart)); updateCartBadge() }
function getCartTotal() { return cart.reduce((s, i) => { const p = window.productsData.find(x => x.id === i.id); return s + (p ? p.price * i.qty : i.price * i.qty) }, 0) }
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Toast
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer'); if (!c) return;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
  const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--info)', warning: 'var(--warning)' };
  const t = document.createElement('div'); t.className = 'toast ' + type;
  t.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon" style="color:${colors[type]}"></i><span class="toast-text">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></span>`;
  c.appendChild(t); setTimeout(() => { if (t.parentElement) t.remove() }, 4000);
}

// Chat
function toggleChat() { document.getElementById('chatBox').classList.toggle('open') }
function sendChatMsg() {
  const inp = document.getElementById('chatInput'); if (!inp || !inp.value.trim()) return;
  const msgs = document.querySelector('.chat-messages');
  const val = inp.value;
  msgs.innerHTML += `<div class="chat-msg sent">${val}</div>`;
  inp.value = ''; msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const responses = ['شكراً لتواصلك! كيف يمكنني مساعدتك؟ 😊', 'سيتم الرد عليك من فريق الدعم قريباً', 'يمكنك تصفح الأقسام للعثور على ما تبحث عنه', 'هل تريد المساعدة في شيء آخر؟'];
    msgs.innerHTML += `<div class="chat-msg received">${responses[Math.floor(Math.random() * responses.length)]}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 1200);
}

// Compare
let compareList = [];
function addToCompare(id, name, img) {
  if (compareList.length >= 4) { showToast('الحد الأقصى 4 منتجات للمقارنة', 'error'); return }
  if (compareList.find(i => i.id === id)) { showToast('المنتج موجود بالفعل', 'info'); return }
  compareList.push({ id, name, img }); renderCompareBar(); showToast('تمت الإضافة للمقارنة', 'success');
}
function renderCompareBar() {
  const bar = document.getElementById('compareBar'), items = document.getElementById('compareItems');
  if (!bar || !items) return;
  if (compareList.length > 0) { bar.classList.add('show'); items.innerHTML = compareList.map(i => `<div class="compare-item"><img src="${i.img}" alt=""><span>${i.name.substring(0, 20)}...</span><span class="remove" onclick="removeCompare(${i.id})"><i class="fas fa-times"></i></span></div>`).join('') }
  else bar.classList.remove('show');
}
function removeCompare(id) { compareList = compareList.filter(i => i.id !== id); renderCompareBar() }
function clearCompare() { compareList = []; renderCompareBar() }
function openCompare() { showToast('صفحة المقارنة التفصيلية قيد التطوير', 'info') }

// Wishlist
let wishlist = JSON.parse(localStorage.getItem('bayti-wishlist') || '[]');
function toggleWishlist(id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) { wishlist.splice(idx, 1); showToast('تمت الإزالة من المفضلة', 'info') }
  else { wishlist.push(id); showToast('تمت الإضافة إلى المفضلة ❤️', 'success') }
  localStorage.setItem('bayti-wishlist', JSON.stringify(wishlist));
  // Update heart icons
  document.querySelectorAll(`[data-wishlist="${id}"]`).forEach(btn => {
    btn.querySelector('i').style.color = wishlist.includes(id) ? 'var(--danger)' : '';
  });
}

// Animate on scroll
document.addEventListener('DOMContentLoaded', () => {
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.style.animationPlayState = 'running'; obs.unobserve(e.target) } }) }, { threshold: 0.1 });
  document.querySelectorAll('.animate-in').forEach(el => { el.style.animationPlayState = 'paused'; obs.observe(el) });
});

// Search
function toggleSearch() { document.querySelector('.search-box').classList.toggle('show') }
function handleSearch(e) {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
  }
}

// URL Params helper
function getParam(name) { return new URLSearchParams(window.location.search).get(name) }

// ===== UTILS =====

// ===== Render product card HTML =====
function renderProductCard(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const isWished = wishlist.includes(p.id);
  return `<div class="product-card animate-in">
    <div class="img-wrap">
      <a href="product-detail.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      <div class="badges">
        ${p.condition === 'used' ? '<span class="badge-tag badge-used">مستعمل</span>' : '<span class="badge-tag badge-new">جديد</span>'}
        ${discount ? '<span class="badge-tag badge-sale">-' + discount + '%</span>' : ''}
        ${p.hot ? '<span class="badge-tag badge-hot">🔥 رائج</span>' : ''}
      </div>
      <div class="actions">
        <button data-wishlist="${p.id}" onclick="toggleWishlist(${p.id})" title="المفضلة"><i class="fas fa-heart" ${isWished ? 'style="color:var(--danger)"' : ''}></i></button>
        <button onclick="addToCompare(${p.id},'${p.name.replace(/'/g, "\\'")}','${p.img}')" title="مقارنة"><i class="fas fa-balance-scale"></i></button>
        <button onclick="window.location.href='product-detail.html?id=${p.id}'" title="عرض سريع"><i class="fas fa-eye"></i></button>
      </div>
    </div>
    <div class="info">
      <div class="seller-info"><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.seller)}&background=2E7D32&color=fff&size=40" alt=""><span>${p.seller}</span></div>
      <h3><a href="product-detail.html?id=${p.id}">${p.name}</a></h3>
      <div class="rating">${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating))}${p.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(p.rating))}<span>(${p.reviews})</span></div>
      <div class="price-row">
        <div><span class="price">${p.price.toLocaleString()} ر.ي</span>${p.oldPrice ? '<span class="old-price">' + p.oldPrice.toLocaleString() + ' ر.ي</span>' : ''}</div>
        <button class="add-cart" onclick="addToCart(${p.id})"><i class="fas fa-plus"></i></button>
      </div>
    </div>
  </div>`;
}
window.renderProductCard = renderProductCard;

// ===== Filter Products =====
function filterProducts(options = {}) {
  let filtered = [...window.productsData];
  if (options.cat) filtered = filtered.filter(p => p.cat === options.cat);
  if (options.sub) filtered = filtered.filter(p => p.sub === options.sub);
  if (options.condition && options.condition !== 'all') filtered = filtered.filter(p => p.condition === options.condition);
  if (options.minPrice !== undefined) filtered = filtered.filter(p => p.price >= options.minPrice);
  if (options.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= options.maxPrice);
  if (options.minRating) filtered = filtered.filter(p => p.rating >= options.minRating);
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(p => p.name.includes(q) || p.seller.includes(q) || (categoryNames[p.cat] || '').includes(q) || (subCategoryNames[p.sub] || '').includes(q));
  }
  if (options.sort) {
    switch (options.sort) {
      case 'cheap': filtered.sort((a, b) => a.price - b.price); break;
      case 'expensive': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'popular': filtered.sort((a, b) => b.reviews - a.reviews); break;
    }
  }
  if (options.filter) {
    switch (options.filter) {
      case 'deals': filtered = filtered.filter(p => p.oldPrice > 0); break;
      case 'trending': filtered.sort((a, b) => b.reviews - a.reviews); break;
      case 'new': filtered.sort((a, b) => b.id - a.id); break;
      case 'featured': filtered = filtered.filter(p => p.hot || p.rating >= 4.5); break;
    }
  }
  return filtered;
}
window.filterProducts = filterProducts;
