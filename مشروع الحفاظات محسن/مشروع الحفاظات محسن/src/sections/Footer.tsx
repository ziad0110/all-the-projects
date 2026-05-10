import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const quickLinks = [
  { nameKey: 'nav.home', href: '/' },
  { nameKey: 'nav.about', href: '/about' },
  { nameKey: 'nav.products', href: '/products' },
  { nameKey: 'nav.sizeGuide', href: '/size-guide' },
  { nameKey: 'nav.tips', href: '/tips' },
  { nameKey: 'nav.faq', href: '/faq' },
  { nameKey: 'nav.contact', href: '/contact' },
  { nameKey: 'nav.blog', href: '/blog' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/princebaby', label: 'فيسبوك' },
  { icon: Instagram, href: 'https://instagram.com/princebaby', label: 'انستغرام' },
  { icon: Twitter, href: 'https://twitter.com/princebaby', label: 'تويتر' },
  { icon: Youtube, href: 'https://youtube.com/@princebaby', label: 'يوتيوب' },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-16 dark:bg-black transition-colors">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-right">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 justify-end">
              <span className="text-2xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {t('hero.title')}
              </span>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#E84B8A]/20 shadow-sm">
                <img src="/assets/logo-icon.png" alt="Prince Baby Logo" className="w-10 h-10 object-contain" />
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              تأسست شركة برنس بيبي لصناعة الحفاظات والفوط الصحية والمناديل عام 2011م. نلتزم بتقديم أفضل حلول رعاية الأطفال بأسعار مناسبة وبأعلى معايير الجودة الوطنية.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E84B8A] transition-colors duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              روابط سريعة
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-[#E84B8A] transition-colors duration-300"
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              معلومات التواصل
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E84B8A] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  صنعاء، الجمهورية اليمنية
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#E84B8A] flex-shrink-0" />
                <a href="tel:+967736499765" className="text-gray-400 hover:text-[#E84B8A] transition-colors" dir="ltr">
                  +967 736 499 765
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E84B8A] flex-shrink-0" />
                <a href="mailto:ziyad.alzuhairy@gmail.com" className="text-gray-400 hover:text-[#E84B8A] transition-colors">
                  ziyad.alzuhairy@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="text-lg font-bold mb-6"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              النشرة البريدية
            </h4>
            <p className="text-gray-400 mb-4">
              اشترك للحصول على أحدث العروض والأخبار
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E84B8A]"
              />
              <button
                type="submit"
                className="bg-[#E84B8A] hover:bg-[#e5a338] text-black font-semibold rounded-full px-5 py-3 transition-colors duration-300"
              >
                اشترك
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} برنس بيبي. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-[#E84B8A] text-sm transition-colors">
                سياسة الخصوصية
              </a>
              <a href="#" className="text-gray-500 hover:text-[#E84B8A] text-sm transition-colors">
                الشروط والأحكام
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
