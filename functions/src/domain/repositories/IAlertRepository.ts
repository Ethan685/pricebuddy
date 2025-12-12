import { Alert } from '../entities/Alert';

export interface IAlertRepository {
    createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string>;
    getAlertsByUserId(userId: string): Promise<Alert[]>;
    updateAlert(id: string, updates: Partial<Alert>): Promise<void>;
    findActiveAlert(userId: string, productId: string): Promise<Alert | null>;
}
