import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';

class QRGeneratorScreen extends StatefulWidget {
  const QRGeneratorScreen({super.key});
  @override
  State<QRGeneratorScreen> createState() => _QRGeneratorScreenState();
}

class _QRGeneratorScreenState extends State<QRGeneratorScreen> {
  int _timeLeft = 120;
  Timer? _timer;
  String _qrData = 'WASHGO-ORD002-${DateTime.now().millisecondsSinceEpoch}';

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_timeLeft > 0) {
        setState(() => _timeLeft--);
      } else {
        _timer?.cancel();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(L.t('انتهت صلاحية الكود', 'QR Code expired')),
            backgroundColor: AppColors.warning));
      }
    });
  }

  void _refresh() {
    setState(() {
      _timeLeft = 120;
      _qrData = 'WASHGO-ORD002-${DateTime.now().millisecondsSinceEpoch}';
    });
    _startTimer();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(L.t('تم إنشاء كود جديد', 'New QR generated')),
        backgroundColor: AppColors.success));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final min = _timeLeft ~/ 60;
    final sec = _timeLeft % 60;
    return Scaffold(
      body: SafeArea(
          child: Center(
              child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('QR Code',
              style:
                  const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(L.scanQR, style: TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 24),
          // QR Code
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.1), blurRadius: 20)
                ]),
            child: QrImageView(
                data: _qrData,
                version: QrVersions.auto,
                size: 200,
                eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square, color: Color(0xFF0D7C46)),
                dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Color(0xFF0D7C46))),
          ),
          const SizedBox(height: 16),
          // Timer
          Text('$min:${sec.toString().padLeft(2, '0')}',
              style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  color:
                      _timeLeft <= 30 ? AppColors.danger : AppColors.primary)),
          Text(L.validFor2Min,
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(height: 16),
          // Order info
          Card(
              child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(children: [
                    _Row(L.t('رقم الطلب', 'Order ID'), 'ORD-002'),
                    _Row(L.t('العميل', 'Customer'),
                        L.t('خالد عبدالله', 'Khaled Abdullah')),
                    _Row(L.serviceDetails,
                        L.t('غسيل داخلي وخارجي', 'In & Out Wash')),
                  ]))),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: _refresh, child: Text(L.generateNew)),
          const SizedBox(height: 8),
          OutlinedButton(
              onPressed: () => Navigator.pushReplacementNamed(
                  context, AppRouter.employeeHome),
              child: Text(L.t('العودة للطلبات', 'Back to Orders'))),
        ]),
      ))),
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  const _Row(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label,
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        Text(value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      ]));
}
