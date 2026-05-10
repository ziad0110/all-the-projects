import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/app_router.dart';
import '../../core/localization.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale, _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _scale = Tween(begin: 0.5, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _fade = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
    _ctrl.forward();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) Navigator.pushReplacementNamed(context, AppRouter.customerHome);
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
        child: Center(child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) => Opacity(opacity: _fade.value,
            child: Transform.scale(scale: _scale.value,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Text('WashGo', style: TextStyle(fontSize: 42, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 12),
                Text(L.carWherever, style: const TextStyle(fontSize: 16, color: Colors.white70)),
                const SizedBox(height: 40),
                const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
              ])),
          ),
        )),
      ),
    );
  }
}
