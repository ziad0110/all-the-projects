import 'package:flutter/material.dart';

class AppColors {
  // Brand - Royal Green
  static const Color primary = Color(0xFF0D7C46);
  static const Color primaryLight = Color(0xFF2EAD6A);
  static const Color primaryDark = Color(0xFF0A6338);

  // Light
  static const Color bgLight = Color(0xFFFFFFFF);
  static const Color bgSecondaryLight = Color(0xFFF7F8FA);
  static const Color bgTertiaryLight = Color(0xFFEEF0F4);
  static const Color textDark = Color(0xFF1F1F1F);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color borderLight = Color(0xFFE5E7EB);

  // Dark
  static const Color bgDark = Color(0xFF0F1117);
  static const Color surfaceDark = Color(0xFF1A1D27);
  static const Color bgSecondaryDark = Color(0xFF242833);
  static const Color textLight = Color(0xFFF3F4F6);
  static const Color borderDark = Color(0xFF2D3140);

  // Status
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppSizes {
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double btnHeight = 48;
  static const double iconSize = 24;
  static const double bottomBarHeight = 64;
}
