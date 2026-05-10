import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Handshake } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const partners = [
    { name: 'هايبر شملان', initials: 'HS' },
    { name: 'سيتي ماكس', initials: 'CM' },
    { name: 'هايبر المستهلك', initials: 'HM' },
    { name: 'صيدليات المجتمع', initials: 'CP' },
    { name: 'أسواق الجند', initials: 'GA' },
    { name: 'توفير هايبر', initials: 'TH' },
    { name: 'المركز التجاري', initials: 'TC' },
    { name: 'المؤسسة العامة', initials: 'GE' },
];

export default function Partners() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.partner-logo',
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                    stagger: 0.08,
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
        <section ref={sectionRef} className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[#8BD7EF]/10 rounded-full px-4 py-2 mb-4">
                        <Handshake className="w-4 h-4 text-[#8BD7EF]" />
                        <span className="text-sm font-medium text-[#8BD7EF]">شركاؤنا</span>
                    </div>
                    <h2
                        className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3"
                        style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                        متوفر لدى <span className="text-[#E84B8A]">الجميع</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        منتجاتنا متوفرة في أشهر المتاجر والصيدليات
                    </p>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {partners.map((partner, index) => (
                        <div
                            key={index}
                            className="partner-logo flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-[#E84B8A]/10 dark:hover:bg-[#E84B8A]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#E84B8A] transition-colors">
                                    {partner.initials}
                                </span>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
