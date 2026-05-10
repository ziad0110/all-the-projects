import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  Navigation,
  Phone,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliveryDashboardProps {
  activeTab: string;
}

// Distinctive self-marker for the current agent
const createSelfIcon = (avatarUrl?: string) => divIcon({
  html: `
    <div class="relative w-14 h-14 flex items-center justify-center">
      <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-50"></div>
      <div class="absolute inset-1 bg-primary/30 rounded-full animate-pulse"></div>
      <img src="${avatarUrl || 'https://via.placeholder.com/56'}" 
           class="relative w-10 h-10 rounded-full border-4 border-primary object-cover shadow-xl z-10"
           onerror="this.src='https://via.placeholder.com/56'" />
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold shadow z-20">أنا</div>
    </div>
  `,
  className: 'custom-self-marker',
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

export function DeliveryDashboard({ activeTab }: DeliveryDashboardProps) {
  const { currentUser, orders, updateAgentLocation, initOrdersListener } = useAppStore();
  const [isOnline, setIsOnline] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 15.3694, lng: 44.1910 });

  const activeOrders = orders.filter(o =>
    o.status === 'out_for_delivery' && o.assignedAgentId === currentUser?.id
  );

  useEffect(() => {
    const unsub = initOrdersListener();
    return () => unsub();
  }, [initOrdersListener]);

  // Simulate GPS tracking
  useEffect(() => {
    if (!locationEnabled) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        if (currentUser) {
          updateAgentLocation(currentUser.id, newLocation.lat, newLocation.lng);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationEnabled, currentUser, updateAgentLocation]);

  // Simulate location updates for demo
  useEffect(() => {
    if (!locationEnabled) return;

    const interval = setInterval(() => {
      const newLat = currentLocation.lat + (Math.random() - 0.5) * 0.001;
      const newLng = currentLocation.lng + (Math.random() - 0.5) * 0.001;
      setCurrentLocation({ lat: newLat, lng: newLng });
      if (currentUser) {
        updateAgentLocation(currentUser.id, newLat, newLng);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [locationEnabled, currentLocation, currentUser, updateAgentLocation]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="bg-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">حالتك</h3>
              <p className="text-muted-foreground">تحكم في توفرك لاستقبال الطلبات</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className={`font-bold ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isOnline ? 'متاح' : 'غير متاح'}
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'التوصيلات اليوم', value: '12', icon: Package, color: 'from-blue-500 to-blue-700' },
          { label: 'الأرباح', value: '350 ر.س', icon: DollarSign, color: 'from-green-500 to-green-700' },
          { label: 'التقييم', value: '4.8', icon: Star, color: 'from-amber-500 to-amber-700' },
          { label: 'الوقت', value: '6 ساعات', icon: Clock, color: 'from-purple-500 to-purple-700' },
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

      {/* Active Orders */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            الطلبات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length > 0 ? (
            <div className="space-y-3">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/30 border border-primary/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-foreground font-bold">{order.id}</p>
                        <Badge className="bg-blue-500/20 text-blue-400">قيد التوصيل</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-1">{order.customerName}</p>
                      <p className="text-muted-foreground/60 text-sm">{order.customerAddress}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-primary font-bold">{order.totalAmount} ر.س</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تم التوصيل
                    </Button>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary">
                      <Phone className="w-4 h-4 ml-2" />
                      اتصال
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد طلبات نشطة حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.filter(o => o.assignedAgentId === currentUser?.id).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 border border-primary/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{order.id}</p>
                    <p className="text-muted-foreground text-sm">{order.customerName}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-primary">{order.totalAmount} ر.س</p>
                    <Badge className={`${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                      {order.status === 'delivered' ? 'تم التوصيل' :
                        order.status === 'out_for_delivery' ? 'قيد التوصيل' : 'معلق'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      {/* Location Status */}
      <Card className="bg-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${locationEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                <MapPin className={`w-6 h-6 ${locationEnabled ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">تتبع الموقع</h3>
                <p className={`text-sm ${locationEnabled ? 'text-green-500' : 'text-destructive'}`}>
                  {locationEnabled ? 'الموقع مفعل - يتم المشاركة مع المدير' : 'الموقع معطل'}
                </p>
              </div>
            </div>
            <Switch
              checked={locationEnabled}
              onCheckedChange={setLocationEnabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {!locationEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 text-sm">
                يجب تفعيل الموقع للعمل كمندوب توصيل
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="bg-card border-primary/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            موقعك الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-xl overflow-hidden">
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={15}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={createSelfIcon(currentUser?.avatar)}
              >
                <Popup>
                  <div className="text-right">
                    <p className="font-bold">موقعك الحالي</p>
                    <p className="text-sm text-muted-foreground">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={500}
                pathOptions={{
                  color: '#f59e0b',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.1,
                }}
              />
            </MapContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground text-sm">خط العرض</p>
              <p className="text-foreground font-mono">{currentLocation.lat.toFixed(6)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground text-sm">خط الطول</p>
              <p className="text-foreground font-mono">{currentLocation.lng.toFixed(6)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
          <Button className="bg-primary text-black">
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">إعدادات التطبيق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">التنبيهات الصوتية</p>
              <p className="text-muted-foreground text-sm">تشغيل صوت عند وصول طلب جديد</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">التنبيهات المنبثقة</p>
              <p className="text-muted-foreground text-sm">عرض إشعارات على الشاشة</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-foreground">الوضع الليلي</p>
              <p className="text-muted-foreground text-sm">تفعيل الوضع الليلي تلقائياً</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'orders':
      return renderOrders();
    case 'location':
      return renderLocation();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}
