import 'package:flutter/material.dart';
import '../screens/portal_screen.dart';
import '../screens/admin/admin_login.dart';
import '../screens/admin/admin_layout.dart';
import '../screens/customer/splash_screen.dart';
import '../screens/customer/customer_login.dart';
import '../screens/customer/customer_layout.dart';
import '../screens/customer/order_screen.dart';
import '../screens/customer/order_tracking.dart';
import '../screens/customer/rating_screen.dart';
import '../screens/customer/customer_orders.dart';
import '../screens/customer/points_screen.dart';
import '../screens/customer/packages_screen.dart';
import '../screens/customer/my_cars.dart';
import '../screens/customer/help_screen.dart';
import '../screens/employee/employee_login.dart';
import '../screens/employee/employee_layout.dart';
import '../screens/employee/order_detail.dart';
import '../screens/employee/qr_generator.dart';

class AppRouter {
  static const String portal = '/';
  static const String adminLogin = '/admin/login';
  static const String adminDashboard = '/admin/dashboard';
  static const String customerSplash = '/customer/splash';
  static const String customerLogin = '/customer/login';
  static const String customerHome = '/customer/home';
  static const String customerOrder = '/customer/order';
  static const String customerOrders = '/customer/orders';
  static const String customerPoints = '/customer/points';
  static const String customerPackages = '/customer/packages';
  static const String customerMyCars = '/customer/my-cars';
  static const String customerHelp = '/customer/help';
  static const String customerTracking = '/customer/tracking';
  static const String customerRating = '/customer/rating';
  static const String employeeLogin = '/employee/login';
  static const String employeeHome = '/employee/home';
  static const String employeeOrderDetail = '/employee/order-detail';
  static const String employeeQR = '/employee/qr';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case portal:
        return _fade(const PortalScreen());
      case adminLogin:
        return _fade(const AdminLoginScreen());
      case adminDashboard:
        return _fade(const AdminLayout());
      case customerSplash:
        return _fade(const SplashScreen());
      case customerLogin:
        return _fade(const CustomerLoginScreen());
      case customerHome:
        return _fade(const CustomerLayout());
      case customerOrders:
        return _slide(const Scaffold(body: CustomerOrdersPage()));
      case customerPoints:
        return _slide(const Scaffold(body: PointsScreen()));
      case customerPackages:
        return _slide(const Scaffold(body: PackagesScreen()));
      case customerMyCars:
        return _slide(const MyCarsScreen());
      case customerHelp:
        return _slide(const HelpScreen());
      case customerOrder:
        final washId = settings.arguments as int? ?? 1;
        return _slide(OrderScreen(initialWashId: washId));
      case customerTracking:
        final orderId = settings.arguments as String? ?? 'ORD-001';
        return _slide(OrderTrackingScreen(orderId: orderId));
      case customerRating:
        return _slide(const RatingScreen());
      case employeeLogin:
        return _fade(const EmployeeLoginScreen());
      case employeeHome:
        return _fade(const EmployeeLayout());
      case employeeOrderDetail:
        final orderId = settings.arguments as String? ?? 'ORD-001';
        return _slide(OrderDetailScreen(orderId: orderId));
      case employeeQR:
        return _slide(const QRGeneratorScreen());
      default:
        return _fade(const PortalScreen());
    }
  }

  static PageRouteBuilder _fade(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, anim, __, child) =>
          FadeTransition(opacity: anim, child: child),
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  static PageRouteBuilder _slide(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, anim, __, child) {
        return SlideTransition(
          position: Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
              .animate(CurvedAnimation(parent: anim, curve: Curves.easeOut)),
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}
