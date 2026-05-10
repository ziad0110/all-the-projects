import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load all pages
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Products = lazy(() => import('@/pages/Products'));
const Tips = lazy(() => import('@/pages/Tips'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Contact = lazy(() => import('@/pages/Contact'));
const SizeGuide = lazy(() => import('@/pages/SizeGuide'));
const Blog = lazy(() => import('@/pages/Blog'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function AppRoutes() {
    const location = useLocation();

    return (
        <Layout>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
                        <Route path="/tips" element={<PageTransition><Tips /></PageTransition>} />
                        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
                        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                        <Route path="/size-guide" element={<PageTransition><SizeGuide /></PageTransition>} />
                        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                    </Routes>
                </AnimatePresence>
            </Suspense>
        </Layout>
    );
}
