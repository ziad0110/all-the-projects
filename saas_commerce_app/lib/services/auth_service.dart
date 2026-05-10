import 'package:flutter/material.dart';
import 'package:saas_commerce_app/models/user.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  bool _isAuthenticated = false;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;

  AuthService() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final role = prefs.getString('user_role');
    if (role != null) {
      _currentUser = User(
        username: prefs.getString('username') ?? '',
        name: prefs.getString('name') ?? '',
        role: role,
        isGuest: prefs.getBool('is_guest') ?? false,
        area: prefs.getString('area'),
        phone: prefs.getString('phone'),
      );
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  // بيانات المستخدمين التجريبية - يمكن استبدالها بـ API
  final Map<String, Map<String, dynamic>> _mockUsers = {
    'customer': {'password': 'customer123', 'role': 'customer', 'name': 'عميل'},
    'admin': {'password': 'admin123', 'role': 'admin', 'name': 'المدير'},
    'driver1': {
      'password': 'driver123',
      'role': 'driver',
      'name': 'مندوب السبعين',
      'driverId': 1,
      'area': 'السبعين',
      'phone': '777111111',
    },
  };

  Future<bool> login(String username, String password) async {
    await Future.delayed(const Duration(milliseconds: 500));

    if (_mockUsers.containsKey(username) &&
        _mockUsers[username]!['password'] == password) {
      final data = _mockUsers[username]!;
      _currentUser = User(
        username: username,
        name: data['name'],
        role: data['role'],
        driverId: data['driverId'],
        area: data['area'],
        phone: data['phone'],
      );
      _isAuthenticated = true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('username', username);
      await prefs.setString('user_role', data['role']);
      await prefs.setString('name', data['name']);
      await prefs.setBool('is_guest', false);
      if (data['area'] != null) await prefs.setString('area', data['area']);
      if (data['phone'] != null) await prefs.setString('phone', data['phone']);

      notifyListeners();
      return true;
    }
    return false;
  }

  void loginAsGuest() async {
    _currentUser = User(
      username: 'guest',
      name: 'زائر',
      role: 'customer',
      isGuest: true,
    );
    _isAuthenticated = true;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_role', 'customer');
    await prefs.setBool('is_guest', true);

    notifyListeners();
  }

  void logout() async {
    _currentUser = null;
    _isAuthenticated = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }
}
