import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../widgets/shared_widgets.dart';

class AdminCustomersPage extends StatelessWidget {
  const AdminCustomersPage({super.key});
  @override
  Widget build(BuildContext context) {
    final customers = [
      {
        'name': 'أحمد محمد',
        'phone': '777123456',
        'orders': 17,
        'points': 7,
        'spent': 85000
      },
      {
        'name': 'خالد عبدالله',
        'phone': '771987654',
        'orders': 12,
        'points': 2,
        'spent': 62000
      },
      {
        'name': 'سارة أحمد',
        'phone': '773456789',
        'orders': 8,
        'points': 8,
        'spent': 45000
      },
      {
        'name': 'يوسف كمال',
        'phone': '774112233',
        'orders': 5,
        'points': 5,
        'spent': 28000
      },
      {
        'name': 'فاطمة حسين',
        'phone': '775998877',
        'orders': 22,
        'points': 2,
        'spent': 120000
      },
    ];
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(children: [
        TextField(
            decoration: InputDecoration(
                hintText: L.search,
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10))),
        const SizedBox(height: 16),
        Expanded(
            child: Card(
                child: SingleChildScrollView(
                    child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          headingRowColor: WidgetStateProperty.all(
                              AppColors.bgSecondaryLight),
                          columns: [
                            DataColumn(label: Text(L.t('العميل', 'Customer'))),
                            DataColumn(label: Text(L.phone)),
                            DataColumn(label: Text(L.t('الطلبات', 'Orders'))),
                            DataColumn(label: Text(L.points)),
                            DataColumn(label: Text(L.t('الإنفاق', 'Spent'))),
                          ],
                          rows: customers
                              .map((c) => DataRow(cells: [
                                    DataCell(Row(children: [
                                      Container(
                                          width: 32,
                                          height: 32,
                                          decoration: BoxDecoration(
                                              color: AppColors.bgSecondaryLight,
                                              borderRadius:
                                                  BorderRadius.circular(16)),
                                          child: Center(
                                              child: Text(
                                                  (c['name'] as String)[0],
                                                  style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      fontSize: 12,
                                                      color:
                                                          AppColors.primary)))),
                                      const SizedBox(width: 8),
                                      Text(c['name'] as String),
                                    ])),
                                    DataCell(Text(c['phone'] as String,
                                        textDirection: TextDirection.ltr)),
                                    DataCell(Text('${c['orders']}')),
                                    DataCell(Text('${c['points']}')),
                                    DataCell(
                                        Text(formatPrice(c['spent'] as int))),
                                  ]))
                              .toList(),
                        ))))),
      ]),
    );
  }
}
