"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseConfigService = void 0;
const admin = __importStar(require("firebase-admin"));
class FirebaseConfigService {
    constructor() {
        this.remoteConfig = admin.remoteConfig();
    }
    async isEnabled(flagKey) {
        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagKey];
            if (!parameter || !parameter.defaultValue) {
                return false; // Default to false if not found
            }
            const value = parameter.defaultValue.value;
            return value === 'true';
        }
        catch (error) {
            console.error(`Failed to fetch feature flag ${flagKey}`, error);
            return false;
        }
    }
    async getString(flagKey) {
        try {
            const template = await this.remoteConfig.getTemplate();
            const parameter = template.parameters[flagKey];
            if (!parameter || !parameter.defaultValue) {
                return '';
            }
            return parameter.defaultValue.value || '';
        }
        catch (error) {
            return '';
        }
    }
    async getNumber(flagKey) {
        const val = await this.getString(flagKey);
        return parseFloat(val) || 0;
    }
    async getJSON(flagKey) {
        const val = await this.getString(flagKey);
        try {
            return JSON.parse(val);
        }
        catch (e) {
            return null;
        }
    }
}
exports.FirebaseConfigService = FirebaseConfigService;
//# sourceMappingURL=FirebaseConfigService.js.map