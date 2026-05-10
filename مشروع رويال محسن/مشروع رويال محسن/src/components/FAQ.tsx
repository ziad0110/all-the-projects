import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'المنتجات',
        question: 'ما الذي يميز سجائر رويال عن غيرها؟',
        answer: 'تتميز سجائر رويال باستخدام أجود أنواع التبغ العالمية المختارة بعناية، مع عملية تصنيع دقيقة تضمن نكهة غنية ومذاقاً ناعماً وفريداً يلبي تطلعات أصحاب الذوق الرفيع.',
    },
    {
        category: 'التوصيل',
        question: 'كم يستغرق التوصيل داخل صنعاء؟',
        answer: 'نحن نلتزم بتوصيل طلباتكم خلال ساعتين فقط داخل المناطق الرئيسية في صنعاء. نوفر خدمة تتبع مباشرة لتعرف موقع المندوب لحظة بلحظة.',
    },
    {
        category: 'الطلبات',
        question: 'هل توفرون خدمة طلبات الجملة؟',
        answer: 'نعم، نوفر أسعاراً تنافسية ودعماً مخصصاً لعملاء الجملة والموزعين. يمكنك التواصل معنا مباشرة عبر صفحة "تواصل معنا" لمناقشة التفاصيل.',
    },
    {
        category: 'الجودة',
        question: 'كيف يمكنني التأكد من أصالة منتجات رويال؟',
        answer: 'جميع منتجاتنا تأتي بختم الجودة الأصلي وبتغليف محكم يحمل علامة رويال التجارية. كما ننصح دائماً بالشراء من الوكلاء المعتمدين أو عبر موقعنا الرسمي.',
    },
    {
        category: 'الدفع',
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'نوفر عدة خيارات للدفع تشمل الدفع عند الاستلام، والتحويلات المالية عبر الشبكات المحلية المعتمدة في اليمن.',
    },
];

export function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="relative py-24 w-full overflow-hidden min-h-[80vh] flex flex-col justify-center">
            <div className="absolute inset-0 bg-royal-gradient opacity-50" />

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8"
                    >
                        <HelpCircle className="w-6 h-6 text-amber-500" />
                        <span className="text-amber-400 text-base font-medium">كل ما تود معرفته عن رويال</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-bold text-gold-gradient font-['Playfair_Display'] mb-6 tracking-tight">
                        الأسئلة الشائعة
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed opacity-80">
                        إجابات شاملة حول منتجاتنا، خدمات التوصيل في صنعاء، وكيفية الحصول على أفضل تجربة ملكية تليق بك
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className={`w-full text-right p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col gap-4 group relative overflow-hidden ${activeIndex === index
                                    ? 'bg-amber-500/[0.08] border-amber-500/40 shadow-2xl shadow-amber-500/10 backdrop-blur-md'
                                    : 'bg-card/40 border-primary/20 hover:border-amber-500/40 hover:bg-amber-500/[0.03] backdrop-blur-sm'
                                    }`}
                            >
                                {/* Decorative Gradient on Hover/Active */}
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'group-hover:opacity-100'}`} />

                                <div className="flex items-center justify-between w-full relative z-10">
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                                            {faq.category}
                                        </span>
                                        <h3 className={`text-xl md:text-2xl font-bold transition-all duration-300 ${activeIndex === index ? 'text-amber-400' : 'text-foreground group-hover:text-amber-200/90'
                                            }`}>
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center transition-all duration-500 ${activeIndex === index ? 'bg-amber-500 border-amber-500 text-black rotate-180 shadow-lg shadow-amber-500/30' : 'text-amber-500 group-hover:bg-amber-500/10'}`}>
                                        <ChevronDown className="w-6 h-6" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="overflow-hidden relative z-10"
                                        >
                                            <div className="pt-6 border-t border-amber-500/20 mt-4">
                                                <p className="text-muted-foreground text-lg md:text-xl leading-[1.8] opacity-90">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Support CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 p-12 rounded-[3.5rem] bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent border border-amber-500/20 text-center relative overflow-hidden backdrop-blur-xl shadow-2xl"
                >
                    <div className="absolute -top-10 -right-10 opacity-5 rotate-12 pointer-events-none">
                        <Crown className="w-64 h-64 text-amber-500" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-4xl font-bold text-gold-gradient mb-4 font-['Playfair_Display']">لم تجد إجابتك؟</h3>
                        <p className="text-muted-foreground text-xl mb-10 max-w-xl mx-auto opacity-80">
                            فريق الدعم الملكي متواجد دائماً لمساعدتك وضمان حصولك على الخدمة التي تليق بفخامتك
                        </p>
                        <Button
                            className="btn-royal text-lg px-12 py-7 h-auto rounded-full hover:scale-105 transition-transform"
                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        >
                            تواصل معنا الآن
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
