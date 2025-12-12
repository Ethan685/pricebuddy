import * as admin from 'firebase-admin';
import { IFeatureFlagService } from '../../domain/services/IFeatureFlagService';

export class FirebaseConfigService implements IFeatureFlagService {
    private remoteConfig = admin.remoteConfig();

    async isEnabled(flagKey: string): Promise<boolean> {
        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagKey];

            if (!parameter || !parameter.defaultValue) {
                return false; // Default to false if not found
            }

            const value = (parameter.defaultValue as any).value;
            return value === 'true';
        } catch (error) {
            console.error(`Failed to fetch feature flag ${flagKey}`, error);
            return false;
        }
    }

    async getString(flagKey: string): Promise<string> {
        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagKey];

            if (!parameter || !parameter.defaultValue) {
                return '';
            }

            return (parameter.defaultValue as any).value || '';
        } catch (error) {
            return '';
        }
    }

    async getNumber(flagKey: string): Promise<number> {
        const val = await this.getString(flagKey);
        return parseFloat(val) || 0;
    }

    async getJSON<T>(flagKey: string): Promise<T | null> {
        const val = await this.getString(flagKey);
        try {
            return JSON.parse(val) as T;
        } catch (e) {
            return null;
        }
    }
}
