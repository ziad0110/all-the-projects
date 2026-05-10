import 'package:flutter/material.dart';

class CartItem {
  final int id;
  final String name;
  final double price;
  final String image;
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.image,
    this.quantity = 1,
  });
}

class CartService extends ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  void addItem(int id, String name, double price, String image) {
    final index = _items.indexWhere((item) => item.id == id);
    if (index != -1) {
      _items[index].quantity++;
    } else {
      _items.add(CartItem(id: id, name: name, price: price, image: image));
    }
    notifyListeners();
  }

  void removeItem(int id) {
    _items.removeWhere((item) => item.id == id);
    notifyListeners();
  }

  void updateQuantity(int id, int quantity) {
    final index = _items.indexWhere((item) => item.id == id);
    if (index != -1) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      notifyListeners();
    }
  }

  double get total => _items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  int get count => _items.fold(0, (sum, item) => sum + item.quantity);

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
