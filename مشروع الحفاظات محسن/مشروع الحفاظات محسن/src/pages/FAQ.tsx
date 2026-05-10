import FAQSection from '@/sections/FAQ';
import SEO from '@/components/SEO';

export default function FAQ() {
    return (
        <div className="pb-12">
            <SEO
                title="الأسئلة الشائعة"
                description="إجابات على الأسئلة الشائعة حول حفاضات ومنتجات برنس بيبي."
            />
            <FAQSection />
        </div>
    );
}
