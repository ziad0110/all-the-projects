import 'package:flutter/material.dart';
import '../../core/localization.dart';
import 'employee_orders.dart';
import 'map_view.dart';
import 'earnings_screen.dart';
import 'employee_profile.dart';

class EmployeeLayout extends StatefulWidget {
  const EmployeeLayout({super.key});
  @override
  State<EmployeeLayout> createState() => _EmployeeLayoutState();
}

class _EmployeeLayoutState extends State<EmployeeLayout> {
  int _currentIndex = 0;
  final _pages = const [
    EmployeeOrdersPage(),
    MapViewPage(),
    EarningsScreen(),
    EmployeeProfilePage()
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: [
          BottomNavigationBarItem(
              icon: const Icon(Icons.receipt_long), label: L.orders),
          BottomNavigationBarItem(icon: const Icon(Icons.map), label: L.map),
          BottomNavigationBarItem(
              icon: const Icon(Icons.account_balance_wallet),
              label: L.myEarnings),
          BottomNavigationBarItem(
              icon: const Icon(Icons.person), label: L.profile),
        ],
      ),
    );
  }
}
