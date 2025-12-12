import 'package:flutter/material.dart';

class AppColors {
  static const bg = Color(0xFF0B1117);
  static const card = Color(0xFF121A23);
  static const brand = Color(0xFF4F7EFF);
  static const text = Color(0xFFE6EDF3);
  static const muted = Color(0xFF9BA7B4);
  static const success = Color(0xFF12B981);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  
  // New tokens for Cashback
  static const textSecondary = muted;
  static const surface = Color(0xFF161B22);
  static const border = Color(0xFF30363D);
  static const radiusPill = 999.0;
}

class AppTextStyles {
  static const display = TextStyle(fontSize: 32, color: AppColors.text);
  static const title = TextStyle(fontSize: 24, color: AppColors.text);
  static const body = TextStyle(fontSize: 16, color: AppColors.text);
  static const caption = TextStyle(fontSize: 12, color: AppColors.muted);
}
