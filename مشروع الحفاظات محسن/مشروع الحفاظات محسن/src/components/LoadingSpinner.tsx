import { Crown } from 'lucide-react';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-[#E84B8A]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E84B8A] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-[#E84B8A]" />
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">جاري التحميل...</p>
            </div>
        </div>
    );
}
