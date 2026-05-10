import AboutSection from '@/sections/About';
import Testimonials from '@/components/Testimonials';
import SEO from '@/components/SEO';

export default function About() {
    return (
        <div className="pb-12">
            <SEO
                title="من نحن"
                description="تعرف على قصة برنس بيبي ورسالتنا في تقديم أفضل رعاية لطفلك."
            />
            <AboutSection />
            <Testimonials />
        </div>
    );
}
