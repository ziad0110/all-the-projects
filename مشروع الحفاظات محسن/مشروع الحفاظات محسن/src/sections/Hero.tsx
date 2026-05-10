import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Droplets, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroDiaper3D from '@/components/3d/HeroDiaper3D';
import gsap from 'gsap';

export default function Hero() {
  const [diaperSize, setDiaperSize] = useState(6);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
      );

      // Animate subtitle
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 }
      );

      // Animate description
      gsap.fromTo(descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.6 }
      );

      // Animate buttons
      gsap.fromTo(buttonsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.8 }
      );

      // Animate decorations
      gsap.fromTo(decorRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );

      // Floating animation for decorations
      gsap.to('.floating-element', {
        y: -15,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FEF8EA] via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />

      {/* Decorative Elements */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none">
        {/* Floating circles */}
        <div className="floating-element absolute top-20 left-10 w-20 h-20 rounded-full bg-[#8BD7EF]/20 blur-xl" />
        <div className="floating-element absolute top-40 right-20 w-32 h-32 rounded-full bg-[#E84B8A]/20 blur-2xl" />
        <div className="floating-element absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-[#C4E0A3]/20 blur-xl" />
        <div className="floating-element absolute bottom-20 right-1/3 w-16 h-16 rounded-full bg-[#E46E6E]/15 blur-lg" />

        {/* Stars */}
        <Sparkles className="floating-element absolute top-32 left-1/4 w-6 h-6 text-[#E84B8A] opacity-60" />
        <Sparkles className="floating-element absolute top-1/3 right-1/4 w-5 h-5 text-[#8BD7EF] opacity-50" />
        <Sparkles className="floating-element absolute bottom-1/3 left-1/3 w-4 h-4 text-[#C4E0A3] opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right order-2 lg:order-1 relative z-10" style={{ isolation: 'isolate' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#E84B8A] animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">جودة عالية - راحة فائقة</span>
            </div>

            {/* Main Title */}
            <h1
              ref={titleRef}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight"
              style={{ fontFamily: 'Fredoka, sans-serif', transform: 'none', fontStyle: 'normal' }}
            >
              حفاضات{' '}
              <span className="text-[#E84B8A] relative whitespace-nowrap">
                برنس بيبي
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="#E84B8A" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6"
              style={{ fontFamily: 'Fredoka, sans-serif', transform: 'none', fontStyle: 'normal' }}
            >
              راحة فائقة، حماية مثالية
            </p>

            {/* Description */}
            <p
              ref={descRef}
              className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl lg:mx-0 mx-auto leading-relaxed"
            >
              اكتشفوا تشكيلتنا الواسعة من الحفاضات والمناديل عالية الجودة المصممة خصيصاً
              لراحة طفلك وحماية بشرته الحساسة، بلمسة وطنية وجودة عالمية.
            </p>

            {/* CTA Buttons */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Button
                onClick={() => scrollToSection('#products')}
                className="bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold text-lg rounded-full px-8 py-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#E84B8A]/30 hover:scale-105"
              >
                اكتشف المنتجات
              </Button>
              <Button
                onClick={() => scrollToSection('#contact')}
                variant="outline"
                className="border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-800 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900 font-bold text-lg rounded-full px-8 py-6 transition-all duration-300"
              >
                تواصل معنا
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl lg:mx-0 mx-auto">
              {[
                { number: '11+', label: 'سنة ريادة' },
                { number: '2M+', label: 'مستهلك سعيد' },
                { number: '20', label: 'منتج وطني' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-right">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E84B8A] mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Content (3D Model) */}
          <div className="flex flex-col items-center justify-center order-2 -mt-4 sm:mt-0 lg:mt-0">
            <div className="relative w-full max-w-2xl h-[400px] sm:h-[450px] lg:h-auto mb-32 lg:mb-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E84B8A]/20 to-[#8BD7EF]/20 rounded-full blur-3xl animate-pulse" />

              <HeroDiaper3D size={diaperSize} />

              {/* Side Features Bar */}
              <div className="absolute right-4 sm:-right-4 lg:left-full lg:ml-8 lg:right-auto top-1/2 -translate-y-1/2 flex flex-col items-start gap-6 z-50">
                {[
                  { icon: ShieldCheck, title: 'الطبقة الخارجية', desc: 'نسيج قطني ناعم يحمي البشرة', color: '#E84B8A' },
                  { icon: Droplets, title: 'قلب الامتصاص', desc: 'جفاف تام لمدة 12 ساعة', color: '#8BD7EF' },
                  { icon: Zap, title: 'جوانب مطاطة', desc: 'مرونة تامة لحركة طفلك', color: '#C4E0A3' },
                ].map((feature, idx) => (
                  <div key={idx} className="group relative flex items-center justify-center w-12 h-12 cursor-pointer">
                    {/* The Emerging Label (Drawer effect towards the left/model) */}
                    <div className="absolute right-full mr-4 pointer-events-none z-0">
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[180px] sm:w-[220px] transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
                      >
                        <p className="text-[12px] font-bold text-gray-900 dark:text-white mb-1 leading-tight">{feature.title}</p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight whitespace-normal">{feature.desc}</p>
                        {/* Decorative Arrow */}
                        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white/95 dark:bg-gray-800/95 rotate-45 border-t border-r border-white/20" />
                      </motion.div>
                    </div>

                    {/* Fixed Icon Button (Anchor) */}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 relative z-10"
                      style={{
                        backgroundColor: feature.color,
                        boxShadow: `0 8px 20px ${feature.color}40`
                      }}
                    >
                      <feature.icon size={22} />
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Size Selector Controls */}
              <div className="absolute -bottom-8 lg:bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[95%] bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-1 sm:p-2 shadow-2xl flex items-center gap-1 sm:gap-2 border border-white/20 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDiaperSize(prev => Math.max(1, prev - 1))}
                  className="rounded-xl hover:bg-[#E84B8A]/20 text-[#E84B8A]"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <div className="flex gap-0.5 sm:gap-1 px-1 sm:px-4">
                  {[1, 2, 3, 4, 5, 6].map((it) => (
                    <button
                      key={it}
                      onClick={() => setDiaperSize(it)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ${diaperSize === it
                        ? 'bg-[#E84B8A] text-black scale-110 shadow-lg'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                      {it}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDiaperSize(prev => Math.min(6, prev + 1))}
                  className="rounded-xl hover:bg-[#E84B8A]/20 text-[#E84B8A]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>

              {/* Size Label */}
              <div className="absolute top-0 right-0 bg-[#E84B8A] text-black font-black px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base rounded-2xl shadow-xl rotate-6 animate-bounce">
                مقاس {diaperSize}
              </div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}
