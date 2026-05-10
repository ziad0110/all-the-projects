import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';
import '../../widgets/confetti.dart';

class OrderScreen extends StatefulWidget {
  final int initialWashId;
  const OrderScreen({super.key, required this.initialWashId});
  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  int _step = 1;
  late int _selectedWash;
  int _selectedCar = 0;
  String _payment = 'cash';

  @override
  void initState() {
    super.initState();
    _selectedWash = widget.initialWashId;
  }

  @override
  Widget build(BuildContext context) {
    final op = Provider.of<OrdersProvider>(context);
    final wash = op.getWashType(_selectedWash);
    final cars = [
      {'type': 'Toyota Camry', 'color': L.t('أبيض', 'White'), 'plate': '12345'},
      {'type': 'Hyundai Accent', 'color': L.t('فضي', 'Silver'), 'plate': ''}
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text('${L.newOrder} ($_step/4)'),
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () =>
                _step > 1 ? setState(() => _step--) : Navigator.pop(context)),
      ),
      body: Column(children: [
        // Step indicator
        Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                    4,
                    (i) => Row(mainAxisSize: MainAxisSize.min, children: [
                          Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: i + 1 <= _step
                                      ? AppColors.primary
                                      : AppColors.bgSecondaryLight,
                                  border: Border.all(
                                      color: i + 1 <= _step
                                          ? AppColors.primary
                                          : AppColors.borderLight)),
                              child: Center(
                                  child: i + 1 < _step
                                      ? const Icon(Icons.check,
                                          size: 14, color: Colors.white)
                                      : Text('${i + 1}',
                                          style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                              color: i + 1 == _step
                                                  ? Colors.white
                                                  : AppColors.textTertiary)))),
                          if (i < 3)
                            Container(
                                width: 32,
                                height: 2,
                                color: i + 1 < _step
                                    ? AppColors.primary
                                    : AppColors.borderLight),
                        ])))),

        // Step content
        Expanded(
            child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _buildStep(op, wash, cars))),

        // Button
        Padding(
            padding: const EdgeInsets.all(20),
            child: ElevatedButton.icon(
              onPressed: () {
                if (_step < 4)
                  setState(() => _step++);
                else {
                  showConfetti(context);
                  Future.delayed(const Duration(seconds: 2), () {
                    if (mounted) Navigator.pop(context);
                  });
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(L.t('تم إرسال الطلب بنجاح! 🎉',
                          'Order placed successfully! 🎉')),
                      backgroundColor: AppColors.success));
                }
              },
              icon: Icon(_step < 4 ? Icons.arrow_back : Icons.check),
              label: Text(_step < 4 ? L.next : L.confirmOrder),
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 52)),
            )),
      ]),
    );
  }

  Widget _buildStep(OrdersProvider op, wash, List<Map<String, String>> cars) {
    if (_step == 1)
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(L.selectWash,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        ...op.washTypes.map((w) => GestureDetector(
              onTap: () => setState(() => _selectedWash = w.id),
              child: Card(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                        color: _selectedWash == w.id
                            ? AppColors.primary
                            : AppColors.borderLight,
                        width: _selectedWash == w.id ? 2 : 1)),
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(children: [
                      Text(w.icon, style: const TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text(w.name,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700)),
                            Text('${w.duration} ${L.minutes}',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary)),
                          ])),
                      Text(formatPrice(w.price),
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary)),
                    ])),
              ),
            )),
      ]);
    if (_step == 2)
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(L.selectCar,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        ...cars.asMap().entries.map((e) => GestureDetector(
              onTap: () => setState(() => _selectedCar = e.key),
              child: Card(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                        color: _selectedCar == e.key
                            ? AppColors.primary
                            : AppColors.borderLight,
                        width: _selectedCar == e.key ? 2 : 1)),
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(children: [
                      const Text('🚗', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text(e.value['type']!,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700)),
                            Text(
                                '${e.value['color']} ${e.value['plate']!.isNotEmpty ? '• ${e.value['plate']}' : ''}',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary)),
                          ])),
                    ])),
              ),
            )),
        const SizedBox(height: 8),
        OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add),
            label: Text(L.addCar)),
      ]);
    if (_step == 3)
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(L.setLocation,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        Container(
            height: 180,
            decoration: BoxDecoration(
                color: AppColors.bgSecondaryLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight)),
            child: Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.location_on, size: 40, color: AppColors.primary),
              Text(L.t('اضغط لتحديد الموقع', 'Tap to set location'),
                  style: TextStyle(color: AppColors.textSecondary)),
            ]))),
        const SizedBox(height: 16),
        TextField(
            decoration:
                InputDecoration(labelText: L.phone, hintText: '777123456'),
            textDirection: TextDirection.ltr,
            keyboardType: TextInputType.phone),
        const SizedBox(height: 12),
        TextField(
            decoration: InputDecoration(
                labelText: L.notes,
                hintText: L.t('أي ملاحظات...', 'Any notes...')),
            maxLines: 3),
      ]);
    // Step 4: Payment
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(L.paymentMethod,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      const SizedBox(height: 12),
      ...[
        {'id': 'cash', 'icon': '💵', 'label': L.cash},
        {'id': 'bank', 'icon': '🏦', 'label': L.bankTransfer},
        {'id': 'wallet', 'icon': '📱', 'label': L.eWallet}
      ].map((p) => GestureDetector(
            onTap: () => setState(() => _payment = p['id']!),
            child: Card(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                      color: _payment == p['id']
                          ? AppColors.primary
                          : AppColors.borderLight,
                      width: _payment == p['id'] ? 2 : 1)),
              margin: const EdgeInsets.only(bottom: 8),
              child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    Text(p['icon']!, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Text(p['label']!,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    const Spacer(),
                    Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: _payment == p['id']
                                    ? AppColors.primary
                                    : AppColors.borderLight,
                                width: 2),
                            color: _payment == p['id']
                                ? AppColors.primary
                                : Colors.transparent),
                        child: _payment == p['id']
                            ? const Icon(Icons.check,
                                size: 12, color: Colors.white)
                            : null),
                  ])),
            ),
          )),
      const SizedBox(height: 16),
      Card(
          child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(L.orderSummary,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    const Divider(),
                    _SummaryRow(
                        label: L.t('نوع الغسيل', 'Wash'), value: wash.name),
                    _SummaryRow(
                        label: L.t('السيارة', 'Car'),
                        value: cars[_selectedCar]['type']!),
                    _SummaryRow(
                        label: L.paymentMethod, value: L.paymentName(_payment)),
                    _SummaryRow(
                        label: L.total,
                        value: formatPrice(wash.price),
                        highlight: true),
                  ]))),
    ]);
  }
}

class _SummaryRow extends StatelessWidget {
  final String label, value;
  final bool highlight;
  const _SummaryRow(
      {required this.label, required this.value, this.highlight = false});
  @override
  Widget build(BuildContext context) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        Text(value,
            style: TextStyle(
                fontWeight: highlight ? FontWeight.w800 : FontWeight.w600,
                color: highlight ? AppColors.primary : null,
                fontSize: highlight ? 15 : 13)),
      ]));
}
