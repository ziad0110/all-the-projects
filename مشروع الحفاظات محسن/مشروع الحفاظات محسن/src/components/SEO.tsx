import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
}

export default function SEO({ title, description, image, url, type = 'website' }: SEOProps) {
    const location = useLocation();
    const fullTitle = `${title} | برنس بيبي`;
    const siteUrl = window.location.origin;
    const currentUrl = url || `${siteUrl}${location.pathname}`;
    const ogImage = image || `${siteUrl}/og-image.png`;

    useEffect(() => {
        // Title
        document.title = fullTitle;

        // Meta description
        updateMeta('description', description);

        // Open Graph
        updateMeta('og:title', fullTitle, 'property');
        updateMeta('og:description', description, 'property');
        updateMeta('og:image', ogImage, 'property');
        updateMeta('og:url', currentUrl, 'property');
        updateMeta('og:type', type, 'property');
        updateMeta('og:site_name', 'برنس بيبي', 'property');
        updateMeta('og:locale', 'ar_YE', 'property');

        // Twitter Card
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', fullTitle);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', ogImage);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', currentUrl);

        // JSON-LD Structured Data
        const existingJsonLd = document.querySelector('script[data-seo="json-ld"]');
        if (existingJsonLd) existingJsonLd.remove();

        const jsonLd = document.createElement('script');
        jsonLd.setAttribute('type', 'application/ld+json');
        jsonLd.setAttribute('data-seo', 'json-ld');
        jsonLd.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'برنس بيبي',
            url: siteUrl,
            logo: `${siteUrl}/favicon.ico`,
            description: 'أفضل حفاضات ومناديل للأطفال بجودة ملكية',
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+967736499765',
                email: 'ziyad.alzuhairy@gmail.com',
                contactType: 'customer service',
                areaServed: 'YE',
                availableLanguage: ['Arabic', 'English']
            },
            sameAs: [
                'https://facebook.com/princebaby',
                'https://instagram.com/princebaby',
                'https://twitter.com/princebaby'
            ]
        });
        document.head.appendChild(jsonLd);

        return () => {
            const script = document.querySelector('script[data-seo="json-ld"]');
            if (script) script.remove();
        };
    }, [fullTitle, description, ogImage, currentUrl, type, siteUrl]);

    return null;
}

function updateMeta(name: string, content: string, attribute: string = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}
