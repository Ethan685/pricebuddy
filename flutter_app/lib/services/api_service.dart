import 'package:cloud_functions/cloud_functions.dart';
import '../models/models.dart';

class ApiService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  Future<List<Product>> searchProducts(String query) async {
    try {
      final result = await _functions.httpsCallable('searchProducts').call({
        'query': query,
      });

      List<dynamic> data;
      if (result.data is List) {
        data = result.data as List<dynamic>;
      } else if (result.data is Map) {
        // Handle legacy/debug object format
        data = (result.data as Map<Object?, Object?>)['products'] as List<dynamic>;
      } else {
        return [];
      }
      
      return data.map((json) => Product.fromMap(Map<String, dynamic>.from(json))).toList();
    } catch (e) {
      print('Search failed: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> getProductDetails(String productId) async {
    try {
      final result = await _functions.httpsCallable('getProductDetails').call({
        'productId': productId,
      });

      final Map<String, dynamic> data = Map<String, dynamic>.from(result.data);
      
      final product = Product.fromMap(Map<String, dynamic>.from(data['product']));
      
      final offers = (data['offers'] as List<dynamic>)
          .map((json) => Offer.fromMap(Map<String, dynamic>.from(json)))
          .toList();

      // Handle priceHistory if present
      final priceHistory = data['priceHistory'] != null 
          ? (data['priceHistory'] as List<dynamic>).map((e) => Map<String, dynamic>.from(e)).toList()
          : [];

      return {
        'product': product,
        'offers': offers,
        'priceHistory': priceHistory,
      };
    } catch (e) {
      print('Get details failed: $e');
      rethrow;
    }
  }
}
