import { motion } from 'framer-motion';
import { Truck, Package, Headphones, Shield, Clock, Award, Crown, ChevronLeft } from 'lucide-react';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Truck,
  Package,
  Headphones,
  Shield,
  Clock,
  Award,
};

export function Services({ onNavigate }: ServicesProps) {
  const services = [
    {
      id: '1',
      title: 'توصيل سريع',
      titleEn: 'Fast Delivery',
      description: 'توصيل خلال ساعتين في المناطق المختارة مع إمكانية التتبع المباشر',
      descriptionEn: 'Delivery within 2 hours in selected areas with live tracking',
      icon: 'Truck',
      features: ['تتبع مباشر', 'توصيل سريع', 'سائقون محترفون'],
      color: 'from-amber-500 to-yellow-600',
    },
    {
      id: '2',
      title: 'طلبات الجملة',
      titleEn: 'Bulk Orders',
      description: 'أسعار تنافسية للمشتريات بالجملة مع دعم مخصص',
      descriptionEn: 'Competitive pricing for wholesale purchases with dedicated support',
      icon: 'Package',
      features: ['أسعار مميزة', 'دعم مخصص', 'دفع مرن'],
      color: 'from-red-600 to-red-800',
    },
    {
      id: '3',
      title: 'دعم على مدار الساعة',
      titleEn: '24/7 Support',
      description: 'فريق خدمة العملاء متاح دائماً لمساعدتك',
      descriptionEn: 'Customer service team always available to help you',
      icon: 'Headphones',
      features: ['دعم متعدد اللغات', 'استجابة سريعة', 'خبراء متخصصون'],
      color: 'from-blue-500 to-blue-700',
    },
    {
      id: '4',
      title: 'جودة مضمونة',
      titleEn: 'Guaranteed Quality',
      description: 'جميع منتجاتنا أصلية 100% مع ضمان الجودة',
      descriptionEn: 'All our products are 100% original with quality guarantee',
      icon: 'Shield',
      features: ['منتجات أصلية', 'ضمان الجودة', 'استبدال سهل'],
      color: 'from-green-500 to-green-700',
    },
    {
      id: '5',
      title: 'توصيل في الوقت المحدد',
      titleEn: 'On-Time Delivery',
      description: 'نلتزم بالمواعيد المحددة للتوصيل دون تأخير',
      descriptionEn: 'We adhere to scheduled delivery times without delay',
      icon: 'Clock',
      features: ['دقة عالية', 'تنبيهات مبكرة', 'جدولة مرنة'],
      color: 'from-purple-500 to-purple-700',
    },
    {
      id: '6',
      title: 'جوائز وولاء',
      titleEn: 'Loyalty Rewards',
      description: 'نقاط ولاء على كل عملية شراء يمكن استبدالها',
      descriptionEn: 'Loyalty points on every purchase that can be redeemed',
      icon: 'Award',
      features: ['نقاط على كل شراء', 'عروض حصرية', 'مكافآت خاصة'],
      color: 'from-pink-500 to-pink-700',
    },
  ];

  return (
    <section className="relative py-24 w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-royal-gradient opacity-50" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
          >
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-amber-400 text-sm font-medium">خدماتنا المتميزة</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gold-gradient font-['Playfair_Display']">
              خدمات رويال
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم لكم مجموعة متكاملة من الخدمات المصممة لتلبية جميع احتياجاتكم
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Truck;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="card-royal p-6 h-full relative overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-primary/70 text-sm mb-1">{service.titleEn}</p>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-amber-500" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">هل تحتاج إلى مساعدة؟</h3>
              <p className="text-muted-foreground">فريق الدعم لدينا جاهز لمساعدتك على مدار الساعة</p>
            </div>
            <motion.button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              تواصل معنا
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
