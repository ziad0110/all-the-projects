import { useState, useEffect } from 'react';
import { X, Sparkles, Timer, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotificationBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    // Auto-collapse after 8 seconds to be less intrusive
    const collapseTimer = setTimeout(() => {
      setIsCollapsed(true);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(collapseTimer);
    };
  }, []);

  if (!isVisible) return null;

  // Collapsed: small floating badge at bottom-right
  if (isCollapsed) {
    return (
      <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="group flex items-center gap-2 bg-gradient-to-r from-[#E84B8A] to-[#E46E6E] text-white rounded-full px-4 py-3 shadow-2xl hover:shadow-[#E84B8A]/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm">خصم 20%</span>
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -left-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Expanded: floating card at bottom-right (not blocking the top)
  return (
    <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-80 max-w-80 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-[#E84B8A]/20">
        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#E84B8A] to-[#E46E6E]" />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E84B8A]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#E84B8A] animate-pulse" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-sm">عرض خاص!</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Offer text */}
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3 text-right">
            وفّر <span className="text-[#E84B8A] font-black text-lg">20%</span> على كل الطلبات اليوم!
          </p>

          {/* Countdown */}
          <div className="flex items-center gap-2 justify-center mb-3">
            <Timer className="w-4 h-4 text-[#E46E6E]" />
            <div className="flex gap-1">
              {[
                { val: timeLeft.hours, label: 'ساعة' },
                { val: timeLeft.minutes, label: 'دقيقة' },
                { val: timeLeft.seconds, label: 'ثانية' }
              ].map((unit, i) => (
                <div key={i} className="text-center">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-mono font-bold text-sm px-2 py-1 rounded-lg">
                    {String(unit.val).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href="/products"
            className="block w-full text-center bg-gradient-to-r from-[#E84B8A] to-[#E46E6E] text-white py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-[#E84B8A]/30 transition-all hover:scale-[1.02]"
          >
            تسوّق الآن 🛒
          </a>
        </div>
      </div>
    </div>
  );
}
