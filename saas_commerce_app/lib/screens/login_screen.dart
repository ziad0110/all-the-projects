import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/widgets/royal_widgets.dart';
import 'package:saas_commerce_app/screens/customer_dashboard.dart';
import 'package:saas_commerce_app/screens/admin_dashboard.dart';
import 'package:saas_commerce_app/screens/driver_dashboard.dart';
import 'package:saas_commerce_app/services/auth_service.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:google_fonts/google_fonts.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final auth = context.read<AuthService>();
    final success = await auth.login(
      _usernameController.text,
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (success) {
      if (mounted) {
        final role = auth.currentUser?.role;
        Widget nextScreen;
        if (role == 'admin') {
          nextScreen = const AdminDashboard();
        } else if (role == 'driver') {
          nextScreen = const DriverDashboard();
        } else {
          nextScreen = const CustomerDashboard();
        }

        Navigator.of(
          context,
        ).pushReplacement(MaterialPageRoute(builder: (_) => nextScreen));
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('بيانات الدخول غير صحيحة')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل الدخول')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.lock_person,
                      size: 80,
                      color: theme.primaryColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'مرحباً بك مجدداً',
                      style: GoogleFonts.almarai(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'سجل دخولك للمتابعة',
                      style: GoogleFonts.almarai(
                        color: theme.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              AppTextField(
                label: 'اسم المستخدم',
                hint: 'أدخل اسم المستخدم',
                icon: Icons.person,
                controller: _usernameController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال اسم المستخدم' : null,
              ),
              const SizedBox(height: 24),
              AppTextField(
                label: 'كلمة المرور',
                hint: 'أدخل كلمة المرور',
                icon: Icons.lock,
                isPassword: true,
                controller: _passwordController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال كلمة المرور' : null,
              ),
              const SizedBox(height: 32),
              if (_isLoading)
                Center(
                  child: CircularProgressIndicator(color: theme.primaryColor),
                )
              else
                AppButton(text: 'دخول', onPressed: _handleLogin),
              const SizedBox(height: 16),
              const Center(
                child: Text('أو', style: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 16),
              AppButton(
                text: 'تصفح كزائر',
                isPrimary: false,
                icon: Icon(Icons.shopping_cart, color: theme.primaryColor),
                onPressed: () {
                  context.read<AuthService>().loginAsGuest();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) => const CustomerDashboard(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 40),
              Center(
                child: Column(
                  children: [
                    const Text(
                      'ليس لديك حساب؟',
                      style: TextStyle(color: Colors.grey),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: Text(
                        '📝 إنشاء حساب جديد',
                        style: TextStyle(color: theme.primaryColor),
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        '🚗 سجل كمندوب توصيل',
                        style: TextStyle(color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
