import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MousePointer2
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents, CircleMarker, Polyline } from 'react-leaflet';
import L, { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryAgent, GeoZone } from '@/types';


interface ManagerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Custom marker icon with avatar
const createAgentIcon = (avatarUrl: string | undefined, status: string) => divIcon({
  html: `
    <div class="relative w-10 h-10 group">
      <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping group-hover:block hidden"></div>
      <img src="${avatarUrl || 'https://via.placeholder.com/40'}" 
           class="w-10 h-10 rounded-full border-2 ${status === 'online' ? 'border-green-500' : status === 'busy' ? 'border-amber-500' : 'border-gray-500'} 
           object-cover shadow-lg hover:scale-110 transition-transform duration-300" 
           onerror="this.src='https://via.placeholder.com/40'" />
      <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'}"></div>
    </div>
  `,
  className: 'custom-agent-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Map Control Component
function MapControls({ agents }: { agents: DeliveryAgent[] }) {
  const map = useMap();

  return (
    <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="bg-background/90 backdrop-blur-md border border-primary/20 shadow-xl hover:bg-primary hover:text-black transition-all font-bold"
        onClick={() => {
          if (agents.length > 0) {
            const bounds = L.latLngBounds(agents.map(a => [a.currentLocation!.lat, a.currentLocation!.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            map.setView([15.3694, 44.1910], 13);
          }
        }}
      >
        الرجوع للمناديب
      </Button>
      <div className="flex gap-2">
        {agents.map(agent => (
          <Button
            key={agent.id}
            variant="secondary"
            size="icon"
            className="w-10 h-10 bg-background/90 backdrop-blur-md border border-primary/20 shadow-xl hover:border-primary transition-all overflow-hidden rounded-full p-0"
            onClick={() => {
              if (agent.currentLocation) {
                map.flyTo([agent.currentLocation.lat, agent.currentLocation.lng], 16);
              }
            }}
            title={agent.name}
          >
            <img src={agent.avatar || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" />
          </Button>
        ))}
      </div>
    </div>
  );
}

// Map Events Component for drawing
const MapEvents = ({ isDrawing, onPointAdded }: { isDrawing: boolean; onPointAdded: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onPointAdded(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export function ManagerDashboard({ activeTab, setActiveTab }: ManagerDashboardProps) {
  const {
    stats,
    agents,
    zones,
    orders,
    updateAgentLocation,
    updateAgent,
    deleteAgent,
    approveAgent,
    rejectAgent,
    currentUser,
    initAgentsListener,
    initOrdersListener,
    initZonesListener
  } = useAppStore();

  useEffect(() => {
    const unsubAgents = initAgentsListener();
    const unsubOrders = initOrdersListener();
    const unsubZones = initZonesListener();
    return () => {
      unsubAgents();
      unsubOrders();
      unsubZones();
    };
  }, [initAgentsListener, initOrdersListener, initZonesListener]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneForm, setNewZoneForm] = useState<{
    name: string;
    color: string;
    agentId: string;
    agentName: string;
    coordinates?: [number, number][];
  }>({
    name: '',
    color: '#fbbf24',
    agentId: '',
    agentName: ''
  });
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', avatar: '' });
  const [editingZone, setEditingZone] = useState<GeoZone | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  const pendingAgents = agents.filter(agent => agent.isApproved === false);
  const approvedAgents = agents.filter(agent => agent.isApproved !== false);

  const filteredAgents = approvedAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.phone.includes(searchQuery)
  );

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.includes(searchQuery)
  );

  // Listen to real-time location updates from Firestore
  useEffect(() => {
    const initFirestoreListener = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const unsubscribe = onSnapshot(collection(db, 'agent_locations'), (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              const agentId = change.doc.id;

              // Only update if it's not the current user (if current user is manager they don't move themselves, 
              // but if they were an agent they'd already have local state updated)
              if (agentId !== currentUser?.id) {
                updateAgentLocation(agentId, data.lat, data.lng);
              }
            }
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing Firestore listener:', error);
      }
    };

    let unsubscribe: () => void;
    initFirestoreListener().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [updateAgentLocation, currentUser?.id]);

  // Simulate local movement for approved agents (optional/demo)
  useEffect(() => {
    const interval = setInterval(() => {
      approvedAgents.forEach(agent => {
        // Only simulate for the current user if they are an agent to push to Firestore
        // AND ensure they ARE a delivery agent (managers shouldn't move on map)
        if (currentUser?.id === agent.id && currentUser.role === 'delivery' && agent.isLocationEnabled && agent.currentLocation) {
          const newLat = agent.currentLocation.lat + (Math.random() - 0.5) * 0.0005;
          const newLng = agent.currentLocation.lng + (Math.random() - 0.5) * 0.0005;
          updateAgentLocation(agent.id, newLat, newLng);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [approvedAgents, updateAgentLocation, currentUser?.id, currentUser?.role]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: Package, color: 'from-blue-500 to-blue-700' },
          { label: 'الإيرادات', value: `${stats.totalRevenue.toLocaleString()} ر.س`, icon: DollarSign, color: 'from-green-500 to-green-700' },
          { label: 'المناديب النشطين', value: stats.activeAgents, icon: Users, color: 'from-amber-500 to-amber-700' },
          { label: 'العملاء', value: stats.totalCustomers, icon: TrendingUp, color: 'from-purple-500 to-purple-700' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-card border-primary/20 shadow-lg dark:shadow-none hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">آخر الطلبات</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary"
              onClick={() => setActiveTab('orders')}
            >
              عرض الكل
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30"
                >
                  <div>
                    <p className="text-white font-medium">{order.customerName}</p>
                    <p className="text-gray-400 text-sm">{order.id}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-primary font-medium">{order.totalAmount} ر.س</p>
                    <Badge className={`${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                      {order.status === 'delivered' ? 'تم التوصيل' :
                        order.status === 'pending' ? 'معلق' :
                          order.status === 'out_for_delivery' ? 'قيد التوصيل' : 'مؤكد'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card className="bg-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">حالة المناديب</CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-500 text-sm">{agents.filter(a => a.status === 'online').length} نشط</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={agent.avatar || 'https://via.placeholder.com/40'}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${agent.status === 'online' ? 'bg-green-500' :
                        agent.status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                        }`} />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{agent.name}</p>
                      <p className="text-muted-foreground text-sm">{agent.deliveriesCompleted} توصيلة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${agent.isLocationEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {agent.isLocationEnabled ? 'الموقع مفعل' : 'الموقع معطل'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      {/* Pending Approvals Section */}
      {pendingAgents.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30 overflow-hidden">
          <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
            <CardTitle className="text-amber-500 text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              طلبات انضمام معلقة ({pendingAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {pendingAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar || 'https://via.placeholder.com/40'}
                      alt={agent.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                    />
                    <div>
                      <h4 className="font-bold text-foreground">{agent.name}</h4>
                      <p className="text-muted-foreground text-sm">{agent.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => approveAgent(agent.id)}
                    >
                      قبول
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                      onClick={() => rejectAgent(agent.id)}
                    >
                      رفض
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن مندوب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-muted/50 border-primary/30 text-foreground"
          />
        </div>
        <Button variant="outline" className="border-primary/30 text-primary">
          <Filter className="w-4 h-4 ml-2" />
          تصفية
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={agent.avatar || 'https://via.placeholder.com/60'}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${agent.status === 'online' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                      }`} />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEditingAgent(agent);
                        setEditForm({ name: agent.name, phone: agent.phone, avatar: agent.avatar || '' });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المندوب ${agent.name}؟`)) {
                          deleteAgent(agent.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1">{agent.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{agent.phone}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-primary">{agent.deliveriesCompleted}</p>
                    <p className="text-xs text-muted-foreground">توصيلة</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-primary">{agent.rating}</p>
                    <p className="text-xs text-muted-foreground">تقييم</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={`${agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
                    agent.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                    {agent.status === 'online' ? 'متاح' :
                      agent.status === 'busy' ? 'مشغول' : 'غير متصل'}
                  </Badge>
                  <span className={`text-xs ${agent.isLocationEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {agent.isLocationEnabled ? 'الموقع مفعل' : 'الموقع معطل'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Agent Modal */}
      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent className="bg-card border-primary/20 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-3">
              {editingAgent?.avatar && (
                <img src={editingAgent.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
              )}
              تعديل بيانات المندوب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editName" className="text-foreground">الاسم</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-background/50 border-primary/30 text-foreground mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editPhone" className="text-foreground">رقم الهاتف</Label>
              <Input
                id="editPhone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-background/50 border-primary/30 text-foreground mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editAvatar" className="text-foreground">رابط الصورة الشخصية</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="editAvatar"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="bg-background/50 border-primary/30 text-foreground mt-1 flex-1"
                  placeholder="https://..."
                />
                {editForm.avatar && (
                  <img src={editForm.avatar} className="w-10 h-10 rounded-full object-cover border border-primary" onError={(e) => e.currentTarget.style.display = 'none'} />
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="border-muted-foreground/30">إلغاء</Button>
            </DialogClose>
            <Button
              className="bg-primary text-black font-bold"
              onClick={() => {
                if (editingAgent) {
                  updateAgent(editingAgent.id, { name: editForm.name, phone: editForm.phone, avatar: editForm.avatar || undefined });
                  setEditingAgent(null);
                }
              }}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderZones = () => (
    <div className="space-y-6">
      {/* Map */}
      <Card className="bg-card border-primary/20 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">خريطة المناطق والمناديب</CardTitle>
          <Button
            onClick={() => setIsAddingZone(true)}
            className="bg-primary text-black hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة منطقة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-xl overflow-hidden relative">
            {isDrawingMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-primary text-black px-6 py-3 rounded-full font-bold shadow-2xl animate-pulse flex items-center gap-3 border-2 border-black/10">
                <MousePointer2 className="w-5 h-5" />
                <span className="text-lg">
                  {drawingPoints.length === 0 ? 'اضغط لتحديد النقطة الأولى' :
                    drawingPoints.length === 1 ? 'اضغط لتحديد النقطة الثانية' :
                      drawingPoints.length === 2 ? 'اضغط لتحديد النقطة الثالثة' :
                        'اضغط لتحديد النقطة الرابعة والأخيرة'}
                </span>
                <Badge variant="outline" className="bg-black text-white border-none ml-2">
                  {drawingPoints.length} / 4
                </Badge>
              </div>
            )}
            <MapContainer
              center={[15.3694, 44.1910]}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Drawing Helper */}
              <MapEvents
                isDrawing={isDrawingMode}
                onPointAdded={(lat: number, lng: number) => {
                  setDrawingPoints(prev => {
                    const next = [...prev, [lat, lng] as [number, number]];
                    if (next.length === 4) {
                      setNewZoneForm(f => ({ ...f, coordinates: next }));
                      setIsDrawingMode(false);
                      setIsAddingZone(true); // Re-open modal
                      return [];
                    }
                    return next;
                  });
                }}
              />

              {/* Render temporary drawing points and lines */}
              {drawingPoints.length > 0 && drawingPoints.map((point, idx) => (
                <CircleMarker
                  key={`draw-${idx}`}
                  center={point}
                  radius={6}
                  pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 1, weight: 2 }}
                />
              ))}

              {drawingPoints.length >= 2 && (
                <Polyline
                  positions={drawingPoints}
                  pathOptions={{ color: '#fbbf24', dashArray: '5, 10', weight: 2 }}
                />
              )}

              {drawingPoints.length === 4 && (
                <Polygon
                  positions={drawingPoints}
                  pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.2, weight: 2 }}
                />
              )}

              {/* Render preview of the zone being added/edited */}
              {newZoneForm.coordinates && newZoneForm.coordinates.length > 0 && !isDrawingMode && (
                <Polygon
                  positions={newZoneForm.coordinates}
                  pathOptions={{
                    color: newZoneForm.color || '#fbbf24',
                    fillColor: newZoneForm.color || '#fbbf24',
                    fillOpacity: 0.4,
                    weight: 3,
                    dashArray: '5, 5'
                  }}
                >
                  <Popup>
                    <div className="text-right">
                      <p className="font-bold">معاينة: {newZoneForm.name || 'منطقة جديدة'}</p>
                      <p className="text-sm text-primary">تم التحديد - اضغط "إضافة" للحفظ</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {/* Render Zones */}
              {zones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates as [number, number][]}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-right">
                      <p className="font-bold">{zone.name}</p>
                      <p className="text-sm">المندوب: {zone.agentName || 'غير محدد'}</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}

              {/* Render Agents */}
              {agents.map((agent) => (
                agent.currentLocation && (agent.id !== currentUser?.id || currentUser?.role !== 'manager') && (
                  <Marker
                    key={agent.id}
                    position={[agent.currentLocation.lat, agent.currentLocation.lng]}
                    icon={createAgentIcon(agent.avatar, agent.status)}
                  >
                    <Popup>
                      <div className="text-right p-2 min-w-[150px]">
                        <div className="flex items-center gap-3 mb-3 border-b border-primary/10 pb-2">
                          <img src={agent.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-base">{agent.name}</p>
                            <Badge className={`${agent.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} text-[10px]`}>
                              {agent.status === 'online' ? 'متصل' : 'مشغول'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm flex items-center gap-2 mb-1"><TrendingUp className="w-3 h-3 text-primary" /> {agent.deliveriesCompleted} توصيلة</p>
                        <p className="text-sm text-muted-foreground">{agent.phone}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
              <MapControls
                agents={agents.filter(a => a.currentLocation)}
              />
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Zones List */}
      <div className="grid md:grid-cols-2 gap-4">
        {zones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div>
                      <p className="text-foreground font-medium">{zone.name}</p>
                      <p className="text-muted-foreground text-sm">
                        المندوب: {zone.agentName || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-amber-400 hover:bg-amber-500/10"
                      onClick={() => {
                        setEditingZone(zone);
                        setNewZoneForm({
                          name: zone.name,
                          color: zone.color,
                          agentId: zone.agentId || '',
                          agentName: zone.agentName || ''
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف منطقة ${zone.name}؟`)) {
                          const { deleteZone } = useAppStore.getState();
                          deleteZone(zone.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Zone Modal */}
      <Dialog open={(isAddingZone || !!editingZone) && !isDrawingMode} onOpenChange={(open) => {
        if (!open) {
          setIsAddingZone(false);
          setEditingZone(null);
          setNewZoneForm({ name: '', color: '#fbbf24', agentId: '', agentName: '' });
        }
      }}>
        <DialogContent className="bg-card border-primary/20 text-foreground max-w-md shadow-2xl z-[10001]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              {editingZone ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingZone ? 'تعديل منطقة التوصيل' : 'إضافة منطقة توصيل جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-foreground font-bold mb-1 block">اسم المنطقة</Label>
              <Input
                placeholder="مثال: حي الروضة"
                className="bg-background/50 border-primary/30 text-foreground"
                value={newZoneForm.name}
                onChange={(e) => setNewZoneForm({ ...newZoneForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground font-bold mb-2 block">لون المنطقة على الخريطة</Label>
              <div className="flex gap-2">
                {['#fbbf24', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newZoneForm.color === color ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewZoneForm({ ...newZoneForm, color })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-foreground font-bold mb-2 block text-sm">إحداثيات المنطقة</Label>
              <Button
                variant="outline"
                className={`w-full h-12 gap-2 border-primary/30 transition-all ${isDrawingMode ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'hover:bg-primary/10'}`}
                onClick={() => {
                  setIsDrawingMode(true);
                  setDrawingPoints([]);
                  setIsAddingZone(false); // Temporarily hide modal
                }}
              >
                {isDrawingMode ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    جاري التحديد على الخريطة...
                  </>
                ) : (
                  <>
                    <MousePointer2 className="w-4 h-4 text-primary" />
                    تحديد المنطقة على الخريطة
                  </>
                )}
              </Button>
              {newZoneForm.name && !isDrawingMode && (
                <p className="text-[10px] text-muted-foreground mt-1 text-center font-arabic">
                  * تم تحديد الإحداثيات بنجاح
                </p>
              )}
            </div>
            <div>
              <Label className="text-foreground font-bold mb-1 block">المندوب المسؤول (اختياري)</Label>
              <select
                className="w-full h-10 px-3 rounded-md bg-background/50 border border-primary/30 text-foreground text-sm outline-none"
                value={newZoneForm.agentId}
                onChange={(e) => {
                  const agent = agents.find(a => a.id === e.target.value);
                  setNewZoneForm({
                    ...newZoneForm,
                    agentId: e.target.value,
                    agentName: agent?.name || ''
                  });
                }}
              >
                <option value="">بدون مندوب</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-start">
            <Button
              className="bg-primary text-black font-bold h-11 flex-1"
              onClick={() => {
                if (!newZoneForm.name) return;
                const { addZone, updateZone } = useAppStore.getState();

                if (editingZone) {
                  updateZone(editingZone.id, {
                    name: newZoneForm.name,
                    color: newZoneForm.color,
                    agentId: newZoneForm.agentId || undefined,
                    agentName: newZoneForm.agentName || undefined,
                    coordinates: newZoneForm.coordinates || editingZone.coordinates
                  });
                } else {
                  addZone({
                    id: `zone-${Date.now()}`,
                    name: newZoneForm.name,
                    color: newZoneForm.color,
                    coordinates: newZoneForm.coordinates || [[15.37, 44.19], [15.38, 44.20], [15.36, 44.21]],
                    agentName: newZoneForm.agentName || undefined,
                    isActive: true
                  });
                }

                setIsAddingZone(false);
                setEditingZone(null);
                setNewZoneForm({ name: '', color: '#fbbf24', agentId: '', agentName: '' });
              }}
            >
              {editingZone ? 'حفظ التعديلات' : 'إضافة المنطقة'}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="h-11 px-6">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن طلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-muted/50 border-primary/30 text-foreground"
          />
        </div>
        <Button variant="outline" className="border-primary/30 text-primary">
          <Filter className="w-4 h-4 ml-2" />
          تصفية
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="bg-card border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-right p-4 text-primary">رقم الطلب</th>
                  <th className="text-right p-4 text-primary">العميل</th>
                  <th className="text-right p-4 text-primary">المبلغ</th>
                  <th className="text-right p-4 text-primary">الحالة</th>
                  <th className="text-right p-4 text-primary">المندوب</th>
                  <th className="text-right p-4 text-primary">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-primary/10 hover:bg-primary/5"
                  >
                    <td className="p-4 text-foreground">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-foreground">{order.customerName}</p>
                        <p className="text-muted-foreground text-sm">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-primary">{order.totalAmount} ر.س</td>
                    <td className="p-4">
                      <Badge className={`${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                        }`}>
                        {order.status === 'delivered' ? 'تم التوصيل' :
                          order.status === 'pending' ? 'معلق' :
                            order.status === 'out_for_delivery' ? 'قيد التوصيل' :
                              order.status === 'confirmed' ? 'مؤكد' : 'قيد التحضير'}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.assignedAgentName || 'غير محدد'}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                        التفاصيل
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl">
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">إعدادات الحساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">الاسم</Label>
            <Input
              defaultValue={currentUser?.name}
              className="bg-muted/50 border-primary/30 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">البريد الإلكتروني</Label>
            <Input
              defaultValue={currentUser?.email}
              className="bg-muted/50 border-primary/30 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">رقم الهاتف</Label>
            <Input
              defaultValue={currentUser?.phone}
              className="bg-muted/50 border-primary/30 text-foreground"
            />
          </div>
          <Button className="bg-primary text-black">
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'agents':
      return renderAgents();
    case 'zones':
      return renderZones();
    case 'orders':
      return renderOrders();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}
