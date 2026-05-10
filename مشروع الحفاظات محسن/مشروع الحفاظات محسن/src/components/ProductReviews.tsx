import { useState, useMemo } from 'react';
import { Star, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Review {
    id: string;
    productId: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
}

const REVIEWS_KEY = 'prince-baby-reviews';

function loadReviews(): Review[] {
    try {
        const stored = localStorage.getItem(REVIEWS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveReviews(reviews: Review[]) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

interface ProductReviewsProps {
    productId: number;
    productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [reviewVersion, setReviewVersion] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const reviews = useMemo(() => {
        void reviewVersion;
        return loadReviews().filter(r => r.productId === productId);
    }, [productId, reviewVersion]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        const newReview: Review = {
            id: Date.now().toString(),
            productId,
            name: name.trim(),
            rating,
            comment: comment.trim(),
            date: new Date().toLocaleDateString('ar-SA')
        };

        const allReviews = loadReviews();
        allReviews.unshift(newReview);
        saveReviews(allReviews);
        setReviewVersion(v => v + 1);

        setName('');
        setComment('');
        setRating(5);
        setShowForm(false);
        toast.success('شكراً لك! تم إضافة تقييمك بنجاح');
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-100">
                    التقييمات ({reviews.length})
                </h4>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#E84B8A] text-[#E84B8A]" />
                        <span className="font-bold text-gray-800 dark:text-gray-100">{averageRating}</span>
                    </div>
                )}
            </div>

            {reviews.length > 0 && (
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#E84B8A]/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-[#E84B8A]" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{review.name}</span>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < review.rating ? 'fill-[#E84B8A] text-[#E84B8A]' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-right">{review.comment}</p>
                            <span className="text-xs text-gray-400 mt-1 block">{review.date}</span>
                        </div>
                    ))}
                </div>
            )}

            {!showForm ? (
                <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                    className="w-full rounded-full text-sm"
                >
                    اكتب تقييمك لـ {productName}
                </Button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in slide-in-from-top-4">
                    <Input
                        placeholder="اسمك"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl text-right text-sm"
                    />

                    <div className="flex items-center gap-1 justify-center" dir="ltr">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-6 h-6 transition-colors ${star <= (hoveredStar || rating)
                                            ? 'fill-[#E84B8A] text-[#E84B8A]'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <Textarea
                        placeholder="شاركنا تجربتك مع هذا المنتج..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="rounded-xl text-right text-sm min-h-[80px] resize-none"
                    />

                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-[#E84B8A] hover:bg-[#e5a338] text-black rounded-full text-sm">
                            <Send className="w-4 h-4 ml-1" />
                            إرسال
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-full text-sm">
                            إلغاء
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
