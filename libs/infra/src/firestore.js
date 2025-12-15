"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
function ensureApp() {
    if (!firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp();
    }
    return firebase_admin_1.default.app();
}
exports.firestore = (() => {
    ensureApp();
    return firebase_admin_1.default.firestore();
})();
//# sourceMappingURL=firestore.js.map