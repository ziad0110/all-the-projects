import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class OrderTrackingScreen extends StatelessWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final order = op.orders.firstWhere((o) => o.id == orderId, orElse: () => op.orders.first);
    final wash = op.getWashType(order.washType);
    final statuses = ['pending','accepted','onway','arrived','started','completed'];
    final labels = [L.t('قيد الانتظار','Pending'), L.t('تم القبول','Accepted'), L.t('في الطريق','On the Way'),
      L.t('تم الوصول','Arrived'), L.t('جاري التنفيذ','In Progress'), L.t('مكتمل','Completed')];
    final icons = [Icons.hourglass_empty, Icons.check_circle, Icons.directions_car, Icons.place, Icons.build, Icons.done_all];
    final idx = statuses.indexOf(order.status);

    return Scaffold(
      appBar: AppBar(title: Text('${L.orderTracking} - ${order.id}')),
      body: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
        // Employee card
        if (order.employee != null) Card(
          child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
            Container(width: 44, height: 44, decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(22)),
              child: Center(child: Text(order.employee![0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18)))),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(order.employee!, style: const TextStyle(fontWeight: FontWeight.w700)),
              Text(L.t('الموظف المسؤول', 'Assigned Employee'), style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ])),
            Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
              child: Icon(Icons.call, color: AppColors.primary, size: 20)),
          ])),
        ),
        const SizedBox(height: 12),
        // Map placeholder
        Container(height: 160, decoration: BoxDecoration(color: AppColors.bgSecondaryLight, borderRadius: BorderRadius.circular(12)),
          child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.location_on, size: 36, color: AppColors.primary),
            Text(order.location, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ]))),
        const SizedBox(height: 20),
        // Timeline
        Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.orderStatus, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          ...List.generate(6, (i) {
            final isDone = i < idx;
            final isActive = i == idx;
            return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Column(children: [
                Container(width: 28, height: 28,
                  decoration: BoxDecoration(shape: BoxShape.circle,
                    color: isDone || isActive ? AppColors.primary : AppColors.bgSecondaryLight,
                    border: Border.all(color: isDone || isActive ? AppColors.primary : AppColors.borderLight)),
                  child: Icon(icons[i], size: 14, color: isDone || isActive ? Colors.white : AppColors.textTertiary)),
                if (i < 5) Container(width: 2, height: 32, color: i < idx ? AppColors.primary : AppColors.borderLight),
              ]),
              const SizedBox(width: 12),
              Expanded(child: Padding(padding: const EdgeInsets.only(bottom: 8), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(labels[i], style: TextStyle(fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isDone || isActive ? null : AppColors.textTertiary)),
                if (i <= idx) Text('${order.date} ${order.time}', style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
              ]))),
            ]);
          }),
        ]))),
        const SizedBox(height: 12),
        // Order details
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.orderDetails, style: const TextStyle(fontWeight: FontWeight.w700)),
          const Divider(),
          _Row(L.t('نوع الغسيل','Wash'), wash.name),
          _Row(L.t('السيارة','Car'), '${order.carType} - ${order.carColor}'),
          _Row(L.paymentMethod, L.paymentName(order.payment)),
          _Row(L.total, formatPrice(order.price), highlight: true),
        ]))),
      ])),
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  final bool highlight;
  const _Row(this.label, this.value, {this.highlight = false});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
      Text(value, style: TextStyle(fontWeight: highlight ? FontWeight.w800 : FontWeight.w600,
        color: highlight ? AppColors.primary : null)),
    ]));
}
