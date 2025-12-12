class Product {
  final String id;
  final String title;
  final String brand;
  final List<String> images;
  final double minPrice;
  final String currency;

  Product({
    required this.id,
    required this.title,
    required this.brand,
    required this.images,
    required this.minPrice,
    required this.currency,
  });

  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'] ?? '',
      title: map['title'] ?? '',
      brand: map['brand'] ?? '',
      images: List<String>.from(map['images'] ?? []),
      minPrice: (map['minPrice'] ?? 0).toDouble(),
      currency: map['currency'] ?? 'KRW',
    );
  }
}

class Offer {
  final String id;
  final String merchantName;
  final double totalPrice;
  final String url;

  Offer({
    required this.id,
    required this.merchantName,
    required this.totalPrice,
    required this.url,
  });

  factory Offer.fromMap(Map<String, dynamic> map) {
    return Offer(
      id: map['id'] ?? '',
      merchantName: map['merchantName'] ?? '',
      totalPrice: (map['totalPrice'] ?? 0).toDouble(),
      url: map['url'] ?? '',
    );
  }
}
