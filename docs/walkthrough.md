# Verification Walkthrough

## 1. Emulator Setup & Data Seeding
- **Firebase Emulators**: Successfully started Authentication, Firestore, and Functions.
- **Seeding**: Ran `npm run seed` in `functions` directory.
- **Data**: Verified 4 products seeded (Apple, Sony, Nike, Samsung).

## 2. Web App Verification
- **Search**: Verified searching for "apple" returns "Apple MacBook Pro 14 M3".
- **Product Detail**: Verified clicking a product shows detailed info and offers.
- **Offers**: Confirmed "Coupang", "Amazon", "11st" appear with prices.
- **Screenshot**:
![Product Detail](/Users/ethanpark/.gemini/antigravity/brain/d7531f7a-c8f0-4725-bc01-dec586e96fbd/uploaded_image_1765033326498.png)

## 3. Flutter App Verification
- **Platform**: Chrome (Web).
- **Search**: Verified functionality with `titleLower` index.
- **Product Detail**: Verified navigation and Price/Offers display.
- **Fixes Applied**:
    - **API**: Handled mixed `List` vs `Object` response types.
    - **UI**: Fixed duplicate price display string.
    - **Data**: Added `offers` subcollection to seed script.

## 4. Enterprise B2B Verification (New)
- **Features Implemented**:
    - **Dashboard**: Created restricted `/enterprise` route.
    - **Auth**: Added Google Sign-In for access control.
    - **API Key**: Implemented key generation and display UI (Mocked).
    - **Reporting**: Implemented CSV generation trigger (Cloud Function).
- **Results**:
    - **Login**: Successfully logged in via Firebase Auth Emulator.
    - **API Key**: "Generate Key" verified (screenshot below).
    - **Reporting**: "Generate New Report" creates a job with status `Pending`.
    - **Pending Status**: Confirmed job creation; backend restart required for new function to process.

![Enterprise Dashboard](/Users/ethanpark/.gemini/antigravity/brain/d7531f7a-c8f0-4725-bc01-dec586e96fbd/uploaded_image_1765034183793.png)

## 5. Cashback Feature Verification
- **Web Interface**: Verified `/cashback` route.
- **Backend Logic**:
    - Confirmed `simulateCashbackEarned` updates wallet balance.
    - Confirmed transaction ledger recording.
    - **Fix Applied**: Replaced `FieldValue.serverTimestamp` with `new Date()` to resolve emulator environment issues.
- **Flutter App**:
    - **Login**: Added interactive "Login" button (Anonymous Auth).
    - **Stability**: Fixed "Bad state" crash by handling non-existent wallet documents for new users.
    - **Status**: App loads correctly with initial 0 KRW state.
- **Results**: User confirmed 5,000 KRW balance earned on Web. Flutter ready for final button test.
- **Final Verification**: Flutter app successfully updated balance to 5,000 KRW and displayed transaction history after clicking "Earn Test".

![Cashback Initial State](/Users/ethanpark/.gemini/antigravity/brain/d7531f7a-c8f0-4725-bc01-dec586e96fbd/uploaded_image_1765038214075.png)
![Cashback Final Success](/Users/ethanpark/.gemini/antigravity/brain/d7531f7a-c8f0-4725-bc01-dec586e96fbd/uploaded_image_1765038365010.png)
