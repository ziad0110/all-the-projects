import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class AdminOffersPage extends StatelessWidget {
  const AdminOffersPage({super.key});
  @override
  Widget build(BuildContext context) {
    final washTypes = Provider.of<OrdersProvider>(context).washTypes;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
              child: Text(L.offersPricing,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w700))),
          ElevatedButton.icon(
              style: ElevatedButton.styleFrom(minimumSize: const Size(0, 48)),
              onPressed: () {
                _showPackageDialog(context);
              },
              icon: const Icon(Icons.add, size: 18),
              label: Text(L.t('إضافة باقة', 'Add Package'))),
        ]),
        const SizedBox(height: 16),
        LayoutBuilder(builder: (context, constraints) {
          int count = constraints.maxWidth < 600
              ? 1
              : (constraints.maxWidth < 900 ? 2 : 3);
          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: count,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: count == 1 ? 0.9 : 0.7),
            itemCount: washTypes.length,
            itemBuilder: (_, i) {
              final w = washTypes[i];
              final isFeatured = i == washTypes.length - 1;
              return Card(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                        color: isFeatured
                            ? AppColors.primary
                            : AppColors.borderLight,
                        width: isFeatured ? 2 : 1)),
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(children: [
                      if (isFeatured)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(20)),
                          child: Text('VIP',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                        ),
                      const SizedBox(height: 8),
                      Text(w.icon, style: const TextStyle(fontSize: 36)),
                      const SizedBox(height: 8),
                      Text(w.name,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                          textAlign: TextAlign.center),
                      const SizedBox(height: 4),
                      Text(formatPrice(w.price),
                          style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary)),
                      Text('${w.duration} ${L.minutes}',
                          style: TextStyle(
                              fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      ...w.includes.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(children: [
                              Icon(Icons.check_circle,
                                  size: 14, color: AppColors.success),
                              const SizedBox(width: 6),
                              Expanded(
                                  child: Text(item,
                                      style: TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondary))),
                            ]),
                          )),
                      const Spacer(),
                      Row(children: [
                        Expanded(
                            child: OutlinedButton(
                                onPressed: () {
                                  _showPackageDialog(context,
                                      package: w.name, editMode: true);
                                },
                                child: Text(L.t('تعديل', 'Edit'),
                                    style: const TextStyle(fontSize: 12)))),
                      ]),
                    ])),
              );
            },
          );
        }),
        const SizedBox(height: 24),
        // Loyalty settings
        Card(
            child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(L.t('نظام النقاط', 'Loyalty System'),
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      _SettingRow(
                          label: L.t('نقاط لكل عملية', 'Points per operation'),
                          value: '1'),
                      _SettingRow(
                          label: L.t(
                              'نقاط للغسلة المجانية', 'Points for free wash'),
                          value: '10'),
                    ]))),
      ]),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String label, value;
  const _SettingRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child:
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: TextStyle(color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ]));
  }
}

void _showPackageDialog(BuildContext context,
    {String? package, bool editMode = false}) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(editMode
          ? L.t('تعديل الباقة', 'Edit Package')
          : L.t('إضافة باقة جديدة', 'Add New Package')),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: L.t('اسم الباقة', 'Package Name'),
                border: const OutlineInputBorder(),
              ),
              controller: TextEditingController(text: package ?? ''),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: L.t('السعر', 'Price'),
                border: const OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: L.t('المدة (دقائق)', 'Duration (minutes)'),
                border: const OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: Text(L.t('إلغاء', 'Cancel')),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(ctx);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(L.t('تم الحفظ بنجاح', 'Saved successfully'))),
            );
          },
          child: Text(L.t('حفظ', 'Save')),
        ),
      ],
    ),
  );
}
