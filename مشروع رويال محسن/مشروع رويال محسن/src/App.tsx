import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Products } from '@/components/Products';
import { Services } from '@/components/Services';
import { About } from '@/components/About';
import { OrderTracking } from '@/components/OrderTracking';
import { FAQ } from '@/components/FAQ';
import { Contact } from '@/components/Contact';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Cart } from '@/components/Cart';
import { Checkout } from '@/components/Checkout';
import { Crown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type Page = 'home' | 'products' | 'services' | 'about' | 'login' | 'register' | 'dashboard' | 'tracking' | 'faq' | 'contact' | 'checkout';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);

  const { theme, setTheme } = useAppStore();

  // Initial loading animation
  useEffect(() => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('royal-tobacco-storage');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state.theme) {
        setTheme(parsed.state.theme);
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [setTheme]);

  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <Crown className="w-24 h-24 text-amber-500 mx-auto" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gold-gradient font-['Playfair_Display'] mt-8"
          >
            ROYAL TOBACCO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-amber-500/70 mt-2"
          >
            شركة رويال للتبغ
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6"
          />
        </motion.div>
      </div>
    );
  }

  // Render page content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        );

      case 'register':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="register"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterPage onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        );

      case 'dashboard':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProtectedRoute onRedirect={handleNavigate} allowedRoles={['manager', 'delivery', 'customer']}>
                <Dashboard onNavigate={handleNavigate} />
              </ProtectedRoute>
            </motion.div>
          </AnimatePresence>
        );

      case 'checkout':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
              <Checkout onNavigate={handleNavigate} />
              <Footer onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        );

      default:
        // Main website pages
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
              {/* Cart Button - Fixed Position */}
              <div className="fixed top-20 left-4 z-40">
                <Cart onNavigate={handleNavigate} />
              </div>

              <main className="relative">
                {currentPage === 'home' && (
                  <>
                    <Hero onNavigate={handleNavigate} />
                    <Newsletter />
                    <Products onNavigate={handleNavigate} />
                    <Services onNavigate={handleNavigate} />
                    <About onNavigate={handleNavigate} />
                  </>
                )}

                {currentPage === 'products' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Products onNavigate={handleNavigate} />
                  </motion.div>
                )}

                {currentPage === 'services' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Services onNavigate={handleNavigate} />
                  </motion.div>
                )}

                {currentPage === 'about' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <About onNavigate={handleNavigate} />
                  </motion.div>
                )}

                {currentPage === 'tracking' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderTracking />
                  </motion.div>
                )}

                {currentPage === 'faq' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FAQ />
                  </motion.div>
                )}

                {currentPage === 'contact' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Contact />
                  </motion.div>
                )}
              </main>

              <Footer onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300 ${theme}`}>
      {/* Floating Theme Toggle for Auth Pages */}
      {(currentPage === 'login' || currentPage === 'register') && (
        <div className="fixed top-6 right-6 z-[60]">
          <ThemeToggle />
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;
