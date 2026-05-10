import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/shared_widgets.dart';

class AdminLoginScreen extends StatelessWidget {
  const AdminLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    return Scaffold(
      body: LayoutBuilder(builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 800;

        final formSide = Expanded(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(40),
              child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.login,
                        style: const TextStyle(
                            fontSize: 24, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(
                        L.t('أدخل بياناتك للوصول للوحة التحكم',
                            'Enter your credentials'),
                        style: TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(height: 32),
                    Text(L.email,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    const TextField(
                        decoration:
                            InputDecoration(hintText: 'admin@washgo.ye'),
                        textDirection: TextDirection.ltr),
                    const SizedBox(height: 16),
                    Text(L.password,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    const TextField(
                        obscureText: true,
                        decoration: InputDecoration(hintText: '••••••••'),
                        textDirection: TextDirection.ltr),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48)),
                      onPressed: () => Navigator.pushReplacementNamed(
                          context, AppRouter.adminDashboard),
                      icon: const Icon(Icons.login),
                      label: Text(L.login),
                    ),
                    const SizedBox(height: 16),
                    Center(
                        child: ThemeLangToggles(
                            onThemeToggle: tp.toggleTheme,
                            onLangToggle: tp.toggleLocale,
                            isDark: tp.isDark,
                            locale: tp.locale)),
                  ]),
            ),
          ),
        );

        if (isMobile) return Row(children: [formSide]);

        final visualSide = Expanded(
          child: Container(
            decoration:
                const BoxDecoration(gradient: AppColors.primaryGradient),
            child: Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text('🚗', style: TextStyle(fontSize: 64)),
              const SizedBox(height: 16),
              const Text('WashGo Yemen',
                  style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: Colors.white)),
              const SizedBox(height: 8),
              Text(L.adminDashboard,
                  style: const TextStyle(fontSize: 16, color: Colors.white70)),
            ])),
          ),
        );

        return Row(children: [visualSide, formSide]);
      }),
    );
  }
}
