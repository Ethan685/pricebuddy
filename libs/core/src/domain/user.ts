export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  subscriptionTier: "free" | "premium";
  referralCode: string;
  referredBy?: string;
}

export interface UserPreferences {
  userId: string;
  defaultCountry: string;
  currency: string;
  notificationEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

