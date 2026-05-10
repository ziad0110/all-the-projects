import React from 'react';
import Header from '@/sections/Header';
import Footer from '@/sections/Footer';
import NotificationBar from '@/components/NotificationBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <NotificationBar />
            <Header />
            <main id="main-content" role="main" className="pt-20">
                {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <BackToTop />
        </div>
    );
};

export default Layout;
