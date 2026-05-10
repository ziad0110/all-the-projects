import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';

class PackagesScreen extends StatelessWidget {
  const PackagesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final washTypes = Provider.of<OrdersProvider>(context).washTypes;
    return SafeArea(
        child: SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(L.t('جميع الباقات', 'All Packages'),
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        ...washTypes.map((w) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                  color: AppColors.bgSecondaryLight,
                                  borderRadius: BorderRadius.circular(14)),
                              child: Center(
                                  child: Text(w.icon,
                                      style: const TextStyle(fontSize: 28)))),
                          const SizedBox(width: 12),
                          Expanded(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(w.name,
                                    style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700)),
                                Text(w.desc,
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSecondary)),
                              ])),
                          Column(children: [
                            Text(
                                '${w.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primary)),
                            Text(L.yer,
                                style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondary)),
                          ]),
                        ]),
                        const SizedBox(height: 12),
                        Row(children: [
                          Icon(Icons.schedule,
                              size: 14, color: AppColors.textTertiary),
                          const SizedBox(width: 4),
                          Text('${w.duration} ${L.minutes}',
                              style: TextStyle(
                                  fontSize: 12, color: AppColors.textTertiary)),
                        ]),
                        const SizedBox(height: 12),
                        Text(L.includes,
                            style: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        ...w.includes.map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(children: [
                                Icon(Icons.check_circle,
                                    size: 16, color: AppColors.success),
                                const SizedBox(width: 8),
                                Expanded(
                                    child: Text(item,
                                        style: TextStyle(
                                            fontSize: 13,
                                            color: AppColors.textSecondary))),
                              ]),
                            )),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () => Navigator.pushNamed(
                              context, AppRouter.customerOrder,
                              arguments: w.id),
                          icon: const Icon(Icons.shopping_cart, size: 18),
                          label: Text(L.orderNow),
                        ),
                      ])),
            )),
        const SizedBox(height: 60),
      ]),
    ));
  }
}
