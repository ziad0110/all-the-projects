import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/shared_widgets.dart';
import 'admin_dashboard.dart';
import 'admin_orders.dart';
import 'admin_employees.dart';
import 'admin_customers.dart';
import 'admin_analytics.dart';
import 'admin_offers.dart';
import 'admin_qr_logs.dart';
import 'admin_settings.dart';

class AdminLayout extends StatefulWidget {
  const AdminLayout({super.key});
  @override
  State<AdminLayout> createState() => _AdminLayoutState();
}

class _AdminLayoutState extends State<AdminLayout> {
  int _currentIndex = 0;

  final _pages = const [
    AdminDashboardPage(),
    AdminOrdersPage(),
    AdminEmployeesPage(),
    AdminCustomersPage(),
    AdminAnalyticsPage(),
    AdminOffersPage(),
    AdminQRLogsPage(),
    AdminSettingsPage(),
  ];

  final _navItems = [
    {'icon': Icons.dashboard, 'label': 'dashboard'},
    {'icon': Icons.receipt_long, 'label': 'orders'},
    {'icon': Icons.people, 'label': 'employees'},
    {'icon': Icons.person_search, 'label': 'customers'},
    {'icon': Icons.analytics, 'label': 'analytics'},
    {'icon': Icons.local_offer, 'label': 'offers'},
    {'icon': Icons.qr_code_2, 'label': 'qrLogs'},
    {'icon': Icons.settings, 'label': 'settings'},
  ];

  String _navLabel(String key) {
    final map = {
      'dashboard': L.dashboard,
      'orders': L.ordersManagement,
      'employees': L.employees,
      'customers': L.customers,
      'analytics': L.analytics,
      'offers': L.offersPricing,
      'qrLogs': L.qrLogs,
      'settings': L.settings,
    };
    return map[key] ?? key;
  }

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sidebar = Container(
      width: 240,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        border: BorderDirectional(
            end: BorderSide(
                color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      ),
      child: Column(children: [
        // Logo
        Padding(
          padding: const EdgeInsets.all(20),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            ShaderMask(
              shaderCallback: (b) => AppColors.primaryGradient.createShader(b),
              child: const Text('WashGo',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white)),
            ),
            Text(L.adminDashboard,
                style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          ]),
        ),
        Divider(
            height: 1,
            color: isDark ? AppColors.borderDark : AppColors.borderLight),
        // Nav items
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: _navItems.length,
            itemBuilder: (_, i) {
              final item = _navItems[i];
              final active = _currentIndex == i;
              return Container(
                margin: const EdgeInsets.only(bottom: 2),
                child: ListTile(
                  dense: true,
                  leading: Icon(item['icon'] as IconData,
                      size: 20,
                      color:
                          active ? AppColors.primary : AppColors.textSecondary),
                  title: Text(_navLabel(item['label'] as String),
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight:
                              active ? FontWeight.w600 : FontWeight.w500,
                          color: active
                              ? AppColors.primary
                              : AppColors.textSecondary)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  tileColor: active ? AppColors.primary.withOpacity(0.1) : null,
                  onTap: () {
                    setState(() => _currentIndex = i);
                    if (MediaQuery.of(context).size.width < 800) {
                      Navigator.pop(context); // close drawer
                    }
                  },
                ),
              );
            },
          ),
        ),
        // Logout
        Padding(
          padding: const EdgeInsets.all(12),
          child: ListTile(
            dense: true,
            leading:
                const Icon(Icons.logout, size: 20, color: AppColors.danger),
            title: Text(L.logout,
                style: const TextStyle(fontSize: 13, color: AppColors.danger)),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            onTap: () =>
                Navigator.pushReplacementNamed(context, AppRouter.portal),
          ),
        ),
      ]),
    );

    return LayoutBuilder(builder: (context, constraints) {
      final isDesktop = constraints.maxWidth >= 800;

      final content = Column(children: [
        // Topbar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceDark : Colors.white,
            border: Border(
                bottom: BorderSide(
                    color:
                        isDark ? AppColors.borderDark : AppColors.borderLight)),
          ),
          child: Row(children: [
            if (!isDesktop)
              Builder(
                builder: (ctx) => IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: () => Scaffold.of(ctx).openDrawer(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
            if (!isDesktop) const SizedBox(width: 12),
            Expanded(
              child: Text(
                  _navLabel(_navItems[_currentIndex]['label'] as String),
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis),
            ),
            ThemeLangToggles(
                onThemeToggle: tp.toggleTheme,
                onLangToggle: tp.toggleLocale,
                isDark: tp.isDark,
                locale: tp.locale),
            const SizedBox(width: 8),
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(18)),
              child: const Center(
                  child: Text('م',
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w700))),
            ),
          ]),
        ),
        // Page content
        Expanded(child: _pages[_currentIndex]),
      ]);

      return Scaffold(
        drawer: isDesktop ? null : Drawer(child: sidebar),
        body: isDesktop
            ? Row(children: [sidebar, Expanded(child: content)])
            : SafeArea(child: content),
      );
    });
  }
}
