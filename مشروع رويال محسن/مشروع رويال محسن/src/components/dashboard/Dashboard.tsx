import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Bell,
  User
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ManagerDashboard } from './ManagerDashboard';
import { DeliveryDashboard } from './DeliveryDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { CartDialog } from './CartDialog';
import { ShoppingCart } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser, logout, notifications, sidebarOpen, toggleSidebar, theme, cart, setCartOpen, activeTab, setActiveTab } = useAppStore();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const managerTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'agents', label: 'المناديب', icon: Users },
    { id: 'zones', label: 'المناطق', icon: MapPin },
    { id: 'orders', label: 'الطلبات', icon: Package },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const deliveryTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'orders', label: 'طلباتي', icon: Package },
    { id: 'location', label: 'موقعي', icon: MapPin },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const customerTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'orders', label: 'طلباتي', icon: Package },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const getTabs = () => {
    switch (currentUser?.role) {
      case 'manager':
        return managerTabs;
      case 'delivery':
        return deliveryTabs;
      case 'customer':
        return customerTabs;
      default:
        return customerTabs;
    }
  };

  const tabs = getTabs();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const renderContent = () => {
    switch (currentUser?.role) {
      case 'manager':
        return <ManagerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'delivery':
        return <DeliveryDashboard activeTab={activeTab} />;
      case 'customer':
        return <CustomerDashboard activeTab={activeTab} onNavigate={onNavigate} />;
      default:
        return <CustomerDashboard activeTab={activeTab} onNavigate={onNavigate} />;
    }
  };

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className={`min-h-screen w-full bg-background transition-colors duration-300 ${theme}`}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-primary/20">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-bold text-gold-gradient">ROYAL</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-lg bg-amber-500/10 text-amber-400"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </button>
            {currentUser?.role === 'customer' && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg bg-primary/10 text-primary"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </button>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-amber-500/10 text-amber-400"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : 300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 right-0 h-full z-[2000] bg-card/95 backdrop-blur-xl border-l border-primary/20 ${sidebarOpen ? 'w-64' : 'w-0'
          } lg:translate-x-0 lg:w-64 transition-all duration-300 shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-primary/20">
            <Crown className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gold-gradient font-['Playfair_Display']">
                ROYAL
              </h1>
              <p className="text-xs text-primary/70">لوحة التحكم</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-primary/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">{currentUser?.name}</p>
                <p className="text-primary/70 text-xs">
                  {currentUser?.role === 'manager' ? 'مدير' :
                    currentUser?.role === 'delivery' ? 'مندوب توصيل' : 'عميل'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                    ? 'bg-primary text-black font-medium'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-primary/20">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pr-64' : ''}`}>
        <div className="pt-16 lg:pt-0">
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between h-20 px-8 border-b border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </button>
            </div>
          </header>

          {/* Notifications Modal */}
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogContent className="bg-card border-primary/20 text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  الإشعارات
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 border border-primary/10">
                      <p className="font-bold text-sm text-primary">{notif.title}</p>
                      <p className="text-sm text-foreground mt-1">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">لا توجد إشعارات جديدة</p>
                )}
              </div>
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">إغلاق</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/* Page Content */}
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-[1999] lg:hidden"
        />
      )}
      <CartDialog onCheckout={() => setActiveTab('orders')} />
    </div>
  );
}
