class L {
  static String locale = 'ar';

  static String t(String ar, String en) => locale == 'ar' ? ar : en;

  // Common
  static String get appName => t('واش قو اليمن', 'WashGo Yemen');
  static String get login => t('تسجيل الدخول', 'Login');
  static String get logout => t('تسجيل الخروج', 'Logout');
  static String get save => t('حفظ', 'Save');
  static String get cancel => t('إلغاء', 'Cancel');
  static String get next => t('التالي', 'Next');
  static String get back => t('رجوع', 'Back');
  static String get search => t('بحث', 'Search');
  static String get all => t('الكل', 'All');
  static String get settings => t('الإعدادات', 'Settings');
  static String get profile => t('حسابي', 'Profile');
  static String get help => t('المساعدة', 'Help');
  static String get language => t('اللغة', 'Language');
  static String get theme => t('المظهر', 'Theme');
  static String get darkMode => t('الوضع الداكن', 'Dark Mode');
  static String get yer => t('ريال', 'YER');

  // Portal
  static String get customerApp => t('تطبيق العميل', 'Customer App');
  static String get employeeApp => t('تطبيق الموظف', 'Employee App');
  static String get adminDashboard => t('لوحة المدير', 'Admin Dashboard');
  static String get orderWashNow => t('اطلب غسلة لسيارتك الآن', 'Order a car wash now');
  static String get manageOrders => t('إدارة الطلبات والمهام', 'Manage orders & tasks');
  static String get analyticsManagement => t('تحليلات وإدارة شاملة', 'Analytics & management');
  static String get mobileCarWash => t('خدمة غسيل السيارات المتنقلة', 'Mobile Car Wash Service');

  // Admin
  static String get dashboard => t('لوحة التحكم', 'Dashboard');
  static String get ordersManagement => t('إدارة الطلبات', 'Orders');
  static String get employees => t('الموظفين', 'Employees');
  static String get customers => t('العملاء', 'Customers');
  static String get analytics => t('التحليلات', 'Analytics');
  static String get offersPricing => t('العروض والأسعار', 'Offers & Pricing');
  static String get qrLogs => t('سجل QR', 'QR Logs');
  static String get revenueToday => t('إيرادات اليوم', 'Today Revenue');
  static String get revenueMonth => t('إيرادات الشهر', 'Monthly Revenue');
  static String get ordersToday => t('طلبات اليوم', 'Today Orders');
  static String get completed => t('مكتملة', 'Completed');
  static String get cancelled => t('ملغية', 'Cancelled');
  static String get activeCustomers => t('عملاء نشطون', 'Active Customers');
  static String get avgRating => t('متوسط التقييم', 'Avg Rating');
  static String get addEmployee => t('إضافة موظف', 'Add Employee');
  static String get email => t('البريد الإلكتروني', 'Email');
  static String get password => t('كلمة المرور', 'Password');

