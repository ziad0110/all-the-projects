import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Languages, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useCart } from '@/hooks/use-cart';
import CartDrawer from '@/components/CartDrawer';

const navItems = [
  { nameKey: 'nav.home', href: '/' },
  { nameKey: 'nav.about', href: '/about' },
  { nameKey: 'nav.products', href: '/products' },
  { nameKey: 'nav.sizeGuide', href: '/size-guide' },
  { nameKey: 'nav.tips', href: '/tips' },
  { nameKey: 'nav.faq', href: '/faq' },
  { nameKey: 'nav.blog', href: '/blog' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-white/90'
              }`}>
              <img src="/assets/logo-icon.png" alt="Prince Baby Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className={`text-xl font-bold transition-colors dark:text-white ${isScrolled ? 'text-gray-800 dark:text-gray-100' : 'text-gray-800 dark:text-gray-100'
              }`} style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {t('hero.title')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.nameKey}
                to={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#E84B8A]/10 dark:text-gray-300 ${location.pathname === item.href
                  ? 'bg-[#E84B8A]/20 text-[#E84B8A]'
                  : 'text-gray-700'
                  }`}
              >
                {t(item.nameKey)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              title="سلة التسوق"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E84B8A] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={i18n.language === 'ar' ? 'English' : 'العربية'}
            >
              <Languages className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/contact">
              <Button
                className="bg-[#E84B8A] hover:bg-[#e5a338] text-black font-semibold rounded-full px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#E84B8A]/30"
              >
                {t('nav.contact')}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              title="سلة التسوق"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E84B8A] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[32rem] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
        >
          <nav className="flex flex-col gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.nameKey}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium hover:bg-[#E84B8A]/10 transition-colors text-right dark:text-gray-300 ${location.pathname === item.href ? 'bg-[#E84B8A]/10 text-[#E84B8A]' : 'text-gray-700 dark:text-gray-300'}
                  }`}
              >
                {t(item.nameKey)}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-4 mt-2 px-2">
              <Button
                variant="outline"
                onClick={toggleLanguage}
                className="flex-1 rounded-xl flex items-center gap-2 justify-center"
              >
                <Languages className="w-4 h-4" />
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </Button>
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="flex-1 rounded-xl flex items-center gap-2 justify-center"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                className="w-full bg-[#E84B8A] hover:bg-[#e5a338] text-black font-semibold rounded-xl mt-2 py-6"
              >
                {t('nav.contact')}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
      <CartDrawer />
    </header>
  );
}
