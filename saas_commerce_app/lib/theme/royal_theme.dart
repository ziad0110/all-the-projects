import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class RoyalTheme {
  // Colors
  static const Color gold = Color(0xFFD4AF37);
  static const Color darkGold = Color(0xFFB8860B);
  static const Color bgDark = Color(0xFF080C14);
  static const Color bgCard = Color(0xFF162033);
  static const Color surface = Color(0xFF1E293B);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color accent = Color(0xFF6366F1);

  // Gradients
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

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: gold,
        secondary: gold,
        surface: surface,
        background: bgDark,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        headlineMedium: GoogleFonts.almarai(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.almarai(
          fontSize: 16,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.almarai(
          fontSize: 14,
          color: textSecondary,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: gold,
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.almarai(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
