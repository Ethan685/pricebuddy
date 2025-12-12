import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'screens/search_screen.dart';
import 'screens/detail_screen.dart';
import 'screens/cashback_screen.dart';
import 'theme/tokens.dart';

import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  if (kDebugMode) {
    try {
      String host = defaultTargetPlatform == TargetPlatform.android ? '10.0.2.2' : 'localhost';
      FirebaseFirestore.instance.useFirestoreEmulator(host, 8080);
      await FirebaseAuth.instance.useAuthEmulator(host, 9099);
      FirebaseFunctions.instance.useFunctionsEmulator(host, 5001);
      print('Connected to Firebase Emulators at $host');
    } catch (e) {
      print('Error connecting to emulators: $e');
    }
  }

  runApp(const PriceBuddyApp());
}

class PriceBuddyApp extends StatelessWidget {
  const PriceBuddyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PriceBuddy',
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.bg,
        primaryColor: AppColors.brand,
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SearchScreen(),
        '/cashback': (context) => const CashbackScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/detail') {
          final productId = settings.arguments as String;
          return MaterialPageRoute(
            builder: (context) => DetailScreen(productId: productId),
          );
        }
        return null;
      },
    );
  }
}
