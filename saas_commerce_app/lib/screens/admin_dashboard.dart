import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/screens/settings_screen.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة تحكم المدير'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => const SettingsScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
        ],
      ),
      drawer: _buildDrawer(context, config, theme),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'نظرة عامة على العمليات 📊',
              style: GoogleFonts.almarai(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildStatsGrid(theme),
            const SizedBox(height: 30),
            _buildSectionHeader('الطلبات الأخيرة', 'عرض الكل', theme),
            const SizedBox(height: 15),
            _buildRecentOrders(theme, config.currencySymbol),
            const SizedBox(height: 30),
            _buildSectionHeader('حالة المناديب', 'إدارة', theme),
            const SizedBox(height: 15),
            _buildDriversStatus(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, config, AppTheme theme) {
    return Drawer(
      backgroundColor: theme.backgroundColor,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: theme.cardColor),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Image.asset(config.logoPath, height: 50),
                const SizedBox(height: 10),
                Text(
                  config.companyName,
                  style: GoogleFonts.almarai(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColor,
                  ),
                ),
                Text(
                  'لوحة الإدارة',
                  style: TextStyle(color: theme.textSecondaryColor),
                ),
              ],
            ),
          ),
          ListTile(
            leading: Icon(Icons.dashboard, color: theme.primaryColor),
            title: const Text('الرئيسية'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: Icon(Icons.shopping_cart, color: theme.primaryColor),
            title: const Text('الطلبات'),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.inventory, color: theme.primaryColor),
            title: const Text('المنتجات'),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.people, color: theme.primaryColor),
            title: const Text('العملاء'),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.local_shipping, color: theme.primaryColor),
            title: const Text('المناديب'),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: Icon(Icons.settings, color: theme.primaryColor),
            title: const Text('الإعدادات'),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => const SettingsScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('تسجيل الخروج'),
            onTap: () =>
                Navigator.of(context).popUntil((route) => route.isFirst),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(AppTheme theme) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.5,
      mainAxisSpacing: 15,
      crossAxisSpacing: 15,
      children: [
        _buildStatCard(
          'إجمالي المبيعات',
          '٢.٥ مليون',
          Icons.monetization_on,
          Colors.amber,
          theme,
        ),
        _buildStatCard(
          'طلبات اليوم',
          '١٤٥',
          Icons.shopping_cart,
          Colors.blue,
          theme,
        ),
        _buildStatCard(
          'المناديب النشطين',
          '١٢',
          Icons.local_shipping,
          Colors.green,
          theme,
        ),
        _buildStatCard(
          'طلبات معلقة',
          '٨',
          Icons.hourglass_empty,
          Colors.orange,
          theme,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
    AppTheme theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String action, AppTheme theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        TextButton(
          onPressed: () {},
          child: Text(action, style: TextStyle(color: theme.primaryColor)),
        ),
      ],
    );
  }

  Widget _buildRecentOrders(AppTheme theme, String currencySymbol) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 3,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const CircleAvatar(
                backgroundColor: Colors.white10,
                child: Icon(Icons.person, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'طلب #102$index',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const Text(
                      'عميل: أحمد محمد',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              Text(
                '٤,٥٠٠ $currencySymbol',
                style: TextStyle(
                  color: theme.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDriversStatus(AppTheme theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _buildDriverRow('محمد علي', 'أونلاين', Colors.green),
          const Divider(color: Colors.white12),
          _buildDriverRow('ياسين سالم', 'في مهمة', Colors.blue),
          const Divider(color: Colors.white12),
          _buildDriverRow('عمر خالد', 'أوفلاين', Colors.grey),
        ],
      ),
    );
  }

  Widget _buildDriverRow(String name, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Text(name),
          const Spacer(),
          Text(status, style: TextStyle(color: color, fontSize: 12)),
        ],
      ),
    );
  }
}
