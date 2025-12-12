import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const db = admin.firestore();

/**
 * Generate a secure random API key
 */
function generateApiKey(): string {
    const prefix = 'pk_live_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return prefix + randomBytes;
}

/**
 * Create a new API key for Enterprise customers
 */
export const createApiKey = functions.https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { label } = data;

    if (!label) {
        throw new functions.https.HttpsError('invalid-argument', 'Label is required');
    }

    // Role check - only Enterprise and Admin
    const userRef = db.collection('users').doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (userData?.role !== 'enterprise' && userData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Enterprise plan required');
    }

    try {
        const apiKey = generateApiKey();
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

        const keyData = {
            userId: context.auth.uid,
            label,
            hashedKey,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUsed: null,
            usageCount: 0,
            active: true
        };

        const keyRef = await db.collection('api_keys').add(keyData);

        functions.logger.info(`API Key created: ${keyRef.id} for user ${context.auth.uid}`);

        // Return the plain key ONLY ONCE (not stored)
        return {
            id: keyRef.id,
            key: apiKey, // Client must save this - we won't show it again
            label,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        functions.logger.error('Failed to create API key', error);
        throw new functions.https.HttpsError('internal', 'Failed to create API key');
    }
});

/**
 * List all API keys for the current user (without showing the actual keys)
 */
export const listApiKeys = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    try {
        const keysSnap = await db.collection('api_keys')
            .where('userId', '==', context.auth.uid)
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        const keys = keysSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                label: data.label,
                createdAt: data.createdAt?.toDate().toISOString(),
                lastUsed: data.lastUsed?.toDate().toISOString() || 'Never',
                usageCount: data.usageCount || 0,
                // Show partial key for identification
                keyPreview: 'pk_live_••••••' + doc.id.substring(0, 6)
            };
        });

        return { keys };
    } catch (error) {
        functions.logger.error('Failed to list API keys', error);
        throw new functions.https.HttpsError('internal', 'Failed to list keys');
    }
});

/**
 * Revoke/delete an API key
 */
export const revokeApiKey = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { keyId } = data;

    if (!keyId) {
        throw new functions.https.HttpsError('invalid-argument', 'Key ID required');
    }

    try {
        const keyRef = db.collection('api_keys').doc(keyId);
        const keySnap = await keyRef.get();

        if (!keySnap.exists) {
            throw new functions.https.HttpsError('not-found', 'API key not found');
        }

        const keyData = keySnap.data();

        // Verify ownership
        if (keyData?.userId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Not your key');
        }

        // Soft delete
        await keyRef.update({
            active: false,
            revokedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        functions.logger.info(`API Key revoked: ${keyId}`);

        return { success: true, message: 'API key revoked' };
    } catch (error) {
        functions.logger.error('Failed to revoke API key', error);
        throw new functions.https.HttpsError('internal', 'Failed to revoke key');
    }
});

/**
 * Validate an API key (used by REST API middleware)
 * This is an internal function, not directly callable
 */
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string }> {
    try {
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

        const keysSnap = await db.collection('api_keys')
            .where('hashedKey', '==', hashedKey)
            .where('active', '==', true)
            .limit(1)
            .get();

        if (keysSnap.empty) {
            return { valid: false };
        }

        const keyDoc = keysSnap.docs[0];
        const keyData = keyDoc.data();

        // Update usage stats
        await keyDoc.ref.update({
            lastUsed: admin.firestore.FieldValue.serverTimestamp(),
            usageCount: admin.firestore.FieldValue.increment(1)
        });

        return {
            valid: true,
            userId: keyData.userId
        };
    } catch (error) {
        functions.logger.error('API key validation failed', error);
        return { valid: false };
    }
}
