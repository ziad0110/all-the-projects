import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/widgets/royal_widgets.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class DriverRegisterScreen extends StatefulWidget {
  const DriverRegisterScreen({super.key});

  @override
  State<DriverRegisterScreen> createState() => _DriverRegisterScreenState();
}

class _DriverRegisterScreenState extends State<DriverRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _areaController = TextEditingController();
  final _idNumberController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _areaController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(title: const Text('التسجيل كمندوب')),
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
                    Icon(
                      Icons.local_shipping,
                      size: 80,
                      color: theme.primaryColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'التسجيل كمندوب توصيل',
                      style: GoogleFonts.almarai(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'انضم لفريق التوصيل',
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
                label: 'منطقة التوصيل',
                hint: 'أدخل منطقة التوصيل الخاصة بك',
                icon: Icons.location_on,
                controller: _areaController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال المنطقة' : null,
              ),
              const SizedBox(height: 24),
              AppTextField(
                label: 'رقم الهوية',
                hint: 'أدخل رقم الهوية',
                icon: Icons.badge,
                controller: _idNumberController,
                validator: (v) => v!.isEmpty ? 'يرجى إدخال رقم الهوية' : null,
              ),
              const SizedBox(height: 32),
              AppButton(
                text: 'إرسال طلب التسجيل',
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'تم إرسال طلب التسجيل بنجاح، سيتم التواصل معك قريباً',
                        ),
                      ),
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
                    'العودة لتسجيل الدخول',
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
