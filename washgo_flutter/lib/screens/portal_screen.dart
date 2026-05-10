import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/app_router.dart';
import '../core/localization.dart';
import '../providers/theme_provider.dart';
import '../widgets/shared_widgets.dart';

class PortalScreen extends StatelessWidget {
  const PortalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(children: [
              ThemeLangToggles(onThemeToggle: tp.toggleTheme, onLangToggle: tp.toggleLocale,
                isDark: tp.isDark, locale: tp.locale),
              const SizedBox(height: 40),
              ShaderMask(
                shaderCallback: (bounds) => AppColors.primaryGradient.createShader(bounds),
                child: const Text('WashGo Yemen', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
              const SizedBox(height: 8),
              Text(L.mobileCarWash, style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
              const SizedBox(height: 40),
              _PortalCard(icon: Icons.phone_iphone, title: L.customerApp, subtitle: L.orderWashNow,
                onTap: () => Navigator.pushNamed(context, AppRouter.customerSplash)),
              const SizedBox(height: 12),
              _PortalCard(icon: Icons.engineering, title: L.employeeApp, subtitle: L.manageOrders,
                onTap: () => Navigator.pushNamed(context, AppRouter.employeeLogin)),
              const SizedBox(height: 12),
              _PortalCard(icon: Icons.admin_panel_settings, title: L.adminDashboard, subtitle: L.analyticsManagement,
                onTap: () => Navigator.pushNamed(context, AppRouter.adminLogin)),
              const SizedBox(height: 40),
              Text('© 2026 WashGo Yemen', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
            ]),
          ),
        ),
      ),
    );
  }
}

class _PortalCard extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final VoidCallback onTap;
  const _PortalCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: Colors.white, size: 28),
            ),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ]),
        ),
      ),
    );
  }
}
