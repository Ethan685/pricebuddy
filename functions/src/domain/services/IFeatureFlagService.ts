export interface IFeatureFlagService {
    isEnabled(flagKey: string): Promise<boolean>;
    getString(flagKey: string): Promise<string>;
    getNumber(flagKey: string): Promise<number>;
    getJSON<T>(flagKey: string): Promise<T | null>;
}
