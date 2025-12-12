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
exports.addComment = exports.votePost = exports.createPost = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.createPost = functions.https.onCall(async (data, context) => {
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
            authorName: context.auth.token.name || context.auth.token.email || "Anonymous",
            votes: 0,
            comments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isHot: false
        });
        return { id: postRef.id, message: "Post created successfully" };
    }
    catch (error) {
        functions.logger.error("Create Post failed", error);
        throw new functions.https.HttpsError("internal", "Failed to create post");
    }
});
exports.votePost = functions.https.onCall(async (data, context) => {
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
            var _a, _b;
            const postDoc = await t.get(postRef);
            if (!postDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Post not found");
            }
            const voteDoc = await t.get(voteRef);
            const currentVote = voteDoc.exists ? ((_a = voteDoc.data()) === null || _a === void 0 ? void 0 : _a.val) || 0 : 0;
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
                }
                else if (currentVote === -1) {
                    nextVal = 1; // Switch
                    finalDelta = 2;
                }
                else {
                    nextVal = 1; // New vote
                    finalDelta = 1;
                }
            }
            else if (delta === -1) {
                if (currentVote === -1) {
                    nextVal = 0; // Toggle off
                    finalDelta = 1;
                }
                else if (currentVote === 1) {
                    nextVal = -1; // Switch
                    finalDelta = -2;
                }
                else {
                    nextVal = -1; // New vote
                    finalDelta = -1;
                }
            }
            if (nextVal === 0) {
                t.delete(voteRef);
            }
            else {
                t.set(voteRef, { val: nextVal, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            }
            const newTotal = (((_b = postDoc.data()) === null || _b === void 0 ? void 0 : _b.votes) || 0) + finalDelta;
            t.update(postRef, { votes: newTotal });
        });
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Vote failed", error);
        throw new functions.https.HttpsError("internal", "Vote failed");
    }
});
exports.addComment = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error("Comment failed", error);
        throw new functions.https.HttpsError("internal", "Comment failed");
    }
});
//# sourceMappingURL=community.js.map