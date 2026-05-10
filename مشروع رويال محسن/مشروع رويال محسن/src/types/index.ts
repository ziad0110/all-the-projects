// User Roles
export type UserRole = 'manager' | 'delivery' | 'customer';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isApproved?: boolean;
  createdAt: Date;
}

// Delivery Agent Interface
export interface DeliveryAgent extends User {
  role: 'delivery';
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  isLocationEnabled: boolean;
  assignedZone?: GeoZone;
  deliveriesCompleted: number;
  rating: number;
  status: 'online' | 'offline' | 'busy';
}

// Customer Interface
export interface Customer extends User {
  role: 'customer';
  address?: string;
  orders: Order[];
}

// Manager Interface
export interface Manager extends User {
  role: 'manager';
}

// Geographic Zone for Delivery Agents
export interface GeoZone {
  id: string;
  name: string;
  agentId?: string;
  agentName?: string;
  coordinates: [number, number][]; // Polygon coordinates
  color: string;
  isActive: boolean;
}

// Product Interface
export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  type: 'white' | 'red';
  stock: number;
  isAvailable: boolean;
  features: string[];
}

// Order Interface
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

// Service Interface
export interface Service {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  features: string[];
}

// Company Info
export interface CompanyInfo {
  name: string;
  nameAr: string;
  logo: string;
  description: string;
  descriptionAr: string;
  foundedYear: number;
  headquarters: string;
  phone: string;
  email: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

// Stats Interface
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeAgents: number;
  totalCustomers: number;
  pendingOrders: number;
  deliveredToday: number;
}

// Notification Interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}
