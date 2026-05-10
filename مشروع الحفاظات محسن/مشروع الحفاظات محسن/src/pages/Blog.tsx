import { useState } from 'react';
import { Baby, Clock, Newspaper, Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    color: string;
    icon: typeof Baby;
    image: string;
    content: string[];
}

const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: 'كيف تختارين الحفاضة المناسبة لطفلك؟',
        excerpt: 'دليل شامل لاختيار الحفاضة الأنسب بناءً على عمر ووزن طفلك ونوع بشرته.',
        category: 'نصائح الأمهات',
        readTime: '5 دقائق',
        date: '2024-12-15',
        color: '#E84B8A',
        icon: Baby,
        image: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?auto=format&fit=crop&q=80&w=800',
        content: [
            'يجب أن تكون الحفاضة مناسبة لوزن طفلك وليس عمره. راجعي دليل المقاسات لمعرفة المقاس الأنسب.',
            'تأكدي من أن الحفاضة لا تترك علامات حمراء على بشرة طفلك - هذا يعني أن المقاس صغير.',
            'اختاري حفاضات خالية من العطور والمواد الكيميائية الضارة لحماية البشرة الحساسة.',
            'جربي ماركات مختلفة حتى تجدي الأنسب لطفلك - كل طفل فريد!'
        ]
    },
    {
        id: 2,
        title: '7 علامات تدل على حاجة طفلك لتغيير مقاس الحفاضة',
        excerpt: 'تعرفي على العلامات التي تدل على أن طفلك يحتاج لمقاس أكبر من الحفاضات.',
        category: 'العناية بالطفل',
        readTime: '4 دقائق',
        date: '2024-12-10',
        color: '#8BD7EF',
        icon: Baby,
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800',
        content: [
            'تسرب متكرر رغم التغيير المنتظم - علامة واضحة على الحاجة لمقاس أكبر.',
            'علامات حمراء على الفخذين أو الخصر - الحفاضة ضيقة جداً.',
            'صعوبة في إغلاق اللاصق - حان وقت الانتقال للمقاس التالي.',
            'عدم راحة الطفل وبكاءه المستمر قد يكون بسبب ضيق الحفاضة.'
        ]
    },
    {
        id: 3,
        title: 'الفرق بين أنواع الحفاضات وتقنيات الامتصاص',
        excerpt: 'شرح مفصل لتقنيات الامتصاص المختلفة وكيف تؤثر على راحة طفلك.',
        category: 'تعليمي',
        readTime: '6 دقائق',
        date: '2024-12-05',
        color: '#C4E0A3',
        icon: Newspaper,
        image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ff67?auto=format&fit=crop&q=80&w=800',
        content: [
            'تقنية الامتصاص الفائق تحول السائل إلى جل، مما يحافظ على جفاف البشرة.',
            'الطبقة الداخلية الناعمة تحمي بشرة الطفل من التهيج والرطوبة.',
            'حواجز التسرب الجانبية تمنع التسرب حتى أثناء الحركة الكثيرة.',
            'حفاضات برنس بيبي تستخدم أحدث تقنيات الامتصاص لحماية تدوم حتى 12 ساعة.'
        ]
    },
    {
        id: 4,
        title: 'العناية ببشرة الطفل في فصل الشتاء',
        excerpt: 'نصائح ذهبية للحفاظ على بشرة طفلك ناعمة ومحمية خلال أشهر الشتاء الباردة.',
        category: 'العناية بالطفل',
        readTime: '4 دقائق',
        date: '2024-11-28',
        color: '#E46E6E',
        icon: Baby,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
        content: [
            'استخدمي مرطب خاص بالأطفال بعد كل حمام للحفاظ على رطوبة البشرة.',
            'قللي من عدد مرات الاستحمام في الشتاء - مرتين إلى ثلاث مرات أسبوعياً تكفي.',
            'اختاري ملابس قطنية ناعمة لتجنب تهيج البشرة.',
            'غيري الحفاضة فوراً عند البلل لمنع التهيج الذي يزداد في الطقس البارد.'
        ]
    },
    {
        id: 5,
        title: 'متى يبدأ التدريب على استخدام الحمام؟',
        excerpt: 'دليلك الشامل لمعرفة الوقت المناسب للبدء في تدريب طفلك على الحمام.',
        category: 'نصائح الأمهات',
        readTime: '7 دقائق',
        date: '2024-11-20',
        color: '#E84B8A',
        icon: Clock,
        image: 'https://images.unsplash.com/photo-1563212693-0248873752e2?auto=format&fit=crop&q=80&w=800',
        content: [
            'معظم الأطفال يكونون جاهزين بين عمر سنتين وثلاث سنوات.',
            'علامات الاستعداد: يخبرك عندما تكون الحفاضة مبللة، يمكنه الجلوس بثبات.',
            'لا تستعجلي - كل طفل يتعلم بوتيرته الخاصة.',
            'استخدمي حفاضات التدريب كمرحلة انتقالية بين الحفاضات والملابس الداخلية.'
        ]
    },
    {
        id: 6,
        title: 'أفضل ممارسات تخزين الحفاضات',
        excerpt: 'كيف تحافظين على جودة الحفاضات والمناديل المبللة لأطول فترة ممكنة.',
        category: 'تعليمي',
        readTime: '3 دقائق',
        date: '2024-11-15',
        color: '#8BD7EF',
        icon: Newspaper,
        image: 'https://images.unsplash.com/photo-1614859324967-bdf471bba561?auto=format&fit=crop&q=80&w=800',
        content: [
            'خزني الحفاضات في مكان جاف وبارد بعيداً عن أشعة الشمس المباشرة.',
            'أغلقي عبوة المناديل المبللة بإحكام بعد كل استخدام لمنع الجفاف.',
            'لا تخزني الحفاضات في الحمام - الرطوبة تؤثر على جودة الامتصاص.',
            'تحققي دائماً من تاريخ الصلاحية قبل الاستخدام.'
        ]
    }
];

