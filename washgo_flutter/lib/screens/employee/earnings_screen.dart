import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final emp = Provider.of<OrdersProvider>(context).employees.first;
    final history = [
      {'title': L.t('غسيل خارجي','External Wash'), 'customer': L.t('أحمد','Ahmed'), 'date': '2026-02-23 09:30', 'amount': 2000},
      {'title': L.t('تنظيف عميق','Deep Clean'), 'customer': L.t('سارة','Sara'), 'date': '2026-02-23 11:00', 'amount': 5000},
      {'title': L.t('غسيل داخلي وخارجي','In & Out'), 'customer': L.t('يوسف','Yousuf'), 'date': '2026-02-23 08:00', 'amount': 3500},
      {'title': L.t('باقة VIP','VIP Package'), 'customer': L.t('فاطمة','Fatima'), 'date': '2026-02-22 14:00', 'amount': 12000},
      {'title': L.t('تلميع كامل','Full Polish'), 'customer': L.t('نورا','Noura'), 'date': '2026-02-22 10:30', 'amount': 8000},
    ];
    return SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
      Text(L.myEarnings, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
      const SizedBox(height: 16),
      // Earnings header
      Container(width: double.infinity, padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
        child: Column(children: [
          Text(formatPrice(emp.revenue), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white)),
          Text(L.totalEarnings, style: const TextStyle(color: Colors.white70)),
        ])),
      const SizedBox(height: 16),
      // Stats
      Row(children: [
        _Stat(emp.tasks.toString(), L.tasksDone),
        const SizedBox(width: 8),
        _Stat(emp.hours.toString(), L.workHours),
        const SizedBox(width: 8),
        _Stat(emp.rating.toString(), L.rating),
        const SizedBox(width: 8),
        _Stat(formatPrice((emp.revenue / emp.tasks).round()), L.t('متوسط','Avg')),
      ]),
      SectionTitle(title: L.t('سجل الأرباح','Earnings History')),
      ...history.map((e) => Card(margin: const EdgeInsets.only(bottom: 6), child: ListTile(
        leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.successLight, borderRadius: BorderRadius.circular(20)),
          child: const Icon(Icons.payments, size: 20, color: AppColors.success)),
        title: Text(e['title'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text('${e['customer']} • ${e['date']}', style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
        trailing: Text('+${formatPrice(e['amount'] as int)}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.success)),
      ))),
      const SizedBox(height: 60),
    ])));
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  const _Stat(this.value, this.label);
  @override
  Widget build(BuildContext context) => Expanded(child: Card(
    child: Padding(padding: const EdgeInsets.all(10), child: Column(children: [
      Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary)),
      Text(label, style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
    ])),
  ));
}
