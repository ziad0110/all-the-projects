import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, Crown, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/types';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export function Products({ onNavigate }: ProductsProps) {
  const { products, isAuthenticated, addToCart } = useAppStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'white' | 'red'>('all');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.type === activeTab);

  const handleOrder = (product: Product) => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    addToCart(product, 1);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };


  return (
    <section className="relative py-24 w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-royal-gradient opacity-50" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
          >
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-amber-400 text-sm font-medium">منتجاتنا المميزة</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gold-gradient font-['Playfair_Display']">
              منتجات رويال
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اكتشف تشكيلتنا الفاخرة من السجائر المصممة بأعلى معايير الجودة
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mb-12"
        >
          {[
            { id: 'all', label: 'الكل', labelEn: 'All' },
            { id: 'white', label: 'الأبيض', labelEn: 'White' },
            { id: 'red', label: 'الأحمر', labelEn: 'Red' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                ? 'text-black'
                : 'text-gray-400 hover:text-amber-400'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group"
              >
                <div className="card-royal p-6 h-full backdrop-blur-sm">
                  {/* Product Image */}
                  <div className="relative mb-6 overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark subtle overlay instead of white/transparent */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Type Badge */}
                    <Badge
                      className={`absolute top-4 right-4 shadow-lg ${product.type === 'white'
                        ? 'bg-slate-100 text-slate-900 hover:bg-white'
                        : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                      {product.type === 'white' ? 'الملكي الأبيض' : 'الملكي الأحمر'}
                    </Badge>

                    {/* Price Tag */}
                    <div className="absolute bottom-4 left-4">
                      <div className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-amber-500/30">
                        <span className="text-2xl font-bold text-amber-400">{product.price}</span>
                        <span className="text-amber-400/70 text-sm mr-1">ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{product.nameAr}</h3>
                      <p className="text-primary/70">{product.name}</p>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed">{product.descriptionAr}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock > 0 ? 'متوفر في المخزون' : 'نفذت الكمية'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleOrder(product)}
                        className={`flex-1 font-semibold hover:shadow-lg transition-all ${addedToCart === product.id
                          ? 'bg-green-500 text-white hover:shadow-green-500/30'
                          : 'bg-gradient-to-r from-amber-600 to-amber-500 text-black hover:shadow-amber-500/30'
                          }`}
                        disabled={product.stock === 0}
                      >
                        {addedToCart === product.id ? (
                          <>
                            <Check className="w-4 h-4 ml-2" />
                            تمت الإضافة
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 ml-2" />
                            أضف للسلة
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      >
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>عرض جميع المنتجات</span>
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-card border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gold-gradient">
              {selectedProduct?.nameAr}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">الوصف</h4>
                  <p className="text-muted-foreground text-sm">{selectedProduct.descriptionAr}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">المميزات</h4>
                  <ul className="space-y-2">
                    {selectedProduct.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">السعر</span>
                    <span className="text-2xl font-bold text-primary">
                      {selectedProduct.price} ر.س
                    </span>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedProduct(null);
                      if (!isAuthenticated) {
                        onNavigate('login');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    اطلب الآن
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
