import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class MapViewPage extends StatelessWidget {
  const MapViewPage({super.key});
  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final active = op.orders.where((o) => !['completed','cancelled'].contains(o.status)).toList();
    return SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.all(16), child: Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(5))),
        const SizedBox(width: 8),
        Text(L.map, style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(width: 8),
        Text('${active.length} ${L.t('طلبات نشطة','active orders')}', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ])),
      // Map area
      Expanded(flex: 3, child: Container(
        decoration: BoxDecoration(color: AppColors.bgSecondaryLight, border: Border.symmetric(horizontal: BorderSide(color: AppColors.borderLight))),
        child: Stack(children: [
          Center(child: Icon(Icons.map, size: 64, color: AppColors.textTertiary.withOpacity(0.3))),
          ...active.asMap().entries.map((e) => Positioned(
            top: 40 + e.key * 60.0, left: 30 + e.key * 50.0,
            child: GestureDetector(
              onTap: () => Navigator.pushNamed(context, AppRouter.employeeOrderDetail, arguments: e.value.id),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.location_on, color: AppColors.primary, size: 30),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(4)),
                  child: Text(e.value.id, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600))),
              ]),
            ),
          )),
        ]),
      )),
      // Bottom sheet
      Container(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.t('الطلبات القريبة','Nearby Orders'), style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ...active.take(3).map((o) => GestureDetector(
            onTap: () => Navigator.pushNamed(context, AppRouter.employeeOrderDetail, arguments: o.id),
            child: Padding(padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(children: [
                Text(op.getWashType(o.washType).icon, style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(o.customer, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  Text(o.location, style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ])),
                StatusBadge(status: o.status),
              ])),
          )),
        ]),
      ),
    ]));
  }
}
