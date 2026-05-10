import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';
import '../../widgets/confetti.dart';

class RatingScreen extends StatefulWidget {
  const RatingScreen({super.key});
  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen>
    with SingleTickerProviderStateMixin {
  int _rating = 0;
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _scale = Tween(begin: 0.0, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ratingTexts = {
      1: '😞 ${L.t('سيء', 'Bad')}',
      2: '😐 ${L.t('مقبول', 'Fair')}',
      3: '🙂 ${L.t('جيد', 'Good')}',
      4: '😊 ${L.t('ممتاز', 'Great')}',
      5: '🤩 ${L.t('رائع!', 'Excellent!')}'
    };
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: ScaleTransition(
                scale: _scale,
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(36)),
                      child: const Icon(Icons.check,
                          size: 36, color: Colors.white)),
                  const SizedBox(height: 20),
                  Text(L.washCompleted,
                      style: const TextStyle(
                          fontSize: 22, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text(L.howWasExperience,
                      style: TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 24),
                  // Stars
                  Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        5,
                        (i) => GestureDetector(
                          onTap: () => setState(() => _rating = i + 1),
                          child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              child: Icon(
                                  i < _rating
                                      ? Icons.star_rounded
                                      : Icons.star_border_rounded,
                                  size: 40,
                                  color: AppColors.warning)),
                        ),
                      )),
                  const SizedBox(height: 8),
                  if (_rating > 0)
                    Text(ratingTexts[_rating]!,
                        style: TextStyle(
                            color: AppColors.warning,
                            fontWeight: FontWeight.w600)),
                  const SizedBox(height: 20),
                  TextField(
                      decoration: InputDecoration(
                          hintText: L.t('أضف تعليقك (اختياري)',
                              'Add a comment (optional)')),
                      maxLines: 3),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      if (_rating == 0) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text(L.t('اختر تقييم', 'Select a rating')),
                            backgroundColor: AppColors.warning));
                        return;
                      }
                      showConfetti(context);
                      Future.delayed(const Duration(seconds: 2), () {
                        if (mounted)
                          Navigator.pushReplacementNamed(
                              context, AppRouter.customerHome);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(L.t(
                              'شكراً لتقييمك! ⭐', 'Thanks for your rating! ⭐')),
                          backgroundColor: AppColors.success));
                    },
                    child: Text(L.submitRating),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: () => Navigator.pushReplacementNamed(
                        context, AppRouter.customerHome),
                    child: Text(L.skip),
                  ),
                  const SizedBox(height: 16),
                  Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12)),
                      child: Row(children: [
                        Icon(Icons.stars, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                            child: Text(
                                L.t('تم إضافة نقطة واحدة إلى رصيدك!',
                                    '1 point added to your balance!'),
                                style: TextStyle(
                                    fontSize: 13, color: AppColors.primary))),
                      ])),
                ])),
          ),
        ),
      ),
    );
  }
}
