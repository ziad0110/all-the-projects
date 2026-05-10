import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Check, Filter, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import ProductReviews from '@/components/ProductReviews';
import ProductImage from '@/components/ProductImage';

gsap.registerPlugin(ScrollTrigger);

interface Product {
  id: number;
  name: string;
  category: string;
  size?: string;
  description: string;
  features: string[];
  color: string;
  rating: number;
  price: number;
  badge?: string;
  image?: string;
}

const products: Product[] = [
  { id: 1, name: 'حفاضات برنس - مقاس 1', category: 'حفاضات', size: '1', description: 'حفاضات برنس الأكثر شهرة، مثالية للأطفال حديثي الولادة 2-5 كجم مع إمتصاص فائق وجوانب مطاطة.', features: ['إمتصاص فائق', 'جوانب مطاطة', 'ملمس قطني ناعم', 'حماية من التسريب'], color: '#8BD7EF', rating: 4.9, price: 4500, badge: 'الأكثر مبيعاً', image: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'حفاضات برنس - مقاس 3', category: 'حفاضات', size: '3', description: 'حفاضات برنس للأطفال 4-9 كجم، تصميم مريح يضمن حماية تدوم طويلاً.', features: ['إمتصاص فائق', 'جوانب مطاطة', 'حماية من التسريب', 'لطيفة على البشرة'], color: '#E84B8A', rating: 4.9, price: 5500, badge: 'جودة عالمية', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'حفاضات عائلي - مقاس 4', category: 'حفاضات', size: '4', description: 'حفاضات عائلي الاقتصادية، توفر حماية ممتازة وجودة عالية بسعر موفر.', features: ['حماية إقتصادية', 'إمتصاص جيد', 'حماية من التسريب'], color: '#C4E0A3', rating: 4.7, price: 4000, badge: 'توفير', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'حفاضات بلاند - مقاس 5', category: 'حفاضات', size: '5', description: 'حفاضات بلاند بتصميمها المريح وحمايتها التي تدوم طويلاً للأطفال 11-25 كجم.', features: ['تصميم مريح', 'حماية طويلة', 'حواجز مانعة للتسريب'], color: '#E46E6E', rating: 4.8, price: 6000, image: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'مناديل مبللة برنس بيبي', category: 'مناديل', description: 'مناديل مبللة ناعمة وآمنة، خالية من الكحول ومناسبة لبشرة الأطفال الحساسة.', features: ['خالية من الكحول', 'نعومة فائقة', 'ترطيب للبشرة'], color: '#8BD7EF', rating: 4.8, price: 2500, badge: 'جديد', image: 'https://images.unsplash.com/photo-1563212693-0248873752e2?auto=format&fit=crop&q=80&w=800' },
  { id: 6, name: 'كريم برنس للحبيبات', category: 'العناية بالبشرة', description: 'كريم وقائي فعال يحمي بشرة طفلك من التهيج ويحافظ على رطوبتها.', features: ['حماية من التهيج', 'ترطيب عميق', 'آمن يومياً'], color: '#E84B8A', rating: 4.9, price: 3500, image: 'https://images.unsplash.com/photo-1614859324967-bdf471bba561?auto=format&fit=crop&q=80&w=800' },
  { id: 7, name: 'حفاضات برنس - مقاس 2', category: 'حفاضات', size: '2', description: 'حفاضات برنس للأطفال 3-6 كجم، إمتصاص فائق ونعومة لا تضاهى.', features: ['إمتصاص فائق', 'محيط خصر مرن', 'حماية من التسريب'], color: '#C4E0A3', rating: 4.8, price: 5000, image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800' },
  { id: 8, name: 'حفاضات برنس - مقاس 6', category: 'حفاضات', size: '6', description: 'حفاضات برنس مقاس كبير 16+ كجم، توفر أقصى درجات الراحة والحماية.', features: ['حماية قصوى', 'جوانب مرنة جداً', 'إمتصاص كثيف'], color: '#8BD7EF', rating: 4.8, price: 7000, image: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?auto=format&fit=crop&q=80&w=800' },
];

const categories = ['الكل', 'حفاضات', 'مناديل', 'العناية بالبشرة'];
const sizes = ['الكل', '1', '2', '3', '4', '5', '6'];

export default function Products() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedSize, setSelectedSize] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, color: product.color });
    toast.success(`تم إضافة ${product.name} إلى السلة`);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSize = selectedSize === 'الكل' || p.size === selectedSize;
    return matchesCategory && matchesSize;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.product-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredProducts]);

  return (
    <section ref={sectionRef} id="products" className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #8BD7EF 1px, transparent 0)`, backgroundSize: '50px 50px' }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#E84B8A]/10 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-[#E84B8A]">منتجاتنا</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            اكتشف تشكيلتنا <span className="text-[#E84B8A]">الواسعة</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">منتجات عالية الجودة مصممة خصيصاً لراحة طفلك وحماية بشرته</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full font-medium hover:bg-gray-200 transition-colors">
            <Filter className="w-5 h-5" />
            {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          </button>

          {showFilters && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-gray-600 py-3">الفئة:</span>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-full font-medium transition-all ${selectedCategory === cat ? 'bg-[#E84B8A] text-black shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 hover:bg-gray-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-gray-600 py-3">المقاس:</span>
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-6 py-3 rounded-full font-medium transition-all ${selectedSize === size ? 'bg-[#8BD7EF] text-black shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 hover:bg-gray-200'}`}>
                    {size === 'الكل' ? 'الكل' : `مقاس ${size}`}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500">
                {filteredProducts.length} منتج متوفر
              </p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand Visual Filler Card */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#E84B8A] to-[#e5a338] rounded-3xl p-8 text-center text-black shadow-lg transform hover:scale-105 transition-all duration-500">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>جودة قطنية</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              نضمن لك أفضل حماية وراحة لبشرة طفلك الحساسة طوال اليوم.
            </p>
          </div>
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-3 group">
              <div className="relative h-36 sm:h-44 flex items-center justify-center" style={{ backgroundColor: `${product.color}15` }}>
                {product.badge && <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#E84B8A] text-black text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">{product.badge}</div>}
                {product.size && <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/80 backdrop-blur-sm text-gray-800 text-[10px] sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">مقاس {product.size}</div>}

                <ProductImage
                  category={product.category}
                  color={product.color}
                  size={product.size}
                  image={product.image}
                  className="w-full h-full p-2"
                />
              </div>

              <div className="p-3 sm:p-5 text-right">
                <div className="flex items-center gap-1 mb-1 sm:mb-2 justify-end">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#E84B8A] text-[#E84B8A]" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{product.rating}</span>
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 line-clamp-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                <span className="text-base sm:text-xl font-black text-[#E84B8A] block mb-2 sm:mb-3">{product.price} ر.ي</span>

                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                  <Button onClick={() => setSelectedProduct(product)} variant="outline" className="flex-1 rounded-full py-1.5 sm:py-2 text-xs sm:text-sm h-auto">التفاصيل</Button>
                  <Button onClick={() => handleAddToCart(product)} className="flex-1 bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold rounded-full py-1.5 sm:py-2 text-xs sm:text-sm h-auto"><ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> أضف</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-lg text-right max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="mt-4">
              <div className="w-full h-48 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${selectedProduct.color}10` }}>
                <ProductImage category={selectedProduct.category} color={selectedProduct.color} size={selectedProduct.size} className="w-40 h-40 drop-shadow-xl" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? 'fill-[#E84B8A] text-[#E84B8A]' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-3xl font-black text-[#E84B8A]">{selectedProduct.price.toFixed(2)} ر.س</span>
              </div>
              <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">المميزات:</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feature, idx) => <li key={idx} className="flex items-center gap-2 text-gray-600"><Check className="w-5 h-5 text-[#C4E0A3]" />{feature}</li>)}
                </ul>
              </div>
              <ProductReviews productId={selectedProduct.id} productName={selectedProduct.name} />
              <Button className="w-full bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold rounded-full py-4 mt-4" onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}>
                <ShoppingCart className="w-5 h-5 ml-2" /> أضف للسلة - {selectedProduct.price.toFixed(2)} ر.س
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
