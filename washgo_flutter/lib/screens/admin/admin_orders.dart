import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class AdminOrdersPage extends StatefulWidget {
  const AdminOrdersPage({super.key});
  @override
  State<AdminOrdersPage> createState() => _AdminOrdersPageState();
}

class _AdminOrdersPageState extends State<AdminOrdersPage> {
  String _filter = 'all';
  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final filtered = _filter == 'all'
        ? op.orders
        : op.orders.where((o) => o.status == _filter).toList();
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Filters
        // Filters
        TextField(
            decoration: InputDecoration(
                hintText: L.search,
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10))),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ['all', 'pending', 'started', 'completed', 'cancelled']
                .map((f) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: ChoiceChip(
                          label: Text(f == 'all' ? L.all : L.status(f),
                              style: const TextStyle(fontSize: 12)),
                          selected: _filter == f,
                          selectedColor: AppColors.primary.withOpacity(0.15),
                          onSelected: (_) => setState(() => _filter = f)),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: Card(
            child: SingleChildScrollView(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  headingRowColor:
                      WidgetStateProperty.all(AppColors.bgSecondaryLight),
                  columns: [
                    DataColumn(label: Text(L.t('رقم', 'ID'))),
                    DataColumn(label: Text(L.t('العميل', 'Customer'))),
                    DataColumn(label: Text(L.t('السيارة', 'Car'))),
                    DataColumn(label: Text(L.t('النوع', 'Type'))),
                    DataColumn(label: Text(L.t('السعر', 'Price'))),
                    DataColumn(label: Text(L.t('الدفع', 'Payment'))),
                    DataColumn(label: Text(L.t('التاريخ', 'Date'))),
                    DataColumn(label: Text(L.t('الحالة', 'Status'))),
                  ],
                  rows: filtered
                      .map((o) => DataRow(cells: [
                            DataCell(Text(o.id,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600))),
                            DataCell(Text(o.customer)),
                            DataCell(Text('${o.carType} - ${o.carColor}')),
                            DataCell(Text(op.getWashType(o.washType).name)),
                            DataCell(Text(formatPrice(o.price))),
                            DataCell(Text(L.paymentName(o.payment))),
                            DataCell(Text('${o.date} ${o.time}')),
                            DataCell(StatusBadge(status: o.status)),
                          ]))
                      .toList(),
                ),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
