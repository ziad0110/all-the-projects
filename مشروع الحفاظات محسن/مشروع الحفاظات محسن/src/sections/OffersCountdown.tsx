import { useState, useEffect } from 'react';
import { Timer, Zap, Gift, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

interface Offer {
    id: number;
    title: string;
    description: string;
    originalPrice: number;
    discountPrice: number;
    discountPercent: number;
    color: string;
    icon: typeof Gift;
    endDate: Date;
}

const offers: Offer[] = [
    {
        id: 101,
        title: 'عرض العائلة الكبيرة',
        description: '3 عبوات حفاضات مقاس 3 + عبوة مناديل مبللة مجانية',
        originalPrice: 19000,
        discountPrice: 14500,
        discountPercent: 24,
        color: '#E84B8A',
        icon: Gift,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
        id: 102,
        title: 'عرض المولود الجديد',
        description: 'مجموعة كاملة: حفاضات مقاس 1 + مقاس 2 + كريم حفاضة',
        originalPrice: 13000,
        discountPrice: 9900,
        discountPercent: 24,
        color: '#8BD7EF',
        icon: Zap,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
        id: 103,
        title: 'عرض نهاية الشهر',
        description: 'خصم 30% على جميع منتجات العناية بالبشرة',
        originalPrice: 10000,
        discountPrice: 7000,
        discountPercent: 30,
        color: '#C4E0A3',
        icon: Percent,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
];

function CountdownTimer({ endDate }: { endDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = endDate.getTime() - Date.now();
        if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const timeUnits = [
        { value: timeLeft.days, label: 'يوم' },
        { value: timeLeft.hours, label: 'ساعة' },
        { value: timeLeft.minutes, label: 'دقيقة' },
        { value: timeLeft.seconds, label: 'ثانية' }
    ];

    return (
        <div className="flex gap-2 justify-center">
            {timeUnits.map((unit, i) => (
                <div key={i} className="text-center">
                    <div className="bg-white dark:bg-gray-900 rounded-xl px-2 sm:px-3 py-2 shadow-md min-w-[2.5rem] sm:min-w-[3.5rem]">
                        <span className="text-lg sm:text-xl font-black text-gray-800 dark:text-gray-100 tabular-nums">
                            {String(unit.value).padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function OffersCountdown() {
    const { addItem } = useCart();

    const handleAddOffer = (offer: Offer) => {
        addItem({ id: offer.id, name: offer.title, price: offer.discountPrice, color: offer.color });
        toast.success(`تم إضافة ${offer.title} إلى السلة!`);
    };

    return (
        <section className="relative py-24 bg-gradient-to-br from-[#E84B8A]/5 via-white to-[#8BD7EF]/5 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#E84B8A]/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#8BD7EF]/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                <Gift className="w-[500px] h-[500px]" />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-full px-4 py-2 mb-6">
                        <Timer className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-500">عروض لفترة محدودة!</span>
                    </div>
                    <h2
                        className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
                        style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                        عروض <span className="text-[#E84B8A]">حصرية</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        استفيدي من عروضنا المميزة قبل انتهاء الوقت!
                    </p>
                </div>

                {/* Offers Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                        >
                            {/* Top color bar */}
                            <div className="h-2" style={{ backgroundColor: offer.color }} />

                            <div className="p-6">
                                {/* Discount Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${offer.color}20` }}
                                    >
                                        <offer.icon className="w-6 h-6" style={{ color: offer.color }} />
                                    </div>
                                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                        -{offer.discountPercent}%
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3
                                    className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-right"
                                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                                >
                                    {offer.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-right">
                                    {offer.description}
                                </p>

                                {/* Pricing */}
                                <div className="flex items-center justify-end gap-3 mb-4">
                                    <span className="text-gray-400 line-through text-lg">{offer.originalPrice} ر.ي</span>
                                    <span className="text-2xl font-black text-[#E84B8A]">{offer.discountPrice} ر.ي</span>
                                </div>

                                {/* Countdown */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">ينتهي العرض خلال:</p>
                                    <CountdownTimer endDate={offer.endDate} />
                                </div>

                                {/* CTA */}
                                <Button
                                    onClick={() => handleAddOffer(offer)}
                                    className="w-full rounded-full py-5 font-bold text-black transition-all hover:shadow-lg"
                                    style={{ backgroundColor: offer.color }}
                                >
                                    اطلب الآن
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
