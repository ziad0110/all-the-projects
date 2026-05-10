import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Crown, Target, Eye, Award, Users, TrendingUp, Calendar, MapPin, Phone } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Card, CardContent } from '@/components/ui/card';

interface AboutProps {
  onNavigate: (page: string) => void;
}

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function About({ onNavigate }: AboutProps) {

  const stats = [
    { value: 1995, label: 'تأسست', labelEn: 'Founded', icon: Calendar, suffix: '' },
    { value: 29, label: 'سنوات الخبرة', labelEn: 'Years Experience', icon: Award, suffix: '+' },
    { value: 50000, label: 'عميل سعيد', labelEn: 'Happy Customers', icon: Users, suffix: '+' },
    { value: 150, label: 'موظف', labelEn: 'Employees', icon: TrendingUp, suffix: '+' },
  ];

  const values = [
    {
      title: 'الجودة',
      titleEn: 'Quality',
      description: 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا وخدماتنا',
      icon: Award,
    },
    {
      title: 'الابتكار',
      titleEn: 'Innovation',
      description: 'نسعى دائماً لتطوير منتجاتنا وخدماتنا لتلبية توقعات عملائنا',
      icon: Target,
    },
    {
      title: 'النزاهة',
      titleEn: 'Integrity',
      description: 'نؤمن بالشفافية والصدق في جميع تعاملاتنا مع العملاء والشركاء',
      icon: Eye,
    },
  ];

  return (
    <section className="relative py-24 w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-royal-gradient opacity-50" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <span className="text-[20vw] font-bold text-primary/5 font-['Playfair_Display'] whitespace-nowrap">
          ROYAL
        </span>
      </div>

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
            <span className="text-amber-400 text-sm font-medium">من نحن</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gold-gradient font-['Playfair_Display']">
              شركة رويال للتبغ
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            رائدة في صناعة التبغ منذ عام 1995، نقدم منتجات عالية الجودة تجمع بين التقاليد والحداثة
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
          {/* Left Column - Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="card-royal p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">قصتنا</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                تأسست شركة رويال للتبغ عام 1995 بهدف تقديم منتجات تبغ عالية الجودة تلبي
                تطلعات المدخنين الباحثين عن التميز. منذ ذلك الحين، نجحنا في بناء سمعة
                قوية كواحدة من الشركات الرائدة في مجال صناعة التبغ.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                نفتخر بتشكيلتنا الفاخرة التي تشمل سجائر رويال البيضاء والحمراء،
                المصنعة بعناية فائقة باستخدام أفضل أنواع التبغ المختارة بعناية
                من مزارع مختارة حول العالم.
              </p>
            </div>

            <div className="card-royal p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">رؤيتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون الخيار الأول للمدخنين الباحثين عن الجودة والتميز،
                وأن نحافظ على مكانتنا كشركة رائدة في صناعة التبغ من خلال
                الابتكار المستمر والالتزام بأعلى معايير الجودة.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Image & Mission */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="/images/photo_2026-02-06_21-03-34.jpg"
                alt="Royal Tobacco Factory"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  <span className="text-primary-foreground font-bold">مصنع رويال للتبغ</span>
                </div>
              </div>
            </div>

            <div className="card-royal p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">مهمتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                تقديم منتجات تبغ عالية الجودة تلبي توقعات عملائنا،
                مع الالتزام بأعلى معايير الجودة والسلامة،
                وبناء علاقات طويلة الأمد مع عملائنا وموردينا وموظفينا.
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الموقع</p>
                  <p className="text-sm text-foreground">صنعاء، اليمن</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الهاتف</p>
                  <p className="text-sm text-foreground">+967 1 234 567</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
                >
                  <IconComponent className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-gold-gradient mb-1">
                    <AnimatedCounter end={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="text-foreground text-sm">{stat.label}</p>
                  <p className="text-primary/50 text-xs">{stat.labelEn}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-32"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            قيمنا <span className="text-primary">الأساسية</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card-royal p-8 text-center border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-2">{value.title}</h4>
                  <p className="text-primary/70 text-sm font-medium mb-3 uppercase tracking-widest">{value.titleEn}</p>
                  <p className="text-muted-foreground text-lg leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gold-gradient font-['Playfair_Display'] mb-4">
              فريق التميز الملكي
            </h3>
            <p className="text-muted-foreground text-xl">سفراء رويال الملتزمون بخدمتكم في جميع أنحاء صنعاء</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-[90rem] mx-auto px-4">
            {useAppStore().agents.map((agent: any, index: number) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-amber-500/5 rounded-[2.5rem] blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                <Card className="relative bg-card/40 backdrop-blur-xl border-primary/20 hover:border-amber-500/40 transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-amber-500 animate-pulse rounded-full opacity-20 blur-lg scale-110" />
                      <img
                        src={agent.avatar || 'https://via.placeholder.com/150'}
                        alt={agent.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/30 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-400 transition-colors">
                      {agent.name}
                    </h4>
                    <p className="text-amber-500/80 text-sm font-black uppercase tracking-[0.2em] mb-4">
                      سفير التوصيل
                    </p>

                    <div className="w-full pt-4 border-t border-primary/10 flex justify-between items-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-foreground">{agent.rating}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">تقييم</span>
                      </div>
                      <div className="h-8 w-px bg-primary/10" />
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-foreground">{agent.deliveriesCompleted}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">مهمة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.button
            onClick={() => onNavigate('products')}
            className="btn-royal"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            اكتشف منتجاتنا
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
