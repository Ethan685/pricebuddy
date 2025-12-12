import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/tokens.dart';

class DetailScreen extends StatefulWidget {
  final String productId;
  const DetailScreen({super.key, required this.productId});

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  final _apiService = ApiService();
  Product? _product;
  List<Offer> _offers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final data = await _apiService.getProductDetails(widget.productId);
    setState(() {
      _product = data['product'] as Product;
      _offers = data['offers'] as List<Offer>;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.bg,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_product == null) {
      return const Scaffold(
        backgroundColor: AppColors.bg,
        body: Center(child: Text('Product not found', style: AppTextStyles.body)),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        title: Text(_product!.title, style: AppTextStyles.body),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance_wallet, color: AppColors.brand),
            onPressed: () => Navigator.pushNamed(context, '/cashback'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Placeholder
            Container(
              height: 200,
              width: double.infinity,
              color: AppColors.card,
              child: const Icon(Icons.image, size: 64, color: AppColors.muted),
            ),
            const SizedBox(height: 16),
            Text(_product!.title, style: AppTextStyles.title),
            const SizedBox(height: 8),
            Text(
              '${_product!.minPrice.toString()} ${_product!.currency}',
              style: AppTextStyles.display.copyWith(color: AppColors.brand),
            ),
            const SizedBox(height: 24),
            Text('Offers', style: AppTextStyles.title),
            const SizedBox(height: 8),
            ..._offers.map((offer) => Card(
              color: AppColors.card,
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(offer.merchantName, style: AppTextStyles.body),
                trailing: Text(
                  '${offer.totalPrice} ${_product!.currency}',
                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}
