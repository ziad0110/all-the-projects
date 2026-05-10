import 'package:flutter/material.dart';
import '../../core/localization.dart';
import 'customer_home.dart';
import 'packages_screen.dart';
import 'customer_orders.dart';
import 'points_screen.dart';
import 'customer_profile.dart';

class CustomerLayout extends StatefulWidget {
  const CustomerLayout({super.key});
  @override
  State<CustomerLayout> createState() => _CustomerLayoutState();
}

class _CustomerLayoutState extends State<CustomerLayout> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const CustomerHomePage(),
      const PackagesScreen(),
      const CustomerOrdersPage(),
      const PointsScreen(),
      const CustomerProfilePage(),
    ];
    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home), label: L.home),
          BottomNavigationBarItem(
              icon: const Icon(Icons.local_car_wash), label: L.packages),
          BottomNavigationBarItem(
              icon: const Icon(Icons.receipt_long), label: L.myOrders),
          BottomNavigationBarItem(
              icon: const Icon(Icons.stars), label: L.myPoints),
          BottomNavigationBarItem(
              icon: const Icon(Icons.person), label: L.profile),
        ],
      ),
    );
  }
}
