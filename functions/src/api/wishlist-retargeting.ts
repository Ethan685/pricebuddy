import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Scheduled function to check wishlist items for price drops
 * Runs every 6 hours
 */
export const checkWishlistPriceDrops = functions.pubsub
    .schedule('every 6 hours')
    .onRun(async (context) => {
        console.log('Checking wishlist price drops...');

        try {
            // Get all users with wishlist items
            const usersSnapshot = await db.collection('users').get();

            let totalChecked = 0;
            let totalNotifications = 0;

            for (const userDoc of usersSnapshot.docs) {
                const wishlistRef = db.collection('users').doc(userDoc.id).collection('wishlist');
                const wishlistSnapshot = await wishlistRef.get();

                for (const wishlistDoc of wishlistSnapshot.docs) {
                    const item = wishlistDoc.data();
                    const productId = wishlistDoc.id;

                    // Get current price
                    const productDoc = await db.collection('products').doc(productId).get();

                    if (!productDoc.exists) continue;

                    const product = productDoc.data();
                    const currentPrice = product?.minPrice || 0;
                    const savedPrice = item.price || currentPrice;

                    // Calculate price drop percentage
                    const dropPercentage = ((savedPrice - currentPrice) / savedPrice) * 100;

                    // If price dropped by 5% or more, send notification
                    if (dropPercentage >= 5) {
                        totalChecked++;

                        // Check if we already notified about this price
                        if (item.lastNotifiedPrice && currentPrice >= item.lastNotifiedPrice) {
                            continue; // Don't spam notifications
                        }

                        // Send notification
                        await sendPriceDropNotification(
                            userDoc.id,
                            productId,
                            item.title,
                            savedPrice,
                            currentPrice,
                            dropPercentage
                        );

                        // Update last notified price
                        await wishlistRef.doc(productId).update({
                            lastNotifiedPrice: currentPrice,
                            lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp()
                        });

                        totalNotifications++;
                    }
                }
            }

            console.log(`Checked ${totalChecked} items, sent ${totalNotifications} notifications`);
            return { checked: totalChecked, notifications: totalNotifications };

        } catch (error) {
            console.error('Error checking wishlist price drops:', error);
            throw error;
        }
    });

/**
 * Send price drop notification to user
 */
async function sendPriceDropNotification(
    userId: string,
    productId: string,
    productTitle: string,
    oldPrice: number,
    newPrice: number,
    dropPercentage: number
) {
    const discountAmount = Math.round(oldPrice - newPrice);

    // Create in-app notification
    await db.collection('notifications').add({
        userId,
        type: 'price_drop',
        title: '🔥 관심 제품 가격 하락!',
        message: `${productTitle}이(가) ₩${discountAmount.toLocaleString()} 저렴해졌어요! (${Math.round(dropPercentage)}% ↓)`,
        data: {
            productId,
            oldPrice,
            newPrice,
            dropPercentage
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // TODO: Send push notification via FCM
    // const userDoc = await db.collection('users').doc(userId).get();
    // const fcmToken = userDoc.data()?.fcmToken;
    // if (fcmToken) {
    //     await admin.messaging().send({
    //         token: fcmToken,
    //         notification: {
    //             title: '🔥 가격 하락!',
    //             body: `${productTitle} - ₩${discountAmount.toLocaleString()} 할인!`
    //         },
    //         data: { productId }
    //     });
    // }

    console.log(`Sent price drop notification to user ${userId} for product ${productId}`);
}

/**
 * Manual trigger to check price drops for a specific user
 */
export const checkUserWishlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const wishlistRef = db.collection('users').doc(userId).collection('wishlist');
    const snapshot = await wishlistRef.get();

    const results = [];

    for (const doc of snapshot.docs) {
        const item = doc.data();
        const productId = doc.id;

        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) continue;

        const product = productDoc.data();
        const currentPrice = product?.minPrice || 0;
        const savedPrice = item.price || currentPrice;
        const dropPercentage = ((savedPrice - currentPrice) / savedPrice) * 100;

        results.push({
            productId,
            title: item.title,
            savedPrice,
            currentPrice,
            dropPercentage: Math.round(dropPercentage * 10) / 10,
            shouldNotify: dropPercentage >= 5
        });
    }

    return { items: results };
});
