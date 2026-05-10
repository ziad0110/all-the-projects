import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: 'ما هي مقاسات الحفاضات المتوفرة؟',
    answer: 'نوفر حفاضات برنس بيبي بستة مقاسات: مقاس 1 (حديثي الولادة - 5 كجم)، مقاس 2 (صغير 3-6 كجم)، مقاس 3 (متوسط 4-9 كجم)، مقاس 4 (كبير 7-18 كجم)، مقاس 5 (كبير جداً 11-25 كجم)، ومقاس 6 (جامبو 16+ كجم). يمكنك استخدام دليل المقاسات لاختيار الأنسب.',
    category: 'المنتجات'
  },
  {
    question: 'هل منتجات برنس بيبي آمنة للبشرة الحساسة؟',
    answer: 'نعم، جميع منتجاتنا مصنوعة من مواد عالية الجودة وخالية من المواد الكيميائية الضارة مثل الكلور والبارابين والعطور الاصطناعية. تم اختبارها من قبل أطباء الأطفال ومناسبة للبشرة الحساسة.',
    category: 'الجودة'
  },
  {
    question: 'كم مرة يجب تغيير الحفاضة؟',
    answer: 'نوصي بتغيير الحفاضة كل 3-4 ساعات خلال النهار، أو فور تلوثها. أثناء النوم، يمكن للحفاضة أن تستمر حتى 8-10 ساعات بفضل تقنية الامتصاص الفائقة.',
    category: 'الاستخدام'
  },
  {
    question: 'أين يمكنني شراء منتجات برنس بيبي؟',
    answer: 'منتجاتنا متوفرة في جميع الصيدليات الكبرى ومحلات مستلزمات الأطفال، كما يمكنك الطلب أونلاين من خلال موقعنا الإلكتروني أو تطبيقات التوصيل.',
    category: 'الشراء'
  },
  {
    question: 'هل توفرون خدمة التوصيل للمنازل؟',
    answer: 'نعم، نوفر خدمة توصيل سريعة لجميع المدن. الطلبات تصل خلال 24-48 ساعة، والشحن مجاني للطلبات التي تزيد عن 200 ريال.',
    category: 'الشحن'
  },
  {
    question: 'ما هي سياسة الإرجاع؟',
    answer: 'يمكنك إرجاع المنتجات غير المفتوحة خلال 14 يوماً من تاريخ الشراء. في حالة وجود أي عيب مصنعي، نستبدل المنتج فوراً.',
    category: 'الشحن'
  }
];

const categories = ['الكل', 'المنتجات', 'الجودة', 'الاستخدام', 'الشراء', 'الشحن'];

function AnswerRating({ index }: { index: number }) {
  const [rating, setRating] = useState<'helpful' | 'not-helpful' | null>(() => {
    const saved = localStorage.getItem(`faq-rating-${index}`);
    return saved as 'helpful' | 'not-helpful' | null;
  });

  const handleRating = (type: 'helpful' | 'not-helpful') => {
    setRating(type);
    localStorage.setItem(`faq-rating-${index}`, type);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <span className="text-sm text-gray-500">هل كانت الإجابة مفيدة؟</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleRating('helpful')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            rating === 'helpful'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          نعم
        </button>
        <button
          onClick={() => handleRating('not-helpful')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            rating === 'not-helpful'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          لا
        </button>
      </div>
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(accordionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.2,
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
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #E84B8A 1px, transparent 0)`,
          backgroundSize: '45px 45px'
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-4xl">
        <div ref={headerRef} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#E84B8A]/10 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="w-4 h-4 text-[#E84B8A]" />
            <span className="text-sm font-medium text-[#E84B8A]">الأسئلة الشائعة</span>
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            أسئلة{' '}
            <span className="text-[#E84B8A]">متكررة</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            إليك إجابات على أكثر الأسئلة شيوعاً عن منتجاتنا وخدماتنا
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث في الأسئلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#E84B8A] focus:ring-[#E84B8A]"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#E84B8A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mb-4">
          {filteredFaqs.length} سؤال تم العثور عليه
        </p>

        <div ref={accordionRef}>
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-[#FEF8EA] dark:bg-gray-800 rounded-2xl border-none overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <AccordionTrigger className="px-6 py-5 text-right hover:no-underline group">
                  <span 
                    className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-[#E84B8A] transition-colors text-right flex-1"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                  >
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-right">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                  <AnswerRating index={index} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لم نجد نتائج مطابقة لبحثك</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('الكل'); }}
                className="mt-2 text-[#E84B8A] hover:underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            لم تجد إجابة لسؤالك؟
          </p>
          <a 
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-[#E84B8A] font-semibold hover:underline"
          >
            تواصل معنا
          </a>
        </div>
      </div>
    </section>
  );
}
