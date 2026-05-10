import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class EmployeeOrdersPage extends StatefulWidget {
  const EmployeeOrdersPage({super.key});
  @override
  State<EmployeeOrdersPage> createState() => _EmployeeOrdersPageState();
}

class _EmployeeOrdersPageState extends State<EmployeeOrdersPage> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final op = Provider.of<OrdersProvider>(context);
    final filtered = _filter == 'all' ? op.orders : op.orders.where((o) {
      if (_filter == 'active') return ['accepted','onway','arrived','started'].contains(o.status);
      return o.status == _filter;
    }).toList();

    return SafeArea(child: Column(children: [
      // Header
      Padding(padding: const EdgeInsets.fromLTRB(20, 16, 20, 0), child: Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(5))),
        const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.t('علي حسن','Ali Hassan'), style: const TextStyle(fontWeight: FontWeight.w700)),
          Text(L.online, style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ]),
        const Spacer(),
        ThemeLangToggles(onThemeToggle: tp.toggleTheme, onLangToggle: tp.toggleLocale, isDark: tp.isDark, locale: tp.locale),
      ])),
      const SizedBox(height: 12),
      // Filter tabs
      SizedBox(height: 36, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          {'id': 'all', 'label': L.all}, {'id': 'pending', 'label': L.newOrders},
          {'id': 'active', 'label': L.active}, {'id': 'completed', 'label': L.done},
        ].map((f) {
          final cnt = f['id'] == 'all' ? op.orders.length
            : f['id'] == 'active' ? op.orders.where((o) => ['accepted','onway','arrived','started'].contains(o.status)).length
            : op.orders.where((o) => o.status == f['id']).length;
          return Padding(padding: const EdgeInsets.only(right: 6),
            child: ChoiceChip(label: Text('${f['label']} ($cnt)', style: const TextStyle(fontSize: 12)),
              selected: _filter == f['id'], selectedColor: AppColors.primary.withOpacity(0.15),
              onSelected: (_) => setState(() => _filter = f['id']!)));
        }).toList(),
      )),
      const SizedBox(height: 8),
      // Orders
      Expanded(child: filtered.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.inbox, size: 48, color: AppColors.textTertiary),
            Text(L.t('لا توجد طلبات','No Orders'), style: TextStyle(color: AppColors.textSecondary)),
          ]))
        : ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: filtered.length,
          itemBuilder: (_, i) {
            final o = filtered[i];
            final w = op.getWashType(o.washType);
            return GestureDetector(
              onTap: () => Navigator.pushNamed(context, AppRouter.employeeOrderDetail, arguments: o.id),
              child: Card(margin: const EdgeInsets.only(bottom: 8), child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(o.id, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  StatusBadge(status: o.status),
                ]),
                const SizedBox(height: 8),
                _OrderRow(Icons.person, o.customer),
                _OrderRow(Icons.directions_car, '${o.carType} - ${o.carColor} ${o.plate.isNotEmpty ? "(${o.plate})" : ""}'),
                _OrderRow(Icons.local_car_wash, w.name),
                _OrderRow(Icons.location_on, o.location),
                const SizedBox(height: 8),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(formatPrice(o.price), style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary)),
                  Text('${o.date} ${o.time}', style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
                ]),
              ]))),
            );
          },
        )),
    ]));
  }
}

class _OrderRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _OrderRow(this.icon, this.text);
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 4),
    child: Row(children: [Icon(icon, size: 16, color: AppColors.textTertiary), const SizedBox(width: 8),
      Expanded(child: Text(text, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)))]));
}
