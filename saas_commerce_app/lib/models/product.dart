/// نموذج المنتج العام (Product Model)
/// يستخدم لتخزين بيانات المنتجات بشكل مرن وقابل للتخصيص

class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String imagePath;
  final String category;
  final bool isActive;
  final bool isFeatured;
  final int stockQuantity;
  final Map<String, dynamic>? metadata;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.imagePath,
    required this.category,
    this.isActive = true,
    this.isFeatured = false,
    this.stockQuantity = 0,
    this.metadata,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      imagePath: json['imagePath'] ?? 'assets/images/placeholder.png',
      category: json['category'] ?? 'عام',
      isActive: json['isActive'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      stockQuantity: json['stockQuantity'] ?? 0,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'imagePath': imagePath,
      'category': category,
      'isActive': isActive,
      'isFeatured': isFeatured,
      'stockQuantity': stockQuantity,
      'metadata': metadata,
    };
  }

  Product copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    String? imagePath,
    String? category,
    bool? isActive,
    bool? isFeatured,
    int? stockQuantity,
    Map<String, dynamic>? metadata,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      imagePath: imagePath ?? this.imagePath,
      category: category ?? this.category,
      isActive: isActive ?? this.isActive,
      isFeatured: isFeatured ?? this.isFeatured,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      metadata: metadata ?? this.metadata,
    );
  }
}
