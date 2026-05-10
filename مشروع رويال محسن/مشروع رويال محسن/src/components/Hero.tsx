import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Crown, ChevronDown, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { theme } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [particles, setParticles] = useState<{ x: number; y: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    const timer = setTimeout(() => setParticles(newParticles), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/photo_2026-02-06_21-03-31.jpg')`,
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark'
          ? 'from-black/70 via-black/40 to-transparent'
          : 'from-black/40 via-transparent to-transparent'
          }`} />
      </motion.div>

      {/* Animated Particles */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/50 rounded-full"
            initial={{
              x: p.x,
              y: p.y,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 text-center px-4 max-w-6xl mx-auto pt-28"
      >
        {/* Crown Icon (Positioned directly below Navbar) */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 100 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <Crown className="w-16 h-16 text-amber-500 mx-auto" strokeWidth={1.5} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1" />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -bottom-1 -left-1" />
            </motion.div>
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4">
            <span className="text-gold-gradient font-['Playfair_Display'] tracking-wider">
              ROYAL
            </span>
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent max-w-md mx-auto"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl text-amber-200/80 mb-4 font-light tracking-wide"
        >
          Tobacco Company
        </motion.p>

        {/* Arabic Title */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-2xl sm:text-3xl md:text-4xl text-amber-400 mb-8 font-bold"
        >
          شركة رويال للتبغ
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          تجربة فاخرة في عالم التبغ، حيث الجودة تلتقي بالتميز
          <br />
          <span className="text-primary/70">A luxurious experience in the world of tobacco</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={() => onNavigate('products')}
            className="btn-royal flex items-center gap-2 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>اكتشف منتجاتنا</span>
          </motion.button>

          <motion.button
            onClick={() => onNavigate('about')}
            className="px-8 py-4 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-all duration-300 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            تعرف علينا
          </motion.button>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 flex justify-center gap-8"
        >
          {['white', 'red'].map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + index * 0.2 }}
              whileHover={{ scale: 1.1, y: -10 }}
              className="relative group cursor-pointer"
              onClick={() => onNavigate('products')}
            >
              <div className="w-16 h-24 md:w-20 md:h-32 rounded-lg overflow-hidden shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500 border border-amber-500/20">
                <img
                  src={type === 'white' ? '/images/white/photo_2026-02-06_21-03-41.jpg' : '/images/red/photo_2026-02-06_21-03-37.jpg'}
                  alt={`Royal ${type}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-sm text-amber-500/70">Royal {type === 'white' ? 'White' : 'Red'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-primary/50 text-sm">Scroll</span>
          <ChevronDown className="w-6 h-6 text-primary/50" />
        </motion.div>
      </motion.div>

      {/* Side Decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              className="w-2 h-2 rounded-full bg-amber-500/30"
            />
          ))}
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              className="w-2 h-2 rounded-full bg-amber-500/30"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
