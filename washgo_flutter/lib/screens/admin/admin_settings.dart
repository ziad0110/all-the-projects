import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';

class AdminSettingsPage extends StatefulWidget {
  const AdminSettingsPage({super.key});

  @override
  State<AdminSettingsPage> createState() => _AdminSettingsPageState();
}

class _AdminSettingsPageState extends State<AdminSettingsPage> {
  bool _newOrders = true;
  bool _ratings = true;
  bool _systemAlerts = false;

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    return LayoutBuilder(builder: (context, constraints) {
      final isMobile = constraints.maxWidth < 800;

      final generalSettings = Card(
          child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.t('إعدادات عامة', 'General Settings'),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
                    const Divider(),
                    _SettingTile(
                        title: L.t('اسم التطبيق', 'App Name'),
                        subtitle: 'WashGo Yemen',
                        icon: Icons.business),
                    _SettingTile(
                        title: L.phone,
                        subtitle: '777000111',
                        icon: Icons.phone),
                    _SettingTile(
                        title: L.email,
                        subtitle: 'admin@washgo.ye',
                        icon: Icons.email),
                    _SettingTile(
                        title: L.t('العنوان', 'Address'),
                        subtitle: L.t('صنعاء، اليمن', 'Sana\'a, Yemen'),
                        icon: Icons.location_on),
                  ])));

      final appearance = Card(
          child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.t('المظهر', 'Appearance'),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
                    const Divider(),
                    SwitchListTile(
                      title: Text(L.darkMode),
                      secondary:
                          Icon(tp.isDark ? Icons.dark_mode : Icons.light_mode),
                      value: tp.isDark,
                      onChanged: (_) => tp.toggleTheme(),
                      activeColor: AppColors.primary,
                    ),
                    ListTile(
                      leading: const Icon(Icons.language),
                      title: Text(L.language),
                      trailing: Text(tp.isArabic ? 'العربية' : 'English',
                          style: TextStyle(color: AppColors.textSecondary)),
                      onTap: tp.toggleLocale,
                    ),
                  ])));

      final notifications = Card(
          child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.t('الإشعارات', 'Notifications'),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
                    const Divider(),
                    SwitchListTile(
                        title: Text(L.t('طلبات جديدة', 'New Orders')),
                        value: _newOrders,
                        onChanged: (v) => setState(() => _newOrders = v),
                        activeColor: AppColors.primary),
                    SwitchListTile(
                        title: Text(L.t('تقييمات', 'Ratings')),
                        value: _ratings,
                        onChanged: (v) => setState(() => _ratings = v),
                        activeColor: AppColors.primary),
                    SwitchListTile(
                        title: Text(L.t('تنبيهات النظام', 'System Alerts')),
                        value: _systemAlerts,
                        onChanged: (v) => setState(() => _systemAlerts = v),
                        activeColor: AppColors.primary),
                  ])));

      final security = Card(
          child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.t('الأمان', 'Security'),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
                    const Divider(),
                    _SettingTile(
                        title: L.t('تغيير كلمة المرور', 'Change Password'),
                        subtitle: L.t('آخر تغيير: قبل 30 يوم',
                            'Last changed: 30 days ago'),
                        icon: Icons.lock),
                    SwitchListTile(
                        title: Text(L.t('المصادقة الثنائية', '2FA')),
                        subtitle: Text(L.t('قريباً', 'Coming soon')),
                        value: false,
                        onChanged: null,
                        activeColor: AppColors.primary),
                  ])));

      return SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: isMobile
            ? Column(children: [
                generalSettings,
                const SizedBox(height: 12),
                appearance,
                const SizedBox(height: 12),
                notifications,
                const SizedBox(height: 12),
                security,
              ])
            : Column(children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(child: generalSettings),
                  const SizedBox(width: 12),
                  Expanded(child: appearance),
                ]),
                const SizedBox(height: 12),
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(child: notifications),
                  const SizedBox(width: 12),
                  Expanded(child: security),
                ]),
              ]),
      );
    });
  }
}

class _SettingTile extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  const _SettingTile(
      {required this.title, required this.subtitle, required this.icon});
  @override
  Widget build(BuildContext context) => ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        subtitle: Text(subtitle,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
      );
}
