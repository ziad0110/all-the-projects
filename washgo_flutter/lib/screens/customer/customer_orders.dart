import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class CustomerOrdersPage extends StatelessWidget {
  const CustomerOrdersPage({super.key});
  @override
  Widget build(BuildContext context) {
    final orders = Provider.of<OrdersProvider>(context).orders;
    final op = Provider.of<OrdersProvider>(context);
    return SafeArea(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.all(20),
        child: Text(L.myOrders, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
      Expanded(child: orders.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.receipt_long, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 12),
            Text(L.t('لا توجد طلبات', 'No Orders'), style: TextStyle(color: AppColors.textSecondary)),
          ]))
        : ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: orders.length > 4 ? 4 : orders.length,
          itemBuilder: (_, i) {
            final o = orders[i];
            final w = op.getWashType(o.washType);
            return GestureDetector(
              onTap: () => Navigator.pushNamed(context, AppRouter.customerTracking, arguments: o.id),
              child: Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(o.id, style: const TextStyle(fontWeight: FontWeight.w700)),
                    StatusBadge(status: o.status),
                  ]),
                  const SizedBox(height: 8),
                  Row(children: [
                    Text(w.icon, style: const TextStyle(fontSize: 28)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(w.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      Text('${o.carType} • ${o.carColor}', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      Text('${o.date} - ${o.time}', style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
                    ])),
                    Text(formatPrice(o.price), style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary)),
                  ]),
                ])),
              ),
            );
          },
        )),
    ]));
  }
}
