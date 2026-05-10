import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'core/app_router.dart';
import 'providers/theme_provider.dart';
import 'providers/orders_provider.dart';
import 'providers/auth_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => OrdersProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const WashGoApp(),
    ),
  );
}

class WashGoApp extends StatelessWidget {
  const WashGoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return MaterialApp(
      title: 'WashGo Yemen',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      locale: Locale(themeProvider.locale),
      initialRoute: AppRouter.portal,
      onGenerateRoute: AppRouter.generateRoute,
      builder: (context, child) {
        return Directionality(
          textDirection: themeProvider.locale == 'ar'
              ? TextDirection.rtl
              : TextDirection.ltr,
          child: child!,
        );
      },
    );
  }
}
