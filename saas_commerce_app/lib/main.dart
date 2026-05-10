import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/auth_service.dart';
import 'package:saas_commerce_app/services/cart_service.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/services/product_service.dart';
import 'package:saas_commerce_app/screens/landing_screen.dart';

void main() {
  // Prevent google_fonts from trying to download fonts at runtime.
  // Without bundled local font files, this avoids crashes when there's no internet.
  GoogleFonts.config.allowRuntimeFetching = false;
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => TenantConfigService()..loadConfig(),
        ),
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => CartService()),
        ChangeNotifierProvider(create: (_) => ProductService()),
      ],
      child: const SaaSCommerceApp(),
    ),
  );
}

class SaaSCommerceApp extends StatelessWidget {
  const SaaSCommerceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<TenantConfigService>(
      builder: (context, configService, child) {
        // انتظار تحميل الإعدادات
        if (!configService.isLoaded) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(
              backgroundColor: const Color(0xFF080C14),
              body: Center(
                child: CircularProgressIndicator(
                  color: configService.config.theme.primaryColor,
                ),
              ),
            ),
          );
        }

        final config = configService.config;
        final appTheme = AppTheme(config);

        return MaterialApp(
          title: config.companyName,
          debugShowCheckedModeBanner: false,
          theme: appTheme.themeData,
          home: const LandingScreen(),
          locale: Locale(
            config.locale.split('_')[0],
            config.locale.split('_')[1],
          ),
          builder: (context, child) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: child!,
            );
          },
        );
      },
    );
  }
}
