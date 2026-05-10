import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class EmployeeProfilePage extends StatelessWidget {
  const EmployeeProfilePage({super.key});
  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final emp = Provider.of<OrdersProvider>(context).employees.first;
    return SafeArea(child: SingleChildScrollView(child: Column(children: [
      const SizedBox(height: 20),
      Container(width: 72, height: 72, decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(36)),
        child: Center(child: Text(emp.name[0], style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)))),
      const SizedBox(height: 12),
      Text(emp.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      Text(emp.phone, style: TextStyle(color: AppColors.textSecondary), textDirection: TextDirection.ltr),
      const SizedBox(height: 4),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        StarRating(rating: emp.rating.round(), size: 18),
        const SizedBox(width: 4),
        Text('${emp.rating}', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
      ]),
      const SizedBox(height: 16),
      Card(margin: const EdgeInsets.symmetric(horizontal: 20), child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
        _Stat(emp.tasks.toString(), L.t('مهام','Tasks')),
        Container(width: 1, height: 32, color: AppColors.borderLight),
        _Stat(emp.hours.toString(), L.t('ساعات','Hours')),
        Container(width: 1, height: 32, color: AppColors.borderLight),
        _Stat('${emp.rating}', L.rating),
      ]))),
      const SizedBox(height: 16),
      ...[
        _MenuItem(Icons.language, L.language, tp.isArabic ? 'العربية' : 'English', tp.toggleLocale),
        _MenuItem(tp.isDark ? Icons.light_mode : Icons.dark_mode, L.theme,
          tp.isDark ? L.t('داكن','Dark') : L.t('فاتح','Light'), tp.toggleTheme),
        _MenuItem(Icons.help, L.help, '', null),
        _MenuItem(Icons.logout, L.logout, '', () => Navigator.pushReplacementNamed(context, AppRouter.portal), danger: true),
      ].map((item) => Card(margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 2), child: ListTile(
        leading: Icon(item.icon, color: item.danger ? AppColors.danger : AppColors.primary, size: 22),
        title: Text(item.label, style: TextStyle(fontSize: 14, color: item.danger ? AppColors.danger : null)),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          if (item.trailing.isNotEmpty) Text(item.trailing, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Icon(Icons.chevron_left, size: 18, color: AppColors.textTertiary),
        ]),
        onTap: item.onTap,
      ))),
      const SizedBox(height: 60),
    ])));
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  const _Stat(this.value, this.label);
  @override
  Widget build(BuildContext context) => Expanded(child: Column(children: [
    Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary)),
    Text(label, style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
  ]));
}

class _MenuItem {
  final IconData icon;
  final String label, trailing;
  final VoidCallback? onTap;
  final bool danger;
  const _MenuItem(this.icon, this.label, this.trailing, this.onTap, {this.danger = false});
}
