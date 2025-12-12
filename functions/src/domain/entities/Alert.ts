export interface Alert {
    id: string;
    userId: string;
    productId: string;
    targetPrice: number;
    initialPrice: number;
    isActive: boolean;
    createdAt: any; // Using any for Firestore Timestamp compatibility or Date
    updatedAt?: any;
    status: 'active' | 'triggered' | 'cancelled';
    email?: string;
}
