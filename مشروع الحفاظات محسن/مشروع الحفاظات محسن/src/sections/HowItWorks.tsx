import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Droplets, Shield, Wind, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const layers = [
    {
        icon: Sparkles,
        title: 'الطبقة الخارجية الناعمة',
        description: 'نسيج قطني فائق النعومة يوفر ملمساً لطيفاً على بشرة طفلك',
        color: '#E84B8A',
        step: 1
    },
    {
        icon: Droplets,
        title: 'طبقة التوزيع السريع',
        description: 'توزع السوائل بسرعة وبشكل متساوٍ لمنع التجمع في نقطة واحدة',
        color: '#8BD7EF',
        step: 2
    },
    {
        icon: Layers,
        title: 'قلب الامتصاص الفائق',
        description: 'حبيبات SAP تحول السائل إلى جل وتحتفظ به لمنع الرجوع للبشرة',
        color: '#C4E0A3',
        step: 3
    },
    {
        icon: Shield,
        title: 'حواجز التسرب الجانبية',
        description: 'حواجز مرنة مزدوجة تمنع التسرب حتى أثناء حركة الطفل النشطة',
        color: '#E46E6E',
        step: 4
    },
    {
        icon: Wind,
        title: 'الطبقة الخارجية المسامية',
        description: 'تسمح بمرور الهواء وتمنع مرور السوائل لبشرة جافة ومريحة',
        color: '#E84B8A',
        step: 5
    }
];

export default function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.layer-card',
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #C4E0A3 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#C4E0A3]/10 rounded-full px-4 py-2 mb-6">
                        <Layers className="w-4 h-4 text-[#C4E0A3]" />
                        <span className="text-sm font-medium text-[#C4E0A3]">التقنية</span>
                    </div>
                    <h2
                        className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
                        style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                        كيف تعمل <span className="text-[#E84B8A]">حفاضاتنا؟</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        5 طبقات متطورة تعمل معاً لتوفير حماية مثالية تدوم حتى 12 ساعة
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual Side */}
                    <div className="flex justify-center order-2 lg:order-1">
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#8BD7EF]/20 to-transparent rounded-full blur-3xl animate-pulse" />
                            <div className="relative space-y-4">
                                {layers.slice(0).reverse().map((layer, idx) => (
                                    <div
                                        key={idx}
                                        className="h-12 rounded-3xl blur-[1px] opacity-60 transform hover:scale-105 transition-transform duration-500 hover:blur-none hover:opacity-100 cursor-help"
                                        style={{
                                            backgroundColor: layer.color,
                                            width: `${100 - (idx * 5)}%`,
                                            marginRight: 'auto',
                                            marginLeft: 'auto'
                                        }}
                                    />
                                ))}
                                <div className="pt-8 text-center">
                                    <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl rotate-3">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">هيكل متطور بـ 5 طبقات</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Side */}
                    <div className="relative order-1 lg:order-2">
                        {/* Vertical Line */}
                        <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E84B8A] via-[#8BD7EF] to-[#C4E0A3] hidden sm:block" />

                        <div className="space-y-6">
                            {layers.map((layer) => (
                                <div
                                    key={layer.step}
                                    className="layer-card flex items-start gap-6 relative"
                                >
                                    {/* Step indicator */}
                                    <div
                                        className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                                        style={{ backgroundColor: `${layer.color}15`, border: `2px solid ${layer.color}` }}
                                    >
                                        <layer.icon className="w-7 h-7" style={{ color: layer.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className="text-xs font-bold px-2 py-1 rounded-full"
                                                style={{ backgroundColor: `${layer.color}20`, color: layer.color }}
                                            >
                                                الطبقة {layer.step}
                                            </span>
                                        </div>
                                        <h3
                                            className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 text-right group-hover:text-[#E84B8A] transition-colors"
                                            style={{ fontFamily: 'Fredoka, sans-serif' }}
                                        >
                                            {layer.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-right">
                                            {layer.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
