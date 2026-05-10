import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../core/localization.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg, fg;
    switch (status) {
      case 'completed':
        bg = AppColors.successLight;
        fg = AppColors.success;
        break;
      case 'pending':
        bg = AppColors.warningLight;
        fg = AppColors.warning;
        break;
      case 'cancelled':
        bg = AppColors.dangerLight;
        fg = AppColors.danger;
        break;
      case 'started':
        bg = AppColors.infoLight;
        fg = AppColors.info;
        break;
      default:
        bg = AppColors.primaryLight.withOpacity(0.2);
        fg = AppColors.primary;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(L.status(status),
          style:
              TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

class KPICard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color iconBg, iconColor;
  final String? change;
  final bool isUp;
  const KPICard(
      {super.key,
      required this.label,
      required this.value,
      required this.icon,
      required this.iconBg,
      required this.iconColor,
      this.change,
      this.isUp = true});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500)),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                  color: iconBg, borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: iconColor, size: 22),
            ),
          ]),
          const SizedBox(height: 8),
          Text(value,
              style:
                  const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          if (change != null) ...[
            const SizedBox(height: 4),
            Row(children: [
              Icon(isUp ? Icons.trending_up : Icons.trending_down,
                  size: 14, color: isUp ? AppColors.success : AppColors.danger),
              const SizedBox(width: 4),
              Text(change!,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isUp ? AppColors.success : AppColors.danger)),
            ]),
          ],
        ]),
      ),
    );
  }
}

class StarRating extends StatelessWidget {
  final int rating;
  final double size;
  final bool interactive;
  final ValueChanged<int>? onChanged;
  const StarRating(
      {super.key,
      required this.rating,
      this.size = 24,
      this.interactive = false,
      this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(5, (i) {
          return GestureDetector(
            onTap: interactive ? () => onChanged?.call(i + 1) : null,
            child: Icon(
                i < rating ? Icons.star_rounded : Icons.star_border_rounded,
                color: AppColors.warning,
                size: size),
          );
        }));
  }
}

class ThemeLangToggles extends StatelessWidget {
  final VoidCallback onThemeToggle, onLangToggle;
  final bool isDark;
  final String locale;
  const ThemeLangToggles(
      {super.key,
      required this.onThemeToggle,
      required this.onLangToggle,
      required this.isDark,
      required this.locale});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      HeaderIconButton(label: locale == 'ar' ? 'EN' : 'ع', onTap: onLangToggle),
      const SizedBox(width: 8),
      HeaderIconButton(
          icon: isDark ? Icons.light_mode : Icons.dark_mode,
          onTap: onThemeToggle),
    ]);
  }
}

class HeaderIconButton extends StatelessWidget {
  final String? label;
  final IconData? icon;
  final VoidCallback onTap;
  const HeaderIconButton(
      {super.key, this.label, this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: isDark ? AppColors.bgSecondaryDark : AppColors.bgSecondaryLight,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
          child: Center(
              child: icon != null
                  ? Icon(icon,
                      size: 20,
                      color: isDark ? AppColors.textLight : AppColors.textDark)
                  : Text(label!,
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? AppColors.textLight
                              : AppColors.textDark))),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String title;
  final String? action;
  final VoidCallback? onAction;
  const SectionTitle(
      {super.key, required this.title, this.action, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        if (action != null)
          GestureDetector(
              onTap: onAction,
              child: Text(action!,
                  style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600))),
      ]),
    );
  }
}

String formatPrice(int price) =>
    '${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} ${L.yer}';
