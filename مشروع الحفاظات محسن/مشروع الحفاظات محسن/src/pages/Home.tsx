import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import HowItWorks from '@/sections/HowItWorks';
import Products from '@/sections/Products';
import OffersCountdown from '@/sections/OffersCountdown';
import Partners from '@/sections/Partners';
import SEO from '@/components/SEO';

// Lazy load the heavy 3D section - only loads when user scrolls near it
const Diaper3DSection = lazy(() => import('@/sections/Diaper3DSection'));

function LazySection({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before it's visible
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref}>
            {isVisible ? children : <div className="min-h-[60vh]" />}
        </div>
    );
}

export default function Home() {
    return (
        <>
            <SEO
                title="الرئيسية"
                description="برنس بيبي - عالم من الراحة والجودة الملكية لحفاضات ومناديل الأطفال."
            />
            <Hero />
            <About />
            <HowItWorks />
            <Products />
            <OffersCountdown />
            <LazySection>
                <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#E84B8A] border-t-transparent rounded-full animate-spin" /></div>}>
                    <Diaper3DSection />
                </Suspense>
            </LazySection>
            <Partners />
        </>
    );
}
