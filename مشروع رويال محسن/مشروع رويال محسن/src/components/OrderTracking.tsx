import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Clock,
    Package,
    Truck,
    CheckCircle,
    Crown,
    Phone,
    Navigation
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Order, OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const agentIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const deliveryIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

export function OrderTracking() {
    const { orders, agents } = useAppStore();
    const [orderId, setOrderId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanOrderId = orderId.trim().startsWith('#') ? orderId.trim().substring(1) : orderId.trim();
        const order = orders.find(o => o.id.toLowerCase() === cleanOrderId.toLowerCase());

        if (order) {
            setSearchedOrder(order);
        } else {
            setSearchedOrder(null);
            setError('عذراً، لم يتم العثور على هذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.');
        }
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 1;
            case 'confirmed': return 2;
            case 'preparing': return 3;
            case 'out_for_delivery': return 4;
            case 'delivered': return 5;
            default: return 1;
        }
    };

    const statusSteps = [
        { id: 'pending', label: 'تم الاستلام', icon: Clock },
        { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
        { id: 'preparing', label: 'قيد التجهيز', icon: Package },
        { id: 'out_for_delivery', label: 'خرج للتوصيل', icon: Truck },
        { id: 'delivered', label: 'تم التوصيل', icon: Crown },
    ];

    const assignedAgent = searchedOrder?.assignedAgentId
        ? agents.find(a => a.id === searchedOrder.assignedAgentId)
        : null;

    return (
        <section className="relative py-24 w-full overflow-hidden min-h-screen flex flex-col items-center">
            <div className="absolute inset-0 bg-royal-gradient opacity-50" />

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8"
                    >
                        <Navigation className="w-6 h-6 text-amber-500" />
                        <span className="text-amber-400 text-base font-medium">تتبع مسار فخامتك في صنعاء</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-bold text-gold-gradient font-['Playfair_Display'] mb-6 tracking-tight">
                        تتبع طلبك
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed opacity-80">
                        أدخل رقم الطلب الخاص بك لمتابعة حالة التوصيل مباشرة وخطوات وصول المنتج إليك بأمان
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="max-w-2xl mx-auto mb-16 bg-card/60 backdrop-blur-2xl border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 md:p-10">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-6">
                            <div className="relative flex-1">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
                                <Input
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="أدخل رقم الطلب (مثلاً: order1)"
                                    className="pr-12 py-7 bg-background/50 border-primary/30 text-lg rounded-2xl"
                                    required
                                />
                            </div>
                            <Button type="submit" className="btn-royal py-7 px-10 text-lg rounded-2xl">
                                بحث الآن
                            </Button>
                        </form>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-base mt-6 text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                    </CardContent>
                </Card>

                <AnimatePresence mode="wait">
                    {searchedOrder && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-12"
                        >
                            {/* Status Timeline */}
                            <div className="grid grid-cols-5 gap-4 relative py-8 px-4 bg-amber-500/[0.03] rounded-[3rem] border border-amber-500/10">
                                <div className="absolute top-1/2 left-10 right-10 h-1 bg-primary/10 -translate-y-[2rem] z-0 hidden md:block" />
                                {statusSteps.map((step, index) => {
                                    const currentStep = getStatusStep(searchedOrder.status);
                                    const isActive = index + 1 <= currentStep;
                                    const IconComp = step.icon;

                                    return (
                                        <div key={step.id} className="relative z-10 text-center">
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    scale: isActive ? 1.1 : 1,
                                                    backgroundColor: isActive ? 'rgb(245, 158, 11)' : 'transparent'
                                                }}
                                                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${isActive
                                                    ? 'border-amber-500 text-black shadow-amber-500/20'
                                                    : 'bg-card border-primary/20 text-muted-foreground'
                                                    }`}
                                            >
                                                <IconComp className="w-8 h-8" />
                                            </motion.div>
                                            <p className={`mt-4 text-sm font-bold md:text-base tracking-wide ${isActive ? 'text-amber-500' : 'text-muted-foreground opacity-60'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-12">
                                {/* Order Details */}
                                <Card className="lg:col-span-1 bg-card/50 border-primary/20 backdrop-blur-xl rounded-[2.5rem] shadow-xl overflow-hidden self-start">
                                    <div className="bg-amber-500/10 p-6 border-b border-amber-500/20">
                                        <h3 className="text-xl font-bold text-amber-500 font-['Playfair_Display']">تفاصيل الطلب الملكي</h3>
                                    </div>
                                    <CardContent className="p-8 space-y-8">
                                        <div>
                                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">رقم الفاتورة</h4>
                                            <p className="text-2xl font-black text-foreground">#{searchedOrder.id}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">قائمة المشتريات</h4>
                                            <div className="space-y-4">
                                                {searchedOrder.items.map((item: OrderItem) => (
                                                    <div key={item.productId} className="flex justify-between items-center text-base p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                        <span className="text-foreground font-medium">{item.productName} × {item.quantity}</span>
                                                        <span className="text-amber-500 font-black">{item.total} ر.س</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t-2 border-dashed border-primary/20">
                                            <div className="flex justify-between items-center bg-royal-gradient p-5 rounded-2xl shadow-inner">
                                                <span className="text-lg font-bold text-white/90">الإجمالي</span>
                                                <span className="text-2xl font-black text-amber-400">{searchedOrder.totalAmount} ر.س</span>
                                            </div>
                                        </div>

                                        {assignedAgent && (
                                            <div className="pt-8 border-t border-primary/10">
                                                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">سفير التوصيل</h4>
                                                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 group hover:border-amber-500/30 transition-colors">
                                                    <img
                                                        src={assignedAgent.avatar}
                                                        alt={assignedAgent.name}
                                                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30 shadow-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-lg font-black text-foreground">{assignedAgent.name}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 opacity-80">
                                                            <MapPin className="w-3 h-3" />
                                                            صنعاء - اليمن
                                                        </p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                                        <Phone className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Map */}
                                <Card className="lg:col-span-2 bg-card/60 border-primary/20 overflow-hidden min-h-[500px] lg:h-full rounded-[3rem] shadow-2xl relative group">
                                    <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                        <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 shadow-lg flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-sm font-bold">تتبع مباشر في صنعاء</span>
                                        </div>
                                    </div>

                                    {searchedOrder.deliveryLocation ? (
                                        <div className="h-full w-full">
                                            <MapContainer
                                                center={[searchedOrder.deliveryLocation.lat, searchedOrder.deliveryLocation.lng]}
                                                zoom={14}
                                                style={{ height: '100%', width: '100%' }}
                                                className="z-10"
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                />

                                                {/* Destination */}
                                                <Marker
                                                    position={[searchedOrder.deliveryLocation.lat, searchedOrder.deliveryLocation.lng]}
                                                    icon={deliveryIcon}
                                                >
                                                    <Popup className="royal-popup">موقع التوصيل: {searchedOrder.customerAddress}</Popup>
                                                </Marker>

                                                {/* Agent Location */}
                                                {assignedAgent?.currentLocation && (
                                                    <Marker
                                                        position={[assignedAgent.currentLocation.lat, assignedAgent.currentLocation.lng]}
                                                        icon={agentIcon}
                                                    >
                                                        <Popup className="royal-popup">المندوب: {assignedAgent.name}</Popup>
                                                    </Marker>
                                                )}
                                            </MapContainer>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-primary/20">
                                                <MapPin className="w-12 h-12 opacity-30 animate-bounce" />
                                            </div>
                                            <h4 className="text-xl font-bold text-foreground mb-2">تحديد المسار...</h4>
                                            <p className="max-w-xs opacity-60">جاري الاتصال بالأقمار الصناعية لتحديد الموقع الدقيق لطلبك</p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
