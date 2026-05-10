import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'سارة أحمد',
        role: 'أم لمنتصر (6 أشهر)',
        text: 'حفاضات رائعة جداً، لا تسبب أي حساسية ومنتصر ينام بعمق بفضل جفافها المستمر.',
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
        name: 'ليلى محمود',
        role: 'أم لمريم (سنة)',
        text: 'جربت ماركات كثيرة، لكن برنس بيبي هي الأفضل من حيث الامتصاص والنعومة على البشرة.',
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laila'
    },
    {
        name: 'نورة العتيبي',
        role: 'أم لفيصل (سنتين)',
        text: 'المناديل المبللة رائعة جداً ورائحتها زكية، والحفاضات تتحمل الحركة الكثيرة للصغار.',
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noura'
    }
];

export default function Testimonials() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.testimonial-card', {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="py-20 bg-[#FEF8EA] dark:bg-gray-800/50 transition-colors">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        ماذا تقول <span className="text-[#E84B8A]">الأمهات</span> عنا؟
                    </h2>
                    <div className="w-20 h-1.5 bg-[#E84B8A] mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="testimonial-card bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                        >
                            <Quote className="absolute -top-2 -right-2 w-16 h-16 text-[#E84B8A]/10 group-hover:text-[#E84B8A]/20 transition-colors" />

                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-[#E84B8A] text-[#E84B8A]" />
                                ))}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 italic leading-relaxed">
                                "{t.text}"
                            </p>

                            <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="w-14 h-14 rounded-full bg-[#8BD7EF]/20"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{t.name}</h4>
                                    <p className="text-sm text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
