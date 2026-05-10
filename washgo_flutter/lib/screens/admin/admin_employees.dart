import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class AdminEmployeesPage extends StatelessWidget {
  const AdminEmployeesPage({super.key});
  @override
  Widget build(BuildContext context) {
    final emps = Provider.of<OrdersProvider>(context).employees;
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
              child: TextField(
                  decoration: InputDecoration(
                      hintText: L.search,
                      prefixIcon: const Icon(Icons.search),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10)))),
          const SizedBox(width: 12),
          ElevatedButton.icon(
              style: ElevatedButton.styleFrom(minimumSize: const Size(0, 48)),
              onPressed: () => _showAddDialog(context),
              icon: const Icon(Icons.add, size: 18),
              label: Text(L.addEmployee)),
        ]),
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
                            DataColumn(label: Text(L.t('الموظف', 'Employee'))),
                            DataColumn(label: Text(L.t('الهاتف', 'Phone'))),
                            DataColumn(label: Text(L.t('المهام', 'Tasks'))),
                            DataColumn(label: Text(L.t('الساعات', 'Hours'))),
                            DataColumn(
                                label: Text(L.t('الإيرادات', 'Revenue'))),
                            DataColumn(label: Text(L.rating)),
                            DataColumn(label: Text(L.t('إجراءات', 'Actions'))),
                          ],
                          rows: emps
                              .map((e) => DataRow(cells: [
                                    DataCell(Row(children: [
                                      Container(
                                          width: 32,
                                          height: 32,
                                          decoration: BoxDecoration(
                                              gradient:
                                                  AppColors.primaryGradient,
                                              borderRadius:
                                                  BorderRadius.circular(16)),
                                          child: Center(
                                              child: Text(e.name[0],
                                                  style: const TextStyle(
                                                      color: Colors.white,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      fontSize: 12)))),
                                      const SizedBox(width: 8),
                                      Text(e.name),
                                    ])),
                                    DataCell(Text(e.phone,
                                        textDirection: TextDirection.ltr)),
                                    DataCell(Text('${e.tasks}')),
                                    DataCell(Text('${e.hours}')),
                                    DataCell(Text(formatPrice(e.revenue))),
                                    DataCell(Row(children: [
                                      StarRating(
                                          rating: e.rating.round(), size: 14),
                                      const SizedBox(width: 4),
                                      Text('${e.rating}',
                                          style: const TextStyle(fontSize: 12))
                                    ])),
                                    DataCell(Row(children: [
                                      IconButton(
                                          icon:
                                              const Icon(Icons.edit, size: 18),
                                          color: AppColors.primary,
                                          onPressed: () {}),
                                      IconButton(
                                          icon: const Icon(Icons.delete,
                                              size: 18),
                                          color: AppColors.danger,
                                          onPressed: () {}),
                                    ])),
                                  ]))
                              .toList(),
                        ))))),
      ]),
    );
  }

  void _showAddDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (_) => AlertDialog(
              title: Text(L.addEmployee),
              content: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(
                    decoration:
                        InputDecoration(labelText: L.t('الاسم', 'Name'))),
                const SizedBox(height: 12),
                TextField(
                    decoration: InputDecoration(labelText: L.phone),
                    textDirection: TextDirection.ltr),
              ]),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(L.cancel)),
                ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(L.save)),
              ],
            ));
  }
}
