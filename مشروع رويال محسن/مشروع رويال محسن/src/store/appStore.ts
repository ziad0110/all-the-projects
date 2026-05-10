import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type {
  User,
  DeliveryAgent,
  Product,
  Order,
  GeoZone,
  Service,
  CompanyInfo,
  DashboardStats,
  Notification,
  UserRole
} from '@/types';

// Auth State
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
}

// Delivery State
interface DeliveryState {
  agents: DeliveryAgent[];
  zones: GeoZone[];
  selectedAgent: DeliveryAgent | null;
  isTracking: boolean;
  updateAgentLocation: (agentId: string, lat: number, lng: number) => void;
  updateAgent: (agentId: string, updates: Partial<DeliveryAgent>) => void;
  deleteAgent: (agentId: string) => void;
  approveAgent: (agentId: string) => void;
  rejectAgent: (agentId: string) => void;
  setSelectedAgent: (agent: DeliveryAgent | null) => void;
  toggleTracking: () => void;
  addZone: (zone: GeoZone) => void;
  updateZone: (zoneId: string, updates: Partial<GeoZone>) => void;
  deleteZone: (zoneId: string) => void;
  assignZoneToAgent: (zoneId: string, agentId: string) => void;
  initAgentsListener: () => () => void;
  initZonesListener: () => () => void;
}

// Orders State
interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignOrderToAgent: (orderId: string, agentId: string, agentName: string) => void;
  getCustomerOrders: (customerId: string) => Order[];
  getAgentOrders: (agentId: string) => Order[];
  getNearestAgent: (lat: number, lng: number) => DeliveryAgent | null;
  cancelOrder: (orderId: string) => void;
  initOrdersListener: () => () => void;
}

// Products State
interface ProductsState {
  products: Product[];
  services: Service[];
  companyInfo: CompanyInfo;
  getProductById: (id: string) => Product | undefined;
  getProductsByType: (type: Product['type']) => Product[];
}

// UI State
interface UIState {
  notifications: Notification[];
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

// Dashboard State
interface DashboardState {
  stats: DashboardStats;
  updateStats: () => void;
}

// Cart Item
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Cart State
interface CartState {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

// Combined Store
interface AppStore extends
  AuthState,
  DeliveryState,
  OrdersState,
  ProductsState,
  UIState,
  DashboardState,
  CartState { }


// Mock Data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Royal White',
    nameAr: 'رويال الأبيض',
    description: 'Premium quality cigarettes with a smooth, refined taste. Crafted for those who appreciate elegance and sophistication.',
    descriptionAr: 'سجائر عالية الجودة ذات مذاق ناعم وراقي. مصنوعة لأولئك الذين يقدرون الأناقة والرقي.',
    price: 25,
    image: '/images/white/photo_2026-02-06_21-03-41.jpg',
    type: 'white',
    stock: 1000,
    isAvailable: true,
    features: ['Premium Tobacco', 'Smooth Taste', 'Elegant Packaging', 'King Size']
  },
  {
    id: '2',
    name: 'Royal Red',
    nameAr: 'رويال الأحمر',
    description: 'Bold and rich flavor for the discerning smoker. A classic choice with a powerful character.',
    descriptionAr: 'نكهة جريئة وغنية للمدخن المتمرس. اختيار كلاسيكي بطابع قوي.',
    price: 23,
    image: '/images/red/photo_2026-02-06_21-03-37.jpg',
    type: 'red',
    stock: 800,
    isAvailable: true,
    features: ['Rich Flavor', 'Full-Bodied', 'Classic Design', 'Premium Blend']
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Fast Delivery',
    titleAr: 'توصيل سريع',
    description: 'Get your order delivered within 2 hours in selected areas.',
    descriptionAr: 'احصل على طلبك خلال ساعتين في المناطق المختارة.',
    icon: 'Truck',
    features: ['2-Hour Delivery', 'Real-time Tracking', 'Professional Couriers']
  },
  {
    id: '2',
    title: 'Bulk Orders',
    titleAr: 'طلبات الجملة',
    description: 'Special pricing for wholesale and bulk purchases.',
    descriptionAr: 'أسعار خاصة للمشتريات بالجملة.',
    icon: 'Package',
    features: ['Competitive Pricing', 'Dedicated Support', 'Flexible Payment']
  },
  {
    id: '3',
    title: '24/7 Support',
    titleAr: 'دعم على مدار الساعة',
    description: 'Our customer service team is available around the clock.',
    descriptionAr: 'فريق خدمة العملاء متاح على مدار الساعة.',
    icon: 'Headphones',
    features: ['Multilingual Support', 'Quick Response', 'Expert Assistance']
  }
];

