import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Shield, Truck, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Award,
    title: 'جودة عالية',
    description: 'نستخدم أفضل المواد لضمان راحة طفلك'
  },
  {
    icon: Shield,
    title: 'آمنة للبشرة',
    description: 'خالية من المواد الكيميائية الضارة'
  },
  {
    icon: Truck,
    title: 'توصيل سريع',
    description: 'نوصل منتجاتك لباب بيتك في أسرع وقت'
  },
  {
    icon: Heart,
    title: 'رضا العملاء',
    description: 'نسعى دائماً لإرضاء عملائنا الكرام'
  }
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate image
      gsap.fromTo(imageRef.current,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate content
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate features
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 bg-[#FEF8EA] dark:bg-gray-900 overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#E84B8A]/10 blur-2xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-[#8BD7EF]/10 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#E84B8A]/20">
              <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200" alt="Prince Baby" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#C4E0A3] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-none">+2M</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">مستهلك سعيد</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="text-right">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 mb-6 shadow-sm">
              <span className="text-sm font-medium text-[#E84B8A]">من نحن</span>
            </div>

            <h2
              className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              قصة{' '}
              <span className="text-[#E84B8A]">برنس بيبي</span>
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              تأسست شركة برنس بيبي لصناعة الحفاظات والفوط الصحية والمناديل عام 2011م، وبدأت عملية الإنتاج عام 2012م في ضواحي العاصمة صنعاء مديرية همدان.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              كان الهدف الرئيسي من المشروع هو تلبية احتياجات المجتمع من منتجات وطنية ذات جودة عالمية، ورفد الاقتصاد الوطني من خلال إيجاد فرص عمل للعمالة الوطنية المبدعة. ونحن نلتزم بالتطوير المستمر كركيزة أساسية لضمان أفضل حماية وراحة لأطفالكم.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                <div className="text-3xl font-bold text-[#E84B8A] mb-1">11+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">سنة من الريادة</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                <div className="text-3xl font-bold text-[#8BD7EF] mb-1">20</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">منتجاً وطنياً</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                <div className="text-3xl font-bold text-[#C4E0A3] mb-1">11</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ميزة للمنتج</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 rounded-xl bg-[#E84B8A]/10 flex items-center justify-center mb-4 group-hover:bg-[#E84B8A] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#E84B8A] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3
                className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
