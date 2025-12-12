import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from "firebase/auth";
import { auth } from "../firebase";

export const authService = {
    signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Google Sign-In failed", error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Sign Out failed", error);
            throw error;
        }
    },

    onAuthStateChanged: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    }
};
