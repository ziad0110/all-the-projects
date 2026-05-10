import { useEffect, useRef } from 'react';
import Diaper3D from '@/components/3d/Diaper3D';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Diaper3DSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title on scroll
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
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
      id="diaper-3d"
      className="relative min-h-screen bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #E84B8A 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Title Section */}
      <div ref={titleRef} className="relative z-10 pt-24 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E84B8A]/10 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-medium text-[#E84B8A]">تقنية مبتكرة</span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          تعرف على حفاضة{' '}
          <span className="text-[#E84B8A]">برنس بيبي</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-4">
          اضغط على البطاقات لاكتشاف طبقات الحفاضة المبتكرة المصممة لأقصى درجات الحماية.
        </p>
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-[#8BD7EF]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-[#C4E0A3]/10 rounded-full blur-3xl" />

      <div className="hidden md:block absolute top-1/2 left-20 -translate-y-1/2 space-y-8 z-20">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-3xl shadow-xl transform -rotate-6 border border-white/20">
          <div className="text-xs font-bold text-[#8BD7EF] mb-1">حمـاية</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">12 سـاعة جفاف</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-3xl shadow-xl transform rotate-3 border border-white/20 ml-12">
          <div className="text-xs font-bold text-[#E84B8A] mb-1">رااحة</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">جوانـب مطاطة</div>
        </div>
      </div>

      {/* Flip Cards */}
      <div className="relative z-10 min-h-[60vh] flex items-center">
        <Diaper3D />
      </div>
    </section>
  );
}
