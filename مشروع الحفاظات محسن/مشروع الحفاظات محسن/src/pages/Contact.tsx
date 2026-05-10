import ContactSection from '@/sections/Contact';
import SEO from '@/components/SEO';

export default function Contact() {
    return (
        <div className="pb-12">
            <SEO
                title="تواصل معنا"
                description="تواصل مع فريق برنس بيبي للاستفسارات والطلبات."
            />
            <ContactSection />
        </div>
    );
}
