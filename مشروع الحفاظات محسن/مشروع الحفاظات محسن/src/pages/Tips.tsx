import TipsSection from '@/sections/Tips';
import SEO from '@/components/SEO';

export default function Tips() {
    return (
        <div className="pb-12">
            <SEO
                title="نصائح طبية"
                description="نصائح طبية وإرشادات للعناية ببشرة طفلك وصحته."
            />
            <TipsSection />
        </div>
    );
}
