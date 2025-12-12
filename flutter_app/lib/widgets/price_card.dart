import 'package:flutter/material.dart';
import '../theme/tokens.dart';

class PBPriceCard extends StatelessWidget {
  final Map<String, dynamic> r;
  const PBPriceCard(this.r, {super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(r['title'] ?? '', style: AppTextStyles.body),
            const SizedBox(height: 6),
            Text(
              '${(r['totalPrice'] ?? 0)}',
              style: AppTextStyles.title.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
