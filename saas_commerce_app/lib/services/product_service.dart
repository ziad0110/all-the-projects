/// خدمة المنتجات (Product Service)
/// تقوم بإدارة المنتجات (إضافة، تعديل، حذف، عرض)

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:saas_commerce_app/models/product.dart';

class ProductService extends ChangeNotifier {
  List<Product> _products = [];
  bool _isLoaded = false;

  List<Product> get products => _products;
  List<Product> get activeProducts =>
      _products.where((p) => p.isActive).toList();
  List<Product> get featuredProducts =>
      _products.where((p) => p.isFeatured && p.isActive).toList();
  bool get isLoaded => _isLoaded;

  ProductService() {
    _loadProducts();
  }

  /// تحميل المنتجات من SharedPreferences أو استخدام البيانات التجريبية
  Future<void> _loadProducts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedProducts = prefs.getString('products');

      if (savedProducts != null) {
        final List<dynamic> jsonList = jsonDecode(savedProducts);
        _products = jsonList.map((json) => Product.fromJson(json)).toList();
      } else {
        // استخدام البيانات التجريبية
        _products = _getDefaultProducts();
        await _saveProducts();
      }

      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('خطأ في تحميل المنتجات: $e');
      _products = _getDefaultProducts();
      _isLoaded = true;
      notifyListeners();
    }
  }

  /// الحصول على المنتجات الافتراضية (تجريبية)
  List<Product> _getDefaultProducts() {
    return [
      const Product(
        id: '1',
        name: 'منتج كلاسيك',
        description: 'منتج عالي الجودة',
        price: 175,
        imagePath: 'assets/images/classic_single.png',
        category: 'كلاسيك',
        isFeatured: true,
      ),
      const Product(
        id: '2',
        name: 'باكيت كلاسيك',
        description: 'باكيت يحتوي على 20 قطعة',
        price: 3500,
        imagePath: 'assets/images/classic_pack.png',
        category: 'كلاسيك',
      ),
      const Product(
        id: '3',
        name: 'منتج جولد',
        description: 'إصدار فاخر',
        price: 200,
        imagePath: 'assets/images/gold_single.png',
        category: 'جولد',
        isFeatured: true,
      ),
      const Product(
        id: '4',
        name: 'باكيت جولد',
        description: 'باكيت فاخر يحتوي على 20 قطعة',
        price: 4000,
        imagePath: 'assets/images/gold_pack.png',
        category: 'جولد',
      ),
    ];
  }

  /// حفظ المنتجات في SharedPreferences
  Future<void> _saveProducts() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = _products.map((p) => p.toJson()).toList();
    await prefs.setString('products', jsonEncode(jsonList));
  }

  /// إضافة منتج جديد
  Future<void> addProduct(Product product) async {
    _products.add(product);
    await _saveProducts();
    notifyListeners();
  }

  /// تحديث منتج
  Future<void> updateProduct(Product product) async {
    final index = _products.indexWhere((p) => p.id == product.id);
    if (index != -1) {
      _products[index] = product;
      await _saveProducts();
      notifyListeners();
    }
  }

  /// حذف منتج
  Future<void> deleteProduct(String productId) async {
    _products.removeWhere((p) => p.id == productId);
    await _saveProducts();
    notifyListeners();
  }

  /// الحصول على منتج بواسطة المعرف
  Product? getProductById(String id) {
    try {
      return _products.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }

  /// الحصول على منتجات حسب الفئة
  List<Product> getProductsByCategory(String category) {
    return _products
        .where((p) => p.category == category && p.isActive)
        .toList();
  }

  /// الحصول على جميع الفئات
  List<String> get categories {
    return _products.map((p) => p.category).toSet().toList();
  }

  /// تبديل حالة المنتج (نشط/غير نشط)
  Future<void> toggleProductStatus(String productId) async {
    final index = _products.indexWhere((p) => p.id == productId);
    if (index != -1) {
      _products[index] = _products[index].copyWith(
        isActive: !_products[index].isActive,
      );
      await _saveProducts();
      notifyListeners();
    }
  }

  /// تبديل حالة المنتج المميز
  Future<void> toggleFeatured(String productId) async {
    final index = _products.indexWhere((p) => p.id == productId);
    if (index != -1) {
      _products[index] = _products[index].copyWith(
        isFeatured: !_products[index].isFeatured,
      );
      await _saveProducts();
      notifyListeners();
    }
  }

  /// إعادة تحميل المنتجات
  Future<void> refresh() async {
    _isLoaded = false;
    notifyListeners();
    await _loadProducts();
  }

  /// إعادة تعيين المنتجات للافتراضية
  Future<void> resetToDefault() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('products');
    _products = _getDefaultProducts();
    await _saveProducts();
    notifyListeners();
  }
}
