/// نموذج إعدادات المستأجر (Tenant Configuration Model)
/// يستخدم لتخزين جميع الإعدادات القابلة للتخصيص للشركة

import 'package:flutter/material.dart';

/// نموذج إعدادات الثيم
class ThemeConfig {
  final Color primaryColor;
  final Color accentColor;
  final Color backgroundColor;
  final Color cardColor;
  final Color textPrimaryColor;
  final Color textSecondaryColor;
  final String fontFamily;
  final bool isDarkMode;

  const ThemeConfig({
    required this.primaryColor,
    required this.accentColor,
    required this.backgroundColor,
    required this.cardColor,
    required this.textPrimaryColor,
    required this.textSecondaryColor,
    this.fontFamily = 'Almarai',
    this.isDarkMode = true,
  });

  factory ThemeConfig.fromJson(Map<String, dynamic> json) {
    return ThemeConfig(
      primaryColor: _colorFromHex(json['primaryColor'] ?? '#D4AF37'),
      accentColor: _colorFromHex(json['accentColor'] ?? '#6366F1'),
      backgroundColor: _colorFromHex(json['backgroundColor'] ?? '#080C14'),
      cardColor: _colorFromHex(json['cardColor'] ?? '#162033'),
      textPrimaryColor: _colorFromHex(json['textPrimaryColor'] ?? '#FFFFFF'),
      textSecondaryColor: _colorFromHex(
        json['textSecondaryColor'] ?? '#94A3B8',
      ),
      fontFamily: json['fontFamily'] ?? 'Almarai',
      isDarkMode: json['isDarkMode'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'primaryColor': _colorToHex(primaryColor),
      'accentColor': _colorToHex(accentColor),
      'backgroundColor': _colorToHex(backgroundColor),
      'cardColor': _colorToHex(cardColor),
      'textPrimaryColor': _colorToHex(textPrimaryColor),
      'textSecondaryColor': _colorToHex(textSecondaryColor),
      'fontFamily': fontFamily,
      'isDarkMode': isDarkMode,
    };
  }

  ThemeConfig copyWith({
    Color? primaryColor,
    Color? accentColor,
    Color? backgroundColor,
    Color? cardColor,
    Color? textPrimaryColor,
    Color? textSecondaryColor,
    String? fontFamily,
    bool? isDarkMode,
  }) {
    return ThemeConfig(
      primaryColor: primaryColor ?? this.primaryColor,
      accentColor: accentColor ?? this.accentColor,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      cardColor: cardColor ?? this.cardColor,
      textPrimaryColor: textPrimaryColor ?? this.textPrimaryColor,
      textSecondaryColor: textSecondaryColor ?? this.textSecondaryColor,
      fontFamily: fontFamily ?? this.fontFamily,
      isDarkMode: isDarkMode ?? this.isDarkMode,
    );
  }

  static Color _colorFromHex(String hex) {
    hex = hex.replaceFirst('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  static String _colorToHex(Color color) {
    return '#${color.value.toRadixString(16).substring(2).toUpperCase()}';
  }

  /// الإعدادات الافتراضية
  static const ThemeConfig defaultConfig = ThemeConfig(
    primaryColor: Color(0xFFD4AF37),
    accentColor: Color(0xFF6366F1),
    backgroundColor: Color(0xFF080C14),
    cardColor: Color(0xFF162033),
    textPrimaryColor: Color(0xFFFFFFFF),
    textSecondaryColor: Color(0xFF94A3B8),
    fontFamily: 'Almarai',
    isDarkMode: true,
  );
}

/// معلومات التواصل
class ContactInfo {
  final String phone;
  final String email;
  final String address;
  final String whatsapp;

  const ContactInfo({
    required this.phone,
    required this.email,
    required this.address,
    required this.whatsapp,
  });

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? '',
      whatsapp: json['whatsapp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'email': email,
      'address': address,
      'whatsapp': whatsapp,
    };
  }

  ContactInfo copyWith({
    String? phone,
    String? email,
    String? address,
    String? whatsapp,
  }) {
    return ContactInfo(
      phone: phone ?? this.phone,
      email: email ?? this.email,
      address: address ?? this.address,
      whatsapp: whatsapp ?? this.whatsapp,
    );
  }

  static const ContactInfo defaultConfig = ContactInfo(
    phone: '+967123456789',
    email: 'info@company.com',
    address: 'العنوان',
    whatsapp: '+967123456789',
  );
}

/// نموذج إعدادات المستأجر الرئيسي
class TenantConfig {
  final String id;
  final String companyName;
  final String slogan;
  final String logoPath;
  final String currency;
  final String currencySymbol;
  final String locale;
  final ThemeConfig theme;
  final ContactInfo contact;
  final List<String> features;
  final String copyrightText;

  const TenantConfig({
    required this.id,
    required this.companyName,
    required this.slogan,
    required this.logoPath,
    required this.currency,
    required this.currencySymbol,
    required this.locale,
    required this.theme,
    required this.contact,
    required this.features,
    required this.copyrightText,
  });

  factory TenantConfig.fromJson(Map<String, dynamic> json) {
    return TenantConfig(
      id: json['id'] ?? 'default',
      companyName: json['companyName'] ?? 'شركتي',
      slogan: json['slogan'] ?? 'منتجات عالية الجودة',
      logoPath: json['logoPath'] ?? 'assets/images/logo.png',
      currency: json['currency'] ?? 'YER',
      currencySymbol: json['currencySymbol'] ?? 'ريال',
      locale: json['locale'] ?? 'ar_YE',
      theme: ThemeConfig.fromJson(json['theme'] ?? {}),
      contact: ContactInfo.fromJson(json['contact'] ?? {}),
      features: List<String>.from(
        json['features'] ?? ['products', 'orders', 'delivery'],
      ),
      copyrightText: json['copyrightText'] ?? '© 2024 جميع الحقوق محفوظة',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'companyName': companyName,
      'slogan': slogan,
      'logoPath': logoPath,
      'currency': currency,
      'currencySymbol': currencySymbol,
      'locale': locale,
      'theme': theme.toJson(),
      'contact': contact.toJson(),
      'features': features,
      'copyrightText': copyrightText,
    };
  }

  TenantConfig copyWith({
    String? id,
    String? companyName,
    String? slogan,
    String? logoPath,
    String? currency,
    String? currencySymbol,
    String? locale,
    ThemeConfig? theme,
    ContactInfo? contact,
    List<String>? features,
    String? copyrightText,
  }) {
    return TenantConfig(
      id: id ?? this.id,
      companyName: companyName ?? this.companyName,
      slogan: slogan ?? this.slogan,
      logoPath: logoPath ?? this.logoPath,
      currency: currency ?? this.currency,
      currencySymbol: currencySymbol ?? this.currencySymbol,
      locale: locale ?? this.locale,
      theme: theme ?? this.theme,
      contact: contact ?? this.contact,
      features: features ?? this.features,
      copyrightText: copyrightText ?? this.copyrightText,
    );
  }

  /// الإعدادات الافتراضية
  static const TenantConfig defaultConfig = TenantConfig(
    id: 'default',
    companyName: 'شركتي',
    slogan: 'منتجات عالية الجودة',
    logoPath: 'assets/images/logo.png',
    currency: 'YER',
    currencySymbol: 'ريال',
    locale: 'ar_YE',
    theme: ThemeConfig.defaultConfig,
    contact: ContactInfo.defaultConfig,
    features: ['products', 'orders', 'delivery', 'reports'],
    copyrightText: '© 2024 جميع الحقوق محفوظة',
  );
}
