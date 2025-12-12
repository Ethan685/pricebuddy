import { IAlertRepository } from '../repositories/IAlertRepository';
import { Alert } from '../entities/Alert';

export class ManageAlerts {
    constructor(private alertRepository: IAlertRepository) { }

    async createAlert(
        userId: string,
        productId: string,
        targetPrice: number,
        currentPrice: number,
        email?: string
    ): Promise<{ alertId: string; message: string; status: string }> {
        // 1. Check for existing active alert
        const existingAlert = await this.alertRepository.findActiveAlert(userId, productId);

        if (existingAlert) {
            // Update existing
            await this.alertRepository.updateAlert(existingAlert.id, {
                targetPrice,
                updatedAt: new Date() // Repository implementation should handle Firestore timestamp conversion if needed
            });
            return {
                alertId: existingAlert.id,
                status: 'active',
                message: 'Alert updated'
            };
        }

        // 2. Create New
        const alertId = await this.alertRepository.createAlert({
            userId,
            productId,
            targetPrice,
            initialPrice: currentPrice,
            isActive: true,
            status: 'active',
            email
        });

        return {
            alertId,
            status: 'active',
            message: 'Alert set'
        };
    }

    async getMyAlerts(userId: string): Promise<Alert[]> {
        return this.alertRepository.getAlertsByUserId(userId);
    }
}
