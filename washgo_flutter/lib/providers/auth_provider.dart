import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  String _role = ''; // 'admin', 'customer', 'employee'
  bool _isLoggedIn = false;

  String get role => _role;
  bool get isLoggedIn => _isLoggedIn;

  void login(String role) {
    _role = role;
    _isLoggedIn = true;
    notifyListeners();
  }

  void logout() {
    _role = '';
    _isLoggedIn = false;
    notifyListeners();
  }
}
