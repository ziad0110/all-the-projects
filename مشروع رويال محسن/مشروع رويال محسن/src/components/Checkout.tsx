import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, User, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';

interface CheckoutProps {
    onNavigate: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
    const { cart, getCartTotal, clearCart, currentUser, createOrder } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        address: '',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setIsSubmitting(true);

        // Create order
        createOrder({
            customerId: currentUser?.id || 'guest',
            customerName: formData.name,
            customerPhone: formData.phone,
            customerAddress: formData.address,
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            })),
            totalAmount: getCartTotal(),
            status: 'pending',
            deliveryLocation: { lat: 15.3694, lng: 44.1910 } // Default to Sana'a center, in real app would use geolocation
        });

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        clearCart();
        setOrderComplete(true);
        setIsSubmitting(false);
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-background pt-20 pb-12">
                <div className="container mx-auto px-4 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-16"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-foreground mb-4">تم إرسال طلبك بنجاح!</h1>
                        <p className="text-muted-foreground mb-8">
                            سيتم التواصل معك قريباً لتأكيد الطلب
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => onNavigate('home')}
                            >
                                العودة للرئيسية
                            </Button>
                            <Button
                                className="bg-primary text-black"
                                onClick={() => onNavigate('dashboard')}
                            >
                                تتبع الطلب
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-20 pb-12">
                <div className="container mx-auto px-4 max-w-lg text-center py-16">
                    <h1 className="text-2xl font-bold text-foreground mb-4">السلة فارغة</h1>
                    <p className="text-muted-foreground mb-8">أضف منتجات إلى السلة أولاً</p>
                    <Button onClick={() => onNavigate('home')} className="bg-primary text-black">
                        تصفح المنتجات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => onNavigate('home')}
                        className="mb-4"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        العودة للتسوق
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">إتمام الطلب</h1>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Info */}
                            <Card className="bg-card border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        معلومات التوصيل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">الاسم الكامل</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="bg-background/50 border-primary/30"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">رقم الهاتف</Label>
                                        <div className="relative">
                                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="bg-background/50 border-primary/30 pr-10"
                                                placeholder="+967 XXX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address">عنوان التوصيل</Label>
                                        <div className="relative">
                                            <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                                className="bg-background/50 border-primary/30 pr-10"
                                                placeholder="المدينة، الحي، الشارع..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            className="bg-background/50 border-primary/30"
                                            placeholder="تعليمات خاصة للتوصيل..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="bg-card border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        طريقة الدفع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3">
                                        <Truck className="w-6 h-6 text-primary" />
                                        <div>
                                            <p className="font-medium text-foreground">الدفع عند الاستلام</p>
                                            <p className="text-sm text-muted-foreground">ادفع نقداً عند استلام طلبك</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold py-6 text-lg"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                        />
                                        جاري إرسال الطلب...
                                    </span>
                                ) : (
                                    `تأكيد الطلب - ${getCartTotal()} ر.س`
                                )}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card className="bg-card border-primary/20 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-foreground">ملخص الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.productId} className="flex gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground text-sm">{item.name}</p>
                                            <p className="text-muted-foreground text-sm">×{item.quantity}</p>
                                        </div>
                                        <p className="text-primary font-bold">{item.price * item.quantity} ر.س</p>
                                    </div>
                                ))}

                                <div className="border-t border-primary/20 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">المجموع الفرعي</span>
                                        <span className="text-foreground">{getCartTotal()} ر.س</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">التوصيل</span>
                                        <span className="text-green-500">مجاني</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2">
                                        <span className="text-foreground">الإجمالي</span>
                                        <span className="text-primary">{getCartTotal()} ر.س</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
