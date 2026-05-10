import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/auth_service.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';

class DriverDashboard extends StatelessWidget {
  const DriverDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);
    final driver = auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة المندوب'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              auth.logout();
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // بطاقة المندوب
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: theme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white24,
                    child: Icon(Icons.person, size: 35, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          driver?.name ?? 'مندوب',
                          style: GoogleFonts.almarai(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        Text(
                          'المنطقة: ${driver?.area ?? 'غير محدد'}',
                          style: const TextStyle(color: Colors.black87),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'متصل',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // إحصائيات اليوم
            Text(
              'إحصائيات اليوم 📊',
              style: GoogleFonts.almarai(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'طلبات مكتملة',
                    '١٢',
                    Icons.check_circle,
                    Colors.green,
                    theme,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    'طلبات معلقة',
                    '٣',
                    Icons.pending,
                    Colors.orange,
                    theme,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'إجمالي المبيعات',
                    '٢٥,٠٠٠',
                    Icons.monetization_on,
                    Colors.amber,
                    theme,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    'عمولتي',
                    '٢,٥٠٠',
                    Icons.wallet,
                    theme.primaryColor,
                    theme,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // الطلبات الحالية
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'الطلبات الحالية 📦',
                  style: GoogleFonts.almarai(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    'عرض الكل',
                    style: TextStyle(color: theme.primaryColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildOrderCard(
              'طلب #1025',
              'أحمد محمد - حي السنينة',
              '٤,٥٠٠',
              'جديد',
              Colors.blue,
              theme,
              config.currencySymbol,
            ),
            const SizedBox(height: 12),
            _buildOrderCard(
              'طلب #1024',
              'سالم علي - حي الجراف',
              '٣,٢٠٠',
              'في الطريق',
              Colors.orange,
              theme,
              config.currencySymbol,
            ),
            const SizedBox(height: 12),
            _buildOrderCard(
              'طلب #1023',
              'محمد سعيد - حي النصر',
              '٥,٨٠٠',
              'تم التسليم',
              Colors.green,
              theme,
              config.currencySymbol,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: theme.primaryColor,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text('مسح الطلب'),
      ),
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
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildOrderCard(
    String orderId,
    String customer,
    String amount,
    String status,
    Color statusColor,
    AppTheme theme,
    String currencySymbol,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const CircleAvatar(
                backgroundColor: Colors.white10,
                child: Icon(Icons.shopping_bag, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      orderId,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      customer,
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: Colors.white12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$amount $currencySymbol',
                style: TextStyle(
                  color: theme.primaryColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.phone, color: Colors.green),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.location_on, color: Colors.blue),
                    onPressed: () {},
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
