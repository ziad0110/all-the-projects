import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Eye, EyeOff, User, Truck, MapPin, ArrowLeft, Phone, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/appStore';
import type { UserRole } from '@/types';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { register, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [requireLocation, setRequireLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles: { id: UserRole; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: 'customer',
      label: 'عميل',
      icon: User,
      description: 'طلب وشراء المنتجات'
    },
    {
      id: 'delivery',
      label: 'مندوب توصيل',
      icon: Truck,
      description: 'توصيل الطلبات للعملاء (يتطلب موافقة)'
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('الصورة كبيرة جداً. الحد الأقصى 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!selectedRole) {
        setError('الرجاء اختيار نوع الحساب');
        return;
      }
      setStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (!agreeTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return;
    }

    // Role specific validation
    if (selectedRole === 'delivery' && !requireLocation) {
      setError('يجب تفعيل الموقع كإلزامي للمناديب');
      return;
    }

    if (selectedRole === 'delivery' && !formData.phone) {
      setError('رقم الهاتف مطلوب للمناديب');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: selectedRole!,
        password: formData.password,
        avatar: formData.avatar || undefined,
      });

      if (success) {
        if (selectedRole === 'delivery') {
          setRegistrationSuccess(true);
        } else {
          onNavigate('dashboard');
        }
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-royal-gradient">
        <div className="relative z-10 w-full max-w-md px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-royal p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gold-gradient mb-4">تم إرسال طلبك!</h2>
            <p className="text-muted-foreground mb-8">
              شكراً لتسجيلك كمندوب. حسابك الآن قيد المراجعة من قبل الإدارة. سيتم إشعارك فور الموافقة عليه.
            </p>
            <Button
              onClick={() => onNavigate('home')}
              className="w-full bg-primary text-black font-bold"
            >
              العودة للرئيسية
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-royal-gradient opacity-90" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <Crown className="w-16 h-16 text-amber-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gold-gradient font-['Playfair_Display'] mb-2">
            ROYAL TOBACCO
          </h1>
          <p className="text-muted-foreground">إنشاء حساب جديد</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-royal p-8"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-black' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm">نوع الحساب</span>
            </div>
            <div className="w-12 h-px bg-muted" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-black' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm">البيانات</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-foreground mb-3 block">اختر نوع الحساب</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <motion.button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-4 rounded-xl border transition-all ${selectedRole === role.id
                            ? 'border-amber-500 bg-amber-500/20'
                            : 'border-amber-500/20 hover:border-amber-500/50'
                            }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <IconComponent className={`w-6 h-6 mx-auto mb-2 ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          <span className={`text-xs ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {role.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {selectedRole && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-primary/70 text-sm mt-3 text-center"
                    >
                      {roles.find(r => r.id === selectedRole)?.description}
                    </motion.p>
                  )}
                </div>

                {selectedRole === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-foreground text-sm font-medium mb-2">متطلبات المندوب</p>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="location"
                            checked={requireLocation}
                            onCheckedChange={(checked) => setRequireLocation(checked as boolean)}
                          />
                          <Label htmlFor="location" className="text-muted-foreground text-sm cursor-pointer">
                            أوافق على تفعيل الموقع إلزامياً
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/20">
                      <Label className="text-foreground text-sm font-medium mb-2 block">صورتك الشخصية</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {formData.avatar ? 'تغيير الصورة' : 'اختيار صورة'}
                        </Button>
                        {formData.avatar && (
                          <motion.img
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            src={formData.avatar}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold"
                >
                  التالي
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 block">الاسم الكامل</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="محمد أحمد"
                    className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 block">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary"
                    required
                  />
                </div>

                {selectedRole === 'delivery' && (
                  <div>
                    <Label htmlFor="phone" className="text-foreground mb-2 block">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary pr-10"
                        placeholder="+966 50 123 4567"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="password" title="password" className="text-foreground mb-2 block">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" title="confirmPassword" className="text-foreground mb-2 block">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-muted-foreground text-sm cursor-pointer">
                    أوافق على الشروط والأحكام
                  </Label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold"
                  >
                    {isLoading ? (
                      <div className="loading-spinner mx-auto" />
                    ) : (
                      'إنشاء الحساب'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center mt-4"
              >
                {error}
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-primary font-medium hover:underline"
              >
                سجل دخولك
              </button>
            </p>
          </div>
        </motion.div>

        <div className="mt-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
