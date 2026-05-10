import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/cart_service.dart';
import 'package:saas_commerce_app/services/auth_service.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/services/product_service.dart';
import 'package:saas_commerce_app/screens/settings_screen.dart';

class CustomerDashboard extends StatelessWidget {
  const CustomerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();
    final auth = context.watch<AuthService>();
    final config = context.watch<TenantConfigService>().config;
    final products = context.watch<ProductService>().activeProducts;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(
        title: Text('متجر ${config.companyName}'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart),
                onPressed: () {
                  // Show Cart Bottom Sheet or Screen
                },
              ),
              if (cart.count > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${cart.count}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          // Settings button for admin
          if (auth.currentUser?.role == 'admin')
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                );
              },
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              auth.logout();
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'مرحباً، ${auth.currentUser?.name ?? 'زائر'} 👋',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'ماذا تريد أن تطلب اليوم؟',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                ),
                itemCount: products.length,
                itemBuilder: (context, index) {
                  final product = products[index];
                  return _buildProductItem(
                    context,
                    product.id,
                    product.name,
                    product.price,
                    product.imagePath,
                    config.currencySymbol,
                    theme,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductItem(
    BuildContext context,
    String id,
    String name,
    double price,
    String image,
    String currencySymbol,
    AppTheme theme,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              child: Image.asset(image, fit: BoxFit.contain),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  '${price.toStringAsFixed(0)} $currencySymbol',
                  style: TextStyle(
                    color: theme.primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      context.read<CartService>().addItem(
                        int.parse(id),
                        name,
                        price,
                        image,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      backgroundColor: theme.primaryColor.withOpacity(0.1),
                      foregroundColor: theme.primaryColor,
                      elevation: 0,
                      side: BorderSide(color: theme.primaryColor),
                    ),
                    child: const Text('أضف للسلة'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