const mockCompanyInfo: CompanyInfo = {
  name: 'Royal Tobacco',
  nameAr: 'رويال للتبغ',
  logo: '/logo.png',
  description: 'Leading tobacco company committed to quality and excellence since 1995.',
  descriptionAr: 'شركة رائدة في مجال التبغ ملتزمة بالجودة والتميز منذ عام 1995.',
  foundedYear: 1995,
  headquarters: 'Sanaa, Yemen',
  phone: '+967 1 234 567',
  email: 'info@royaltobacco.com',
  socialMedia: {
    facebook: 'https://facebook.com/royaltobacco',
    instagram: 'https://instagram.com/royaltobacco',
    twitter: 'https://twitter.com/royaltobacco',
    whatsapp: '+967 777 777 777'
  }
};

// Manager Credentials (Single Account)
const MANAGER_EMAIL = 'manager@royal.com';
const MANAGER_PASSWORD = 'admin123';

// Create Store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth State
      currentUser: null,
      isAuthenticated: false,

      login: async (email: string, password: string, role: UserRole) => {
        // Manager login - validate against hardcoded credentials
        if (role === 'manager') {
          if (email === MANAGER_EMAIL && password === MANAGER_PASSWORD) {
            const managerUser: User = {
              id: 'manager-royal',
              name: 'مدير رويال',
              email: MANAGER_EMAIL,
              phone: '+967 777 777 777',
              role: 'manager',
              isActive: true,
              isApproved: true,
              createdAt: new Date()
            };
            set({ currentUser: managerUser, isAuthenticated: true });
            return true;
          } else {
            return false; // Invalid manager credentials
          }
        }

        // Customer/Delivery login - mock for now
        const mockUser: User = {
          id: `user-${Date.now()}`,
          name: role === 'delivery' ? 'Delivery Agent' : 'Customer',
          email,
          phone: '+967 777 777 777',
          role,
          isActive: true,
          createdAt: new Date()
        };

        set({ currentUser: mockUser, isAuthenticated: true });
        return true;
      },

      loginWithGoogle: async (role: UserRole) => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;

          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'مستخدم Google',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role,
            avatar: firebaseUser.photoURL || undefined,
            isActive: true,
            isApproved: role === 'customer' || role === 'manager',
            createdAt: new Date()
          };

          set((state) => {
            const newState: Partial<AppStore> = {
              currentUser: newUser,
              isAuthenticated: true
            };

            // If registering as delivery agent, add to agents list
            if (role === 'delivery') {
              const newAgent: DeliveryAgent = {
                id: firebaseUser.uid,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                avatar: newUser.avatar,
                role: 'delivery',
                isActive: true,
                isApproved: false,
                createdAt: newUser.createdAt,
                currentLocation: { lat: 15.3694, lng: 44.1910, timestamp: new Date() },
                isLocationEnabled: true,
                deliveriesCompleted: 0,
                rating: 5.0,
                status: 'offline'
              };
              newState.agents = [...state.agents, newAgent];

              get().addNotification({
                title: 'طلب انضمام مندوب جديد',
                message: `المندوب ${newUser.name} بانتظار الموافقة`,
                type: 'info',
                read: false
              });
            }

            return newState;
          });

          return true;
        } catch (error) {
          console.error('Google login error:', error);
          return false;
        }
      },


      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      register: async (userData) => {
        // Block manager registration - only one manager account exists
        if (userData.role === 'manager') {
          console.error('Manager registration is disabled');
          return false;
        }

        const userId = `user${Date.now()}`;
        const newUser: User = {
          id: userId,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'customer',
          avatar: userData.avatar,
          isActive: true,
          isApproved: userData.role === 'customer',
          createdAt: new Date()
        };

        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          // Save User profile
          await setDoc(doc(db, 'users', userId), {
            ...newUser,
            createdAt: serverTimestamp()
          });

          // If role is delivery, also add to agents collection
          if (newUser.role === 'delivery') {
            const newAgent: DeliveryAgent = {
              id: userId,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              avatar: newUser.avatar,
              role: 'delivery',
              isActive: true,
              isApproved: false,
              createdAt: newUser.createdAt,
              currentLocation: { lat: 15.3694, lng: 44.1910, timestamp: new Date() },
              isLocationEnabled: true,
              deliveriesCompleted: 0,
              rating: 5.0,
              status: 'offline'
            };

            await setDoc(doc(db, 'agents', userId), {
              ...newAgent,
              createdAt: serverTimestamp(),
              currentLocation: {
                lat: 15.3694,
                lng: 44.1910,
                timestamp: serverTimestamp()
              }
            });
          }

          set({
            currentUser: newUser,
            isAuthenticated: true
          });

          return true;
        } catch (error) {
          console.error('Error in registration:', error);
          return false;
        }
      },

      // Delivery State
      agents: [],
      zones: [],
      selectedAgent: null,
      isTracking: false,

      updateAgentLocation: async (agentId, lat, lng) => {
        set((state) => ({
          agents: state.agents.map(agent =>
            agent.id === agentId
              ? { ...agent, currentLocation: { lat, lng, timestamp: new Date() } }
              : agent
          )
        }));

        // If this is the current user updating their own location, sync to Firebase
        const currentUser = get().currentUser;
        if (currentUser && currentUser.id === agentId) {
          try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            await setDoc(doc(db, 'agent_locations', agentId), {
              lat,
              lng,
              timestamp: serverTimestamp(),
              name: currentUser.name
            }, { merge: true });
          } catch (error) {
            console.error('Error syncing location to Firebase:', error);
          }
        }
      },

      updateAgent: (agentId, updates) => {
        set((state) => ({
          agents: state.agents.map(agent =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          )
        }));
      },

      deleteAgent: (agentId) => {
        set((state) => ({
          agents: state.agents.filter(agent => agent.id !== agentId),
          zones: state.zones.map(zone =>
            zone.agentId === agentId ? { ...zone, agentId: undefined, agentName: undefined } : zone
          )
        }));
      },

      approveAgent: async (agentId) => {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await updateDoc(doc(db, 'agents', agentId), { isApproved: true });
          await updateDoc(doc(db, 'users', agentId), { isApproved: true });

          set((state) => ({
            agents: state.agents.map(agent =>
              agent.id === agentId ? { ...agent, isApproved: true } : agent
            )
          }));

          get().addNotification({
            title: 'تمت الموافقة',
            message: 'تم قبول المندوب بنجاح',
            type: 'success',
            read: false
          });
        } catch (error) {
          console.error('Error approving agent:', error);
        }
      },

      rejectAgent: async (agentId) => {
        try {
          const { doc, deleteDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await deleteDoc(doc(db, 'agents', agentId));
          await deleteDoc(doc(db, 'users', agentId));

          set((state) => ({
            agents: state.agents.filter(agent => agent.id !== agentId)
          }));

          get().addNotification({
            title: 'تم الرفض',
            message: 'تم رفض طلب الانضمام وحذف المندوب',
            type: 'warning',
            read: false
          });
        } catch (error) {
          console.error('Error rejecting agent:', error);
        }
      },

      setSelectedAgent: (agent) => {
        set({ selectedAgent: agent });
      },

      toggleTracking: () => {
        set((state) => ({ isTracking: !state.isTracking }));
      },

      addZone: async (zone) => {
        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await setDoc(doc(db, 'zones', zone.id), {
            ...zone,
            createdAt: serverTimestamp()
          });
          set((state) => ({ zones: [...state.zones, zone] }));
        } catch (error) {
          console.error('Error adding zone:', error);
        }
      },

      updateZone: async (zoneId, updates) => {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await updateDoc(doc(db, 'zones', zoneId), updates);
          set((state) => ({
            zones: state.zones.map(zone =>
              zone.id === zoneId ? { ...zone, ...updates } : zone
            )
          }));
        } catch (error) {
          console.error('Error updating zone:', error);
        }
      },

      deleteZone: async (zoneId) => {
        try {
          const { doc, deleteDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await deleteDoc(doc(db, 'zones', zoneId));
          set((state) => ({
            zones: state.zones.filter(zone => zone.id !== zoneId)
          }));
        } catch (error) {
          console.error('Error deleting zone:', error);
        }
      },

      assignZoneToAgent: async (zoneId, agentId) => {
        const agent = get().agents.find(a => a.id === agentId);
        const agentName = agent ? agent.name : 'Unknown';
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await updateDoc(doc(db, 'zones', zoneId), {
            agentId,
            agentName
          });
          set((state) => ({
            zones: state.zones.map(zone =>
              zone.id === zoneId
                ? { ...zone, agentId, agentName }
                : zone
            )
          }));
        } catch (error) {
          console.error('Error assigning zone:', error);
        }
      },

      initZonesListener: () => {
        let unsubscribe: () => void = () => { };

        const setup = async () => {
          try {
            const { collection, onSnapshot, query } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            console.log('Setting up Firestore listener for zones...');
            const q = query(collection(db, 'zones'));
            unsubscribe = onSnapshot(q, (snapshot) => {
              const zonesList: GeoZone[] = [];
              snapshot.forEach((doc) => {
                zonesList.push({
                  ...doc.data(),
                  id: doc.id
                } as GeoZone);
              });
              set({ zones: zonesList });
            });
          } catch (error) {
            console.error('Error setting up zones listener:', error);
          }
        };

        setup();
        return () => unsubscribe();
      },

      initAgentsListener: () => {
        let unsubscribe: () => void = () => { };

        const setup = async () => {
          try {
            const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            console.log('Setting up Firestore listener for agents...');
            const q = query(collection(db, 'agents'));
            unsubscribe = onSnapshot(q, (snapshot) => {
              console.log('Received agents snapshot, size:', snapshot.size);
              const agentsList: DeliveryAgent[] = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                agentsList.push({
                  ...data,
                  id: doc.id,
                  // Handle potential timestamp objects from Firestore
                  createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now())
                } as DeliveryAgent);
              });

              // Detect new unregistered agents to trigger notifications
              const currentAgents = get().agents;
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  const newAgent = change.doc.data();
                  if (!newAgent.isApproved && !currentAgents.some(a => a.id === change.doc.id)) {
                    get().addNotification({
                      title: 'طلب انضمام مندوب جديد',
                      message: `المندوب ${newAgent.name} بانتظار الموافقة`,
                      type: 'info',
                      read: false
                    });
                  }
                }
              });

              set({ agents: agentsList });
            });
          } catch (error) {
            console.error('Error setting up agents listener:', error);
          }
        };

        setup();
        return () => unsubscribe();
      },

      // Orders State
      orders: [],
      currentOrder: null,

      createOrder: async (order) => {
        try {
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          const orderData = {
            ...order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending' as const
          };

          const docRef = await addDoc(collection(db, 'orders'), orderData);
          console.log('Order created in Firestore with ID:', docRef.id);
        } catch (error) {
          console.error('Error creating order in Firestore:', error);
          // Local fallback if needed
          const newOrder: Order = {
            ...order as Order,
            id: `ORD-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending'
          };
          set((state) => ({ orders: [newOrder, ...state.orders] }));
        }
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await updateDoc(doc(db, 'orders', orderId), {
            status,
            updatedAt: serverTimestamp()
          });

          set((state) => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { ...order, status, updatedAt: new Date() }
                : order
            )
          }));
          get().updateStats();
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      },

      assignOrderToAgent: async (orderId, agentId, agentName) => {
        try {
          const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await updateDoc(doc(db, 'orders', orderId), {
            assignedAgentId: agentId,
            assignedAgentName: agentName,
            status: 'confirmed',
            updatedAt: serverTimestamp()
          });

          set((state) => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { ...order, assignedAgentId: agentId, assignedAgentName: agentName, status: 'confirmed', updatedAt: new Date() }
                : order
            )
          }));
        } catch (error) {
          console.error('Error assigning order:', error);
        }
      },

      getCustomerOrders: (customerId) => {
        return get().orders.filter(order => order.customerId === customerId);
      },

      getAgentOrders: (agentId) => {
        return get().orders.filter(order => order.assignedAgentId === agentId);
      },

      cancelOrder: async (orderId) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order || order.status === 'cancelled' || order.status === 'delivered') return;

        try {
          const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await updateDoc(doc(db, 'orders', orderId), {
            status: 'cancelled',
            updatedAt: serverTimestamp()
          });

          set((state) => ({
            orders: state.orders.map(o =>
              o.id === orderId ? { ...o, status: 'cancelled' as const, updatedAt: new Date() } : o
            )
          }));

          get().addNotification({
            title: 'تم إلغاء الطلب',
            message: `تم إلغاء الطلب #${orderId} وإعادة الكميات للمخزن`,
            type: 'info',
            read: false
          });

          get().updateStats();
        } catch (error) {
          console.error('Error cancelling order:', error);
        }
      },

      initOrdersListener: () => {
        let unsubscribe: () => void = () => { };

        const setup = async () => {
          try {
            const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            console.log('Setting up Firestore listener for orders...');
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            unsubscribe = onSnapshot(q, (snapshot) => {
              const ordersList: Order[] = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                ordersList.push({
                  ...data,
                  id: doc.id,
                  createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
                  updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now())
                } as Order);
              });
              set({ orders: ordersList });
              get().updateStats();
            });
          } catch (error) {
            console.error('Error setting up orders listener:', error);
          }
        };

        setup();
        return () => unsubscribe();
      },

      getNearestAgent: (lat, lng) => {
        const { agents } = get();
        const availableAgents = agents.filter(a => a.status === 'online' && a.isApproved);

        if (availableAgents.length === 0) return null;

        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        let nearestAgent: DeliveryAgent | null = null;
        let minDistance = Infinity;

        availableAgents.forEach(agent => {
          if (agent.currentLocation) {
            const distance = calculateDistance(lat, lng, agent.currentLocation.lat, agent.currentLocation.lng);
            if (distance < minDistance) {
              minDistance = distance;
              nearestAgent = agent;
            }
          }
        });

        return nearestAgent;
      },

      // Products State
      products: mockProducts,
      services: mockServices,
      companyInfo: mockCompanyInfo,

      getProductById: (id) => {
        return get().products.find(p => p.id === id);
      },

      getProductsByType: (type) => {
        return get().products.filter(p => p.type === type);
      },

      // UI State
      notifications: [],
      sidebarOpen: false,
      isCartOpen: false,
      activeTab: 'overview',
      theme: 'dark',

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif${Date.now()}`,
          createdAt: new Date()
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open });
      },
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // Dashboard State
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        activeAgents: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        deliveredToday: 0
      },

      updateStats: () => {
        const orders = get().orders;
        const agents = get().agents;
        const totalRevenue = orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const deliveredToday = orders.filter(o =>
          o.status === 'delivered' &&
          new Date(o.updatedAt).toDateString() === new Date().toDateString()
        ).length;

        set((state) => ({
          stats: {
            ...state.stats,
            totalOrders: orders.length,
            totalRevenue: totalRevenue,
            activeAgents: agents.filter(a => a.status === 'online').length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            deliveredToday,
            totalCustomers: state.stats.totalCustomers
          }
        }));
      },

      // Cart State
      cart: [],

      addToCart: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.productId === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          return {
            cart: [...state.cart, {
              productId: product.id,
              name: product.nameAr || product.name,
              price: product.price,
              quantity,
              image: product.image
            }]
          };
        });
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cart: state.cart.filter(item => item.productId !== productId)
        }));
      },

      updateCartQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'royal-tobacco-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            agents: [],
            orders: [],
            zones: []
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        products: state.products,
        orders: state.orders,
        agents: state.agents,
        zones: state.zones,
        cart: state.cart
      })
    }
  )
);
