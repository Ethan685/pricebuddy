import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_functions/cloud_functions.dart';
import '../theme/tokens.dart';

class CashbackScreen extends StatefulWidget {
  const CashbackScreen({super.key});

  @override
  State<CashbackScreen> createState() => _CashbackScreenState();
}

class _CashbackScreenState extends State<CashbackScreen> {
  // We need to listen to auth state changes to make this reactive
  User? get user => FirebaseAuth.instance.currentUser;
  bool processing = false;

  void _simulateEarn() async {
    if (user == null) return;
    setState(() => processing = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('simulateCashbackEarned').call();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Simulated earning +5,000 KRW')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
    setState(() => processing = false);
  }

  void _withdraw(int balance) async {
    if (balance < 10000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum withdrawal is 10,000 KRW')),
      );
      return;
    }
    setState(() => processing = true);
    try {
      // Prompt user for amount handled via fixed amount for demo or add dialog
      // For speed, withdrawing fixed 10,000 unit
      await FirebaseFunctions.instance.httpsCallable('requestWithdrawal').call({'amount': 10000});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Withdrawal requested for 10,000 KRW')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
    setState(() => processing = false);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        final user = snapshot.data;

        if (user == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('My Rewards'), backgroundColor: AppColors.bg),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.account_balance_wallet, size: 64, color: AppColors.textSecondary),
                  const SizedBox(height: 16),
                  const Text('Please login to view rewards', style: TextStyle(color: AppColors.text)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () async {
                       try {
                         await FirebaseAuth.instance.signInAnonymously();
                       } catch (e) {
                         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Login failed: $e")));
                       }
                    },
                    child: const Text('Login (Anonymous)'),
                  )
                ],
              ),
            ),
          );
        }

        // Logged in UI
        return _buildDashboard(user);
      }
    );
  }

  Widget _buildDashboard(User user) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Rewards', style: TextStyle(color: AppColors.text)),
        backgroundColor: AppColors.bg,
        iconTheme: const IconThemeData(color: AppColors.text),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Balance Card
            StreamBuilder<DocumentSnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('cashback_wallet')
                  .doc(user!.uid)
                  .snapshots(),
              builder: (context, snapshot) {
                final doc = snapshot.data;
                final balance = (doc != null && doc.exists) ? (doc.data() as Map<String, dynamic>)['balance'] ?? 0 : 0;
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.brand, Color(0xFF1F6FEB)]),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(color: AppColors.brand.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text(
                        '₩ ${balance.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                        style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: processing || balance < 10000 ? null : () => _withdraw(balance),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppColors.brand,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('Withdraw', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: processing ? null : _simulateEarn,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Colors.white54),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('+ Earn Test'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 32),
            const Text('Transaction History', style: TextStyle(color: AppColors.text, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            // Ledger List
            StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('cashback_ledger')
                  .where('userId', isEqualTo: user!.uid)
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                final docs = snapshot.data!.docs;
                if (docs.isEmpty) {
                  return const Center(child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Text('No transactions yet', style: TextStyle(color: AppColors.textSecondary)),
                  ));
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: docs.length,
                  separatorBuilder: (c, i) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final data = docs[index].data() as Map<String, dynamic>;
                    final amount = data['amount'] ?? 0;
                    final isPositive = amount > 0;
                    final date = (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now();

                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isPositive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isPositive ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isPositive ? Colors.green : Colors.red,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  data['description'] ?? (isPositive ? 'Cashback Earned' : 'Withdrawal'),
                                  style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.w500),
                                ),
                                Text(
                                  "${date.month}/${date.day} ${date.hour}:${date.minute.toString().padLeft(2, '0')}",
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            "${isPositive ? '+' : ''}${amount.toString()}",
                            style: TextStyle(
                              color: isPositive ? Colors.green : AppColors.text,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
