import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';

class AdminQRLogsPage extends StatelessWidget {
  const AdminQRLogsPage({super.key});
  @override
  Widget build(BuildContext context) {
    final logs = [
      {
        'orderId': 'ORD-001',
        'customer': 'أحمد محمد',
        'employee': 'علي حسن',
        'time': '2026-02-23 09:15',
        'status': 'scanned'
      },
      {
        'orderId': 'ORD-002',
        'customer': 'خالد عبدالله',
        'employee': 'علي حسن',
        'time': '2026-02-23 10:45',
        'status': 'pending'
      },
      {
        'orderId': 'ORD-003',
        'customer': 'سارة أحمد',
        'employee': 'محمد سعيد',
        'time': '2026-02-23 11:30',
        'status': 'expired'
      },
      {
        'orderId': 'ORD-005',
        'customer': 'فاطمة حسين',
        'employee': 'أحمد علي',
        'time': '2026-02-22 15:00',
        'status': 'scanned'
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
            child: ListView.builder(
          itemCount: logs.length,
          itemBuilder: (_, i) {
            final log = logs[i];
            Color bg, fg;
            String label;
            switch (log['status']) {
              case 'scanned':
                bg = AppColors.successLight;
                fg = AppColors.success;
                label = L.t('تم المسح', 'Scanned');
                break;
              case 'expired':
                bg = AppColors.dangerLight;
                fg = AppColors.danger;
                label = L.t('منتهي', 'Expired');
                break;
              default:
                bg = AppColors.warningLight;
                fg = AppColors.warning;
                label = L.t('معلق', 'Pending');
            }
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                        color: AppColors.bgSecondaryLight,
                        borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.qr_code_2, color: AppColors.primary)),
                title: Text(log['orderId']!,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(
                    '${log['customer']} → ${log['employee']}\n${log['time']}',
                    style: TextStyle(
                        fontSize: 12, color: AppColors.textSecondary)),
                isThreeLine: true,
                trailing: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                        color: bg, borderRadius: BorderRadius.circular(12)),
                    child: Text(label,
                        style: TextStyle(
                            color: fg,
                            fontSize: 11,
                            fontWeight: FontWeight.w600))),
              ),
            );
          },
        )),
      ]),
    );
  }
}
