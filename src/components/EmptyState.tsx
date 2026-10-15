import React from 'react';
import {
  AlertCircle,
  Database,
  Store,
  MapPin,
  Camera,
  FileQuestion,
  Plus,
  Compass,
  FileText,
  Radio,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'database' | 'store' | 'location' | 'camera' | 'error' | 'fileText' | 'radio' | 'generic';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  isError?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  isError = false,
  className = '',
}) => {
  const renderIcon = () => {
    const iconClass = `w-6 h-6 ${isError ? 'text-[#C0392B]' : 'text-[#2D5A36]'}`;
    switch (icon) {
      case 'database':
        return <Database className={iconClass} />;
      case 'store':
        return <Store className={iconClass} />;
      case 'location':
        return <MapPin className={iconClass} />;
      case 'camera':
        return <Camera className={iconClass} />;
      case 'fileText':
        return <FileText className={iconClass} />;
      case 'radio':
        return <Radio className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <FileQuestion className={iconClass} />;
    }
  };

  return (
    <div
      className={`py-8 px-4 text-center rounded-[14px] border ${
        isError
          ? 'bg-[#F8E3E0] border-[#F8B4B4] text-[#C0392B]'
          : 'bg-[#FBFAF5] border-[#E6E1D3] text-[#2F3A2E]'
      } shadow-[0_1px_3px_rgba(40,50,35,0.06)] flex flex-col items-center justify-center gap-3 transition-colors ${className}`}
    >
      {/* Icon Capsule */}
      <div
        className={`w-12 h-12 rounded-[14px] flex items-center justify-center border ${
          isError
            ? 'bg-[#F8E3E0] border-[#F8B4B4] text-[#C0392B]'
            : 'bg-[#E3E8D8] border-[#E6E1D3] text-[#2D5A36]'
        }`}
      >
        {renderIcon()}
      </div>

      {/* Typography */}
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-bold text-[#1E2B1F] tracking-tight">{title}</h4>
        <p className="text-xs text-[#6B7266] leading-relaxed">{description}</p>
      </div>

      {/* Action Buttons */}
      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
          {onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className={`px-4 py-2 rounded-[8px] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isError
                  ? 'bg-[#C0392B] hover:bg-[#A93226] text-white'
                  : 'bg-[#2D5A36] hover:bg-[#23472A] text-white'
              }`}
            >
              {actionIcon}
              <span>{actionLabel}</span>
            </button>
          )}

          {onSecondaryAction && secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-3.5 py-2 rounded-[8px] text-xs font-semibold bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#2D5A36] border border-[#D9D4C4] transition-all duration-150 cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
