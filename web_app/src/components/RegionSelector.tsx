import React from 'react';

export type Region = 'ALL' | 'KR' | 'NA' | 'EU' | 'ASIA' | 'JP' | 'SEA';

interface RegionOption {
    code: Region;
    label: string;
    flag: string;
    description: string;
}

const REGIONS: RegionOption[] = [
    { code: 'ALL', label: '모든 지역', flag: '🌍', description: '글로벌 최저가 비교' },
    { code: 'KR', label: '한국', flag: '🇰🇷', description: '국내 배송 빠름' },
    { code: 'NA', label: '북미', flag: '🇺🇸', description: 'Amazon, Walmart 등' },
    { code: 'EU', label: '유럽', flag: '🇪🇺', description: 'UK, DE, FR' },
    { code: 'ASIA', label: '중국', flag: '🇨🇳', description: 'AliExpress 직구' },
    { code: 'JP', label: '일본', flag: '🇯🇵', description: 'Rakuten 직구' },
    { code: 'SEA', label: '동남아', flag: '🌏', description: 'Lazada, Shopee' }
];

interface RegionSelectorProps {
    value: Region;
    onChange: (region: Region) => void;
    className?: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
    value,
    onChange,
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-bold text-[#9BA7B4] mb-2">
                검색 지역 선택
            </label>

            {/* Desktop: Button Grid */}
            <div className="hidden md:grid grid-cols-4 gap-2">
                {REGIONS.map((region) => (
                    <button
                        key={region.code}
                        onClick={() => onChange(region.code)}
                        className={`p-3 rounded-lg border-2 transition-all ${value === region.code
                                ? 'border-[#4F7EFF] bg-[#4F7EFF]/10 text-white'
                                : 'border-[#30363D] hover:border-[#4F7EFF]/50 text-[#9BA7B4] hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{region.flag}</span>
                            <span className="font-bold text-sm">{region.label}</span>
                        </div>
                        <div className="text-xs opacity-75">{region.description}</div>
                    </button>
                ))}
            </div>

            {/* Mobile: Dropdown */}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as Region)}
                className="md:hidden w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F7EFF]"
            >
                {REGIONS.map((region) => (
                    <option key={region.code} value={region.code}>
                        {region.flag} {region.label} - {region.description}
                    </option>
                ))}
            </select>

            {/* Selected Info */}
            {value !== 'ALL' && (
                <div className="mt-3 p-3 bg-[#161B22] border border-[#30363D] rounded-lg text-sm text-[#9BA7B4]">
                    💡 <span className="text-white font-bold">Tip:</span> 해외 구매 시 배송비 및 관세가 추가됩니다
                </div>
            )}
        </div>
    );
};
