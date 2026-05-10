import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // KPIs
        LayoutBuilder(builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 600;
          return GridView.count(
            crossAxisCount: isMobile ? 2 : 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: isMobile ? 1.15 : 2,
            children: [
              KPICard(
                  label: L.revenueToday,
                  value: '125,000',
                  icon: Icons.payments,
                  iconBg: const Color(0xFFF0FDF4),
                  iconColor: AppColors.primary,
                  change: '+12%'),
              KPICard(
                  label: L.revenueMonth,
                  value: '3,850,000',
                  icon: Icons.trending_up,
                  iconBg: const Color(0xFFEFF6FF),
                  iconColor: AppColors.info,
                  change: '+8%'),
              KPICard(
                  label: L.ordersToday,
                  value: '47',
                  icon: Icons.receipt_long,
                  iconBg: const Color(0xFFFAF5FF),
                  iconColor: const Color(0xFF9333EA),
                  change: '+15%'),
              KPICard(
                  label: L.completed,
                  value: '42',
                  icon: Icons.check_circle,
                  iconBg: AppColors.successLight,
                  iconColor: AppColors.success,
                  change: '+10%'),
              KPICard(
                  label: L.cancelled,
                  value: '3',
                  icon: Icons.cancel,
                  iconBg: AppColors.dangerLight,
                  iconColor: AppColors.danger,
                  change: '-5%',
                  isUp: false),
              KPICard(
                  label: L.activeCustomers,
                  value: '1,240',
                  icon: Icons.people,
                  iconBg: const Color(0xFFF0FDF4),
                  iconColor: const Color(0xFF16A34A),
                  change: '+22%'),
              KPICard(
                  label: L.employees,
                  value: '15',
                  icon: Icons.engineering,
                  iconBg: const Color(0xFFFAF5FF),
                  iconColor: const Color(0xFF9333EA)),
              KPICard(
                  label: L.avgRating,
                  value: '4.7',
                  icon: Icons.star,
                  iconBg: AppColors.warningLight,
                  iconColor: AppColors.warning),
            ],
          );
        }),
        const SizedBox(height: 20),
        // Charts
        Column(children: [
          _RevenueChart(),
          const SizedBox(height: 12),
          _WashDistChart(),
        ]),
        const SizedBox(height: 20),
        // Recent orders table
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(L.t('أحدث الطلبات', 'Recent Orders'),
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              _OrdersTable(),
            ]),
          ),
        ),
      ]),
    );
  }
}

class _RevenueChart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.t('الإيرادات', 'Revenue'),
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: LineChart(LineChartData(
              gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => FlLine(
                      color: AppColors.borderLight.withOpacity(0.5),
                      strokeWidth: 0.5)),
              titlesData: FlTitlesData(
                topTitles:
                    const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles:
                    const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 24,
                        getTitlesWidget: (v, _) => Text(
                            [
                              '',
                              'S',
                              'M',
                              'T',
                              'W',
                              'T',
                              'F',
                              'S'
                            ][v.toInt().clamp(0, 7)],
                            style: TextStyle(
                                fontSize: 10, color: AppColors.textTertiary)))),
                leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (v, _) => Text(
                            '${(v / 1000).toStringAsFixed(0)}k',
                            style: TextStyle(
                                fontSize: 10, color: AppColors.textTertiary)))),
              ),
              borderData: FlBorderData(show: false),
              minX: 1,
              maxX: 7,
              minY: 0,
              maxY: 200000,
              lineBarsData: [
                LineChartBarData(
                  spots: const [
                    FlSpot(1, 80000),
                    FlSpot(2, 120000),
                    FlSpot(3, 95000),
                    FlSpot(4, 150000),
                    FlSpot(5, 180000),
                    FlSpot(6, 125000),
                    FlSpot(7, 160000)
                  ],
                  isCurved: true,
                  color: AppColors.primary,
                  barWidth: 3,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                      show: true, color: AppColors.primary.withOpacity(0.1)),
                ),
              ],
            )),
          ),
        ]),
      ),
    );
  }
}

class _WashDistChart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(L.t('توزيع أنواع الغسيل', 'Wash Distribution'),
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: PieChart(PieChartData(
              sections: [
                PieChartSectionData(
                    value: 35,
                    color: AppColors.primary,
                    title: '35%',
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                    radius: 50),
                PieChartSectionData(
                    value: 28,
                    color: AppColors.primaryLight,
                    title: '28%',
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                    radius: 50),
                PieChartSectionData(
                    value: 18,
                    color: AppColors.success,
                    title: '18%',
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                    radius: 50),
                PieChartSectionData(
                    value: 12,
                    color: AppColors.info,
                    title: '12%',
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                    radius: 50),
                PieChartSectionData(
                    value: 7,
                    color: const Color(0xFF8B5CF6),
                    title: '7%',
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white),
                    radius: 50),
              ],
              centerSpaceRadius: 30,
              sectionsSpace: 2,
            )),
          ),
        ]),
      ),
    );
  }
}

class _OrdersTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final orders = Provider.of<OrdersProvider>(context).orders;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        headingRowColor: WidgetStateProperty.all(AppColors.bgSecondaryLight),
        columns: [
          DataColumn(label: Text(L.t('رقم', 'ID'))),
          DataColumn(label: Text(L.t('العميل', 'Customer'))),
          DataColumn(label: Text(L.t('السيارة', 'Car'))),
          DataColumn(label: Text(L.t('الخدمة', 'Service'))),
          DataColumn(label: Text(L.t('السعر', 'Price'))),
          DataColumn(label: Text(L.t('الحالة', 'Status'))),
        ],
        rows: orders
            .take(5)
            .map((o) => DataRow(cells: [
                  DataCell(Text(o.id,
                      style: const TextStyle(fontWeight: FontWeight.w600))),
                  DataCell(Text(o.customer)),
                  DataCell(Text('${o.carType} - ${o.carColor}')),
                  DataCell(Text(Provider.of<OrdersProvider>(context)
                      .getWashType(o.washType)
                      .name)),
                  DataCell(Text(formatPrice(o.price),
                      style: const TextStyle(fontWeight: FontWeight.w700))),
                  DataCell(StatusBadge(status: o.status)),
                ]))
            .toList(),
      ),
    );
  }
}
