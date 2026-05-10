import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class PointsScreen extends StatelessWidget {
  const PointsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final progress = (op.customerPoints % 10) / 10;
    final history = [
      {'type': 'earned', 'title': L.t('غسيل خارجي','External Wash'), 'date': '2026-02-23', 'pts': '+1'},
      {'type': 'earned', 'title': L.t('تنظيف عميق','Deep Clean'), 'date': '2026-02-20', 'pts': '+1'},
      {'type': 'redeemed', 'title': L.t('غسلة مجانية','Free Wash'), 'date': '2026-02-18', 'pts': '-10'},
      {'type': 'earned', 'title': L.t('باقة VIP','VIP Package'), 'date': '2026-02-15', 'pts': '+1'},
      {'type': 'earned', 'title': L.t('غسيل داخلي وخارجي','In & Out'), 'date': '2026-02-12', 'pts': '+1'},
    ];

    return SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
      Text(L.myPoints, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
      const SizedBox(height: 20),
      // Points card
      Container(
        width: double.infinity, padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
        child: Column(children: [
          Text('${op.customerPoints}', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w800, color: Colors.white)),
          Text(L.points, style: const TextStyle(color: Colors.white70, fontSize: 16)),
          const SizedBox(height: 16),
          ClipRRect(borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(value: progress, backgroundColor: Colors.white24, color: Colors.white, minHeight: 8)),
          const SizedBox(height: 8),
          Text('${op.customerPoints % 10}/10 ${L.forFreeWash}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
        ]),
      ),
      const SizedBox(height: 16),
      // Stats cards
      Row(children: [
        _StatCard(L.points, '${op.customerPoints}'),
        const SizedBox(width: 8),
        _StatCard(L.operations, '${op.customerTotalOps}'),
        const SizedBox(width: 8),
        _StatCard(L.freeWashes, '${op.customerFreeWashes}'),
      ]),
      SectionTitle(title: L.pointsHistory),
      ...history.map((h) => Card(
        margin: const EdgeInsets.only(bottom: 6),
        child: ListTile(
          leading: Container(width: 40, height: 40, decoration: BoxDecoration(
            color: h['type'] == 'earned' ? AppColors.successLight : AppColors.dangerLight,
            borderRadius: BorderRadius.circular(20)),
            child: Icon(h['type'] == 'earned' ? Icons.add_circle : Icons.redeem, size: 20,
              color: h['type'] == 'earned' ? AppColors.success : AppColors.danger)),
          title: Text(h['title']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text(h['date']!, style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
          trailing: Text(h['pts']!, style: TextStyle(fontWeight: FontWeight.w800,
            color: h['type'] == 'earned' ? AppColors.success : AppColors.danger)),
        ),
      )),
      const SizedBox(height: 60),
    ])));
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  const _StatCard(this.label, this.value);
  @override
  Widget build(BuildContext context) => Expanded(child: Card(
    child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [
      Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.primary)),
      const SizedBox(height: 4),
      Text(label, style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
    ])),
  ));
}
