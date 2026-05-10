import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Baby, Droplets, Shield, Sun, Clock, CheckCircle2, ChevronDown, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const tips = [
  {
    icon: Clock,
    title: 'تغيير الحفاضة بانتظام',
    description: 'قم بتغيير حفاضة طفلك كل 3-4 ساعات أو فور تلوثها.',
    reasoning: 'التغيير المتكرر يمنع تراكم الرطوبة والأمونيا التي تسبب تهيج البشرة والطفح الجلدي البكتيري.',
    routineTime: 'كل 3 ساعات',
    color: '#8BD7EF'
  },
  {
    icon: Shield,
    title: 'استخدام كريم الحماية',
    description: 'طِبقي طبقة رقيقة من كريم الحفاضة في كل تغيير.',
    reasoning: 'يعمل الكريم كحاجز وقائي يمنع ملامسة الفضلات مباشرة لبشرة الطفل الحساسة، مما يقلل الاحتكاك.',
    routineTime: 'عند التغيير',
    color: '#C4E0A3'
  },
  {
    icon: Droplets,
    title: 'تنظيف البشرة بلطف',
    description: 'استخدمي مناديل مبللة ناعمة أو ماء دافئ وقطن.',
    reasoning: 'المسح اللطيف يحافظ على الزيوت الطبيعية للبشرة. تجنبي الفرك القوي لمنع حدوث التسلخات.',
    routineTime: 'أثناء التنظيف',
    color: '#E84B8A'
  },
  {
    icon: Sun,
    title: 'ترك البشرة تتنفس',
    description: 'اتركي بشرة طفلك مكشوفة لبعض الوقت يومياً للتهوية.',
    reasoning: 'الهواء الطبيعي هو أفضل وسيلة لعلاج ومنع الطفح الجلدي، حيث يجفف الرطوبة المحبوسة بشكل طبيعي.',
    routineTime: 'وقت القيلولة',
    color: '#E46E6E'
  },
  {
    icon: Baby,
    title: 'اختيار المقاس المناسب',
    description: 'تأكدي من اختيار مقاس الحفاضة المناسب لوزن طفلك.',
    reasoning: 'المقاس الصغير يضغط على الدورة الدموية، والمقاس الكبير يسبب التسرب. الوزن هو المقياس الأدق.',
    routineTime: 'مرة شهرياً',
    color: '#8BD7EF'
  }
];

export default function Tips() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tips"
      className="relative py-24 overflow-hidden bg-gradient-to-b from-[#FEF8EA] to-white dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left Column: Doctor Profile & Routine */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-8">
            {/* Dr. Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-[#E84B8A]/5 border border-pink-50/50 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF8EA] dark:bg-pink-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

              <div className="relative z-10 text-right">
                <div className="flex items-center justify-end gap-3 mb-6">
                  <div className="text-right">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">د. سارة المنصور</h4>
                    <p className="text-xs text-[#E84B8A] font-bold">استشارية طب الأطفال</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E84B8A] to-[#E84B8A]/80 flex items-center justify-center shadow-lg transform rotate-3">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic mb-6">
                  "بشرة طفلك هي خط الدفاع الأول، والعناية بها اليوم تعني راحة وتطوراً صحياً غداً. هذه النصائح هي ركائز الروتين اليومي المثالي."
                </p>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-end gap-2 text-green-600 font-bold text-xs">
                    <span>موثق طبياً بنسبة 100%</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Routine Mini Timeline */}
            <div className="bg-[#E84B8A]/5 rounded-3xl p-8 border border-[#E84B8A]/20">
              <h5 className="text-sm font-bold text-gray-500 mb-6 text-right uppercase tracking-widest">الروتين اليومي المقترح</h5>
              <div className="space-y-6">
                {tips.slice(0, 4).map((tip, i) => (
                  <div key={i} className="flex items-center gap-4 flex-row-reverse">
                    <div className="w-2 h-2 rounded-full bg-[#E84B8A]" />
                    <div className="flex-1 text-right">
                      <p className="text-[10px] font-bold text-[#E84B8A] mb-0.5">{tip.routineTime}</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{tip.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tips Content & Accordion */}
          <div className="w-full lg:w-2/3">
            <div ref={headerRef} className="text-right mb-12">
              <div className="inline-flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 text-[#E84B8A] rounded-full px-4 py-2 mb-6">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Verified by Experts</span>
              </div>

              <h2
                className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-6 leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                الدليل الطبي للعناية <br />
                <span className="text-[#E84B8A]">ببشرة ملكنا الصغير</span>
              </h2>

              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl ml-auto leading-relaxed">
                نحن نهتم بأدق التفاصيل. إليكِ القواعد الطبية الذهبية لضمان بشرة جافة، صحية، وخالية تماماً من الالتهابات.
              </p>
            </div>

            <div className="space-y-4">
              {tips.map((tip, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className={`bg-white dark:bg-gray-800 rounded-3xl transition-all duration-300 cursor-pointer border-2 ${isExpanded ? 'border-[#E84B8A]/30' : 'border-transparent hover:border-pink-100 dark:hover:border-gray-700'} shadow-lg shadow-[#E84B8A]/[0.02]`}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 flex-row-reverse">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${tip.color}15` }}
                        >
                          <tip.icon className="w-7 h-7" style={{ color: tip.color }} />
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                            {tip.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{tip.description}</p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#E84B8A]' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 mt-6 border-t border-gray-50 dark:border-gray-700 text-right">
                              <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-[#E84B8A] uppercase mb-3">
                                <span>التفسير الطبي</span>
                                <Stethoscope className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-pink-50/50 dark:bg-pink-900/10 p-4 rounded-2xl">
                                {tip.reasoning}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
