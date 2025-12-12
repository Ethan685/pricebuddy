import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Clock, TrendingDown } from 'lucide-react';

interface TrustBadgeProps {
    type: 'verified' | 'lowest' | 'fresh' | 'trending';
    text: string;
    size?: 'sm' | 'md' | 'lg';
}

const BADGE_CONFIGS = {
    verified: {
        icon: Shield,
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30'
    },
    lowest: {
        icon: TrendingDown,
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30'
    },
    fresh: {
        icon: Clock,
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
    },
    trending: {
        icon: CheckCircle,
        bgColor: 'bg-purple-500/20',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30'
    }
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type, text, size = 'md' }) => {
    const config = BADGE_CONFIGS[type];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <div className={`
            inline-flex items-center gap-2 rounded-lg border
            ${config.bgColor} ${config.textColor} ${config.borderColor}
            ${sizeClasses[size]}
            font-semibold
        `}>
            <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
            <span>{text}</span>
        </div>
    );
};

interface DataSourceBadgeProps {
    source: 'api' | 'scraper' | 'user_report';
    lastUpdated?: Date;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source, lastUpdated }) => {
    const sourceInfo = {
        api: { label: 'API 연동', color: 'green', icon: CheckCircle },
        scraper: { label: '자동 수집', color: 'blue', icon: Shield },
        user_report: { label: '사용자 제보', color: 'yellow', icon: AlertTriangle }
    };

    const info = sourceInfo[source];
    const Icon = info.icon;

    return (
        <div className="flex items-center gap-3 text-xs text-[#9BA7B4]">
            <div className={`flex items-center gap-1 ${info.color === 'green' ? 'text-green-400' :
                info.color === 'blue' ? 'text-blue-400' :
                    'text-yellow-400'
                }`}>
                <Icon size={12} />
                <span>{info.label}</span>
            </div>
            {lastUpdated && (
                <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(lastUpdated).toLocaleDateString('ko-KR')}</span>
                    </div>
                </>
            )}
        </div>
    );
};

interface PriceAccuracyIndicatorProps {
    accuracy: number; // 0-100
}

export const PriceAccuracyIndicator: React.FC<PriceAccuracyIndicatorProps> = ({ accuracy }) => {
    const getColor = () => {
        if (accuracy >= 90) return { bg: 'bg-green-500', text: 'text-green-400', label: '매우 정확' };
        if (accuracy >= 70) return { bg: 'bg-blue-500', text: 'text-blue-400', label: '정확' };
        if (accuracy >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: '보통' };
        return { bg: 'bg-red-500', text: 'text-red-400', label: '재확인 필요' };
    };

    const color = getColor();

    return (
        <div className="bg-[#0D1117] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#9BA7B4]">가격 정확도</span>
                <span className={`text-xs font-bold ${color.text}`}>{color.label}</span>
            </div>
            <div className="w-full bg-[#30363D] rounded-full h-2">
                <div
                    className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${accuracy}%` }}
                />
            </div>
            <div className="text-xs text-[#9BA7B4] mt-1">
                {accuracy}% 신뢰도
            </div>
        </div>
    );
};
