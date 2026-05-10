import 'package:flutter/material.dart';
import '../models/order.dart';
import '../models/wash_type.dart';
import '../models/employee.dart';

class OrdersProvider extends ChangeNotifier {
  final List<Order> _orders = Order.mockOrders();
  final List<WashType> _washTypes = WashType.all();
  final List<Employee> _employees = Employee.mockEmployees();

  List<Order> get orders => _orders;
  List<WashType> get washTypes => _washTypes;
  List<Employee> get employees => _employees;

  WashType getWashType(int id) => _washTypes.firstWhere((w) => w.id == id, orElse: () => _washTypes.first);

  void advanceOrder(String orderId) {
    final order = _orders.firstWhere((o) => o.id == orderId, orElse: () => _orders.first);
    const flow = ['pending', 'accepted', 'onway', 'arrived', 'started', 'completed'];
    final idx = flow.indexOf(order.status);
    if (idx < flow.length - 1) {
      order.status = flow[idx + 1];
      notifyListeners();
    }
  }

  int get customerPoints => 7;
  int get customerTotalOps => 17;
  int get customerFreeWashes => 1;
}
