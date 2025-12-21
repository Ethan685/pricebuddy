import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as functions from "firebase-functions";

// Initialize Nodemailer transporter
// Note: In production, these should be set via firebase functions:config:set
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
        user: process.env.SMTP_EMAIL || "pricebuddy@example.com",
        pass: process.env.SMTP_PASSWORD || "password"
    }
});

export interface NotificationPayload {
    title: string;
    body: string;
    data?: { [key: string]: string };
    url?: string;
}

/**
 * Send an email notification
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!to) return;

    try {
        await transporter.sendMail({
            from: `"PriceBuddy" <${process.env.SMTP_EMAIL || "noreply@pricebuddy.com"}>`,
            to,
            subject,
            html
        });
        functions.logger.info(`Email sent to ${to}`);
    } catch (error) {
        functions.logger.error(`Failed to send email to ${to}`, error);
        // We generally don't throw here to prevent blocking other notifications
    }
}

/**
 * Send a push notification via FCM
 */
export async function sendPushNotification(token: string, payload: NotificationPayload): Promise<void> {
    if (!token) return;

    try {
        const message: admin.messaging.Message = {
            token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
            webpush: {
                fcmOptions: {
                    link: payload.url
                }
            }
        };

        await admin.messaging().send(message);
        functions.logger.info(`Push notification sent to token ${token.substring(0, 10)}...`);
    } catch (error) {
        functions.logger.error(`Failed to send push notification`, error);
    }
}
