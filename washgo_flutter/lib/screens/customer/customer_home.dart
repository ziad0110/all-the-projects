import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../providers/theme_provider.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/shared_widgets.dart';

class CustomerHomePage extends StatelessWidget {
  const CustomerHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final op = Provider.of<OrdersProvider>(context);
    return SafeArea(
      child: SingleChildScrollView(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Header
          Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(children: [
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(L.hello,
                          style: TextStyle(
                              fontSize: 14, color: AppColors.textSecondary)),
                      Text(L.t('أحمد محمد', 'Ahmed Mohammed'),
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w700)),
                    ])),
                ThemeLangToggles(
                    onThemeToggle: tp.toggleTheme,
                    onLangToggle: tp.toggleLocale,
                    isDark: tp.isDark,
                    locale: tp.locale),
                const SizedBox(width: 8),
                Stack(children: [
                  HeaderIconButton(
                      icon: Icons.notifications_outlined,
                      onTap: () {
                        // TODO: navigate to notifications
                      }),
                  Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                              color: AppColors.danger,
                              borderRadius: BorderRadius.circular(8)),
                          child: const Center(
                              child: Text('2',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700))))),
                ]),
              ])),
          const SizedBox(height: 16),
          // Promo Banner
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16)),
            child: Row(children: [
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(
                        L.t('خصم 30% على أول غسلة!',
                            '30% OFF your first wash!'),
                        style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Colors.white)),
                    const SizedBox(height: 4),
                    Text(L.t('استخدم كود WASH30', 'Use code WASH30'),
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 12),
                    Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20)),
                        child: Text(L.orderNow,
                            style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 13))),
                  ])),
              const Text('🚗', style: TextStyle(fontSize: 48)),
            ]),
          ),
          const SizedBox(height: 20),
          // Services
          SectionTitle(
            title: L.ourServices,
            action: L.viewAll,
            onAction: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (ctx) => Container(
                  height: MediaQuery.of(context).size.height * 0.7,
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(children: [
                    const SizedBox(height: 12),
                    Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                            color: Colors.grey.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(2))),
                    const SizedBox(height: 16),
                    Text(L.ourServices,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w700)),
                    const Divider(),
                    Expanded(
                        child: GridView.builder(
                            padding: const EdgeInsets.all(20),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 1.1,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                            ),
                            itemCount: op.washTypes.length,
                            itemBuilder: (context, i) {
                              final w = op.washTypes[i];
                              return GestureDetector(
                                  onTap: () {
                                    Navigator.pop(context);
                                    Navigator.pushNamed(
                                        context, AppRouter.customerOrder,
                                        arguments: w.id);
                                  },
                                  child: Card(
                                      elevation: 2,
                                      child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(w.icon,
                                                style: const TextStyle(
                                                    fontSize: 36)),
                                            const SizedBox(height: 8),
                                            Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8),
                                              child: Text(w.name,
                                                  style: const TextStyle(
                                                      fontSize: 13,
                                                      fontWeight:
                                                          FontWeight.w700),
                                                  textAlign: TextAlign.center,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(formatPrice(w.price),
                                                style: TextStyle(
                                                    color: AppColors.primary,
                                                    fontWeight: FontWeight.w800,
                                                    fontSize: 12)),
                                          ])));
                            }))
                  ]),
                ),
              );
            },
          ),
          SizedBox(
              height: 140,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: op.washTypes.length,
                itemBuilder: (_, i) {
                  final w = op.washTypes[i];
                  return GestureDetector(
                    onTap: () => Navigator.pushNamed(
                        context, AppRouter.customerOrder,
                        arguments: w.id),
                    child: Container(
                      width: 110,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: Card(
                          child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(w.icon,
                                        style: const TextStyle(fontSize: 28)),
                                    const SizedBox(height: 6),
                                    Expanded(
                                        child: Center(
                                            child: Text(w.name,
                                                style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight:
                                                        FontWeight.w600),
                                                textAlign: TextAlign.center,
                                                maxLines: 2,
                                                overflow:
                                                    TextOverflow.ellipsis))),
                                    const SizedBox(height: 4),
                                    Text(formatPrice(w.price),
                                        style: TextStyle(
                                            fontSize: 11,
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w700)),
                                  ]))),
                    ),
                  );
                },
              )),
          // Featured Packages
          SectionTitle(title: L.featuredPackages),
          ...op.washTypes.skip(2).map((w) => GestureDetector(
                onTap: () => Navigator.pushNamed(
                    context, AppRouter.customerOrder,
                    arguments: w.id),
                child: Card(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(children: [
                        Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                                color: AppColors.bgSecondaryLight,
                                borderRadius: BorderRadius.circular(12)),
                            child: Center(
                                child: Text(w.icon,
                                    style: const TextStyle(fontSize: 24)))),
                        const SizedBox(width: 12),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(w.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                              const SizedBox(height: 2),
                              Text(w.desc,
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary)),
                              const SizedBox(height: 4),
                              Row(children: [
                                Icon(Icons.schedule,
                                    size: 14, color: AppColors.textTertiary),
                                const SizedBox(width: 4),
                                Text('${w.duration} ${L.minutes}',
                                    style: TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textTertiary)),
                              ]),
                            ])),
                        Text(formatPrice(w.price),
                            style: TextStyle(
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary)),
                      ])),
                ),
              )),
          const SizedBox(height: 16),
          // CTA
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(
                  context, AppRouter.customerOrder,
                  arguments: 1),
              icon: const Icon(Icons.local_car_wash),
              label: Text(L.t('اطلب غسلة الآن', 'Order a Wash Now')),
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 52)),
            ),
          ),
          const SizedBox(height: 80),
        ]),
      ),
    );
  }
}
