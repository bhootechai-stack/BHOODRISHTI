import React from 'react';
import {
  Sparkles,
  Award,
  Repeat,
  ArrowUpRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  DefaultCropRecommendationsPair,
} from '../types/hyperLocalAdvisory';

interface DefaultCropRecommendationsCornerProps {
  cropRecommendations: DefaultCropRecommendationsPair;
  activeCropName?: string;
  onSelectCrop?: (cropName: string, cropId: string) => void;
}

export const DefaultCropRecommendationsCorner: React.FC<DefaultCropRecommendationsCornerProps> = ({
  cropRecommendations,
  activeCropName,
  onSelectCrop,
}) => {
  const { topCrops, derivationBasis, fieldAreaAcres = 2.5 } = cropRecommendations || {};
  const cropsList = (
    topCrops && topCrops.length > 0
      ? topCrops
      : [cropRecommendations?.primaryCrop, cropRecommendations?.secondaryCrop]
  ).filter(Boolean);

  return (
    <div className="p-3.5 sm:p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] space-y-3.5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#2F5233] flex items-center justify-center shrink-0 border border-[#2F5233]/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1F2A1F] flex items-center gap-1.5">
              <span>Top 3 Dynamic Crop Recommendations</span>
              <span className="text-[9px] font-bold bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3] px-1.5 py-0.2 rounded">
                Live Field Fit
              </span>
            </h4>
            <p className="text-[11px] text-[#6B7280]">
              Evaluated against NPK, pH, root-zone moisture, NDRE chlorophyll & regional climate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono text-[#6B7280] bg-[#FAF8F2] px-2 py-0.5 rounded border border-[#E5E0D3]">
            Land: {fieldAreaAcres.toFixed(1)} Acres
          </span>
        </div>
      </div>

      {/* Top 3 Crop Cards Responsive Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cropsList.map((cropItem, idx) => {
          const isSelected =
            activeCropName?.toLowerCase().includes(cropItem.cropId.toLowerCase()) ||
            cropItem.cropName.toLowerCase().includes(activeCropName?.toLowerCase() || '');

          const rankBadgeBg =
            idx === 0
              ? 'bg-[#2F5233] text-white font-bold'
              : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]';

          const cardBorderClass = isSelected
            ? 'bg-[#FAF8F2] border-[#2F5233] shadow-xs'
            : 'bg-[#FFFFFF] hover:bg-[#FAF8F2] border-[#E5E0D3]';

          return (
            <div
              key={cropItem.cropId || idx}
              onClick={() => onSelectCrop && onSelectCrop(cropItem.cropName, cropItem.cropId)}
              className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between group ${cardBorderClass}`}
            >
              <div className="space-y-2.5">
                {/* Top Rank Badge & Success Probability */}
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${rankBadgeBg}`}>
                    {idx === 0 ? <Sparkles className="w-2.5 h-2.5" /> : idx === 1 ? <Repeat className="w-2.5 h-2.5" /> : <Award className="w-2.5 h-2.5" />}
                    Rank #{idx + 1}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black font-mono text-[#1F2A1F] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#E5E0D3]">
                      {cropItem.suitabilityScore}% Success
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5233]" />
                    )}
                  </div>
                </div>

                {/* Crop Title */}
                <div>
                  <h5 className="text-sm font-black text-[#1F2A1F] group-hover:text-[#2F5233] transition-colors">
                    {cropItem.cropName}
                  </h5>
                  <div className="text-[11px] text-[#6B7280] font-medium">
                    {cropItem.hindiName} {cropItem.category ? `• ${cropItem.category}` : ''}
                  </div>
                </div>

                {/* Scaled Yield & Mandi Rate Box */}
                <div className="bg-[#FAF8F2] p-2.5 rounded-xl border border-[#E5E0D3] space-y-2">
                  {/* Scaled Yield */}
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E0D3]">
                    <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider block mb-0.5">
                      Expected Parcel Yield:
                    </span>
                    <div className="text-sm sm:text-base font-black text-[#1F2A1F] font-mono leading-tight">
                      {cropItem.totalEstimatedYieldQuintals || ((cropItem.estimatedYieldPerAcreQuintals || 20) * fieldAreaAcres).toFixed(1)} Quintals
                    </div>
                    <div className="text-[11px] font-semibold text-[#6B7280]">
                      expected on your {fieldAreaAcres.toFixed(1)} acre field
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                      Rate: {cropItem.estimatedYieldPerAcreQuintals || 20} Qtl / Acre
                    </div>
                  </div>

                  {/* Live Mandi Trading Rate & MSP */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#E5E0D3]">
                    <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Live Mandi Rate:</span>
                    <div className="text-right">
                      <div className="font-black text-[#1F2A1F] font-mono">
                        ₹{cropItem.liveMandiRatePerQuintal.toLocaleString('en-IN')}/Qtl
                      </div>
                      <div className="text-[9px] text-[#6B7280] font-mono flex items-center justify-end gap-1">
                        <span>MSP: ₹{cropItem.govtMspPerQuintal}</span>
                        {cropItem.rateChange24h > 0 && (
                          <span className="text-[#2F5233] font-bold flex items-center">
                            <ArrowUpRight className="w-2.5 h-2.5 text-[#2F5233]" />+₹{cropItem.rateChange24h}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Match Breakdown */}
                {cropItem.soilMatchDetails && (
                  <div className="space-y-1 bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D3]">
                    <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Physiological Match Breakdown:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                      <span className="text-[#6B7280]">
                        NPK: <strong className="text-[#1F2A1F]">{cropItem.soilMatchDetails.npkMatch}%</strong>
                      </span>
                      <span className="text-[#6B7280]">
                        pH: <strong className="text-[#1F2A1F]">{cropItem.soilMatchDetails.phMatch}%</strong>
                      </span>
                      <span className="text-[#6B7280]">
                        Moisture: <strong className="text-[#1F2A1F]">{cropItem.soilMatchDetails.moistureMatch}%</strong>
                      </span>
                      <span className="text-[#6B7280]">
                        Climate: <strong className="text-[#1F2A1F]">{cropItem.soilMatchDetails.climateMatch}%</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Agronomic Reason */}
                <p className="text-[11px] text-[#6B7280] leading-relaxed bg-[#FAF8F2] p-2 rounded-lg border border-[#E5E0D3]">
                  {cropItem.reason}
                </p>
              </div>

              {/* Card Footer Button */}
              <div className="pt-2 mt-2 border-t border-[#E5E0D3] flex items-center justify-between text-[10px]">
                <span className="text-[#6B7280] truncate max-w-[120px]">
                  {cropItem.yieldPotentialText}
                </span>
                <span className={`font-bold shrink-0 ${isSelected ? 'text-[#2F5233]' : 'text-[#6B7280] group-hover:text-[#1F2A1F]'}`}>
                  {isSelected ? 'Currently Selected' : 'Select Crop →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Derivation Basis Note */}
      <div className="p-2.5 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] text-[10px] text-[#6B7280] flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-[#2F5233] shrink-0" />
        <span>
          <strong className="text-[#1F2A1F]">Physiological Engine Basis:</strong> {derivationBasis}
        </span>
      </div>
    </div>
  );
};