  // Customer
  static String get hello => t('مرحباً 👋', 'Hello 👋');
  static String get home => t('الرئيسية', 'Home');
  static String get packages => t('الباقات', 'Packages');
  static String get myOrders => t('طلباتي', 'My Orders');
  static String get myPoints => t('نقاطي', 'My Points');
  static String get ourServices => t('خدماتنا', 'Our Services');
  static String get viewAll => t('عرض الكل', 'View All');
  static String get featuredPackages => t('الباقات المميزة', 'Featured Packages');
  static String get orderNow => t('اطلب الآن', 'Order Now');
  static String get newOrder => t('طلب جديد', 'New Order');
  static String get selectWash => t('اختر نوع الغسيل', 'Select Wash Type');
  static String get selectCar => t('اختر السيارة', 'Select Your Car');
  static String get setLocation => t('حدد موقعك', 'Set Your Location');
  static String get paymentMethod => t('طريقة الدفع', 'Payment Method');
  static String get confirmOrder => t('تأكيد الطلب', 'Confirm Order');
  static String get orderSummary => t('ملخص الطلب', 'Order Summary');
  static String get addCar => t('إضافة سيارة جديدة', 'Add New Car');
  static String get phone => t('رقم الهاتف', 'Phone Number');
  static String get sendOtp => t('إرسال رمز التحقق', 'Send OTP');
  static String get verify => t('تحقق', 'Verify');
  static String get points => t('نقاط', 'Points');
  static String get operations => t('العمليات', 'Operations');
  static String get freeWashes => t('مجانية', 'Free');
  static String get pointsHistory => t('سجل النقاط', 'Points History');
  static String get forFreeWash => t('للغسلة المجانية', 'for free wash');
  static String get washCompleted => t('تم إكمال الغسيل!', 'Wash Completed!');
  static String get howWasExperience => t('كيف كانت تجربتك؟', 'How was your experience?');
  static String get submitRating => t('إرسال التقييم', 'Submit Rating');
  static String get skip => t('تخطي', 'Skip');
  static String get orderTracking => t('تتبع الطلب', 'Order Tracking');
  static String get orderStatus => t('حالة الطلب', 'Order Status');
  static String get orderDetails => t('تفاصيل الطلب', 'Order Details');
  static String get total => t('الإجمالي', 'Total');
  static String get cash => t('كاش', 'Cash');
  static String get bankTransfer => t('تحويل بنكي', 'Bank Transfer');
  static String get eWallet => t('محفظة إلكترونية', 'E-Wallet');
  static String get carWherever => t('غسيل سيارتك أينما كنت', 'Car wash wherever you are');
  static String get minutes => t('دقيقة', 'min');
  static String get services => t('خدمات', 'services');
  static String get includes => t('يشمل:', 'Includes:');
  static String get notes => t('ملاحظات إضافية', 'Additional Notes');

  // Employee
  static String get orders => t('الطلبات', 'Orders');
  static String get map => t('الخريطة', 'Map');
  static String get myEarnings => t('أرباحي', 'Earnings');
  static String get online => t('متصل', 'Online');
  static String get newOrders => t('جديدة', 'New');
  static String get accepted => t('مقبولة', 'Accepted');
  static String get active => t('نشطة', 'Active');
  static String get done => t('مكتملة', 'Done');
  static String get acceptOrder => t('قبول الطلب', 'Accept Order');
  static String get onMyWay => t('في الطريق', 'On My Way');
  static String get arrived => t('تم الوصول', 'I\'ve Arrived');
  static String get startWork => t('بدء العمل', 'Start Working');
  static String get completeWork => t('إنهاء العمل', 'Complete Work');
  static String get customerInfo => t('معلومات العميل', 'Customer Info');
  static String get carInfo => t('معلومات السيارة', 'Car Info');
  static String get serviceDetails => t('تفاصيل الخدمة', 'Service Details');
  static String get scanQR => t('اطلب من العميل مسح هذا الكود', 'Ask the customer to scan this code');
  static String get validFor2Min => t('صالح لمدة دقيقتين', 'Valid for 2 minutes');
  static String get generateNew => t('إنشاء كود جديد', 'Generate New Code');
  static String get totalEarnings => t('إجمالي الأرباح', 'Total Earnings');
  static String get tasksDone => t('مهمة مكتملة', 'Tasks Done');
  static String get workHours => t('ساعة عمل', 'Work Hours');
  static String get rating => t('التقييم', 'Rating');

  // Statuses
  static String status(String s) {
    final map = {
      'pending': t('قيد الانتظار', 'Pending'),
      'accepted': t('تم القبول', 'Accepted'),
      'onway': t('في الطريق', 'On the Way'),
      'arrived': t('تم الوصول', 'Arrived'),
      'started': t('جاري التنفيذ', 'In Progress'),
      'completed': t('مكتمل', 'Completed'),
      'cancelled': t('ملغي', 'Cancelled'),
    };
    return map[s] ?? s;
  }

  static String paymentName(String m) {
    final map = { 'cash': cash, 'bank': bankTransfer, 'wallet': eWallet };
    return map[m] ?? m;
  }
}
