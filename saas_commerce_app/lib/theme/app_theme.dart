/// نظام الثيم الديناميكي (Dynamic App Theme)
/// يقوم بإنشاء ثيم التطبيق بناءً على إعدادات المستأجر

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:saas_commerce_app/models/tenant_config.dart';

class AppTheme {
  final TenantConfig config;

  AppTheme(this.config);

  /// اللون الأساسي
  Color get primaryColor => config.theme.primaryColor;

  /// لون التمييز
  Color get accentColor => config.theme.accentColor;

  /// لون الخلفية
  Color get backgroundColor => config.theme.backgroundColor;

  /// لون البطاقات
  Color get cardColor => config.theme.cardColor;

  /// لون النص الأساسي
  Color get textPrimaryColor => config.theme.textPrimaryColor;

  /// لون النص الثانوي
  Color get textSecondaryColor => config.theme.textSecondaryColor;

  /// تدرج اللون الأساسي
  LinearGradient get primaryGradient => LinearGradient(
    colors: [
      primaryColor,
      HSLColor.fromColor(primaryColor).withLightness(0.6).toColor(),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// تدرج الخلفية
  LinearGradient get backgroundGradient => LinearGradient(
    colors: [backgroundColor, cardColor],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  /// الحصول على ThemeData
  ThemeData get themeData {
    return ThemeData(
      useMaterial3: true,
      brightness: config.theme.isDarkMode ? Brightness.dark : Brightness.light,
      scaffoldBackgroundColor: backgroundColor,
      colorScheme: ColorScheme(
        brightness: config.theme.isDarkMode
            ? Brightness.dark
            : Brightness.light,
        primary: primaryColor,
        onPrimary: Colors.black,
        secondary: accentColor,
        onSecondary: Colors.white,
        error: Colors.red,
        onError: Colors.white,
        surface: cardColor,
        onSurface: textPrimaryColor,
      ),
      textTheme: _buildTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: _getFont(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: textPrimaryColor,
        ),
        iconTheme: IconThemeData(color: primaryColor),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: _getFont(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          side: BorderSide(color: primaryColor),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: primaryColor),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: primaryColor),
        ),
        hintStyle: TextStyle(color: textSecondaryColor.withOpacity(0.5)),
        labelStyle: TextStyle(color: textSecondaryColor),
      ),
      cardTheme: const CardThemeData(
        color: null,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      iconTheme: IconThemeData(color: primaryColor),
      dividerColor: Colors.white12,
    );
  }

  TextTheme _buildTextTheme() {
    return TextTheme(
      displayLarge: _getFont(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      displayMedium: _getFont(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      headlineLarge: _getFont(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      headlineMedium: _getFont(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      titleLarge: _getFont(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
      titleMedium: _getFont(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
      bodyLarge: _getFont(fontSize: 16, color: textPrimaryColor),
      bodyMedium: _getFont(fontSize: 14, color: textSecondaryColor),
      labelLarge: _getFont(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
    );
  }

  TextStyle _getFont({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.normal,
    Color? color,
  }) {
    // استخدام الخط المحدد في الإعدادات
    switch (config.theme.fontFamily) {
      case 'Outfit':
        return GoogleFonts.outfit(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
      case 'Almarai':
      default:
        return GoogleFonts.almarai(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
    }
  }

  /// الحصول على نمط النص للخط المحدد
  TextStyle getTextStyle({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.normal,
    Color? color,
  }) {
    return _getFont(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color ?? textPrimaryColor,
    );
  }
}

/// للتوافق مع الكود القديم - ستتم إزالته لاحقاً
class LegacyTheme {
  static const Color gold = Color(0xFFD4AF37);
  static const Color darkGold = Color(0xFFB8860B);
  static const Color bgDark = Color(0xFF080C14);
  static const Color bgCard = Color(0xFF162033);
  static const Color surface = Color(0xFF1E293B);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color accent = Color(0xFF6366F1);

  static const LinearGradient goldGradient = LinearGradient(
    colors: [gold, Color(0xFFF9D423)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [bgDark, Color(0xFF1E293B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
