import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createPost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { title, url, price, currency = 'KRW', imageUrl } = data;

    if (!title || !url || !price) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    const db = admin.firestore();

    try {
        const postRef = await db.collection("community_posts").add({
            title,
            url,
            price: Number(price),
            currency,
            imageUrl: imageUrl || null,
            authorId: context.auth.uid,
            authorName: context.auth.token.name || context.auth.token.email || "Anonymous", // Simple fallback
            votes: 0,
            comments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isHot: false
        });

        return { id: postRef.id, message: "Post created successfully" };
    } catch (error) {
        functions.logger.error("Create Post failed", error);
        throw new functions.https.HttpsError("internal", "Failed to create post");
    }
});

export const votePost = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { postId, delta } = data; // delta should be 1 or -1
    const userId = context.auth.uid;

    if (!postId || ![1, -1].includes(delta)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid arguments");
    }

    const db = admin.firestore();
    const postRef = db.collection("community_posts").doc(postId);
    const voteRef = postRef.collection("votes").doc(userId);

    try {
        await db.runTransaction(async (t) => {
            const postDoc = await t.get(postRef);
            if (!postDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Post not found");
            }

            const voteDoc = await t.get(voteRef);
            const currentVote = voteDoc.exists ? voteDoc.data()?.val || 0 : 0;


            // Simple logic:
            // If voting same direction again -> ignore or toggle off?
            // Standard reddit style:
            // If no vote -> vote (+1/-1) -> Net +1/-1
            // If voted +1 and vote +1 -> toggle off (0) -> Net -1
            // If voted +1 and vote -1 -> switch (-1) -> Net -2

            // For MVP simplicity, let's just apply the delta but ensure bound [-1, 1] per user.
            // Actually, the "delta" from UI usually implies "User clicked Up".
            // Let's assume UI sends the DESIRED state or we handle the toggle login on server.
            // Let's handle "Toggle" logic here for robust API.

            let finalDelta = 0;
            let nextVal = 0;

            if (delta === 1) {
                if (currentVote === 1) {
                    nextVal = 0; // Toggle off
                    finalDelta = -1;
                } else if (currentVote === -1) {
                    nextVal = 1; // Switch
                    finalDelta = 2;
                } else {
                    nextVal = 1; // New vote
                    finalDelta = 1;
                }
            } else if (delta === -1) {
                if (currentVote === -1) {
                    nextVal = 0; // Toggle off
                    finalDelta = 1;
                } else if (currentVote === 1) {
                    nextVal = -1; // Switch
                    finalDelta = -2;
                } else {
                    nextVal = -1; // New vote
                    finalDelta = -1;
                }
            }

            if (nextVal === 0) {
                t.delete(voteRef);
            } else {
                t.set(voteRef, { val: nextVal, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            }

            const newTotal = (postDoc.data()?.votes || 0) + finalDelta;
            t.update(postRef, { votes: newTotal });
        });

        return { success: true };
    } catch (error) {
        functions.logger.error("Vote failed", error);
        throw new functions.https.HttpsError("internal", "Vote failed");
    }
});

export const addComment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { postId, text } = data;
    if (!postId || !text) {
        throw new functions.https.HttpsError("invalid-argument", "Missing fields");
    }

    const db = admin.firestore();

    try {
        const commentRef = await db.collection("community_posts").doc(postId).collection("comments").add({
            text,
            authorId: context.auth.uid,
            authorName: context.auth.token.name || context.auth.token.email || "Anonymous",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Increment comment count
        await db.collection("community_posts").doc(postId).update({
            comments: admin.firestore.FieldValue.increment(1)
        });

        return { id: commentRef.id };
    } catch (error) {
        functions.logger.error("Comment failed", error);
        throw new functions.https.HttpsError("internal", "Comment failed");
    }
});
