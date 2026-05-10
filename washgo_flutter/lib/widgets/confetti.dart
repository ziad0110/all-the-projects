import 'dart:math';
import 'package:flutter/material.dart';

class ConfettiOverlay extends StatefulWidget {
  final Widget child;
  final bool trigger;
  const ConfettiOverlay({super.key, required this.child, this.trigger = false});

  @override
  State<ConfettiOverlay> createState() => _ConfettiOverlayState();
}

class _ConfettiOverlayState extends State<ConfettiOverlay>
    with TickerProviderStateMixin {
  final List<_ConfettiPiece> _pieces = [];
  late AnimationController _ctrl;
  bool _wasTriggered = false;

  @override
  void initState() {
    super.initState();
    _ctrl =
        AnimationController(vsync: this, duration: const Duration(seconds: 3));
    _ctrl.addListener(() => setState(() {}));
    _ctrl.addStatusListener((s) {
      if (s == AnimationStatus.completed) _pieces.clear();
    });
  }

  @override
  void didUpdateWidget(covariant ConfettiOverlay old) {
    super.didUpdateWidget(old);
    if (widget.trigger && !_wasTriggered) {
      _wasTriggered = true;
      _fire();
    }
    if (!widget.trigger) _wasTriggered = false;
  }

  void _fire() {
    final rng = Random();
    const colors = [
      Color(0xFF0D7C46),
      Color(0xFF2EAD6A),
      Color(0xFF10B981),
      Color(0xFF3B82F6),
      Color(0xFFF59E0B),
      Color(0xFF34D399),
    ];
    _pieces.clear();
    for (int i = 0; i < 60; i++) {
      _pieces.add(_ConfettiPiece(
        color: colors[rng.nextInt(colors.length)],
        x: rng.nextDouble(),
        speed: 0.3 + rng.nextDouble() * 0.7,
        delay: rng.nextDouble() * 0.3,
        size: 6 + rng.nextDouble() * 8,
        drift: (rng.nextDouble() - 0.5) * 0.3,
        isCircle: rng.nextBool(),
        rotation: rng.nextDouble() * 6.28,
      ));
    }
    _ctrl.reset();
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      widget.child,
      if (_ctrl.isAnimating)
        ..._pieces.map((p) {
          final t = (_ctrl.value - p.delay).clamp(0.0, 1.0) / (1.0 - p.delay);
          final progress = t * p.speed + t * (1 - p.speed);
          if (progress <= 0) return const SizedBox.shrink();
          final screenW = MediaQuery.of(context).size.width;
          final screenH = MediaQuery.of(context).size.height;
          final x = p.x * screenW +
              sin(progress * 6) * 30 +
              p.drift * screenW * progress;
          final y = -20 + progress * (screenH + 40);
          final opacity = progress < 0.8 ? 1.0 : (1.0 - (progress - 0.8) / 0.2);
          return Positioned(
            left: x,
            top: y,
            child: Opacity(
              opacity: opacity,
              child: Transform.rotate(
                angle: p.rotation + progress * 10,
                child: Container(
                  width: p.size,
                  height: p.size,
                  decoration: BoxDecoration(
                    color: p.color,
                    borderRadius: p.isCircle
                        ? BorderRadius.circular(p.size / 2)
                        : BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          );
        }),
    ]);
  }
}

class _ConfettiPiece {
  final Color color;
  final double x, speed, delay, size, drift, rotation;
  final bool isCircle;
  const _ConfettiPiece({
    required this.color,
    required this.x,
    required this.speed,
    required this.delay,
    required this.size,
    required this.drift,
    required this.isCircle,
    required this.rotation,
  });
}

/// Standalone function to trigger confetti from anywhere
void showConfetti(BuildContext context) {
  final overlay = Overlay.of(context);
  late OverlayEntry entry;
  entry = OverlayEntry(builder: (_) {
    return _OverlayConfetti(onDone: () => entry.remove());
  });
  overlay.insert(entry);
}

class _OverlayConfetti extends StatefulWidget {
  final VoidCallback onDone;
  const _OverlayConfetti({required this.onDone});
  @override
  State<_OverlayConfetti> createState() => _OverlayConfettiState();
}

class _OverlayConfettiState extends State<_OverlayConfetti>
    with TickerProviderStateMixin {
  late AnimationController _ctrl;
  final List<_ConfettiPiece> _pieces = [];

  @override
  void initState() {
    super.initState();
    _ctrl =
        AnimationController(vsync: this, duration: const Duration(seconds: 3));
    _ctrl.addListener(() => setState(() {}));
    _ctrl.addStatusListener((s) {
      if (s == AnimationStatus.completed) widget.onDone();
    });

    final rng = Random();
    const colors = [
      Color(0xFF0D7C46),
      Color(0xFF2EAD6A),
      Color(0xFF10B981),
      Color(0xFF3B82F6),
      Color(0xFFF59E0B),
      Color(0xFF34D399),
    ];
    for (int i = 0; i < 60; i++) {
      _pieces.add(_ConfettiPiece(
        color: colors[rng.nextInt(colors.length)],
        x: rng.nextDouble(),
        speed: 0.3 + rng.nextDouble() * 0.7,
        delay: rng.nextDouble() * 0.3,
        size: 6 + rng.nextDouble() * 8,
        drift: (rng.nextDouble() - 0.5) * 0.3,
        isCircle: rng.nextBool(),
        rotation: rng.nextDouble() * 6.28,
      ));
    }
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenW = MediaQuery.of(context).size.width;
    final screenH = MediaQuery.of(context).size.height;
    return IgnorePointer(
        child: SizedBox(
      width: screenW,
      height: screenH,
      child: Stack(
          children: _pieces.map((p) {
        final t = (_ctrl.value - p.delay).clamp(0.0, 1.0) / (1.0 - p.delay);
        final progress = t * p.speed + t * (1 - p.speed);
        if (progress <= 0) return const SizedBox.shrink();
        final x = p.x * screenW +
            sin(progress * 6) * 30 +
            p.drift * screenW * progress;
        final y = -20 + progress * (screenH + 40);
        final opacity = progress < 0.8 ? 1.0 : (1.0 - (progress - 0.8) / 0.2);
        return Positioned(
            left: x,
            top: y,
            child: Opacity(
                opacity: opacity,
                child: Transform.rotate(
                    angle: p.rotation + progress * 10,
                    child: Container(
                        width: p.size,
                        height: p.size,
                        decoration: BoxDecoration(
                            color: p.color,
                            borderRadius: p.isCircle
                                ? BorderRadius.circular(p.size / 2)
                                : BorderRadius.circular(2))))));
      }).toList()),
    ));
  }
}
