"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageAlerts = void 0;
class ManageAlerts {
    constructor(alertRepository) {
        this.alertRepository = alertRepository;
    }
    async createAlert(userId, productId, targetPrice, currentPrice, email) {
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
    async getMyAlerts(userId) {
        return this.alertRepository.getAlertsByUserId(userId);
    }
}
exports.ManageAlerts = ManageAlerts;
//# sourceMappingURL=ManageAlerts.js.map