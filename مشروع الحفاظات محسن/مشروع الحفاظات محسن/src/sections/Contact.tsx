import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  {
    icon: MapPin,
    title: 'العنوان',
    content: 'صنعاء، الجمهورية اليمنية',
    color: '#8BD7EF'
  },
  {
    icon: Phone,
    title: 'رقم الهاتف',
    content: '+967 736 499 765',
    color: '#C4E0A3'
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    content: 'ziyad.alzuhairy@gmail.com',
    color: '#E84B8A'
  },
  {
    icon: Clock,
    title: 'ساعات العمل',
    content: 'الأحد - الخميس: 9 ص - 6 م',
    color: '#E46E6E'
  }
];

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate form
      gsap.fromTo(formRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate info
      gsap.fromTo(infoRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate contact cards
      gsap.fromTo('.contact-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setIsSubmitted(true);
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 bg-[#FEF8EA] dark:bg-gray-900 overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-[#E84B8A]/10 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[#8BD7EF]/10 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Send className="w-4 h-4 text-[#E84B8A]" />
            <span className="text-sm font-medium text-[#E84B8A]">تواصل معنا</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            نحن هنا{' '}
            <span className="text-[#E84B8A]">للمساعدة</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            تواصل معنا للاستفسارات أو الطلبات، فريقنا جاهز لمساعدتك
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <div ref={formRef}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h3
                className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-right"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                أرسل رسالتك
              </h3>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#C4E0A3] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">تم الإرسال بنجاح!</h4>
                  <p className="text-gray-600 dark:text-gray-400">سنتواصل معك في أقرب وقت</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-right text-gray-700 dark:text-gray-300 font-medium mb-2">
                      الاسم
                    </label>
                    <Input
                      type="text"
                      placeholder="أدخل اسمك"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-right rounded-xl py-6 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-[#E84B8A] focus:ring-[#E84B8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-right text-gray-700 dark:text-gray-300 font-medium mb-2">
                      البريد الإلكتروني
                    </label>
                    <Input
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-right rounded-xl py-6 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-[#E84B8A] focus:ring-[#E84B8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-right text-gray-700 dark:text-gray-300 font-medium mb-2">
                      الرسالة
                    </label>
                    <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="text-right rounded-xl min-h-[140px] border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-[#E84B8A] focus:ring-[#E84B8A] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold rounded-full py-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#E84B8A]/30"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الرسالة
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div ref={infoRef}>
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="contact-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${info.color}20` }}
                  >
                    <info.icon className="w-6 h-6" style={{ color: info.color }} />
                  </div>
                  <h4
                    className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                  >
                    {info.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    {info.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Google Maps */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121747.12839498498!2d44.14639367812786!3d15.369445446029566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db31834c6305%3A0x5db5b822b7004295!2sSanaa%2C%20Yemen!5e0!3m2!1sar!2s!4v1700000000000!5m2!1sar!2s"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع برنس بيبي على الخريطة"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
