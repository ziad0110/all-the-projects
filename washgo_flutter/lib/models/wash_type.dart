import '../core/localization.dart';

class WashType {
  final int id;
  final String nameAr, nameEn, descAr, descEn, icon;
  final int price, duration;
  final List<String> includesAr, includesEn;

  WashType({
    required this.id, required this.nameAr, required this.nameEn,
    required this.descAr, required this.descEn, required this.icon,
    required this.price, required this.duration,
    required this.includesAr, required this.includesEn,
  });

  String get name => L.t(nameAr, nameEn);
  String get desc => L.t(descAr, descEn);
  List<String> get includes => L.locale == 'ar' ? includesAr : includesEn;

  static List<WashType> all() => [
    WashType(id: 1, nameAr: 'غسيل خارجي عادي', nameEn: 'Basic External Wash', icon: '💧',
      descAr: 'غسيل خارجي شامل للسيارة', descEn: 'Complete exterior car wash',
      price: 2000, duration: 30,
      includesAr: ['غسيل خارجي بالماء', 'تنظيف الإطارات', 'تجفيف كامل'],
      includesEn: ['Water wash', 'Tire cleaning', 'Full dry']),
    WashType(id: 2, nameAr: 'غسيل داخلي وخارجي', nameEn: 'Interior & Exterior Wash', icon: '🫧',
      descAr: 'غسيل شامل من الداخل والخارج', descEn: 'Complete in & out wash',
      price: 3500, duration: 60,
      includesAr: ['غسيل خارجي', 'تنظيف داخلي', 'تنظيف الإطارات', 'معطر'],
      includesEn: ['Exterior wash', 'Interior clean', 'Tire cleaning', 'Air freshener']),
    WashType(id: 3, nameAr: 'تنظيف عميق', nameEn: 'Deep Clean', icon: '✨',
      descAr: 'تنظيف عميق احترافي لكل جزء في السيارة', descEn: 'Professional deep cleaning',
      price: 5000, duration: 90,
      includesAr: ['غسيل خارجي', 'تنظيف داخلي عميق', 'تنظيف المحرك', 'تلميع خفيف'],
      includesEn: ['Exterior wash', 'Deep interior', 'Engine clean', 'Light polish']),
    WashType(id: 4, nameAr: 'تلميع كامل', nameEn: 'Full Polish', icon: '💎',
      descAr: 'تلميع وحماية كاملة للطلاء', descEn: 'Full paint polish and protection',
      price: 8000, duration: 120,
      includesAr: ['غسيل كامل', 'تلميع الطلاء', 'حماية شمعية', 'تنظيف الزجاج'],
      includesEn: ['Full wash', 'Paint polish', 'Wax protection', 'Glass clean']),
    WashType(id: 5, nameAr: 'باقة VIP', nameEn: 'VIP Package', icon: '👑',
      descAr: 'أفضل خدمة مع جميع المميزات', descEn: 'Best service with all features',
      price: 12000, duration: 180,
      includesAr: ['كل ما سبق', 'تعقيم', 'تنظيف الجلد', 'طلاء نانو سيراميك'],
      includesEn: ['All above', 'Sanitizing', 'Leather clean', 'Nano ceramic coat']),
  ];
}
