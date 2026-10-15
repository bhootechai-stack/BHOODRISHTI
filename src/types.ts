export type IndianState =
  // 28 States
  | 'Andhra Pradesh'
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Bihar'
  | 'Chhattisgarh'
  | 'Goa'
  | 'Gujarat'
  | 'Haryana'
  | 'Himachal Pradesh'
  | 'Jharkhand'
  | 'Karnataka'
  | 'Kerala'
  | 'Madhya Pradesh'
  | 'Maharashtra'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Odisha'
  | 'Punjab'
  | 'Rajasthan'
  | 'Sikkim'
  | 'Tamil Nadu'
  | 'Telangana'
  | 'Tripura'
  | 'Uttar Pradesh'
  | 'Uttarakhand'
  | 'West Bengal'
  // 8 Union Territories
  | 'Andaman and Nicobar Islands'
  | 'Chandigarh'
  | 'Dadra and Nagar Haveli and Daman and Diu'
  | 'Delhi (NCT)'
  | 'Jammu and Kashmir'
  | 'Ladakh'
  | 'Lakshadweep'
  | 'Puducherry'
  // Backward compatibility aliases
  | 'Andhra Pradesh & Telangana'
  | 'Jammu & Kashmir / Ladakh';

export interface LandUnit {
  id: string;
  name: string;
  localName?: string;
  // 1 unit = conversionFactorInSqMeters sq. meters
  sqMeters: number;
  description: string;
  subUnits?: { name: string; ratio: number }[];
}

export interface StateUnitGroup {
  state: IndianState;
  commonName: string;
  primaryUnit: string;
  units: LandUnit[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  address?: string;
  updatedAt: string;
}

export interface BoundaryPoint extends LatLng {
  id: string | number;
}

export type HeatmapMode = 'ndre' | 'ndwi';

export type FieldViewMode =
  | 'default' // DEFAULT (ALL): Collective NDRE/NDWI heatmap + grey structure polygons
  | 'healthy_only' // Healthy ONLY (Green): Only green pixels, red/yellow 0% opacity, hide/dim structures
  | 'moderate_only' // Moderate Stress ONLY (Yellow): Only yellow pixels, red/green 0% opacity, hide structures
  | 'severe_only' // Severe Stress ONLY (Red): Only red pixels, yellow/green 0% opacity, hide structures
  | 'structures_only' // Structures ONLY (Cleared Field): 0% heatmap opacity, reveal base map, highlight grey structure polygons
  | 'empty_field'; // Empty Field: Hide ALL overlays (heatmap and structures), show pure base map inside boundary

export interface HeatmapStats {
  healthyPct: number;
  moderateStressPct: number;
  severeNonVegPct: number;
  meanIndex: number;
  uniformityScore: number;
  mode: HeatmapMode;
  totalAreaSqm: number;
  totalAreaAcres: number;
  totalAreaHectares: number;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rainChance: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  sunrise: string;
  sunset: string;
  dailyForecast: {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    rainChance: number;
    code: number;
  }[];
}

export interface LeafDisease {
  id: string;
  crop: string;
  diseaseName: string;
  scientificName: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'High' | 'Severe';
  symptoms: string[];
  chemicalRemedy: {
    compound: string;
    dosage: string;
    schedule: string;
    precautions: string;
  };
  organicRemedy: {
    title: string;
    ingredients: string[];
    preparation: string;
    application: string;
  };
}

export interface AIAdvisoryOutput {
  crop: string;
  summary: string;
  sowingHarvestAdvice: string;
  irrigationSchedule: string;
  nitrogenFertilizerAction: string;
  pestFungalRisk: string;
  actionChecklist: string[];
}
