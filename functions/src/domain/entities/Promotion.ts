export interface Promotion {
    id: string;
    type: 'discount' | 'shipping' | 'cashback';
    code: string;
    description: string;
    conditions: {
        minAmount?: number;
        merchant?: string;
        category?: string;
    };
    reward: {
        amount: number;
        unit: 'currency' | 'percent';
    };
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}
