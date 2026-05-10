import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Crown, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { ThemeToggle } from './ui/ThemeToggle';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'الرئيسية', labelEn: 'Home' },
    { id: 'products', label: 'المنتجات', labelEn: 'Products' },
    { id: 'services', label: 'الخدمات', labelEn: 'Services' },
    { id: 'about', label: 'من نحن', labelEn: 'About' },
    { id: 'tracking', label: 'تتبع الطلب', labelEn: 'Tracking' },
    { id: 'faq', label: 'الأسئلة الشائعة', labelEn: 'FAQ' },
    { id: 'contact', label: 'تواصل معنا', labelEn: 'Contact' },
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-background/90 backdrop-blur-xl border-b border-primary/20'
        : 'bg-transparent'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Crown className="w-10 h-10 text-amber-500 transition-all duration-300 group-hover:text-amber-400" />
              <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gold-gradient font-['Playfair_Display']">
                ROYAL
              </span>
              <span className="text-xs text-amber-500/70 tracking-widest">TOBACCO</span>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${currentPage === link.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                {currentPage === link.id && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{currentUser?.name}</span>
                </motion.button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  خروج
                </Button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400"
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-primary/20"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`block w-full text-right py-3 px-4 rounded-lg text-lg font-medium transition-colors ${currentPage === link.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="pt-4 border-t border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-primary/5">
                  <span className="text-muted-foreground font-medium">الوضع النهارى/الليللى</span>
                  <ThemeToggle />
                </div>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full py-3 px-4 rounded-lg bg-primary/20 text-primary font-medium"
                    >
                      لوحة التحكم
                    </button>
                    <button
                      onClick={logout}
                      className="w-full py-3 px-4 rounded-lg border border-red-500/30 text-red-400"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick('login')}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold"
                  >
                    تسجيل الدخول
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
