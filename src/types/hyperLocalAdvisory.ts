export interface SoilTelemetry {
  nLevel: number; // mg/kg (e.g. 140-300)
  pLevel: number; // mg/kg (e.g. 15-45)
  kLevel: number; // mg/kg (e.g. 120-280)
  ph: number; // 5.5 - 8.5
  moisturePct: number; // 0 - 100%
  organicCarbonPct: number; // 0.2 - 1.5%
  ec: number; // dS/m electrical conductivity
  soilType: 'Alluvial' | 'Black Cotton' | 'Red Sandy Loam' | 'Clayey Loam' | 'Laterite' | 'Coastal Sandy';
}

export interface MandiMarketQuote {
  mandiName: string;
  distanceKm: number;
  coordinates?: { lat: number; lng: number };
  currentPricePerQuintal: number;
  prevDayPricePerQuintal: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  arrivalTons: number;
  highestPrice: number;
  lowestPrice: number;
  isEnamIntegrated?: boolean;
  mandiType?: 'Principal APMC Yard' | 'Sub-Yard Market' | 'Specialized Commodity Yard';
  district?: string;
  state?: string;
  govtMsp?: number;
  agency?: string;
}

export interface EnsemblePrediction {
  xgboostYieldQuintalsPerAcre: number;
  prophet15DayPriceTrend: {
    day: string;
    forecastedPrice: number;
    upperBound: number;
    lowerBound: number;
  }[];
  ensembleConfidence: number; // e.g. 94.8%
  ensembleConfidencePct?: number;
  projectedProfitPerAcre: number; // ₹
  totalProjectedProfit: number; // ₹ for total acreage
  prophetPeakForecastPrice?: number;
  optimalSellingWindow?: string;
}

export type RiskCode = 'GREEN' | 'YELLOW' | 'RED';

export interface WeightedRiskScore {
  overallScore: number; // 0.0 to 1.0 (WRS)
  riskLevel: RiskCode;
  riskLabel: string;
  isInstantAlert: boolean; // True if WRS > 0.7
  weatherProbabilityComponent: number; // 40% weight
  soilDeficiencyComponent: number; // 30% weight
  marketVolatilityComponent: number; // 30% weight
  weatherRiskDetail: string;
  soilRiskDetail: string;
  marketRiskDetail: string;
}

export interface PrescriptiveDecision {
  ureaAction: {
    decision: 'APPLY NOW' | 'POSTPONE' | 'SPLIT DOSE' | 'HOLD';
    justification: string;
    optimalWindow: string;
    safeThresholdHours: number;
    recommendedDoseKgPerAcre?: number;
  };
  irrigationAction: {
    decision: 'IRRIGATE' | 'HOLD / PAUSE' | 'DRAIN EXCESS';
    optimalWindow: string;
    recommendedDepthMm: number;
    justification?: string;
    recommendedDurationHours?: number;
    waterQuantityMm?: number;
  };
  harvestOrMandiAction: {
    decision: 'HOLD FOR PRICE PEAK' | 'SELL TO TOP MANDI' | 'SPLIT BATCH SALE';
    recommendedMandi: string;
    expectedGainPerQuintal: number;
    reasoning?: string;
    targetPrice?: number;
  };
}

export interface CropRecommendationItem {
  cropId: string;
  cropName: string;
  hindiName: string;
  punjabiName?: string;
  rank: number; // 1, 2, or 3
  rankLabel: string;
  season: string;
  yieldPotentialText: string; // e.g. "+24% Yield Potential"
  suitabilityScore: number; // e.g. 96% (Success probability)
  estimatedYieldPerAcreQuintals: number; // e.g. 24.5 Qtl/Acre
  totalEstimatedYieldQuintals: number; // scaled to usable land area
  liveMandiRatePerQuintal: number; // ₹/Qtl
  govtMspPerQuintal: number; // ₹/Qtl
  rateTrend: 'UP' | 'DOWN' | 'STABLE';
  rateChange24h: number; // +₹65
  reason: string;
  agronomicFit: string;
  isNitrogenFixing?: boolean;
  category?: 'High-Value Fruit' | 'Cash / Commercial' | 'Staple Cereal' | 'Oilseed' | 'Pulse / Legume' | 'Horticulture Vegetable' | 'Plantation / Spice';
  soilMatchDetails?: {
    npkMatch: number;
    phMatch: number;
    moistureMatch: number;
    canopyMatch: number;
    climateMatch: number;
  };
}

export interface DefaultCropRecommendationsPair {
  primaryCrop: CropRecommendationItem; // #1 Best Recommended Crop
  secondaryCrop: CropRecommendationItem; // 2nd Best Alternative Crop (for rotation)
  thirdCrop?: CropRecommendationItem; // #3 Third Best High-Value / Diversification Option
  topCrops: CropRecommendationItem[]; // Top 3 dynamically calculated crops
  derivationBasis: string;
  fieldAreaAcres?: number;
}

export interface MandiForecastPoint {
  date: string;
  dayOffset: number; // e.g. -5 to +22 days around harvest
  dayLabel: string;
  forecastedPrice: number;
  upperBound: number;
  lowerBound: number;
  msp: number;
  isHarvestDay?: boolean;
  isPeak?: boolean;
  notes?: string;
}

export interface CustomFarmScheduleMandiIntelligence {
  cropName: string;
  cropId: string;
  plantingDate: string;
  harvestingDate: string;
  growthDurationDays: number;
  pinnedGps: {
    lat: number;
    lng: number;
    state: string;
    district?: string;
    tehsil?: string;
    village?: string;
  };
  top3NearestMandis: MandiMarketQuote[];
  govtMspPerQuintal: number;
  prevailingMandiRate: number;
  mspSpread: number; // live - msp
  procuringAgency: string;
  priceForecastHorizon: MandiForecastPoint[];
  peakPricePoint: MandiForecastPoint;
  optimalSellingWindow: {
    startDate: string;
    endDate: string;
    peakPrice: number;
    peakDayOffset: number;
    estimatedSurplusPerQuintal: number;
    recommendation: string;
  };
}

export interface HyperLocalAdvisoryEngineResult {
  gpsCoordinates: { lat: number; lng: number };
  resolvedLocation: {
    state: string;
    district?: string;
    tehsil?: string;
    patwarCircle?: string;
    village?: string;
  };
  crop: string;
  fieldAreaAcres: number;
  timestamp: string;
  soil: SoilTelemetry;
  mandis: MandiMarketQuote[];
  ensemble: EnsemblePrediction;
  weightedRisk: WeightedRiskScore;
  prescriptiveDecisions: PrescriptiveDecision;
  cropRecommendations: DefaultCropRecommendationsPair;
  mandiIntelligence?: CustomFarmScheduleMandiIntelligence;
  primaryAdvisoryBanner: {
    headline: string;
    subheadline: string;
    badge: string;
    code: RiskCode;
  };
  aiAgronomistVerdict: string;
}
