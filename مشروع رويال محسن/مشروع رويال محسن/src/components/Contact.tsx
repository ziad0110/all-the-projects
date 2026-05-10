import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Facebook,
    Instagram,
    Twitter,
    MessageCircle,
    Clock,
    CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const contactIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export function Contact() {
    const { companyInfo } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    const contactDetails = [
        {
            icon: MapPin,
            label: 'المقر الرئيسي',
            value: companyInfo.headquarters,
            color: 'bg-blue-500/10 text-blue-500',
        },
        {
            icon: Phone,
            label: 'اتصل بنا',
            value: companyInfo.phone,
            color: 'bg-green-500/10 text-green-500',
        },
        {
            icon: Mail,
            label: 'البريد الإلكتروني',
            value: companyInfo.email,
            color: 'bg-amber-500/10 text-amber-500',
        },
        {
            icon: Clock,
            label: 'ساعات العمل',
            value: 'السبت - الخميس: 9:00 ص - 10:00 م',
            color: 'bg-purple-500/10 text-purple-500',
        },
    ];

    return (
        <section className="relative py-24 w-full overflow-hidden min-h-screen flex flex-col justify-center">
            <div className="absolute inset-0 bg-royal-gradient opacity-50" />

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8"
                    >
                        <MessageCircle className="w-6 h-6 text-amber-500" />
                        <span className="text-amber-400 text-base font-medium">نحن هنا لخدمتكم على مدار الساعة</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-bold text-gold-gradient font-['Playfair_Display'] mb-6 tracking-tight">
                        تواصل معنا
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed opacity-80">
                        يسعدنا استقبال استفساراتكم واقتراحاتكم. فريق رويال متاح دائماً لخدمتكم بأسلوب يليق بفخامتكم في قلب صنعاء
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Contact Info & Form */}
                    <div className="space-y-10">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {contactDetails.map((detail, index) => {
                                const IconComp = detail.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="bg-card/40 border-primary/20 h-full backdrop-blur-md hover:border-amber-500/40 transition-all duration-500 group rounded-[2rem] overflow-hidden shadow-xl">
                                            <CardContent className="p-8">
                                                <div className={`w-14 h-14 rounded-2xl ${detail.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                                    <IconComp className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">{detail.label}</h4>
                                                <p className="text-xl font-bold text-foreground leading-tight">{detail.value}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <Card className="bg-card/60 border-primary/20 backdrop-blur-2xl shadow-2xl rounded-[3rem] overflow-hidden">
                            <CardContent className="p-10 md:p-12">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-500/10 shadow-2xl">
                                            <CheckCircleIcon className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground mb-4">شكرًا لتواصلك معنا!</h3>
                                        <p className="text-muted-foreground text-xl">لقد تم استلام رسالتك الملكية بنجاح. سنقوم بالرد عليك في أقرب وقت متاح.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest mr-2">الاسم الكامل</label>
                                                <Input
                                                    placeholder="أدخل اسمك الكريم"
                                                    className="bg-background/40 border-primary/30 py-7 text-lg rounded-2xl focus:border-amber-500/50"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                                                <Input
                                                    type="email"
                                                    placeholder="example@mail.com"
                                                    className="bg-background/40 border-primary/30 py-7 text-lg rounded-2xl focus:border-amber-500/50"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-muted-foreground uppercase tracking-widest mr-2">الموضوع</label>
                                            <Input
                                                placeholder="بخصوص ماذا تود مراسلتنا؟"
                                                className="bg-background/40 border-primary/30 py-7 text-lg rounded-2xl focus:border-amber-500/50"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-muted-foreground uppercase tracking-widest mr-2">الرسالة</label>
                                            <Textarea
                                                placeholder="اكتب رسالتك وتفاصيل استفسارك هنا بكل رحابة صدر..."
                                                className="bg-background/40 border-primary/30 min-h-[200px] text-lg rounded-2xl focus:border-amber-500/50 p-6"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full btn-royal py-8 text-xl rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-amber-500/20"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    إرسال الرسالة الآن
                                                    <Send className="w-6 h-6" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map & Social */}
                    <div className="space-y-12 h-full lg:sticky lg:top-24">
                        <Card className="bg-card/40 border-primary/20 overflow-hidden min-h-[500px] lg:h-[calc(100vh-25rem)] p-0 rounded-[3.5rem] shadow-2xl relative border-2 border-amber-500/10 group">
                            <div className="absolute top-8 right-8 z-20">
                                <div className="bg-background/90 backdrop-blur-md px-6 py-3 rounded-full border border-amber-500/20 shadow-2xl flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-amber-500 animate-bounce" />
                                    <span className="text-base font-bold text-foreground">مقرنا الرئيسي في صنعاء</span>
                                </div>
                            </div>

                            <MapContainer
                                center={[15.3694, 44.1910]}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                className="z-10 grayscale hover:grayscale-0 transition-all duration-1000"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[15.3694, 44.1910]} icon={contactIcon}>
                                    <Popup className="royal-popup text-lg font-bold">
                                        رويال للتبغ - فخر الصناعة اليمنية
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </Card>

                        <div className="flex flex-col items-center gap-6">
                            <h4 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] opacity-80">تابعنا على وسائل التواصل</h4>
                            <div className="flex justify-center gap-8">
                                {[
                                    { icon: Facebook, href: '#', label: 'فيسبوك', color: 'hover:bg-blue-600/20 hover:text-blue-500 hover:border-blue-500/50' },
                                    { icon: Instagram, href: '#', label: 'انستقرام', color: 'hover:bg-pink-600/20 hover:text-pink-500 hover:border-pink-500/50' },
                                    { icon: Twitter, href: '#', label: 'تويتر', color: 'hover:bg-sky-600/20 hover:text-sky-500 hover:border-sky-500/50' },
                                    { icon: MessageCircle, href: '#', label: 'واتساب', color: 'hover:bg-green-600/20 hover:text-green-500 hover:border-green-500/50' },
                                ].map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href={social.href}
                                        aria-label={social.label}
                                        className={`w-16 h-16 rounded-2xl bg-card/40 border border-primary/20 flex items-center justify-center text-muted-foreground transition-all duration-500 backdrop-blur-md ${social.color}`}
                                        whileHover={{ scale: 1.1, y: -8, rotate: 8 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <social.icon className="w-8 h-8" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