const categories = ['الكل', 'نصائح الأمهات', 'العناية بالطفل', 'تعليمي'];

export default function Blog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [expandedPost, setExpandedPost] = useState<number | null>(null);

    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.includes(searchQuery) || post.excerpt.includes(searchQuery);
        const matchesCategory = selectedCategory === 'الكل' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen pt-8 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <SEO
                title="المدونة"
                description="مقالات ونصائح متخصصة في العناية بالأطفال والحفاضات من برنس بيبي."
            />
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[#E84B8A]/10 rounded-full px-4 py-2 mb-6">
                        <Newspaper className="w-4 h-4 text-[#E84B8A]" />
                        <span className="text-sm font-medium text-[#E84B8A]">مدونة برنس بيبي</span>
                    </div>
                    <h1
                        className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4"
                        style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                        نصائح ومقالات <span className="text-[#E84B8A]">للأمهات</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                        كل ما تحتاجين معرفته عن العناية بطفلك وصحته
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="ابحث في المقالات..."
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
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-[#E84B8A] text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                        >
                            {/* Header Bar */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1.5"
                                    style={{ backgroundColor: post.color }}
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                    <post.icon className="w-5 h-5" style={{ color: post.color }} />
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Category & Date */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className="text-xs font-bold px-3 py-1 rounded-full"
                                        style={{ backgroundColor: `${post.color}20`, color: post.color }}
                                    >
                                        {post.category}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3
                                    className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 text-right leading-relaxed group-hover:text-[#E84B8A] transition-colors"
                                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                                >
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-right leading-relaxed">
                                    {post.excerpt}
                                </p>

                                {/* Expanded Content */}
                                {expandedPost === post.id && (
                                    <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-4">
                                        {post.content.map((paragraph, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-right">
                                                <span className="text-[#E84B8A] mt-1 text-lg">•</span>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{paragraph}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Read More */}
                                <Button
                                    variant="ghost"
                                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                    className="w-full rounded-full text-[#E84B8A] hover:bg-[#E84B8A]/10 font-medium"
                                >
                                    {expandedPost === post.id ? 'إخفاء' : 'اقرأ المزيد'}
                                    <ChevronLeft className={`w-4 h-4 mr-1 transition-transform ${expandedPost === post.id ? 'rotate-90' : ''}`} />
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">لم نجد مقالات مطابقة لبحثك</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('الكل'); }}
                            className="mt-2 text-[#E84B8A] hover:underline"
                        >
                            إعادة ضبط البحث
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
