class User {
  final String username;
  final String name;
  final String role; // customer, admin, driver, pos
  final int? driverId;
  final String? area;
  final String? phone;
  final bool isGuest;

  User({
    required this.username,
    required this.name,
    required this.role,
    this.driverId,
    this.area,
    this.phone,
    this.isGuest = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      username: json['username'],
      name: json['name'],
      role: json['role'],
      driverId: json['driverId'],
      area: json['area'],
      phone: json['phone'],
      isGuest: json['isGuest'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'name': name,
      'role': role,
      'driverId': driverId,
      'area': area,
      'phone': phone,
      'isGuest': isGuest,
    };
  }
}
