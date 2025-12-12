import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../widgets/price_card.dart';
import '../theme/tokens.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _apiService = ApiService();
  final _searchController = TextEditingController();
  List<Product> _results = [];
  bool _isLoading = false;

  Future<void> _search() async {
    setState(() => _isLoading = true);
    try {
      final results = await _apiService.searchProducts(_searchController.text);
      setState(() => _results = results);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('PriceBuddy', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.text)),
        backgroundColor: AppColors.bg,
        elevation: 0,
        actions: [
            IconButton(
                icon: const Icon(Icons.account_balance_wallet, color: AppColors.brand),
                onPressed: () => Navigator.pushNamed(context, '/cashback'),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              style: AppTextStyles.body,
              decoration: InputDecoration(
                hintText: 'Search products...',
                hintStyle: AppTextStyles.caption,
                filled: true,
                fillColor: AppColors.card,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppColors.radiusPill),
                  borderSide: BorderSide.none,
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search, color: AppColors.text),
                  onPressed: _search,
                ),
              ),
              onSubmitted: (_) => _search(),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.75,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: _results.length,
                  itemBuilder: (context, index) {
                    final product = _results[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          '/detail',
                          arguments: product.id,
                        );
                      },
                      child: PBPriceCard({
                        'title': product.title,
                        'totalPrice': product.minPrice,
                      }),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
