import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final order = op.orders.firstWhere((o) => o.id == orderId, orElse: () => op.orders.first);
    final wash = op.getWashType(order.washType);
    final actionLabels = {
      'pending': L.acceptOrder, 'accepted': L.onMyWay, 'onway': L.arrived,
      'arrived': L.startWork, 'started': L.completeWork,
    };
    final actionIcons = {
      'pending': Icons.check_circle, 'accepted': Icons.directions_car, 'onway': Icons.place,
      'arrived': Icons.play_arrow, 'started': Icons.done_all,
    };

    return Scaffold(
      appBar: AppBar(title: Text('${L.orderDetails} - ${order.id}')),
      body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
        // Customer info
        _InfoSection(L.customerInfo, [
          _InfoRow(L.t('الاسم','Name'), order.customer),
          _InfoRow(L.phone, order.phone),
          _InfoRow(L.t('الموقع','Location'), order.location),
        ]),
        // Car info
        _InfoSection(L.carInfo, [
          _InfoRow(L.t('النوع','Type'), order.carType),
          _InfoRow(L.t('اللون','Color'), order.carColor),
          if (order.plate.isNotEmpty) _InfoRow(L.t('اللوحة','Plate'), order.plate),
        ]),
        // Service info
        _InfoSection(L.serviceDetails, [
          _InfoRow(L.t('نوع الغسيل','Wash'), wash.name),
          _InfoRow(L.t('السعر','Price'), formatPrice(order.price), highlight: true),
          _InfoRow(L.t('الدفع','Payment'), L.paymentName(order.payment)),
          _InfoRow(L.t('الحالة','Status'), L.status(order.status)),
        ]),
        // Map placeholder
        const SizedBox(height: 12),
        Container(height: 150, decoration: BoxDecoration(color: AppColors.bgSecondaryLight, borderRadius: BorderRadius.circular(12)),
          child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.location_on, size: 32, color: AppColors.primary),
            Text(order.location, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ]))),
        const SizedBox(height: 20),
        // Action button
        if (order.status != 'completed' && order.status != 'cancelled') ...[
          ElevatedButton.icon(
            onPressed: () {
              op.advanceOrder(order.id);
              if (order.status == 'completed') {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(L.t('تم إنهاء العمل!','Work completed!')), backgroundColor: AppColors.success));
                Navigator.pushReplacementNamed(context, AppRouter.employeeQR);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(L.t('تم تحديث الحالة','Status updated')), backgroundColor: AppColors.success));
              }
            },
            icon: Icon(actionIcons[order.status] ?? Icons.check, size: 20),
            label: Text(actionLabels[order.status] ?? L.t('تحديث','Update')),
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
          ),
          if (order.status == 'pending') ...[
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.close, color: AppColors.danger, size: 18),
              label: Text(L.t('رفض الطلب','Reject'), style: const TextStyle(color: AppColors.danger)),
              style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.danger)),
            ),
          ],
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.call, size: 18),
            label: Text(L.t('اتصال بالعميل','Call Customer')),
          ),
        ],
      ])),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _InfoSection(this.title, this.children);
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontWeight: FontWeight.w700)), const Divider(), ...children,
    ])));
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  final bool highlight;
  const _InfoRow(this.label, this.value, {this.highlight = false});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
      Text(value, style: TextStyle(fontWeight: highlight ? FontWeight.w800 : FontWeight.w500,
        color: highlight ? AppColors.primary : null, fontSize: 13)),
    ]));
}
