class Order {
  final String id, customer, phone, carType, carColor, plate, location;
  final int washType;
  String status;
  final String payment, date, time;
  final int price;
  final String? employee;

  Order({
    required this.id, required this.customer, required this.phone,
    required this.carType, required this.carColor, this.plate = '',
    required this.location, required this.washType, required this.status,
    required this.payment, required this.date, required this.time,
    required this.price, this.employee,
  });

  static List<Order> mockOrders() => [
    Order(id: 'ORD-001', customer: 'أحمد محمد', phone: '777123456',
      carType: 'Toyota Camry', carColor: 'أبيض', plate: '12345',
      location: 'صنعاء - حدة', washType: 1, status: 'completed',
      payment: 'cash', date: '2026-02-23', time: '09:00', price: 2000, employee: 'علي حسن'),
    Order(id: 'ORD-002', customer: 'خالد عبدالله', phone: '771987654',
      carType: 'Hyundai Accent', carColor: 'فضي', plate: '67890',
      location: 'صنعاء - الزبيري', washType: 2, status: 'started',
      payment: 'wallet', date: '2026-02-23', time: '10:30', price: 3500, employee: 'علي حسن'),
    Order(id: 'ORD-003', customer: 'سارة أحمد', phone: '773456789',
      carType: 'Kia Sportage', carColor: 'أسود',
      location: 'صنعاء - الستين', washType: 3, status: 'onway',
      payment: 'bank', date: '2026-02-23', time: '11:00', price: 5000, employee: 'محمد سعيد'),
    Order(id: 'ORD-004', customer: 'يوسف كمال', phone: '774112233',
      carType: 'Toyota Hilux', carColor: 'أزرق',
      location: 'صنعاء - شارع تعز', washType: 4, status: 'pending',
      payment: 'cash', date: '2026-02-23', time: '14:00', price: 8000),
    Order(id: 'ORD-005', customer: 'فاطمة حسين', phone: '775998877',
      carType: 'Nissan Sunny', carColor: 'أحمر', plate: '54321',
      location: 'صنعاء - الجامعة', washType: 5, status: 'accepted',
      payment: 'wallet', date: '2026-02-23', time: '15:30', price: 12000, employee: 'أحمد علي'),
    Order(id: 'ORD-006', customer: 'نورا سالم', phone: '776543210',
      carType: 'Honda CR-V', carColor: 'أبيض',
      location: 'صنعاء - الميدان', washType: 1, status: 'cancelled',
      payment: 'cash', date: '2026-02-22', time: '08:00', price: 2000),
  ];
}
