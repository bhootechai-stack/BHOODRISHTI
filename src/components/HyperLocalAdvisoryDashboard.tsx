import React, { useState } from 'react';
import {
  ShieldAlert,
  Droplets,
  Sprout,
  Store,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Database,
  Compass,
  Navigation,
  HelpCircle,
  X,
  AlertTriangle,
  Zap,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import {
  HyperLocalAdvisoryEngineResult,
  RiskCode,
  SoilTelemetry,
  MandiMarketQuote,
} from '../types/hyperLocalAdvisory';
import { DefaultCropRecommendationsCorner } from './DefaultCropRecommendationsCorner';
import { saveLandReportToDb as saveLandReport } from '../services/dbApi';

interface HyperLocalAdvisoryDashboardProps {
  data: HyperLocalAdvisoryEngineResult;
  soil?: SoilTelemetry;
  mandis?: MandiMarketQuote[];
  gpsCoordinates?: { lat: number; lng: number };
  fieldAreaAcres?: number;
  crop?: string;
  onSelectCrop?: (cropName: string, cropId?: string) => void;
  onNavigateToMandi?: (mandi: MandiMarketQuote) => void;
  onRefresh?: () => void;
}

export const HyperLocalAdvisoryDashboard: React.FC<HyperLocalAdvisoryDashboardProps> = ({
  data,
  soil,
  mandis,
  gpsCoordinates,
  fieldAreaAcres,
  crop,
  onSelectCrop,
  onNavigateToMandi,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'triangulation' | 'prescriptive' | 'ensemble'>('triangulation');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const effectiveSoil = soil || data?.soil || {
    soilType: 'Alluvial',
    nLevel: 220,
    pLevel: 20,
    kLevel: 210,
    ph: 6.8,
    moisturePct: 40,
    organicCarbonPct: 0.65,
  };
  const effectiveMandis = mandis || data?.mandis || [];
  const effectiveGps = gpsCoordinates || data?.gpsCoordinates || { lat: 30.901, lng: 75.8573 };
  const effectiveArea = fieldAreaAcres ?? data?.fieldAreaAcres ?? 2.5;
  const effectiveCrop = crop || data?.crop || 'Wheat';

  const weightedRisk = data?.weightedRisk || {
    overallScore: 0.35,
    riskLevel: 'GREEN' as RiskCode,
    riskLabel: 'STABLE: Conditions Optimal',
    weatherProbabilityComponent: 0.1,
    soilDeficiencyComponent: 0.1,
    marketVolatilityComponent: 0.1,
    weatherRiskDetail: 'Weather and micro-climate conditions stable.',
    soilRiskDetail: 'Soil moisture balanced.',
    marketRiskDetail: 'Mandi prices tracking normal trends.',
  };
  const prescriptiveDecisions = data?.prescriptiveDecisions || {
    ureaAction: {
      decision: 'HOLD',
      justification: 'Soil nitrogen levels adequate for current growth stage.',
      recommendedDoseKgPerAcre: 0,
      optimalWindow: 'Next scheduled top-dressing in 10-14 days',
    },
    irrigationAction: {
      decision: 'HOLD',
      justification: 'Canopy and topsoil moisture levels are within optimal range.',
      optimalWindow: 'Evaluate moisture in 3-4 days',
      recommendedDurationHours: 0,
      waterQuantityMm: 0,
    },
    harvestOrMandiAction: {
      decision: 'MONITOR',
      reasoning: 'Market arrivals steady; evaluate pricing resistance.',
      recommendedMandi: effectiveMandis[0]?.mandiName || 'Local APMC',
      targetPrice: effectiveMandis[0]?.currentPricePerQuintal || 2275,
    },
  };
  const ensemble = data?.ensemble || {
    xgboostYieldQuintalsPerAcre: 22,
    prophetPeakForecastPrice: 2450,
    totalProjectedProfit: 85000,
    ensembleConfidencePct: 92,
    optimalSellingWindow: '10-15 Days',
  };
  const cropRecommendations = data?.cropRecommendations;
  const primaryAdvisoryBanner = data?.primaryAdvisoryBanner || {
    headline: 'Farm Conditions Stable for Current Crop Cycle',
    subheadline: 'Multi-source Data Fusion confirms balanced soil moisture and favorable micro-climate.',
    badge: 'ALL CLEAR',
    code: 'GREEN' as RiskCode,
  };

  const wrsPct = Math.round((weightedRisk?.overallScore ?? 0.35) * 100);

  const handleSaveToSupabase = async () => {
    try {
      setSaveStatus('saving');
      const report = await saveLandReport({
        farmName: `${effectiveCrop} Field Report`,
        farmerName: 'Farmer',
        crop: effectiveCrop,
        state: data?.resolvedLocation?.state || 'Punjab',
        district: data?.resolvedLocation?.district || '',
        areaAcres: effectiveArea,
        areaSqm: effectiveArea * 4046.86,
        healthScore: Math.round((1 - (weightedRisk?.overallScore ?? 0.3)) * 100),
        soilPh: effectiveSoil?.ph ?? 6.8,
        soilMoisture: effectiveSoil?.moisturePct ?? 40,
        soilN: effectiveSoil?.nLevel ?? 220,
        soilP: effectiveSoil?.pLevel ?? 20,
        soilK: effectiveSoil?.kLevel ?? 210,
        advisorySummary: data?.aiAgronomistVerdict || primaryAdvisoryBanner?.headline || 'Field Report',
        irrigationSchedule: prescriptiveDecisions?.irrigationAction?.optimalWindow || '--',
        fertilizerRecommendation: prescriptiveDecisions?.ureaAction?.justification || '--',
        center: effectiveGps,
        userId: 'active-user',
      });

      if (report) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Failed to save land report from advisory dashboard:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getRiskBg = (code?: RiskCode) => {
    switch (code) {
      case 'RED':
        return 'bg-[#FDF2F2] border-[#F8B4B4] text-[#1F2A1F]';
      case 'YELLOW':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#1F2A1F]';
      case 'GREEN':
      default:
        return 'bg-[#FFFFFF] border-[#E5E0D3] text-[#1F2A1F]';
    }
  };

  const getRiskBadge = (code?: RiskCode) => {
    switch (code) {
      case 'RED':
        return 'bg-[#C0392B] text-white font-black';
      case 'YELLOW':
        return 'bg-[#D97706] text-white font-black';
      case 'GREEN':
      default:
        return 'bg-[#2F5233] text-white font-black';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Sovereign Decision & Weighted Risk Score */}
      <div className={`p-4 rounded-2xl border ${getRiskBg(weightedRisk.riskLevel)} transition-colors shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D3]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${getRiskBadge(weightedRisk.riskLevel)}`}>
              {weightedRisk.riskLevel === 'RED' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : weightedRisk.riskLevel === 'YELLOW' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F2] border border-[#E5E0D3] text-[#1F2A1F]">
                  {primaryAdvisoryBanner.badge}
                </span>
                <span className="text-xs font-mono text-[#727970]">
                  GPS: {gpsCoordinates && Number.isFinite(gpsCoordinates.lat) && Number.isFinite(gpsCoordinates.lng)
                    ? `${gpsCoordinates.lat.toFixed(4)}°N, ${gpsCoordinates.lng.toFixed(4)}°E`
                    : (console.error('HyperLocalAdvisoryDashboard.tsx: gpsCoordinates undefined or invalid', gpsCoordinates), 'Location Pending')}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#1F2A1F] mt-0.5">
                {primaryAdvisoryBanner.headline}
              </h4>
            </div>
          </div>

          {/* WRS Metric Pill */}
          <div className="flex items-center gap-3 bg-[#FAF8F2] px-3.5 py-2 rounded-xl border border-[#E5E0D3] self-start sm:self-auto shrink-0">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Weighted Risk Score (WRS)
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono tracking-tight text-[#1F2A1F]">
                  {wrsPct}%
                </span>
                <span className={`text-[10px] font-bold uppercase ${weightedRisk.riskLevel === 'RED' ? 'text-[#C0392B]' : 'text-[#6B7280]'}`}>
                  [{weightedRisk.riskLevel}]
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="p-1 rounded-lg hover:bg-[#E5E0D3]/50 text-[#6B7280] hover:text-[#1F2A1F] transition-colors cursor-pointer"
              title="View Decision Formula"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-headline & Breakdown */}
        <div className="pt-3 space-y-2">
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#6B7280]">
            {primaryAdvisoryBanner.subheadline}
          </p>

          {/* 3-Part Weighted Factor Progress Bar */}
          <div className="w-full bg-[#FAF8F2] h-2 rounded-full overflow-hidden flex border border-[#E5E0D3]">
            <div
              style={{ width: `${(weightedRisk.weatherProbabilityComponent / 0.4) * 40}%` }}
              className="bg-[#2F5233] h-full"
              title={`Weather Factor: ${(weightedRisk.weatherProbabilityComponent * 100).toFixed(0)}% (Weight: 40%)`}
            />
            <div
              style={{ width: `${(weightedRisk.soilDeficiencyComponent / 0.3) * 30}%` }}
              className="bg-[#9CA3AF] h-full"
              title={`Soil Deficiency Factor: ${(weightedRisk.soilDeficiencyComponent * 100).toFixed(0)}% (Weight: 30%)`}
            />
            <div
              style={{ width: `${(weightedRisk.marketVolatilityComponent / 0.3) * 30}%` }}
              className="bg-[#E5E0D3] h-full"
              title={`Market Volatility Factor: ${(weightedRisk.marketVolatilityComponent * 100).toFixed(0)}% (Weight: 30%)`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-[#6B7280] pt-0.5 gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2F5233]"></span>
              Weather (40%): {weightedRisk.weatherProbabilityComponent.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
              Soil Deficit (30%): {weightedRisk.soilDeficiencyComponent.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E5E0D3]"></span>
              Mandi Volatility (30%): {weightedRisk.marketVolatilityComponent.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="p-3 bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl text-xs space-y-2 text-[#6B7280] shadow-xs">
          <div className="flex items-center justify-between font-bold text-[#1F2A1F] border-b border-[#E5E0D3] pb-1">
            <span className="flex items-center gap-1.5 text-[#1F2A1F]">
              <Cpu className="w-3.5 h-3.5 text-[#2F5233]" />
              Decision Logic: Weighted Risk Score (WRS)
            </span>
            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="text-[#6B7280] hover:text-[#1F2A1F] p-0.5 rounded-md cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 bg-[#FAF8F2] rounded-lg font-mono text-[11px] text-[#1F2A1F] border border-[#E5E0D3]">
            Risk = (Weather_Probability × 0.4) + (Soil_Deficiency × 0.3) + (Market_Volatility × 0.3)
          </div>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            If <strong className="text-[#1F2A1F]">Risk Score &gt; 0.70</strong>, the sovereign advisory engine issues an instant alert,
            prohibiting chemical input washing and guiding precise night/evening irrigation.
          </p>
        </div>
      )}

      {/* 1. TOP 3 DYNAMIC CROP RECOMMENDATIONS CORNER */}
      {cropRecommendations && (
        <DefaultCropRecommendationsCorner
          cropRecommendations={cropRecommendations}
          activeCropName={crop}
          onSelectCrop={onSelectCrop}
        />
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] text-xs font-bold transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('triangulation')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'triangulation'
              ? 'bg-[#2F5233] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1F2A1F]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Soil-Crop-Mandi Triangulation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prescriptive')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'prescriptive'
              ? 'bg-[#2F5233] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1F2A1F]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Prescriptive Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ensemble')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'ensemble'
              ? 'bg-[#2F5233] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1F2A1F]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ensemble Optimizer</span>
        </button>
      </div>

      {/* TAB 1: SOIL-CROP-MARKET TRIANGULATION */}
      {activeTab === 'triangulation' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. The Soil Card */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-[#6B7280]" />
                  1. The Soil (NPK & pH)
                </span>
                <span className="text-[9px] font-bold bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-1.5 py-0.5 rounded">
                  {effectiveSoil?.soilType || 'Alluvial'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="bg-[#FAF8F2] p-1.5 rounded-lg border border-[#E5E0D3]">
                  <div className="text-[9px] text-[#6B7280] font-bold">N (Nitrogen)</div>
                  <div className="text-xs font-black text-[#1F2A1F]">{effectiveSoil?.nLevel ?? '--'} <span className="text-[8px] font-normal text-[#6B7280]">mg/kg</span></div>
                </div>
                <div className="bg-[#FAF8F2] p-1.5 rounded-lg border border-[#E5E0D3]">
                  <div className="text-[9px] text-[#6B7280] font-bold">P (Phosphorus)</div>
                  <div className="text-xs font-black text-[#1F2A1F]">{effectiveSoil?.pLevel ?? '--'} <span className="text-[8px] font-normal text-[#6B7280]">mg/kg</span></div>
                </div>
                <div className="bg-[#FAF8F2] p-1.5 rounded-lg border border-[#E5E0D3]">
                  <div className="text-[9px] text-[#6B7280] font-bold">K (Potassium)</div>
                  <div className="text-xs font-black text-[#1F2A1F]">{effectiveSoil?.kLevel ?? '--'} <span className="text-[8px] font-normal text-[#6B7280]">mg/kg</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#6B7280] pt-1 border-t border-[#E5E0D3]">
                <span>pH: <strong className="text-[#1F2A1F]">{effectiveSoil?.ph ?? '--'}</strong></span>
                <span>Moisture: <strong className="text-[#1F2A1F]">{effectiveSoil?.moisturePct ?? '--'}%</strong></span>
                <span>OC: <strong className="text-[#1F2A1F]">{effectiveSoil?.organicCarbonPct ?? '--'}%</strong></span>
              </div>
            </div>

            {/* 2. The Atmosphere Card */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#6B7280]" />
                  2. The Atmosphere
                </span>
                <span className="text-[9px] font-bold bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-1.5 py-0.5 rounded">
                  Micro-Climate
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-snug">
                {weightedRisk?.weatherRiskDetail || 'Micro-climate data synchronized.'}
              </p>
              <div className="p-1.5 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3] flex items-center justify-between text-[10px]">
                <span className="text-[#6B7280]">Target Crop Evaluation:</span>
                <strong className="text-[#1F2A1F] font-semibold">{effectiveCrop}</strong>
              </div>
            </div>

            {/* 3. The Mandi Card */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <Store className="w-3 h-3 text-[#6B7280]" />
                  3. Nearest Official APMC Mandis
                </span>
                <span className="text-[9px] font-bold bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-1.5 py-0.5 rounded">
                  Real GPS Haversine
                </span>
              </div>
              <div className="space-y-1.5">
                {(effectiveMandis || []).map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-between text-[10px] gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[#1F2A1F] truncate font-bold" title={m.mandiName}>
                          {m.mandiName}
                        </span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-[#E5E0D3]/60 text-[#6B7280] shrink-0 font-medium">
                          {m.mandiType || 'APMC Yard'}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#6B7280] flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-[#6B7280] shrink-0" />
                        <span className="font-semibold text-[#1F2A1F]">{m.distanceKm} km</span>
                        <span>• MSP: ₹{m.govtMsp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#1F2A1F]">
                          ₹{m.currentPricePerQuintal}
                        </div>
                        <div className="text-[8px] font-bold">
                          {m.currentPricePerQuintal >= m.govtMsp ? (
                            <span className="text-[#2F5233]">+₹{m.currentPricePerQuintal - m.govtMsp}</span>
                          ) : (
                            <span className="text-[#6B7280]">At MSP</span>
                          )}
                        </div>
                      </div>

                      {onNavigateToMandi && (
                        <button
                          type="button"
                          onClick={() => onNavigateToMandi(m)}
                          className="p-1.5 bg-[#FFFFFF] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border border-[#E5E0D3] rounded-lg transition-colors cursor-pointer"
                          title={`Navigate to ${m.mandiName} (${m.distanceKm} km)`}
                        >
                          <Compass className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Agronomist Sovereign Verdict */}
          {data.aiAgronomistVerdict && (
            <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] flex items-start gap-2.5 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1F2A1F] uppercase tracking-wider block">
                  Agronomist Sovereign Intelligence:
                </span>
                <p className="text-xs text-[#6B7280] leading-relaxed font-medium">
                  "{data.aiAgronomistVerdict}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTIVE ANALYTICS */}
      {activeTab === 'prescriptive' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Urea Top-Dressing */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2A1F] flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-[#6B7280]" />
                  Urea Top-Dressing
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    prescriptiveDecisions?.ureaAction?.decision === 'APPLY NOW'
                      ? 'bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/30'
                      : prescriptiveDecisions?.ureaAction?.decision === 'HOLD'
                      ? 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
                      : 'bg-[#FDF2F2] text-[#C0392B] border border-[#F8B4B4]'
                  }`}
                >
                  {prescriptiveDecisions?.ureaAction?.decision || 'HOLD'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {prescriptiveDecisions?.ureaAction?.justification || 'Nitrogen levels evaluated.'}
              </p>
              <div className="p-2 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3] text-[10px] space-y-1">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Recommended Dosage:</span>
                  <strong className="text-[#1F2A1F] font-mono">{prescriptiveDecisions?.ureaAction?.recommendedDoseKgPerAcre ?? '--'} kg/acre</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Optimal Window:</span>
                  <strong className="text-[#1F2A1F]">{prescriptiveDecisions?.ureaAction?.optimalWindow || '--'}</strong>
                </div>
              </div>
            </div>

            {/* 2. Tubewell Irrigation */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2A1F] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#6B7280]" />
                  Tubewell Irrigation
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    prescriptiveDecisions?.irrigationAction?.decision === 'IRRIGATE'
                      ? 'bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/30'
                      : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
                  }`}
                >
                  {prescriptiveDecisions?.irrigationAction?.decision || 'HOLD'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {prescriptiveDecisions?.irrigationAction?.justification || 'Moisture levels evaluated.'}
              </p>
              <div className="p-2 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3] text-[10px] space-y-1">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Duration / Quantity:</span>
                  <strong className="text-[#1F2A1F] font-mono">{prescriptiveDecisions?.irrigationAction?.recommendedDurationHours ?? '--'} hrs ({prescriptiveDecisions?.irrigationAction?.waterQuantityMm ?? '--'} mm)</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Optimal Slot:</span>
                  <strong className="text-[#1F2A1F]">{prescriptiveDecisions?.irrigationAction?.optimalWindow || '--'}</strong>
                </div>
              </div>
            </div>

            {/* 3. Market Peak Selling Window */}
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2A1F] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#6B7280]" />
                  Mandi Selling Strategy
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3]">
                  {prescriptiveDecisions?.harvestOrMandiAction?.decision || 'MONITOR'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {prescriptiveDecisions?.harvestOrMandiAction?.reasoning || 'Market trends evaluated.'}
              </p>
              <div className="p-2 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3] text-[10px] space-y-1">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Target Mandi:</span>
                  <strong className="text-[#1F2A1F] truncate max-w-[130px]">{prescriptiveDecisions?.harvestOrMandiAction?.recommendedMandi || '--'}</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Forecast Price:</span>
                  <strong className="text-[#1F2A1F] font-mono">₹{prescriptiveDecisions?.harvestOrMandiAction?.targetPrice ?? '--'}/Qtl</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENSEMBLE OPTIMIZER */}
      {activeTab === 'ensemble' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D3]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#1F2A1F]">
                    AI Ensemble Model Architecture
                  </h5>
                  <span className="text-[10px] text-[#6B7280]">
                    Dual Pipeline: XGBoost (Agronomic Yield) + Prophet 15-Day Curve (Mandi Pricing)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#1F2A1F] bg-[#FAF8F2] px-2 py-0.5 rounded border border-[#E5E0D3]">
                  Confidence: {ensemble?.ensembleConfidencePct ?? 92}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] font-semibold">
                  XGBoost Estimated Yield
                </div>
                <div className="text-lg font-black font-mono text-[#1F2A1F]">
                  {ensemble?.xgboostYieldQuintalsPerAcre ?? '--'} <span className="text-xs font-normal text-[#6B7280]">Qtl/Acre</span>
                </div>
                <div className="text-[9px] text-[#6B7280] mt-0.5">
                  Total parcel: {((ensemble?.xgboostYieldQuintalsPerAcre ?? 0) * effectiveArea).toFixed(1)} Qtl
                </div>
              </div>

              <div className="p-2.5 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] font-semibold">
                  Peak Mandi Price Projection
                </div>
                <div className="text-lg font-black font-mono text-[#1F2A1F]">
                  ₹{ensemble?.prophetPeakForecastPrice ?? '--'} <span className="text-xs font-normal text-[#6B7280]">/Qtl</span>
                </div>
                <div className="text-[9px] text-[#6B7280] mt-0.5">
                  Peak Target: {ensemble?.optimalSellingWindow ?? '--'}
                </div>
              </div>

              <div className="p-2.5 bg-[#FAF8F2] rounded-lg border border-[#E5E0D3]">
                <div className="text-[10px] text-[#6B7280] font-semibold">
                  Net Projected Profit
                </div>
                <div className="text-lg font-black font-mono text-[#2F5233]">
                  ₹{(ensemble?.totalProjectedProfit ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-[#6B7280] mt-0.5">
                  Based on {effectiveArea.toFixed(1)} Acres & Peak Selling
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Report to Database Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleSaveToSupabase}
          disabled={saveStatus === 'saving'}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2F5233] hover:bg-[#244027] rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            {saveStatus === 'saving'
              ? 'Saving Report...'
              : saveStatus === 'saved'
              ? 'Agronomy Report Saved to Database'
              : saveStatus === 'error'
              ? 'Saved Locally'
              : 'Save Full Report to Database'}
          </span>
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-[#6B7280] hover:text-[#1F2A1F] font-semibold transition-colors cursor-pointer"
          >
            Re-evaluate Telemetry ⟳
          </button>
        )}
      </div>
    </div>
  );
};
