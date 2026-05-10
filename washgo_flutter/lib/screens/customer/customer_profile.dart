import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../providers/orders_provider.dart';

class CustomerProfilePage extends StatelessWidget {
  const CustomerProfilePage({super.key});
  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final op = Provider.of<OrdersProvider>(context);
    return SafeArea(
        child: SingleChildScrollView(
            child: Column(children: [
      const SizedBox(height: 20),
      // Avatar
      Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(36)),
          child: Center(
              child: Text(L.t('أ', 'A'),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700)))),
      const SizedBox(height: 12),
      Text(L.t('أحمد محمد', 'Ahmed Mohammed'),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      Text('777123456',
          style: TextStyle(color: AppColors.textSecondary),
          textDirection: TextDirection.ltr),
      const SizedBox(height: 16),
      // Stats
      Card(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(children: [
                _Stat('${op.customerPoints}', L.points),
                Container(width: 1, height: 32, color: AppColors.borderLight),
                _Stat('${op.customerTotalOps}', L.t('طلب', 'Orders')),
                Container(width: 1, height: 32, color: AppColors.borderLight),
                _Stat('${op.customerFreeWashes}', L.freeWashes),
              ]))),
      const SizedBox(height: 16),
      // Menu
      ...[
        _MenuItem(Icons.directions_car, L.t('سياراتي', 'My Cars'),
            trailing: '2',
            onTap: () =>
                Navigator.pushNamed(context, AppRouter.customerMyCars)),
        _MenuItem(Icons.receipt_long, L.t('سجل الطلبات', 'Order History'),
            onTap: () =>
                Navigator.pushNamed(context, AppRouter.customerOrders)),
        _MenuItem(Icons.stars, L.myPoints,
            trailing: '${op.customerPoints}',
            onTap: () =>
                Navigator.pushNamed(context, AppRouter.customerPoints)),
        _MenuItem(Icons.language, L.language,
            trailing: tp.isArabic ? 'العربية' : 'English',
            onTap: tp.toggleLocale),
        _MenuItem(tp.isDark ? Icons.light_mode : Icons.dark_mode, L.theme,
            trailing: tp.isDark ? L.t('داكن', 'Dark') : L.t('فاتح', 'Light'),
            onTap: tp.toggleTheme),
        _MenuItem(Icons.help, L.help,
            onTap: () => Navigator.pushNamed(context, AppRouter.customerHelp)),
        _MenuItem(Icons.logout, L.logout, danger: true, onTap: () {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: Text(L.logout),
              content: Text(L.t('هل أنت متأكد من تسجيل الخروج؟',
                  'Are you sure you want to logout?')),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text(L.t('إلغاء', 'Cancel'))),
                TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pushReplacementNamed(context, AppRouter.portal);
                    },
                    child: Text(L.logout,
                        style: const TextStyle(color: Colors.red))),
              ],
            ),
          );
        }),
      ].map((item) => Card(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
            child: ListTile(
              leading: Icon(item.icon,
                  color: item.danger ? AppColors.danger : AppColors.primary,
                  size: 22),
              title: Text(item.label,
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: item.danger ? AppColors.danger : null)),
              trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                if (item.trailing != null)
                  Text(item.trailing!,
                      style: TextStyle(
                          fontSize: 13, color: AppColors.textSecondary)),
                const SizedBox(width: 4),
                Icon(Icons.chevron_left,
                    size: 18, color: AppColors.textTertiary),
              ]),
              onTap: item.onTap,
            ),
          )),
      const SizedBox(height: 60),
    ])));
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  const _Stat(this.value, this.label);
  @override
  Widget build(BuildContext context) => Expanded(
          child: Column(children: [
        Text(value,
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.primary)),
        Text(label,
            style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ]));
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String? trailing;
  final bool danger;
  final VoidCallback? onTap;
  const _MenuItem(this.icon, this.label,
      {this.trailing, this.danger = false, this.onTap});
}
