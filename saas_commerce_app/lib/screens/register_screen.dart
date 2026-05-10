import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/widgets/royal_widgets.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(title: const Text('إنشاء حساب جديد')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Column(
                  children: [
                    Icon(Icons.person_add, size: 80, color: theme.primaryColor),
                    const SizedBox(height: 16),
                    Text(
                      'إنشاء حساب جديد',
                      style: GoogleFonts.almarai(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'أدخل بياناتك للتسجيل',
                      style: GoogleFonts.almarai(
                        color: theme.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              AppTextField(
                label: 'الاسم الكامل',
                hint: 'أدخل اسمك الكامل',
                icon: Icons.person,
                controller: _nameController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال الاسم' : null,
              ),
              const SizedBox(height: 24),
              AppTextField(
                label: 'رقم الهاتف',
                hint: 'أدخل رقم الهاتف',
                icon: Icons.phone,
                controller: _phoneController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال رقم الهاتف' : null,
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
              AppButton(
                text: 'إنشاء حساب',
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تم إنشاء الحساب بنجاح')),
                    );
                    Navigator.pop(context);
                  }
                },
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'لديك حساب؟ سجل دخولك',
                    style: TextStyle(color: theme.primaryColor),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
