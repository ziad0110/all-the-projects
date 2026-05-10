import ProductsSection from '@/sections/Products';
import SEO from '@/components/SEO';

export default function Products() {
    return (
        <div className="pb-12">
            <SEO
                title="المنتجات"
                description="استعرض تشكيلتنا من حفاضات برنس بيبي والمناديل المبللة بمختلف المقاسات."
            />
            <ProductsSection />
        </div>
    );
}
