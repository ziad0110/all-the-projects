import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/shared_widgets.dart';

class EmployeeLoginScreen extends StatefulWidget {
  const EmployeeLoginScreen({super.key});
  @override
  State<EmployeeLoginScreen> createState() => _EmployeeLoginScreenState();
}

class _EmployeeLoginScreenState extends State<EmployeeLoginScreen> {
  bool _showOtp = false;

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    return Scaffold(
      body: SafeArea(child: Center(child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ShaderMask(shaderCallback: (b) => AppColors.primaryGradient.createShader(b),
            child: const Text('WashGo', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white))),
          Text(L.employeeApp, style: TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 32),
          TextField(decoration: InputDecoration(labelText: L.phone, hintText: '777XXXXXX'), textDirection: TextDirection.ltr, keyboardType: TextInputType.phone),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: () => setState(() { _showOtp = true;
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(L.t('تم إرسال رمز التحقق','OTP Sent')), backgroundColor: AppColors.success)); }),
            child: Text(L.sendOtp)),
          if (_showOtp) ...[
            const SizedBox(height: 24),
            Text(L.t('رمز التحقق','OTP Code'), style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(4, (i) =>
              Container(width: 48, height: 48, margin: const EdgeInsets.symmetric(horizontal: 6),
                child: TextField(maxLength: 1, textAlign: TextAlign.center, keyboardType: TextInputType.number,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                  decoration: InputDecoration(counterText: '', contentPadding: EdgeInsets.zero))))),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () => Navigator.pushReplacementNamed(context, AppRouter.employeeHome),
              child: Text(L.login)),
          ],
          const SizedBox(height: 24),
          ThemeLangToggles(onThemeToggle: tp.toggleTheme, onLangToggle: tp.toggleLocale, isDark: tp.isDark, locale: tp.locale),
        ]),
      ))),
    );
  }
}
