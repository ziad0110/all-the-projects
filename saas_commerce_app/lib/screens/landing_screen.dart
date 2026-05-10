import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/services/product_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:saas_commerce_app/screens/login_screen.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final config = context.watch<TenantConfigService>().config;
    final theme = AppTheme(config);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context, config, theme),
          _buildHeroSection(context, config, theme),
          _buildProductsSection(context, config, theme),
          _buildFeaturesSection(context, config, theme),
          _buildFooter(context, config, theme),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context, config, AppTheme theme) {
    return SliverAppBar(
      floating: true,
      pinned: true,
      backgroundColor: theme.backgroundColor.withOpacity(0.8),
      title: Row(
        children: [
          Image.asset(config.logoPath, height: 32),
          const SizedBox(width: 8),
          Text(
            config.companyName,
            style: GoogleFonts.almarai(
              fontWeight: FontWeight.bold,
              color: theme.primaryColor,
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () {},
          child: const Text(
            'الرئيسية',
            style: TextStyle(color: Colors.white, fontSize: 13),
          ),
        ),
        TextButton(
          onPressed: () {},
          child: const Text(
            'المنتجات',
            style: TextStyle(color: Colors.white, fontSize: 13),
          ),
        ),
        IconButton(
          icon: Icon(Icons.brightness_4, color: theme.primaryColor, size: 20),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildHeroSection(BuildContext context, config, AppTheme theme) {
    return SliverToBoxAdapter(
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(gradient: theme.backgroundGradient),
        child: Stack(
          children: [
            _buildAnimatedOrb(
              -50,
              -50,
              200,
              theme.primaryColor.withOpacity(0.05),
            ),
            _buildAnimatedOrb(150, 300, 180, Colors.blue.withOpacity(0.05)),
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: theme.primaryColor.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        '👑 ${config.slogan}',
                        style: GoogleFonts.almarai(
                          color: theme.primaryColor,
                          fontSize: 11,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Hero(
                      tag: 'logo',
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: theme.primaryColor.withOpacity(0.5),
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: theme.primaryColor.withOpacity(0.2),
                              blurRadius: 30,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            config.logoPath,
                            height: 120,
                            width: 120,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      config.companyName,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.almarai(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        color: theme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      config.slogan,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.almarai(
                        fontSize: 16,
                        color: theme.textSecondaryColor,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 48),
                    Column(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const LoginScreen(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.primaryColor,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 40,
                              vertical: 14,
                            ),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(Icons.shopping_bag),
                          label: Text(
                            'ابدأ التسوق الآن',
                            style: GoogleFonts.almarai(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        OutlinedButton.icon(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            foregroundColor: theme.primaryColor,
                            side: BorderSide(color: theme.primaryColor),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 40,
                              vertical: 14,
                            ),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(Icons.explore),
                          label: Text(
                            'اكتشف مجموعتنا',
                            style: GoogleFonts.almarai(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsSection(BuildContext context, config, AppTheme theme) {
    final products = context.watch<ProductService>().featuredProducts;

    return SliverPadding(
      padding: const EdgeInsets.all(24),
      sliver: SliverToBoxAdapter(
        child: Column(
          children: [
            SectionHeader(
              title: '📦 منتجاتنا المميزة',
              subtitle: 'اكتشف تشكيلتنا الفاخرة',
              theme: theme,
            ),
            const SizedBox(height: 32),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 0.65,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return _buildProductCard(
                  product.name,
                  product.category,
                  '${product.price.toStringAsFixed(0)} ${config.currencySymbol}',
                  product.imagePath,
                  theme,
                  isGold: product.category == 'جولد',
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturesSection(BuildContext context, config, AppTheme theme) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      sliver: SliverToBoxAdapter(
        child: Column(
          children: [
            SectionHeader(
              title: '✨ لماذا تختارنا؟',
              subtitle: 'أفضل تجربة تسوق',
              theme: theme,
            ),
            const SizedBox(height: 32),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.1,
              children: [
                _buildFeatureCard(
                  '🏆',
                  'جودة عالية',
                  'أفضل المواد والمعايير',
                  theme,
                ),
                _buildFeatureCard(
                  '🚚',
                  'توصيل سريع',
                  'خدمة سريعة للمنزل',
                  theme,
                ),
                _buildFeatureCard(
                  '💰',
                  'أسعار منافسة',
                  'أفضل سعر مع الجودة',
                  theme,
                ),
                _buildFeatureCard('📱', 'تطبيق سهل', 'تصفح وطلب بسهولة', theme),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, config, AppTheme theme) {
    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
        color: Colors.black,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(config.logoPath, height: 40),
                const SizedBox(width: 12),
                Text(
                  config.companyName,
                  style: GoogleFonts.almarai(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              config.copyrightText,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedOrb(double top, double left, double size, Color color) {
    return Positioned(
      top: top,
      left: left,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 80,
              spreadRadius: 30,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(
    String title,
    String badge,
    String price,
    String image,
    AppTheme theme, {
    bool isGold = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isGold ? theme.primaryColor.withOpacity(0.3) : Colors.white10,
        ),
        boxShadow: [
          if (isGold)
            BoxShadow(
              color: theme.primaryColor.withOpacity(0.05),
              blurRadius: 10,
              spreadRadius: 2,
            ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Align(
            alignment: Alignment.topRight,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isGold ? theme.primaryColor : theme.backgroundColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                badge,
                style: TextStyle(
                  color: isGold ? Colors.black : Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(child: Image.asset(image, fit: BoxFit.contain)),
          const SizedBox(height: 12),
          Text(
            title,
            style: GoogleFonts.almarai(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            price,
            style: TextStyle(
              color: theme.primaryColor,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
    String icon,
    String title,
    String desc,
    AppTheme theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(icon, style: const TextStyle(fontSize: 32)),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 4),
          Text(
            desc,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey, fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final AppTheme theme;

  const SectionHeader({
    super.key,
    required this.title,
    required this.subtitle,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          title,
          style: GoogleFonts.almarai(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: theme.primaryColor,
          ),
        ),
        Text(subtitle, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}
