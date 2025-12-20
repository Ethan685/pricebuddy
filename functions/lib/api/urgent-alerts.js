"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFlashDeal = exports.onPriceChange = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Real-time price change detection
 * Triggers when a product price is updated
 */
exports.onPriceChange = functions.firestore
    .document('products/{productId}')
    .onUpdate(async (change, context) => {
    const productId = context.params.productId;
    const before = change.before.data();
    const after = change.after.data();
    const oldPrice = before.minPrice || 0;
    const newPrice = after.minPrice || 0;
    // Only trigger on price drops
    if (newPrice >= oldPrice)
        return;
    const dropAmount = oldPrice - newPrice;
    const dropPercentage = (dropAmount / oldPrice) * 100;
    // Urgent alert threshold: 10% or more drop
    const isUrgent = dropPercentage >= 10;
    if (isUrgent) {
        console.log(`URGENT: ${after.title} price dropped by ${dropPercentage.toFixed(1)}%`);
        // Send urgent alerts to all interested users
        await sendUrgentPriceAlert(productId, after.title, oldPrice, newPrice, dropPercentage);
    }
    return null;
});
/**
 * Send urgent price alert to interested users
 */
async function sendUrgentPriceAlert(productId, productTitle, oldPrice, newPrice, dropPercentage) {
    // Find users who have this in wishlist
    const usersSnapshot = await db.collection('users').get();
    const urgentMessage = [
        '🔥 방금 가격 급락!',
        '⚡️ 지금 안 사면 손해!',
        '💥 역대 최저가 갱신!',
        '🚨 한정 수량 특가!',
    ][Math.floor(Math.random() * 4)];
    let notificationsSent = 0;
    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        // Check if user has this product in wishlist or viewed recently
        const wishlistRef = db.collection('users').doc(userId).collection('wishlist');
        const wishlistDoc = await wishlistRef.doc(productId).get();
        if (wishlistDoc.exists) {
            // Create urgent notification
            await db.collection('notifications').add({
                userId,
                type: 'urgent_price_drop',
                priority: 'high',
                title: urgentMessage,
                message: `${productTitle} - ₩${Math.round(oldPrice - newPrice).toLocaleString()} 할인! (${Math.round(dropPercentage)}% ↓)`,
                data: {
                    productId,
                    oldPrice,
                    newPrice,
                    dropPercentage,
                    expiresIn: 3 * 60 * 1000, // 3 minutes urgency
                },
                read: false,
                urgent: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 3 * 60 * 1000) // 3 minutes
            });
            // Send FCM push notification
            const userData = userDoc.data();
            const fcmToken = userData?.fcmToken;
            if (fcmToken) {
                try {
                    await admin.messaging().send({
                        token: fcmToken,
                        notification: {
                            title: urgentMessage,
                            body: `${productTitle} - ₩${Math.round(oldPrice - newPrice).toLocaleString()} 할인!`,
                        },
                        data: {
                            productId,
                            type: 'urgent_price_drop',
                            priority: 'high'
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                sound: 'urgent',
                                channelId: 'urgent_deals',
                                priority: 'max',
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'urgent.wav',
                                    badge: 1
                                }
                            }
                        }
                    });
                    notificationsSent++;
                }
                catch (error) {
                    console.error(`Failed to send FCM to user ${userId}:`, error);
                }
            }
        }
    }
    console.log(`Sent ${notificationsSent} urgent notifications for product ${productId}`);
    // Log urgent deal for analytics
    await db.collection('urgent_deals').add({
        productId,
        productTitle,
        oldPrice,
        newPrice,
        dropPercentage,
        notificationsSent,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
/**
 * Flash deal countdown timer
 * Creates artificial scarcity
 */
exports.createFlashDeal = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Admin only');
    }
    const { productId, discountPercentage, durationMinutes } = data;
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Product not found');
    }
    const product = productDoc.data();
    const originalPrice = product?.minPrice || 0;
    const flashPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
    // Create flash deal
    await db.collection('flash_deals').add({
        productId,
        productTitle: product?.title,
        originalPrice,
        flashPrice,
        discountPercentage,
        startsAt: admin.firestore.FieldValue.serverTimestamp(),
        endsAt: new Date(Date.now() + durationMinutes * 60 * 1000),
        active: true,
        notificationsSent: 0
    });
    // Broadcast to all users
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
        await db.collection('notifications').add({
            userId: userDoc.id,
            type: 'flash_deal',
            priority: 'high',
            title: '⚡️ 플래시 딜 시작!',
            message: `${product?.title} - ${durationMinutes}분간 ${discountPercentage}% 할인!`,
            data: { productId, flashPrice, endsAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() },
            urgent: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    return { success: true, flashPrice };
});
