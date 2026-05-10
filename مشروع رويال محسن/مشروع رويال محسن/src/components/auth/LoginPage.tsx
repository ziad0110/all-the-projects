import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Eye, EyeOff, User, Truck, Shield, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/appStore';
import type { UserRole } from '@/types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, loginWithGoogle, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requireLocation, setRequireLocation] = useState(false);

  const roles: { id: UserRole; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: 'manager',
      label: 'مدير',
      icon: Shield,
      description: 'إدارة الشركة والمناديب'
    },
    {
      id: 'delivery',
      label: 'مندوب توصيل',
      icon: Truck,
      description: 'توصيل الطلبات للعملاء'
    },
    {
      id: 'customer',
      label: 'عميل',
      icon: User,
      description: 'طلب وشراء المنتجات'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('الرجاء اختيار نوع الحساب');
      return;
    }

    if (selectedRole === 'delivery' && !requireLocation) {
      setError('يجب تفعيل الموقع كإلزامي للمناديب');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        onNavigate('dashboard');
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setError('الرجاء اختيار نوع الحساب أولاً');
      return;
    }
    setIsLoading(true);
    try {
      const success = await loginWithGoogle(selectedRole);
      if (success) {
        onNavigate('dashboard');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول بواسطة Google');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-muted-foreground">تسجيل الدخول إلى حسابك</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-royal p-8"
        >
          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-foreground mb-3 block">اختر نوع الحساب</Label>
            <div className="grid grid-cols-3 gap-3">
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
                className="text-primary/70 text-sm mt-2 text-center"
              >
                {roles.find(r => r.id === selectedRole)?.description}
              </motion.p>
            )}
          </div>

          {/* Location Requirement for Delivery */}
          {selectedRole === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
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
                  <p className="text-amber-500/70 text-xs mt-2">
                    يجب تفعيل الموقع لمتابعة عملك كمندوب توصيل
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-background/50 border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground mb-2 block">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-muted-foreground text-sm cursor-pointer">
                  تذكرني
                </Label>
              </div>
              <button type="button" className="text-primary text-sm hover:underline">
                نسيت كلمة المرور؟
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold hover:shadow-lg hover:shadow-amber-500/30"
            >
              {isLoading ? (
                <div className="loading-spinner mx-auto" />
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          {selectedRole !== 'manager' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-500/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 border-gray-200 flex items-center justify-center gap-3 font-medium transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                تسجيل الدخول بواسطة Google
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-primary hover:underline"
              >
                سجل الآن
              </button>
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
