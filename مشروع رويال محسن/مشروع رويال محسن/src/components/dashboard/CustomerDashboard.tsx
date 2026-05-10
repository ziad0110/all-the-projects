import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  MapPin,
  CheckCircle,
  Star,
  Plus,
  Minus,
  Trash2,
  Phone,
  Truck
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CustomerDashboardProps {
  activeTab: string;
  onNavigate: (page: string) => void;
}

export function CustomerDashboard({ activeTab, onNavigate }: CustomerDashboardProps) {
  const { products, orders, currentUser, cart, addToCart, removeFromCart, updateCartQuantity, getCartTotal, getNearestAgent, cancelOrder, initOrdersListener } = useAppStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const unsub = initOrdersListener();
    return () => unsub();
  }, [initOrdersListener]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            مرحباً، {currentUser?.name}
          </h2>
          <p className="text-muted-foreground">
            اكتشف منتجاتنا الفاخرة واطلب بكل سهولة
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'طلباتي', value: orders.length, icon: Package, color: 'from-blue-500 to-blue-700' },
          { label: 'قيد التوصيل', value: orders.filter(o => o.status === 'out_for_delivery').length, icon: MapPin, color: 'from-amber-500 to-amber-700' },
          { label: 'تم التوصيل', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'from-green-500 to-green-700' },
          { label: 'نقاطي', value: '250', icon: Star, color: 'from-purple-500 to-purple-700' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">منتجاتنا</h3>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate('home')}
            >
              المتجر العام
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-primary/20 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.nameAr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <Badge
                    className={`absolute top-4 right-4 ${product.type === 'white'
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-red-700 text-white'
                      }`}
                  >
                    {product.type === 'white' ? 'أبيض' : 'أحمر'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-lg font-bold text-foreground mb-1">{product.nameAr}</h4>
                  <p className="text-muted-foreground text-sm mb-3">{product.descriptionAr}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-primary">{product.price} ر.س</p>
                    <Button
                      onClick={() => addToCart(product)}
                      size="sm"
                      className="bg-primary text-black"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      أضف للسلة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">طلباتي</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const nearestAgent = order.status === 'pending' && order.deliveryLocation
                    ? getNearestAgent(order.deliveryLocation.lat, order.deliveryLocation.lng)
                    : null;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 rounded-xl bg-muted/30 border border-primary/10 overflow-hidden"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header: ID and Status */}
                        <div className="flex items-start justify-between">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <Badge className={`${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400' :
                                  order.status === 'confirmed' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-amber-500/20 text-amber-400'
                                }`}>
                                {order.status === 'delivered' ? 'تم التوصيل' :
                                  order.status === 'out_for_delivery' ? 'قيد التوصيل' :
                                    order.status === 'confirmed' ? 'مؤكد' : 'معلق'}
                              </Badge>
                              <p className="text-foreground font-bold">{order.id}</p>
                            </div>
                            <p className="text-muted-foreground/60 text-xs text-right" dir="ltr">
                              {new Date(order.createdAt).toLocaleString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-bold text-primary">{order.totalAmount} ر.س</p>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="py-3 border-t border-b border-primary/10 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground text-right">
                                {item.productName} <span className="text-muted-foreground mr-1">×{item.quantity}</span>
                              </span>
                              <span className="text-muted-foreground">{item.total} ر.س</span>
                            </div>
                          ))}
                        </div>

                        {/* Logistics Section */}
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1 text-right">
                            <p className="text-muted-foreground flex items-center gap-2 justify-end">
                              العنوان
                              <MapPin className="w-3 h-3 text-primary" />
                            </p>
                            <p className="text-foreground">{order.customerAddress}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-muted-foreground flex items-center gap-2 justify-end">
                              التواصل
                              <Phone className="w-3 h-3 text-primary" />
                            </p>
                            <p className="text-foreground">{order.customerPhone}</p>
                          </div>
                        </div>

                        {/* Agent Section */}
                        <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Truck className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">توصيل الطلب</p>
                              <p className="text-sm font-medium text-foreground">
                                {order.assignedAgentName
                                  ? `المندوب: ${order.assignedAgentName}`
                                  : nearestAgent
                                    ? `الأقرب حالياً: ${nearestAgent.name}`
                                    : 'جاري البحث عن مندوب...'}
                              </p>
                            </div>
                          </div>
                          {nearestAgent && !order.assignedAgentId && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              جاري التخصيص
                            </Badge>
                          )}
                        </div>

                        {/* Order Cancellation */}
                        {order.status === 'pending' && (
                          <div className="flex justify-end pt-2 border-t border-primary/5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
                                  cancelOrder(order.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8"
                            >
                              إلغاء الطلب
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">لا توجد طلبات حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-2xl space-y-6">
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">إعدادات الحساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-foreground text-sm">الاسم</label>
            <input
              defaultValue={currentUser?.name}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-primary/30 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-foreground text-sm">البريد الإلكتروني</label>
            <input
              defaultValue={currentUser?.email}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-primary/30 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-foreground text-sm">رقم الهاتف</label>
            <input
              defaultValue={currentUser?.phone}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-primary/30 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-foreground text-sm">العنوان</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-primary/30 text-foreground resize-none"
              placeholder="أدخل عنوانك الكامل..."
            />
          </div>
          <Button className="bg-primary text-black">
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">إعدادات الإشعارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">إشعارات الطلبات</p>
              <p className="text-muted-foreground text-sm">تلقي إشعارات عند تحديث حالة الطلب</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">العروض والخصومات</p>
              <p className="text-muted-foreground text-sm">تلقي إشعارات بالعروض الجديدة</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">البريد الإلكتروني</p>
              <p className="text-muted-foreground text-sm">تلقي تحديثات عبر البريد الإلكتروني</p>
            </div>
            <input type="checkbox" className="w-5 h-5 accent-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Cart Dialog
  const renderCartDialog = () => (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="bg-card border-primary/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            سلة التسوق
          </DialogTitle>
        </DialogHeader>

        {cart.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{item.name}</p>
                    <p className="text-primary">{item.price} ر.س</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-foreground w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/20 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground">الإجمالي</span>
                <span className="text-2xl font-bold text-primary">{getCartTotal()} ر.س</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-primary text-black font-semibold"
              >
                إتمام الطلب
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">السلة فارغة</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  switch (activeTab) {
    case 'overview':
      return (
        <div key="overview">
          {renderOverview()}
          {renderCartDialog()}
        </div>
      );
    case 'orders':
      return renderOrders();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}
