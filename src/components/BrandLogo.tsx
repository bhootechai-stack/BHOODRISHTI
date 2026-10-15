import React from 'react';
import { Satellite } from 'lucide-react';
import { PALETTE } from '../utils/themeTokens';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  tagline = 'Better Crops. Brighter Future.',
  badge,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
  };

  const svgSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Icon Emblem */}
      <div
        className={`${iconSizes[size]} bg-[#EAF0EB] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0 relative transition-transform duration-150 ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
      >
        <Satellite className={`${svgSizes[size]} text-[#2F5233]`} />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#2F5233] ring-2 ring-white" />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`${textSizes[size]} font-black tracking-tight text-[#1F2A1F] leading-none whitespace-nowrap`}>
            BHOOTECH <span className="text-[#2F5233]">AI</span>
          </span>
          {badge && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        {showTagline && (
          <span className={`${taglineSizes[size]} text-[#6B7280] font-medium tracking-wide mt-0.5 truncate`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
