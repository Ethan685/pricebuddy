import axios, { AxiosInstance } from 'axios';

export interface PriceBuddyConfig {
    apiKey?: string;
    baseUrl?: string;
}

export class PriceBuddyClient {
    private client: AxiosInstance;

    constructor(config: PriceBuddyConfig = {}) {
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://us-central1-pricebuddy.cloudfunctions.net',
            headers: {
                'Content-Type': 'application/json',
                ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {})
            }
        });
    }

    /**
     * Search for products (Public REST API)
     */
    async searchProducts(query: string, limit: number = 20): Promise<any> {
        const response = await this.client.get('/apiSearchProducts', {
            params: { q: query, limit }
        });
        return response.data;
    }

    /**
     * Get Product Details
     */
    async getProduct(productId: string): Promise<any> {
        const response = await this.client.get(`/apiGetProduct/${productId}`);
        return response.data;
    }

    /**
     * Create Price Alert
     */
    async createAlert(productId: string, targetPrice: number): Promise<any> {
        const response = await this.client.post('/apiCreateAlert', {
            productId,
            targetPrice
        });
        return response.data;
    }

    /**
     * List my alerts (B2B)
     */
    async getAlerts(): Promise<any> {
        const response = await this.client.get('/apiListAlerts');
        return response.data;
    }

    /**
     * Generate Creator Link (B2B)
     */
    async createShareLink(path: string): Promise<string> {
        const response = await this.client.post('/apiCreateShareLink', { path });
        return response.data.link;
    }
}
