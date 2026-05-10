import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/shared_widgets.dart';

class CustomerLoginScreen extends StatefulWidget {
  const CustomerLoginScreen({super.key});
  @override
  State<CustomerLoginScreen> createState() => _CustomerLoginScreenState();
}

class _CustomerLoginScreenState extends State<CustomerLoginScreen> {
  bool _showOtp = false;

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              ShaderMask(
                shaderCallback: (b) => AppColors.primaryGradient.createShader(b),
                child: const Text('WashGo', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
              const SizedBox(height: 4),
              Text(L.t('سجّل دخولك أو أنشئ حساب جديد', 'Login or create a new account'),
                style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 32),
              TextField(
                decoration: InputDecoration(labelText: L.phone, hintText: L.t('مثال: 777123456', 'e.g. 777123456')),
                textDirection: TextDirection.ltr, keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => setState(() => _showOtp = true), child: Text(L.sendOtp)),
              if (_showOtp) ...[
                const SizedBox(height: 24),
                Text(L.t('أدخل رمز التحقق', 'Enter OTP Code'), style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(4, (i) =>
                  Container(
                    width: 48, height: 48, margin: const EdgeInsets.symmetric(horizontal: 6),
                    child: TextField(
                      maxLength: 1, textAlign: TextAlign.center, keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                      decoration: InputDecoration(counterText: '', contentPadding: EdgeInsets.zero),
                    ),
                  ),
                )),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: () => Navigator.pushReplacementNamed(context, AppRouter.customerHome),
                  child: Text(L.verify)),
              ],
              const SizedBox(height: 24),
              ThemeLangToggles(onThemeToggle: tp.toggleTheme, onLangToggle: tp.toggleLocale, isDark: tp.isDark, locale: tp.locale),
            ]),
          ),
        ),
      ),
    );
  }
}
