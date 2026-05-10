import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function ThemeToggle() {
    const { theme, toggleTheme } = useAppStore();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={theme === 'dark' ? 'التبديل للوضع النهارى' : 'التبديل للوضع الليلى'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180, scale: theme === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Moon className="w-5 h-5" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? -180 : 0, scale: theme === 'dark' ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
            >
                <Sun className="w-5 h-5" />
            </motion.div>
        </motion.button>
    );
}
