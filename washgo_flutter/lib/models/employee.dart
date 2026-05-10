class Employee {
  final String name, phone;
  final int tasks, hours;
  final double rating;
  final int revenue;

  Employee({required this.name, required this.phone, required this.tasks,
    required this.hours, required this.rating, required this.revenue});

  static List<Employee> mockEmployees() => [
    Employee(name: 'علي حسن', phone: '777111222', tasks: 45, hours: 120, rating: 4.8, revenue: 185000),
    Employee(name: 'محمد سعيد', phone: '777333444', tasks: 38, hours: 98, rating: 4.6, revenue: 152000),
    Employee(name: 'أحمد علي', phone: '777555666', tasks: 52, hours: 140, rating: 4.9, revenue: 210000),
    Employee(name: 'عمر خالد', phone: '777777888', tasks: 28, hours: 75, rating: 4.3, revenue: 98000),
    Employee(name: 'ياسر محمد', phone: '777999000', tasks: 33, hours: 85, rating: 4.5, revenue: 125000),
  ];
}
