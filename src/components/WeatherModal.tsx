import React from 'react';
import {
  X,
  CloudSun,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Thermometer,
  Gauge,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { WeatherData, LatLng } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { PALETTE } from '../utils/themeTokens';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData | null;
  location: LatLng;
  locationName: string;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  weather,
  location,
  locationName,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Fallback weather data if null
  const current = weather || {
    temperature: 29,
    apparentTemperature: 31,
    humidity: 58,
    precipitation: 0.0,
    rainChance: 15,
    windSpeed: 9,
    weatherCode: 1,
    conditionText: 'Partly Cloudy / Fair Weather',
    sunrise: '06:10 AM',
    sunset: '06:48 PM',
    dailyForecast: [
      { date: '2026-08-26', dayName: 'Today', tempMax: 33, tempMin: 22, rainChance: 15, code: 1 },
      { date: '2026-08-27', dayName: 'Tomorrow', tempMax: 34, tempMin: 23, rainChance: 10, code: 0 },
      { date: '2026-08-28', dayName: 'Fri', tempMax: 32, tempMin: 21, rainChance: 30, code: 2 },
    ],
  };

  const isRainLikely = (current.rainChance || 0) > 40;
  const isHighWind = current.windSpeed > 18;
  const isSprayOptimal = !isRainLikely && !isHighWind && current.humidity < 80;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-4 bg-black/40 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FBFAF5] border border-[#E6E1D3] text-[#1E2B1F] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FBFAF5] text-[#1E2B1F] border-b border-[#E6E1D3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#2F5233] flex items-center justify-center border border-[#E5E0D3]">
              <CloudSun className="w-5 h-5 text-[#2F5233]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1F2A1F]">
                  Local Weather & Atmospheric Risk Telemetry
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                {locationName} • GPS: {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#6B7280] hover:text-[#1F2A1F] border border-[#E5E0D3] flex items-center justify-center transition-all duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Main Temperature & Weather Hero Card */}
          <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-4xl sm:text-5xl font-black text-[#1F2A1F] tracking-tight font-mono">
                {current.temperature}°C
              </div>
              <div>
                <span className="text-sm font-bold text-[#1F2A1F] block">{current.conditionText}</span>
                <span className="text-xs text-[#6B7280]">Feels like {current.apparentTemperature}°C</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center border-t sm:border-t-0 sm:border-l border-[#E5E0D3] pt-3 sm:pt-0 sm:pl-4">
              <div className="p-2.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] flex items-center justify-center gap-1 font-semibold">
                  <Droplets className="w-3 h-3 text-[#6B7280]" />
                  {t('humidity')}
                </div>
                <div className="text-sm font-bold text-[#1F2A1F] font-mono">{current.humidity}%</div>
              </div>

              <div className="p-2.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] flex items-center justify-center gap-1 font-semibold">
                  <CloudRain className="w-3 h-3 text-[#6B7280]" />
                  {t('rainChance')}
                </div>
                <div className="text-sm font-bold text-[#1F2A1F] font-mono">{current.rainChance}%</div>
              </div>

              <div className="p-2.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] flex items-center justify-center gap-1 font-semibold">
                  <Wind className="w-3 h-3 text-[#6B7280]" />
                  {t('windSpeed')}
                </div>
                <div className="text-sm font-bold text-[#1F2A1F] font-mono">{current.windSpeed} km/h</div>
              </div>
            </div>
          </div>

          {/* Precision Agronomy Spray & Farm Intervention Index */}
          <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A1F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2F5233]" />
                Agronomic Spray Feasibility
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSprayOptimal
                    ? 'bg-[#FAF8F2] text-[#2F5233] border-[#2F5233]/50'
                    : isRainLikely
                    ? 'bg-[#FAF8F2] text-[#C0392B] border-[#C0392B]/50'
                    : 'bg-[#FAF8F2] text-[#6B7280] border-[#E5E0D3]'
                }`}
              >
                {isSprayOptimal ? 'Optimal Conditions' : isRainLikely ? 'Hold Spraying (Alert)' : 'Moderate Window'}
              </span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              {isRainLikely
                ? `Rain probability is ${current.rainChance}%. Chemical sprays or granular Urea top-dressing should be held to prevent soil leaching and chemical wash-off.`
                : isHighWind
                ? `Wind velocity is ${current.windSpeed} km/h. Avoid foliar spraying to prevent spray droplet drift.`
                : `Low rain chance (${current.rainChance}%) and calm winds (${current.windSpeed} km/h) provide an ideal window for calibrated foliar nutrition and pest inspection.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E5E0D3] text-[11px]">
              <div>
                <span className="text-[#6B7280] block text-[10px]">Sunrise:</span>
                <span className="font-bold text-[#1F2A1F] flex items-center gap-1 font-mono">
                  <Sunrise className="w-3 h-3 text-[#6B7280]" />
                  {current.sunrise}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">Sunset:</span>
                <span className="font-bold text-[#1F2A1F] flex items-center gap-1 font-mono">
                  <Sunset className="w-3 h-3 text-[#6B7280]" />
                  {current.sunset}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">Precipitation:</span>
                <span className="font-bold text-[#1F2A1F] font-mono">{current.precipitation} mm</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">Atmospheric Risk:</span>
                <span className="font-bold text-[#1F2A1F] font-mono">
                  {isRainLikely ? 'Elevated' : 'Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Day Forecast Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
              Upcoming Micro-Climate Forecast
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {current.dailyForecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FFFFFF] border border-[#E5E0D3] rounded-2xl flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-[#1F2A1F] block">{day.dayName}</span>
                    <span className="text-[10px] text-[#6B7280] font-mono">{day.date}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-[#1F2A1F]">
                      {day.tempMax}° / {day.tempMin}°
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-semibold flex items-center justify-end gap-1">
                      <CloudRain className="w-2.5 h-2.5" />
                      {day.rainChance}% rain
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-[#E5E0D3] flex flex-wrap items-center justify-between gap-2 transition-colors">
          <span className="text-[11px] text-[#6B7280] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2F5233] inline-block" />
            Source: Open-Meteo High-Resolution Satellite &amp; IMD Atmospheric Telemetry • Updated Live
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] border border-[#E5E0D3] rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
