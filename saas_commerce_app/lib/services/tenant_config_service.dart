/// خدمة إدارة إعدادات المستأجر (Tenant Configuration Service)
/// تقوم بتحميل وحفظ إعدادات الشركة

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:saas_commerce_app/models/tenant_config.dart';

class TenantConfigService extends ChangeNotifier {
  TenantConfig _config = TenantConfig.defaultConfig;
  bool _isLoaded = false;

  TenantConfig get config => _config;
  bool get isLoaded => _isLoaded;

  /// تحميل الإعدادات من الملف أو SharedPreferences
  Future<void> loadConfig() async {
    try {
      // أولاً: محاولة تحميل الإعدادات المحفوظة محلياً
      final prefs = await SharedPreferences.getInstance();
      final savedConfig = prefs.getString('tenant_config');

      if (savedConfig != null) {
        _config = TenantConfig.fromJson(jsonDecode(savedConfig));
      } else {
        // ثانياً: تحميل الإعدادات من ملف JSON
        await _loadFromAsset();
      }

      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('خطأ في تحميل الإعدادات: $e');
      _config = TenantConfig.defaultConfig;
      _isLoaded = true;
      notifyListeners();
    }
  }

  /// تحميل الإعدادات من ملف assets
  Future<void> _loadFromAsset() async {
    try {
      final jsonString = await rootBundle.loadString(
        'assets/config/tenant_config.json',
      );
      _config = TenantConfig.fromJson(jsonDecode(jsonString));
    } catch (e) {
      debugPrint('لا يوجد ملف إعدادات، استخدام الإعدادات الافتراضية');
      _config = TenantConfig.defaultConfig;
    }
  }

  /// حفظ الإعدادات محلياً
  Future<void> saveConfig(TenantConfig newConfig) async {
    _config = newConfig;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('tenant_config', jsonEncode(newConfig.toJson()));
    notifyListeners();
  }

  /// تحديث اسم الشركة
  Future<void> updateCompanyName(String name) async {
    await saveConfig(_config.copyWith(companyName: name));
  }

  /// تحديث الشعار
  Future<void> updateSlogan(String slogan) async {
    await saveConfig(_config.copyWith(slogan: slogan));
  }

  /// تحديث مسار الشعار
  Future<void> updateLogoPath(String path) async {
    await saveConfig(_config.copyWith(logoPath: path));
  }

  /// تحديث اللون الأساسي
  Future<void> updatePrimaryColor(Color color) async {
    await saveConfig(
      _config.copyWith(theme: _config.theme.copyWith(primaryColor: color)),
    );
  }

  /// تحديث لون الخلفية
  Future<void> updateBackgroundColor(Color color) async {
    await saveConfig(
      _config.copyWith(theme: _config.theme.copyWith(backgroundColor: color)),
    );
  }

  /// تحديث معلومات التواصل
  Future<void> updateContactInfo(ContactInfo contact) async {
    await saveConfig(_config.copyWith(contact: contact));
  }

  /// تحديث العملة
  Future<void> updateCurrency(String currency, String symbol) async {
    await saveConfig(
      _config.copyWith(currency: currency, currencySymbol: symbol),
    );
  }

  /// تحديث نص حقوق النشر
  Future<void> updateCopyrightText(String text) async {
    await saveConfig(_config.copyWith(copyrightText: text));
  }

  /// إعادة تعيين الإعدادات للافتراضية
  Future<void> resetToDefault() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('tenant_config');
    _config = TenantConfig.defaultConfig;
    notifyListeners();
  }
}
