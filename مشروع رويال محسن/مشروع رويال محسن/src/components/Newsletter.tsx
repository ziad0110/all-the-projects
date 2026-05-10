import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="relative py-20 overflow-hidden">
            {/* Background with subtle glow */}
            <div className="absolute inset-0 bg-background/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-amber-500/5 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-5xl mx-auto px-4">
                <div className="card-royal p-8 md:p-12 border-amber-500/20 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
                    {/* Decorative Sparkles */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-24 -right-24 opacity-20 pointer-events-none"
                    >
                        <Sparkles className="w-48 h-48 text-amber-500" />
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Mail className="w-6 h-6 text-amber-500" />
                                </div>
                                <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">النشرة الإخبارية</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Playfair_Display']">
                                انضم إلى عالم رويال <span className="text-gold-gradient">الحصري</span>
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                كن أول من يعلم عن تشكيلاتنا الفاخرة الجديدة، العروض الحصرية، وآخر أخبار شركة رويال في صنعاء.
                            </p>
                        </div>

                        <div className="relative">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">شكراً لانضمامك!</h3>
                                    <p className="text-muted-foreground">ستصلك رسائلنا الملكية قريباً.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative group/input">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="بريدك الإلكتروني"
                                            className="h-14 bg-background/50 border-primary/20 text-foreground placeholder:text-muted-foreground pr-4 pl-12 rounded-xl focus:border-amber-500/50 transition-all text-right"
                                            dir="rtl"
                                            required
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-amber-500 transition-colors" />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full h-14 btn-royal rounded-xl text-lg font-bold group"
                                    >
                                        {status === 'loading' ? (
                                            <div className="loading-spinner" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                اشترك الآن
                                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-gray-500 mt-4">
                                        * نعدك بعدم إرسال رسائل مزعجة. يمكنك إلغاء الاشتراك في أي وقت.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
