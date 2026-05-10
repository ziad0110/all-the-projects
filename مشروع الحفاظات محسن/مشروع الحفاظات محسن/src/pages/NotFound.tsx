import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Home, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF8EA] via-white to-[#E84B8A]/5 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
            <SEO title="الصفحة غير موجودة" description="الصفحة التي تبحث عنها غير موجودة." />

            <div className="text-center max-w-lg">
                {/* Crown decoration */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 rounded-full bg-[#E84B8A]/10 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-[#E84B8A]/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Crown className="w-16 h-16 text-[#E84B8A]" />
                    </div>
                </div>

                {/* Error number */}
                <h1
                    className="text-8xl md:text-9xl font-black text-[#E84B8A] mb-4"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    404
                </h1>

                {/* Message */}
                <h2
                    className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                    عذراً، يبدو أن هذه الصفحة ضاعت في عالم الحفاضات! 👶
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <Button className="bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold rounded-full px-8 py-6 text-lg transition-all hover:shadow-xl hover:shadow-[#E84B8A]/30 hover:scale-105">
                            <Home className="w-5 h-5 ml-2" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                    <Link to="/products">
                        <Button variant="outline" className="border-2 border-gray-800 dark:border-gray-300 text-gray-800 dark:text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900 font-bold rounded-full px-8 py-6 text-lg transition-all">
                            تصفح المنتجات
                            <ArrowRight className="w-5 h-5 mr-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
