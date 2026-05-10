import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../widgets/shared_widgets.dart';

class AdminAnalyticsPage extends StatelessWidget {
  const AdminAnalyticsPage({super.key});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(children: [
        LayoutBuilder(
            builder: (ctx, cons) => GridView.count(
                    crossAxisCount: cons.maxWidth < 600 ? 2 : 4,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: cons.maxWidth < 600 ? 1.15 : 2.2,
                    children: [
                      KPICard(
                          label: L.t('إجمالي الإيرادات', 'Total Revenue'),
                          value: '12,500,000',
                          icon: Icons.payments,
                          iconBg: const Color(0xFFF0FDF4),
                          iconColor: AppColors.primary,
                          change: '+18%'),
                      KPICard(
                          label: L.t('إجمالي الطلبات', 'Total Orders'),
                          value: '847',
                          icon: Icons.receipt,
                          iconBg: const Color(0xFFEFF6FF),
                          iconColor: AppColors.info,
                          change: '+25%'),
                      KPICard(
                          label: L.t('معدل الإكمال', 'Completion Rate'),
                          value: '94%',
                          icon: Icons.verified,
                          iconBg: AppColors.successLight,
                          iconColor: AppColors.success,
                          change: '+3%'),
                      KPICard(
                          label: L.t('معدل النمو', 'Growth Rate'),
                          value: '+22%',
                          icon: Icons.trending_up,
                          iconBg: AppColors.warningLight,
                          iconColor: AppColors.warning),
                    ])),
        const SizedBox(height: 20),
        LayoutBuilder(builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 800;
          final charts = [
            // Performance bar chart
            Card(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(L.t('أداء الموظفين', 'Employee Performance'),
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 16),
                          SizedBox(
                              height: 200,
                              child: BarChart(BarChartData(
                                barGroups: [
                                  _bar(0, 45, AppColors.primary),
                                  _bar(1, 38, AppColors.primaryLight),
                                  _bar(2, 52, AppColors.success),
                                  _bar(3, 28, AppColors.info),
                                  _bar(4, 33, const Color(0xFF8B5CF6)),
                                ],
                                titlesData: FlTitlesData(
                                  topTitles: const AxisTitles(
                                      sideTitles:
                                          SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(
                                      sideTitles:
                                          SideTitles(showTitles: false)),
                                  bottomTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                          showTitles: true,
                                          reservedSize: 28,
                                          getTitlesWidget: (v, _) {
                                            final n = [
                                              L.t('علي', 'Ali'),
                                              L.t('محمد', 'Mohammed'),
                                              L.t('أحمد', 'Ahmed'),
                                              L.t('عمر', 'Omar'),
                                              L.t('ياسر', 'Yaser')
                                            ];
                                            return Text(
                                                n[v.toInt().clamp(0, 4)],
                                                style: TextStyle(
                                                    fontSize: 10,
                                                    color: AppColors
                                                        .textTertiary));
                                          })),
                                  leftTitles: const AxisTitles(
                                      sideTitles:
                                          SideTitles(showTitles: false)),
                                ),
                                borderData: FlBorderData(show: false),
                                gridData: const FlGridData(show: false),
                              ))),
                        ]))),
            if (isMobile)
              const SizedBox(height: 12)
            else
              const SizedBox(width: 12),
            // Growth chart
            Card(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(L.t('معدل النمو الشهري', 'Monthly Growth'),
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 16),
                          SizedBox(
                              height: 200,
                              child: LineChart(LineChartData(
                                gridData: const FlGridData(show: false),
                                borderData: FlBorderData(show: false),
                                titlesData: const FlTitlesData(
                                    topTitles: AxisTitles(
                                        sideTitles:
                                            SideTitles(showTitles: false)),
                                    rightTitles: AxisTitles(
                                        sideTitles:
                                            SideTitles(showTitles: false)),
                                    leftTitles: AxisTitles(
                                        sideTitles:
                                            SideTitles(showTitles: false)),
                                    bottomTitles: AxisTitles(
                                        sideTitles:
                                            SideTitles(showTitles: false))),
                                lineBarsData: [
                                  LineChartBarData(
                                    spots: const [
                                      FlSpot(0, 10),
                                      FlSpot(1, 15),
                                      FlSpot(2, 22),
                                      FlSpot(3, 18),
                                      FlSpot(4, 28),
                                      FlSpot(5, 35)
                                    ],
                                    isCurved: true,
                                    color: AppColors.success,
                                    barWidth: 3,
                                    dotData: FlDotData(
                                        show: true,
                                        getDotPainter: (_, __, ___, ____) =>
                                            FlDotCirclePainter(
                                                color: AppColors.success,
                                                radius: 3,
                                                strokeWidth: 2,
                                                strokeColor: Colors.white)),
                                    belowBarData: BarAreaData(
                                        show: true,
                                        color:
                                            AppColors.success.withOpacity(0.1)),
                                  )
                                ],
                              ))),
                        ]))),
          ];
          return isMobile
              ? Column(children: charts)
              : Row(
                  children: charts
                      .map((c) => c is SizedBox ? c : Expanded(child: c))
                      .toList());
        }),
      ]),
    );
  }

  static BarChartGroupData _bar(int x, double y, Color c) =>
      BarChartGroupData(x: x, barRods: [
        BarChartRodData(
            toY: y,
            color: c,
            width: 20,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(6)))
      ]);
}
