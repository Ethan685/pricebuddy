import * as admin from "firebase-admin";
import { sendEmail, sendPushNotification } from "../lib/notifications";
import * as dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS or emulator)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

async function testNotifications() {
    console.log("Testing Notification System...");

    const testEmail = process.argv[2];
    const testFCMToken = process.argv[3];

    if (!testEmail && !testFCMToken) {
        console.error("Usage: ts-node test-notification.ts <email> [fcmToken]");
        process.exit(1);
    }

    // 1. Test Email
    if (testEmail) {
        console.log(`Sending test email to ${testEmail}...`);
        await sendEmail(
            testEmail,
            "PriceBuddy Test Notification",
            "<h1>Hello!</h1><p>This is a test notification from PriceBuddy notification system.</p>"
        );
    }

    // 2. Test Push
    if (testFCMToken) {
        console.log(`Sending test push to ${testFCMToken.substring(0, 10)}...`);
        await sendPushNotification(testFCMToken, {
            title: "PriceBuddy Test",
            body: "This is a test push notification.",
            url: "https://pricebuddy-5a869.web.app"
        });
    }

    console.log("Done.");
}

testNotifications().catch(console.error);
