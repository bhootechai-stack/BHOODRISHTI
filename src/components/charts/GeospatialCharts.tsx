import React, { useState } from 'react';
import { PALETTE } from '../../utils/themeTokens';

/**
 * Enterprise Circular Progress Ring / Donut Chart
 * Restrained light theme: Deep Forest Green (#2F5233) + Neutral Grey (#6B7280) + Reserved Red (#C0392B)
 */
interface CircularProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'forest' | 'neutral' | 'red' | 'auto';
  showPercentageSign?: boolean;
  valueFormatter?: (val: number) => string | number;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  size = 90,
  strokeWidth = 8,
  label,
  sublabel,
  colorScheme = 'auto',
  showPercentageSign = true,
  valueFormatter,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Deep forest green for healthy/good series, neutral grey for mid, muted red for critical alert
  const resolvedColor =
    colorScheme === 'red'
      ? PALETTE.alertDanger
      : colorScheme === 'neutral'
      ? PALETTE.textSecondary
      : colorScheme === 'forest'
      ? PALETTE.primaryAccent
      : clampedValue >= 60
      ? PALETTE.primaryAccent
      : clampedValue >= 35
      ? PALETTE.textSecondary
      : PALETTE.alertDanger;

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={PALETTE.border}
            strokeWidth={strokeWidth}
          />
          {/* Filled Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-mono font-bold tracking-tight leading-none"
            style={{
              color: PALETTE.textPrimary,
              fontSize: size >= 100 ? '1.35rem' : size >= 75 ? '1.05rem' : '0.85rem',
            }}
          >
            {valueFormatter ? valueFormatter(value) : Math.round(value)}
            {showPercentageSign && <span className="text-[10px] font-sans font-bold ml-0.5">%</span>}
          </span>
          {label && (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280] mt-0.5 line-clamp-1 max-w-[80%]"
            >
              {label}
            </span>
          )}
        </div>
      </div>
      {sublabel && (
        <span className="text-[10px] text-[#6B7280] mt-1 font-medium text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
};

/**
 * Responsive Multi-Pass Sparkline Chart
 */
export interface SparklineDataPoint {
  label: string;
  value: number;
  formattedDate?: string;
  details?: string;
}

interface SparklineAreaProps {
  data: SparklineDataPoint[];
  color?: string;
  gradientId?: string;
  height?: number;
  min?: number;
  max?: number;
  valueFormatter?: (val: number) => string;
  activeLabel?: string;
}

export const SparklineArea: React.FC<SparklineAreaProps> = ({
  data,
  color = PALETTE.primaryAccent,
  height = 42,
  min,
  max,
  valueFormatter,
  activeLabel,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const dataMin = min !== undefined ? min : Math.min(...values) * 0.95;
  const dataMax = max !== undefined ? max : Math.max(...values) * 1.05;
  const range = dataMax - dataMin || 1;

  const width = 200;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  // Generate smooth cubic bezier SVG path points
  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((d.value - dataMin) / range) * usableHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cX1 = prev.x + (point.x - prev.x) / 2;
    const cY1 = prev.y;
    const cX2 = prev.x + (point.x - prev.x) / 2;
    const cY2 = point.y;
    return `${acc} C ${cX1},${cY1} ${cX2},${cY2} ${point.x},${point.y}`;
  }, '');

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full flex flex-col" style={{ height: height + 16 }}>
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Subtle Flat Area Fill */}
          <path d={areaD} fill={color} fillOpacity={0.12} />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Dots */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isLast = idx === points.length - 1;
            return (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={8}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4 : isLast ? 3 : 2}
                  fill={isHovered || isLast ? PALETTE.textPrimary : color}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute -top-7 pointer-events-none transform -translate-x-1/2 z-20 whitespace-nowrap bg-white text-[#1F2A1F] text-[9px] font-mono px-2 py-0.5 rounded border border-[#E5E0D3] shadow-xs flex items-center gap-1"
            style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
          >
            <span className="font-bold text-[#6B7280]">{hoveredPoint.data.label}:</span>
            <span className="font-bold text-[#1F2A1F]">
              {valueFormatter ? valueFormatter(hoveredPoint.data.value) : hoveredPoint.data.value}
            </span>
          </div>
        )}
      </div>

      {/* Baseline Date Labels */}
      <div className="flex justify-between items-center text-[9px] text-[#6B7280] font-mono mt-1 px-0.5">
        <span>{data[0]?.label}</span>
        {activeLabel && <span className="text-[#1F2A1F] font-bold">{activeLabel}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

/**
 * Semi-Circular Severity Gauge Dial for Disease Spread
 * Restrained palette: forest green (mild), neutral grey (moderate), muted red (severe alert)
 */
interface SeverityGaugeProps {
  score: number; // 0 to 100
  label?: string;
  category?: string;
  size?: number;
}

export const SeverityGauge: React.FC<SeverityGaugeProps> = ({
  score,
  label = 'Infection Severity',
  category,
  size = 140,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const clampedScore = Math.min(100, Math.max(0, score));

  // Half-circle arc math: angle from -180 to 0 degrees
  const angle = (clampedScore / 100) * 180;
  const radians = ((angle - 180) * Math.PI) / 180;
  const needleX = size / 2 + (radius - 14) * Math.cos(radians);
  const needleY = size / 2 + (radius - 14) * Math.sin(radians);

  const getSeverityInfo = (val: number) => {
    if (val <= 30) return { label: 'Mild / Localized', color: PALETTE.primaryAccent };
    if (val <= 65) return { label: 'Moderate Spread', color: PALETTE.textSecondary };
    return { label: 'Severe / Systemic', color: PALETTE.alertDanger };
  };

  const info = getSeverityInfo(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
        <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
            fill="none"
            stroke={PALETTE.border}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Severity Arc */}
          <path
            d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
            fill="none"
            stroke={info.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.9}
          />

          {/* Needle Pointer */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={needleX}
            y2={needleY}
            stroke={PALETTE.textPrimary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size / 2} r={4} fill={PALETTE.textPrimary} />
        </svg>

        {/* Value badge in center */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold font-mono leading-none text-[#1F2A1F]">
            {Math.round(clampedScore)}%
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280] mt-0.5">
            {label}
          </span>
        </div>
      </div>

      <div className="mt-1 px-2.5 py-0.5 rounded-full border border-[#E5E0D3] bg-[#FAF8F2] text-[10px] font-semibold text-[#1F2A1F]">
        {category || info.label}
      </div>
    </div>
  );
};

/**
 * Multi-Segment Stacked Tissue Breakdown Bar
 */
interface TissueBreakdownProps {
  healthyPct: number;
  mildPct: number;
  severePct: number;
  totalAreaAnalyzed?: string;
}

export const TissuePathologyBreakdown: React.FC<TissueBreakdownProps> = ({
  healthyPct,
  mildPct,
  severePct,
  totalAreaAnalyzed = 'Multi-Angle Photos',
}) => {
  const segments = [
    { label: 'Healthy Tissue', percentage: healthyPct, color: PALETTE.primaryAccent },
    { label: 'Mild / Latent Lesions', percentage: mildPct, color: PALETTE.textSecondary },
    { label: 'Severe / Necrotic', percentage: severePct, color: PALETTE.alertDanger },
  ];

  return (
    <div className="p-3 bg-white rounded-xl border border-[#E5E0D3] shadow-xs space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-[#1F2A1F]">Tissue Pathology Breakdown</span>
        <span className="text-[10px] text-[#6B7280] font-mono">{totalAreaAnalyzed}</span>
      </div>

      {/* Visual Stacked Bar */}
      <div className="w-full h-3 rounded-full bg-[#FAF8F2] overflow-hidden flex border border-[#E5E0D3]">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
            className="h-full transition-all duration-500"
            title={`${seg.label}: ${seg.percentage}%`}
          />
        ))}
      </div>

      {/* Legend & Percentages */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[#6B7280] truncate">{seg.label}</span>
            </div>
            <span className="font-mono font-bold text-[#1F2A1F] pl-3.5">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Horizontal Metric Comparison Bar
 */
interface HorizontalMetricBarProps {
  label: string;
  value: number; // percentage
  targetValue?: number;
  valueText?: string;
  color?: string;
  benchmarkText?: string;
}

export const HorizontalMetricBar: React.FC<HorizontalMetricBarProps> = ({
  label,
  value,
  targetValue,
  valueText,
  color = PALETTE.primaryAccent,
  benchmarkText,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#1F2A1F] font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          {benchmarkText && <span className="text-[#6B7280] font-mono text-[9px]">{benchmarkText}</span>}
          <span className="font-mono font-bold text-[#1F2A1F]">{valueText || `${clampedValue}%`}</span>
        </div>
      </div>
      <div className="relative w-full h-2 rounded-full bg-[#FAF8F2] border border-[#E5E0D3] overflow-hidden">
        <div
          style={{ width: `${clampedValue}%`, backgroundColor: color }}
          className="h-full rounded-full transition-all duration-500"
        />
        {targetValue !== undefined && (
          <div
            style={{ left: `${Math.min(100, Math.max(0, targetValue))}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-[#1F2A1F]"
            title={`Benchmark: ${targetValue}%`}
          />
        )}
      </div>
    </div>
  );
};
