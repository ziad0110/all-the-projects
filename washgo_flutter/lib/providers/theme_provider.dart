import 'package:flutter/material.dart';
import '../core/localization.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  String _locale = 'ar';

  ThemeMode get themeMode => _themeMode;
  String get locale => _locale;
  bool get isDark => _themeMode == ThemeMode.dark;
  bool get isArabic => _locale == 'ar';

  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }

  void toggleLocale() {
    _locale = _locale == 'ar' ? 'en' : 'ar';
    L.locale = _locale;
    notifyListeners();
  }
}
