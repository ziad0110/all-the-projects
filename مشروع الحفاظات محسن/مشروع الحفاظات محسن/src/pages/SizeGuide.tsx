import { useState, useMemo } from 'react';
import { Baby } from 'lucide-react';
import SEO from '@/components/SEO';

interface SizeInfo {
    size: number;
    label: string;
    weight: string;
    minWeight: number;
    maxWeight: number;
    count: number;
    price: string;
    ageRange: string;
    emoji: string;
}

const sizes: SizeInfo[] = [
    { size: 1, label: 'حديثي الولادة', weight: '2-5 كجم', minWeight: 2, maxWeight: 5, count: 42, price: '45 ر.س', ageRange: '0-3 أشهر', emoji: '👶' },
    { size: 2, label: 'صغير', weight: '3-6 كجم', minWeight: 3, maxWeight: 6, count: 40, price: '50 ر.س', ageRange: '3-6 أشهر', emoji: '👶' },
    { size: 3, label: 'متوسط', weight: '4-9 كجم', minWeight: 4, maxWeight: 9, count: 36, price: '55 ر.س', ageRange: '6-12 شهر', emoji: '🧒' },
    { size: 4, label: 'كبير', weight: '7-18 كجم', minWeight: 7, maxWeight: 18, count: 32, price: '60 ر.س', ageRange: '1-2 سنة', emoji: '🧒' },
    { size: 5, label: 'كبير جداً', weight: '11-25 كجم', minWeight: 11, maxWeight: 25, count: 28, price: '65 ر.س', ageRange: '2-3 سنوات', emoji: '🧒' },
    { size: 6, label: 'جامبو', weight: '16+ كجم', minWeight: 16, maxWeight: 35, count: 24, price: '70 ر.س', ageRange: '3+ سنوات', emoji: '👦' },
];

export default function SizeGuide() {
    const [weight, setWeight] = useState<number>(5);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);

    const recommended = useMemo(() => {
        return sizes.find(s => weight >= s.minWeight && weight <= s.maxWeight) || sizes[sizes.length - 1];
    }, [weight]);

    const activeSize = selectedSize !== null ? sizes.find(s => s.size === selectedSize)! : recommended;

    return (
        <div className="min-h-screen pt-8 pb-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" dir="rtl">
            <SEO
                title="دليل المقاسات"
                description="اختر المقاس المناسب لطفلك - أدخل الوزن فقط وسنختار لك."
            />
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Simplified Header */}
                <div className="text-center mb-8">
                    <Baby className="w-10 h-10 text-[#E84B8A] mx-auto mb-3" />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        دليل المقاسات الذكي
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">حدد وزن طفلك وسنكشف لك عن المقاس المثالي فوراً</p>
                </div>

                {/* Unified Interactive Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-6 md:p-10 mb-10 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    {/* Background Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E84B8A]/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl group-hover:opacity-100 transition-opacity" />

                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                        {/* Right Side: Weight Selection (Arabic RTL) */}
                        <div className="order-1 lg:order-2 flex flex-col justify-center">
                            <div className="text-center mb-10">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">وزن الطفـل الحالي</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl text-gray-400 mb-2">كجم</span>
                                    <span className="text-7xl md:text-8xl font-black text-[#E84B8A] transition-all duration-300 transform scale-100 hover:scale-105 inline-block">{weight}</span>
                                </div>
                            </div>

                            <div className="relative px-2">
                                <input
                                    type="range"
                                    min={2}
                                    max={35}
                                    step={0.5}
                                    value={weight}
                                    onChange={(e) => { setWeight(parseFloat(e.target.value)); setSelectedSize(null); }}
                                    className="w-full h-4 rounded-full appearance-none cursor-pointer bg-gray-100 dark:bg-gray-700"
                                    style={{
                                        background: `linear-gradient(to right, #e5e7eb ${100 - ((weight - 2) / 33) * 100}%, #E84B8A ${100 - ((weight - 2) / 33) * 100}%)`,
                                    }}
                                />
                                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-4 px-1">
                                    <span>2 كجم</span>
                                    <span>35+ كجم</span>
                                </div>
                            </div>
                        </div>

                        {/* Left Side: Dynamic Result */}
                        <div className="order-2 lg:order-1 lg:border-l lg:border-gray-100 lg:dark:border-gray-700 lg:pl-12">
                            <div className="bg-gradient-to-br from-[#E84B8A]/10 to-transparent rounded-[2rem] p-8 text-center border-2 border-[#E84B8A]/20 transform hover:scale-[1.02] transition-transform duration-500">
                                <span className="inline-block px-4 py-1.5 bg-[#E84B8A] text-white text-[10px] font-bold rounded-full mb-4 shadow-lg shadow-[#E84B8A]/20">المقاس الموصى به</span>

                                <div className="flex flex-col items-center">
                                    <div className="text-8xl md:text-9xl font-black text-[#E84B8A] leading-none mb-4 drop-shadow-sm">{activeSize.size}</div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{activeSize.label}</h2>
                                    <div className="h-px w-12 bg-gray-200 dark:bg-gray-700 my-4" />
                                    <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">{activeSize.emoji} {activeSize.ageRange}</span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">📦 {activeSize.count} حفاضة</span>
                                    </div>
                                    <div className="mt-6 text-xl font-black text-[#E84B8A]">
                                        {activeSize.price}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary: Manual Grid */}
                <div className="mb-6">
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">أو اختر مقاسك يدوياً</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {sizes.map((s) => {
                            const isActive = activeSize.size === s.size;
                            return (
                                <button
                                    key={s.size}
                                    onClick={() => setSelectedSize(s.size)}
                                    className={`relative py-5 px-2 rounded-[1.5rem] text-center transition-all duration-300 border-2 ${isActive
                                        ? 'bg-[#E84B8A] border-[#E84B8A] text-white shadow-xl shadow-[#E84B8A]/25 -translate-y-1'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#E84B8A]/30'
                                        }`}
                                >
                                    <div className="text-2xl mb-1.5">{s.emoji}</div>
                                    <div className={`text-xl font-black ${isActive ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{s.size}</div>
                                    <div className={`text-[10px] font-medium leading-tight mt-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>{s.weight}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Helpful Tip */}
                <div className="flex items-start gap-4 bg-[#8BD7EF]/10 p-5 rounded-2xl border border-[#8BD7EF]/20">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-bold">
                        نصيحة الخبراء: إذا كان وزن طفلك على الحدود الفاصلة بين مقاسين، ننصحك دائماً باختيار المقاس الأكبر لضمان أقصى درجات الراحة وحرية الحركة لطفلك.
                    </p>
                </div>
            </div>

            {/* Custom range slider styles */}
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #E84B8A;
                    cursor: pointer;
                    border: 4px solid white;
                    box-shadow: 0 2px 10px rgba(232, 75, 138, 0.4);
                    transition: transform 0.2s;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #E84B8A;
                    cursor: pointer;
                    border: 4px solid white;
                    box-shadow: 0 2px 10px rgba(232, 75, 138, 0.4);
                }
            `}</style>
        </div>
    );
}
