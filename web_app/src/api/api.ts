import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import type { Product, Offer, GlobalSearchResult } from '../types';

export const api = {
    // Legacy searchProducts removed. Use search() or searchGlobal() instead.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProductDetails: async (productId: string): Promise<{ product: Product; offers: Offer[]; priceHistory: any[] }> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getDetailsFn = httpsCallable<{ productId: string }, { product: Product; offers: Offer[]; priceHistory: any[] }>(functions, 'getProductDetails');
            const result = await getDetailsFn({ productId });
            return result.data;
        } catch (error) {
            console.error("Get details failed:", error);
            throw error;
        }
    },

    getUserFeed: async (): Promise<Product[]> => {
        try {
            const getFeedFn = httpsCallable<void, { success: boolean; data: { products: Product[] } }>(functions, 'getUserFeed');
            const result = await getFeedFn();

            if (result.data.success && result.data.data) {
                return result.data.data.products;
            }
            return [];
        } catch (error) {
            console.error("Get feed failed:", error);
            return [];
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logEvent: async (eventName: string, params?: any): Promise<void> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const logFn = httpsCallable<{ eventName: string; params: any }, void>(functions, 'logEvent');
            // Fire and forget
            logFn({ eventName, params });
        } catch (error) {
            // Telemetry errors should not block app usage
            console.warn("Telemetry error:", error);
        }
    },

    createCommunityPost: async (post: { title: string; url: string; price: number; currency: string; imageUrl?: string }): Promise<void> => {
        const createFn = httpsCallable(functions, 'createPost');
        await createFn(post);
    },

    voteCommunityPost: async (postId: string, delta: number): Promise<void> => {
        const voteFn = httpsCallable(functions, 'votePost');
        await voteFn({ postId, delta });
    },

    addComment: async (postId: string, text: string): Promise<void> => {
        const commentFn = httpsCallable(functions, 'addComment');
        await commentFn({ postId, text });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictPrice: async (productId: string, currentPrice: number): Promise<any> => {
        const predictFn = httpsCallable(functions, 'predictPrice');
        const result = await predictFn({ productId, currentPrice });
        return result.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchSKU: async (title: string, currentPrice: number, currency: string): Promise<any> => {
        const matchFn = httpsCallable(functions, 'matchSKU');
        const result = await matchFn({ title, currentPrice, currency });
        return result.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyzeReviews: async (reviews: string[]): Promise<any> => {
        const analyzeFn = httpsCallable(functions, 'analyzeReviews');
        const result = await analyzeFn({ reviews });
        return result.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateReport: async (type: string, format: 'csv' | 'pdf' = 'csv'): Promise<any> => {
        const reportFn = httpsCallable(functions, 'generateB2BReport');
        const result = await reportFn({ type, format });
        return result.data;
    },

    createPriceAlert: async (productId: string, targetPrice: number, currentPrice: number): Promise<void> => {
        const alertFn = httpsCallable(functions, 'createPriceAlert');
        await alertFn({ productId, targetPrice, currentPrice });
    },

    createCheckoutSession: async (planId: string): Promise<any> => {
        const checkoutFn = httpsCallable(functions, 'createCheckoutSession');
        const res = await checkoutFn({ planId });
        return res.data;
    },

    createPortalSession: async (): Promise<{ success: boolean; url: string }> => {
        const portalFn = httpsCallable(functions, 'createPortalSession');
        const res = await portalFn();
        return res.data as { success: boolean; url: string };
    },

    createReferralCode: async (): Promise<{ code: string }> => {
        const createRef = httpsCallable(functions, 'createReferralCode');
        const result = await createRef();
        return result.data as { code: string };
    },

    redeemReferral: async (code: string): Promise<{ success: boolean; message: string }> => {
        const redeemRef = httpsCallable(functions, 'redeemReferral');
        const result = await redeemRef({ code });
        return result.data as { success: boolean; message: string };
    },

    checkBadges: async (): Promise<{ newBadges: string[]; message: string }> => {
        const checkFn = httpsCallable(functions, 'checkBadges');
        const result = await checkFn();
        return result.data as { newBadges: string[]; message: string };
    },

    getWishlist: async (): Promise<any[]> => {
        const getFn = httpsCallable(functions, 'getWishlist');
        const result = await getFn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (result.data as any).items;
    },

    toggleWishlist: async (productId: string, productData: any): Promise<{ added: boolean, message: string }> => {
        const toggleFn = httpsCallable(functions, 'toggleWishlist');
        const result = await toggleFn({ productId, productData });
        return result.data as { added: boolean, message: string };
    },

    // Search (Local / DB)
    search: async (query: string): Promise<Product[]> => {
        const fn = httpsCallable<{ query: string }, Product[]>(functions, 'search');
        const res = await fn({ query });
        return res.data;
    },

    // NEW: Global marketplace search (Scraper Service)
    searchGlobal: async (query: string, region: string = 'ALL', limit: number = 10): Promise<GlobalSearchResult> => {
        const fn = httpsCallable<{ query: string; region: string; limit: number }, GlobalSearchResult>(functions, 'searchGlobal');
        const res = await fn({ query, region, limit });
        return res.data;
    },

    // Get available merchants
    getAvailableMerchants: async (): Promise<any[]> => {
        const fn = httpsCallable(functions, 'getAvailableMerchants');
        const res = await fn({});
        return res.data as any[];
    },

    // Price History & Trust Features
    getPriceHistory: async (productId: string, merchantName?: string, daysBack: number = 30): Promise<any> => {
        const fn = httpsCallable(functions, 'getPriceHistory');
        const res = await fn({ productId, merchantName, daysBack });
        return res.data;
    },

    getDataFreshness: async (productId: string): Promise<any> => {
        const fn = httpsCallable(functions, 'getDataFreshness');
        const res = await fn({ productId });
        return res.data;
    },

    recordPriceSnapshot: async (productId: string, merchantName: string, price: number, currency: string): Promise<any> => {
        const fn = httpsCallable(functions, 'recordPriceSnapshot');
        const res = await fn({ productId, merchantName, price, currency, source: 'user_report' });
        return res.data;
    },

    // Wallet
    getWalletBalance: async (): Promise<any> => {
        const fn = httpsCallable(functions, 'getWalletBalance');
        const res = await fn();
        return res.data;
    },

    requestWithdrawal: async (amount: number): Promise<void> => {
        const fn = httpsCallable(functions, 'requestWithdrawal');
        await fn({ amount });
    },

    simulateCashback: async (): Promise<void> => {
        const fn = httpsCallable(functions, 'simulateCashbackEarned');
        await fn();
    },

    // Delivery (Pro+)
    trackPackage: async (carrier: string, trackingNumber: string): Promise<any> => {
        const fn = httpsCallable(functions, 'trackPackage');
        const res = await fn({ carrier, trackingNumber });
        return res.data;
    },

    getShareUrl: (productId: string): string => {
        // Points to the cloud function for Open Graph support
        return `https://us-central1-pricebuddy.cloudfunctions.net/shareProduct?id=${productId}`;
    },

    // === Enterprise Features ===
    // API Key Management
    createApiKey: async (label: string): Promise<{ id: string; key: string; label: string; createdAt: string }> => {
        const fn = httpsCallable(functions, 'createApiKey');
        const res = await fn({ label });
        return res.data as { id: string; key: string; label: string; createdAt: string };
    },

    listApiKeys: async (): Promise<{ keys: any[] }> => {
        const fn = httpsCallable(functions, 'listApiKeys');
        const res = await fn();
        return res.data as { keys: any[] };
    },

    revokeApiKey: async (keyId: string): Promise<{ success: boolean; message: string }> => {
        const fn = httpsCallable(functions, 'revokeApiKey');
        const res = await fn({ keyId });
        return res.data as { success: boolean; message: string };
    },

    // Bulk SKU Import
    bulkImportSKUs: async (csvData: string): Promise<{ success: boolean; imported: number; total: number; errors?: string[] }> => {
        const fn = httpsCallable(functions, 'bulkImportSKUs');
        const res = await fn({ csvData });
        return res.data as { success: boolean; imported: number; total: number; errors?: string[] };
    },

    getMonitoredSKUs: async (limit = 50, offset = 0): Promise<{ skus: any[]; total: number }> => {
        const fn = httpsCallable(functions, 'getMonitoredSKUs');
        const res = await fn({ limit, offset });
        return res.data as { skus: any[]; total: number };
    },

    removeMonitoredSKU: async (skuId: string): Promise<{ success: boolean; message: string }> => {
        const fn = httpsCallable(functions, 'removeMonitoredSKU');
        const res = await fn({ skuId });
        return res.data as { success: boolean; message: string };
    }
};
