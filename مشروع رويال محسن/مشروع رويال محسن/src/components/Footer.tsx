import { motion } from 'framer-motion';
import { Crown, Facebook, Instagram, Twitter, Phone, Mail, MapPin, ChevronLeft } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const quickLinks = [
    { label: 'الرئيسية', page: 'home' },
    { label: 'المنتجات', page: 'products' },
    { label: 'الخدمات', page: 'services' },
    { label: 'من نحن', page: 'about' },
  ];

  const services = [
    { label: 'توصيل سريع', page: 'services' },
    { label: 'طلبات الجملة', page: 'services' },
    { label: 'دعم العملاء', page: 'services' },
    { label: 'تتبع الطلبات', page: 'dashboard' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/royaltobacco', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/royaltobacco', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/royaltobacco', label: 'Twitter' },
    { icon: Phone, href: 'https://wa.me/966112345678', label: 'WhatsApp' },
  ];

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Top Border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 bg-royal-gradient opacity-90" />

      {/* Main Footer Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-10 h-10 text-amber-500" />
                <div>
                  <h3 className="text-2xl font-bold text-gold-gradient font-['Playfair_Display']">
                    ROYAL
                  </h3>
                  <p className="text-xs text-amber-500/70 tracking-widest">TOBACCO</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                شركة رويال للتبغ - رائدة في صناعة التبغ منذ عام 1995،
                نقدم منتجات عالية الجودة تجمع بين التقاليد والحداثة.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-lg font-bold text-foreground mb-6">روابط سريعة</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <motion.button
                      onClick={() => onNavigate(link.page)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                      whileHover={{ x: 5 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {link.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-lg font-bold text-foreground mb-6">خدماتنا</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.label}>
                    <motion.button
                      onClick={() => onNavigate(service.page)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                      whileHover={{ x: 5 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {service.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-lg font-bold text-foreground mb-6">تواصل معنا</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">العنوان</p>
                    <p className="text-foreground text-sm">الرياض، المملكة العربية السعودية</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">الهاتف</p>
                    <p className="text-foreground text-sm">+966 11 234 5678</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">البريد الإلكتروني</p>
                    <p className="text-foreground text-sm">info@royaltobacco.com</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">اشترك في نشرتنا الإخبارية</h4>
                <p className="text-muted-foreground text-sm">احصل على آخر العروض والأخبار مباشرة إلى بريدك</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 md:w-64 px-4 py-3 rounded-lg bg-background/50 border border-primary/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <motion.button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  اشترك
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-amber-500/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-right">
              © 2024 شركة رويال للتبغ. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <button className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                سياسة الخصوصية
              </button>
              <button className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                شروط الاستخدام
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
