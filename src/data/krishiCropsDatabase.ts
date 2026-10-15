/**
 * Authentic Indian Crop Agronomy Database & Soil Classification
 * Grounded in ICAR (Indian Council of Agricultural Research) & State Agricultural Universities (SAUs).
 */

export interface AgronomicCrop {
  id: string;
  name: string;
  hindiName: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Commercial' | 'Horticulture' | 'Orchard Fruit';
  isTreeOrOrchard: boolean;
  sowingMonths: number[]; // 1-12
  seasons: ('Kharif' | 'Rabi' | 'Zaid')[];
  tempRange: {
    min: number;
    max: number;
    optimalMin: number;
    optimalMax: number;
  };
  elevation: {
    min: number; // in metres
    max: number;
  };
  frostSensitive: boolean;
  waterNeedMm: number; // seasonal requirement in mm
  phRange: [number, number];
  preferredTextures: string[];
  typicalYieldPerAcre: {
    min: number;
    max: number;
    unit: string;
    source: string;
  };
  mainRisk: string;
  growthDurationDays: number;
}

export const INDIAN_CROPS_DATABASE: AgronomicCrop[] = [
  // 1. Wheat
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [10, 11, 12],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 28, optimalMin: 15, optimalMax: 22 },
    elevation: { min: 0, max: 2300 },
    frostSensitive: false,
    waterNeedMm: 450,
    phRange: [6.0, 7.8],
    preferredTextures: ['Loam', 'Clay Loam', 'Silt Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 18, max: 24, unit: 'Quintals', source: 'ICAR-IIWBR Karnal' },
    mainRisk: 'Terminal heat stress during grain filling in late March',
    growthDurationDays: 135,
  },
  // 2. Paddy / Rice
  {
    id: 'paddy',
    name: 'Paddy / Rice',
    hindiName: 'धान (चावल)',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [5, 6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 20, max: 38, optimalMin: 24, optimalMax: 32 },
    elevation: { min: 0, max: 1200 },
    frostSensitive: true,
    waterNeedMm: 1250,
    phRange: [5.0, 7.5],
    preferredTextures: ['Clay', 'Clay Loam', 'Silty Clay', 'Loam'],
    typicalYieldPerAcre: { min: 22, max: 30, unit: 'Quintals', source: 'ICAR-NRRI Cuttack' },
    mainRisk: 'Water shortage during panicle initiation; sheath blight in humid weather',
    growthDurationDays: 130,
  },
  // 3. Mustard / Rapeseed
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    hindiName: 'सरसों / तोरिया',
    category: 'Oilseed',
    isTreeOrOrchard: false,
    sowingMonths: [9, 10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 26, optimalMin: 14, optimalMax: 20 },
    elevation: { min: 0, max: 1800 },
    frostSensitive: true,
    waterNeedMm: 280,
    phRange: [6.0, 7.5],
    preferredTextures: ['Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 7, max: 11, unit: 'Quintals', source: 'ICAR-DRMR Bharatpur' },
    mainRisk: 'Aphid infestation and sudden frost during flowering stage',
    growthDurationDays: 115,
  },
  // 4. Barley (Jau) - High altitude / drought hardy
  {
    id: 'barley',
    name: 'Barley',
    hindiName: 'जौ',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [10, 11, 12],
    seasons: ['Rabi'],
    tempRange: { min: 8, max: 26, optimalMin: 12, optimalMax: 18 },
    elevation: { min: 0, max: 3200 },
    frostSensitive: false,
    waterNeedMm: 250,
    phRange: [6.0, 8.5],
    preferredTextures: ['Loam', 'Sandy Loam', 'Silt Loam'],
    typicalYieldPerAcre: { min: 14, max: 20, unit: 'Quintals', source: 'ICAR-IIWBR' },
    mainRisk: 'Lodging under excess nitrogen; rust in humid pockets',
    growthDurationDays: 120,
  },
  // 5. Gram / Chickpea (Chana)
  {
    id: 'gram',
    name: 'Chickpea / Gram',
    hindiName: 'चना',
    category: 'Pulse',
    isTreeOrOrchard: false,
    sowingMonths: [10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 30, optimalMin: 15, optimalMax: 24 },
    elevation: { min: 0, max: 2000 },
    frostSensitive: true,
    waterNeedMm: 280,
    phRange: [6.0, 7.8],
    preferredTextures: ['Sandy Loam', 'Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 7, max: 11, unit: 'Quintals', source: 'ICAR-IIPR Kanpur' },
    mainRisk: 'Pod borer (Helicoverpa armigera) and collar rot in waterlogged plots',
    growthDurationDays: 110,
  },
  // 6. Potato
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [9, 10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 25, optimalMin: 15, optimalMax: 20 },
    elevation: { min: 0, max: 2800 },
    frostSensitive: true,
    waterNeedMm: 500,
    phRange: [5.2, 6.8],
    preferredTextures: ['Sandy Loam', 'Loam'],
    typicalYieldPerAcre: { min: 90, max: 130, unit: 'Quintals', source: 'ICAR-CPRI Shimla' },
    mainRisk: 'Late blight disease during cloudy humid winter weeks',
    growthDurationDays: 95,
  },
  // 7. Green Peas (Matar) - Excellent for hills and plains
  {
    id: 'peas',
    name: 'Green Peas',
    hindiName: 'मटर',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [9, 10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 8, max: 22, optimalMin: 12, optimalMax: 18 },
    elevation: { min: 0, max: 3000 },
    frostSensitive: false,
    waterNeedMm: 350,
    phRange: [6.0, 7.5],
    preferredTextures: ['Loam', 'Silt Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 35, max: 55, unit: 'Quintals', source: 'ICAR-IIVR Varanasi' },
    mainRisk: 'Powdery mildew in late flowering stage',
    growthDurationDays: 80,
  },
  // 8. Maize / Corn
  {
    id: 'maize',
    name: 'Maize',
    hindiName: 'मक्का',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [5, 6, 7, 10], // Both Kharif and Rabi
    seasons: ['Kharif', 'Rabi'],
    tempRange: { min: 18, max: 35, optimalMin: 22, optimalMax: 30 },
    elevation: { min: 0, max: 2400 },
    frostSensitive: true,
    waterNeedMm: 550,
    phRange: [5.8, 7.5],
    preferredTextures: ['Loam', 'Sandy Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 20, max: 28, unit: 'Quintals', source: 'ICAR-IIMR Ludhiana' },
    mainRisk: 'Fall Armyworm (Spodoptera frugiperda) and stem borer',
    growthDurationDays: 105,
  },
  // 9. Soybean
  {
    id: 'soybean',
    name: 'Soybean',
    hindiName: 'सोयाबीन',
    category: 'Oilseed',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 20, max: 35, optimalMin: 25, optimalMax: 30 },
    elevation: { min: 0, max: 1000 },
    frostSensitive: true,
    waterNeedMm: 600,
    phRange: [6.0, 7.5],
    preferredTextures: ['Clay', 'Clay Loam', 'Loam'],
    typicalYieldPerAcre: { min: 9, max: 13, unit: 'Quintals', source: 'ICAR-IISR Indore' },
    mainRisk: 'Yellow mosaic virus and waterlogging during early germination',
    growthDurationDays: 100,
  },
  // 10. Cotton
  {
    id: 'cotton',
    name: 'Cotton',
    hindiName: 'कपास (नरमा)',
    category: 'Commercial',
    isTreeOrOrchard: false,
    sowingMonths: [4, 5, 6],
    seasons: ['Kharif'],
    tempRange: { min: 22, max: 40, optimalMin: 26, optimalMax: 34 },
    elevation: { min: 0, max: 800 },
    frostSensitive: true,
    waterNeedMm: 700,
    phRange: [6.5, 8.2],
    preferredTextures: ['Clay', 'Clay Loam', 'Loam'],
    typicalYieldPerAcre: { min: 8, max: 12, unit: 'Quintals', source: 'ICAR-CICR Nagpur' },
    mainRisk: 'Pink bollworm and whitefly infestations',
    growthDurationDays: 160,
  },
  // 11. Groundnut (Moongphali)
  {
    id: 'groundnut',
    name: 'Groundnut',
    hindiName: 'मूंगफली',
    category: 'Oilseed',
    isTreeOrOrchard: false,
    sowingMonths: [5, 6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 22, max: 35, optimalMin: 25, optimalMax: 30 },
    elevation: { min: 0, max: 1100 },
    frostSensitive: true,
    waterNeedMm: 480,
    phRange: [6.0, 7.2],
    preferredTextures: ['Sandy Loam', 'Loamy Sand', 'Loam'],
    typicalYieldPerAcre: { min: 10, max: 15, unit: 'Quintals', source: 'ICAR-DGR Junagadh' },
    mainRisk: 'Tikka leaf spot and collar rot in hard soil crusting',
    growthDurationDays: 115,
  },
  // 12. Sugarcane
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    hindiName: 'गन्ना',
    category: 'Commercial',
    isTreeOrOrchard: false,
    sowingMonths: [2, 3, 10, 11],
    seasons: ['Kharif', 'Rabi'],
    tempRange: { min: 20, max: 38, optimalMin: 26, optimalMax: 34 },
    elevation: { min: 0, max: 800 },
    frostSensitive: true,
    waterNeedMm: 1600,
    phRange: [6.5, 7.8],
    preferredTextures: ['Clay Loam', 'Loam'],
    typicalYieldPerAcre: { min: 320, max: 420, unit: 'Quintals', source: 'ICAR-IISR Lucknow' },
    mainRisk: 'Red rot and top borer during hot summer spells',
    growthDurationDays: 330,
  },
  // 13. Lentil / Masoor
  {
    id: 'lentil',
    name: 'Lentil / Masoor',
    hindiName: 'मसूर',
    category: 'Pulse',
    isTreeOrOrchard: false,
    sowingMonths: [10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 26, optimalMin: 14, optimalMax: 20 },
    elevation: { min: 0, max: 2500 },
    frostSensitive: false,
    waterNeedMm: 220,
    phRange: [5.8, 7.5],
    preferredTextures: ['Loam', 'Clay Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 6, max: 9, unit: 'Quintals', source: 'ICAR-IIPR Kanpur' },
    mainRisk: 'Rust and Stemphylium blight under prolonged dew',
    growthDurationDays: 110,
  },
  // 14. Green Gram (Moong) - Short duration Zaid / Kharif
  {
    id: 'moong',
    name: 'Green Gram / Moong',
    hindiName: 'मूंग',
    category: 'Pulse',
    isTreeOrOrchard: false,
    sowingMonths: [3, 4, 6, 7],
    seasons: ['Zaid', 'Kharif'],
    tempRange: { min: 24, max: 40, optimalMin: 28, optimalMax: 35 },
    elevation: { min: 0, max: 1400 },
    frostSensitive: true,
    waterNeedMm: 300,
    phRange: [6.2, 7.5],
    preferredTextures: ['Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 5, max: 8, unit: 'Quintals', source: 'ICAR-IIPR Kanpur' },
    mainRisk: 'Yellow mosaic virus spread by whiteflies in summer',
    growthDurationDays: 65,
  },
  // 15. Black Gram (Urad)
  {
    id: 'urad',
    name: 'Black Gram / Urad',
    hindiName: 'उड़द',
    category: 'Pulse',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7, 2, 3],
    seasons: ['Kharif', 'Zaid'],
    tempRange: { min: 24, max: 38, optimalMin: 27, optimalMax: 33 },
    elevation: { min: 0, max: 1200 },
    frostSensitive: true,
    waterNeedMm: 350,
    phRange: [6.0, 7.5],
    preferredTextures: ['Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 4, max: 7, unit: 'Quintals', source: 'ICAR-IIPR Kanpur' },
    mainRisk: 'Root rot and leaf crinkle virus',
    growthDurationDays: 75,
  },
  // 16. Pearl Millet (Bajra) - Dryland arid champion
  {
    id: 'bajra',
    name: 'Pearl Millet / Bajra',
    hindiName: 'बाजरा',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 22, max: 42, optimalMin: 28, optimalMax: 36 },
    elevation: { min: 0, max: 1200 },
    frostSensitive: true,
    waterNeedMm: 320,
    phRange: [6.5, 8.5],
    preferredTextures: ['Sand', 'Loamy Sand', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 12, max: 18, unit: 'Quintals', source: 'ICAR-IIMR Hyderabad' },
    mainRisk: 'Downy mildew and ergot in cloudy humid spells',
    growthDurationDays: 85,
  },
  // 17. Sorghum (Jowar)
  {
    id: 'jowar',
    name: 'Sorghum / Jowar',
    hindiName: 'ज्वार',
    category: 'Cereal',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7, 9, 10],
    seasons: ['Kharif', 'Rabi'],
    tempRange: { min: 20, max: 38, optimalMin: 26, optimalMax: 32 },
    elevation: { min: 0, max: 1000 },
    frostSensitive: true,
    waterNeedMm: 400,
    phRange: [6.0, 8.2],
    preferredTextures: ['Clay', 'Clay Loam', 'Loam'],
    typicalYieldPerAcre: { min: 11, max: 16, unit: 'Quintals', source: 'ICAR-IIMR Hyderabad' },
    mainRisk: 'Shoot fly in early seedling stage; grain mold if unseasonal rain',
    growthDurationDays: 105,
  },
  // 18. Pigeon Pea / Arhar / Tur
  {
    id: 'arhar',
    name: 'Pigeon Pea / Arhar',
    hindiName: 'अरहर (तुअर)',
    category: 'Pulse',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 20, max: 36, optimalMin: 25, optimalMax: 32 },
    elevation: { min: 0, max: 1200 },
    frostSensitive: true,
    waterNeedMm: 600,
    phRange: [6.5, 7.8],
    preferredTextures: ['Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 7, max: 11, unit: 'Quintals', source: 'ICAR-IIPR Kanpur' },
    mainRisk: 'Fusarium wilt and sterility mosaic disease',
    growthDurationDays: 160,
  },
  // 19. Onion
  {
    id: 'onion',
    name: 'Onion',
    hindiName: 'प्याज',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [10, 11, 12, 5, 6],
    seasons: ['Rabi', 'Kharif'],
    tempRange: { min: 13, max: 30, optimalMin: 18, optimalMax: 24 },
    elevation: { min: 0, max: 1800 },
    frostSensitive: false,
    waterNeedMm: 450,
    phRange: [6.0, 7.2],
    preferredTextures: ['Sandy Loam', 'Loam', 'Silt Loam'],
    typicalYieldPerAcre: { min: 80, max: 120, unit: 'Quintals', source: 'ICAR-DOGR Pune' },
    mainRisk: 'Purple blotch and thrips in dry warm weather',
    growthDurationDays: 120,
  },
  // 20. Garlic
  {
    id: 'garlic',
    name: 'Garlic',
    hindiName: 'लहसुन',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [9, 10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 12, max: 28, optimalMin: 16, optimalMax: 22 },
    elevation: { min: 0, max: 2500 },
    frostSensitive: false,
    waterNeedMm: 400,
    phRange: [6.0, 7.5],
    preferredTextures: ['Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 30, max: 45, unit: 'Quintals', source: 'ICAR-DOGR Pune' },
    mainRisk: 'Stem and bulb nematode; thrips infestation',
    growthDurationDays: 130,
  },
  // 21. Tomato
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7, 10, 11],
    seasons: ['Kharif', 'Rabi'],
    tempRange: { min: 15, max: 32, optimalMin: 20, optimalMax: 26 },
    elevation: { min: 0, max: 2200 },
    frostSensitive: true,
    waterNeedMm: 600,
    phRange: [6.0, 7.0],
    preferredTextures: ['Loam', 'Sandy Loam'],
    typicalYieldPerAcre: { min: 110, max: 160, unit: 'Quintals', source: 'ICAR-IIHR Bengaluru' },
    mainRisk: 'Early/late blight and tomato leaf curl virus',
    growthDurationDays: 110,
  },
  // 22. Cauliflower
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    hindiName: 'फूलगोभी',
    category: 'Horticulture',
    isTreeOrOrchard: false,
    sowingMonths: [9, 10, 11],
    seasons: ['Rabi'],
    tempRange: { min: 10, max: 24, optimalMin: 14, optimalMax: 19 },
    elevation: { min: 0, max: 2400 },
    frostSensitive: false,
    waterNeedMm: 450,
    phRange: [6.0, 7.0],
    preferredTextures: ['Loam', 'Sandy Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 70, max: 110, unit: 'Quintals', source: 'ICAR-IIVR Varanasi' },
    mainRisk: 'Buttoning of curd if temperature drops prematurely',
    growthDurationDays: 90,
  },
  // 23. Black Pepper (South / Coastal plantation)
  {
    id: 'black_pepper',
    name: 'Black Pepper',
    hindiName: 'काली मिर्च',
    category: 'Commercial',
    isTreeOrOrchard: false,
    sowingMonths: [5, 6, 7],
    seasons: ['Kharif'],
    tempRange: { min: 20, max: 35, optimalMin: 23, optimalMax: 30 },
    elevation: { min: 0, max: 1500 },
    frostSensitive: true,
    waterNeedMm: 1800,
    phRange: [5.0, 6.5],
    preferredTextures: ['Clayey Loam', 'Sandy Loam', 'Loam'],
    typicalYieldPerAcre: { min: 6, max: 10, unit: 'Quintals', source: 'ICAR-IISR Kozhikode' },
    mainRisk: 'Phytophthora quick wilt disease in stagnant monsoon water',
    growthDurationDays: 240,
  },
  // 24. Sesame / Til
  {
    id: 'sesame',
    name: 'Sesame / Til',
    hindiName: 'तिल',
    category: 'Oilseed',
    isTreeOrOrchard: false,
    sowingMonths: [6, 7, 2, 3],
    seasons: ['Kharif', 'Zaid'],
    tempRange: { min: 24, max: 38, optimalMin: 26, optimalMax: 32 },
    elevation: { min: 0, max: 1200 },
    frostSensitive: true,
    waterNeedMm: 350,
    phRange: [5.5, 7.8],
    preferredTextures: ['Sandy Loam', 'Loam'],
    typicalYieldPerAcre: { min: 3, max: 5, unit: 'Quintals', source: 'ICAR-IIOR Hyderabad' },
    mainRisk: 'Phyllody mycoplasma transmitted by leafhoppers',
    growthDurationDays: 85,
  },
  // 25. Apple (Long-Term Tree Orchard Option)
  {
    id: 'apple',
    name: 'Apple',
    hindiName: 'सेब (बागवानी)',
    category: 'Orchard Fruit',
    isTreeOrOrchard: true, // Marked as tree/orchard!
    sowingMonths: [1, 2, 12],
    seasons: ['Rabi'],
    tempRange: { min: -10, max: 24, optimalMin: 10, optimalMax: 18 },
    elevation: { min: 1200, max: 2700 }, // High altitude requirement!
    frostSensitive: false,
    waterNeedMm: 1000,
    phRange: [5.5, 6.8],
    preferredTextures: ['Loam', 'Sandy Loam', 'Clay Loam'],
    typicalYieldPerAcre: { min: 45, max: 70, unit: 'Quintals', source: 'Dr. YSP UHF Nauni, Solan' },
    mainRisk: 'Apple scab and lack of requisite chilling hours (<7°C for 800-1200h)',
    growthDurationDays: 180,
  },
];

/**
 * USDA Soil Texture Triangle Classifier
 * Translates clay, sand, and silt percentages into authentic soil texture nomenclature.
 */
export function getUsdaSoilTexture(sand: number, silt: number, clay: number): string {
  const total = sand + silt + clay;
  if (total > 0 && Math.abs(total - 100) > 1) {
    sand = (sand / total) * 100;
    silt = (silt / total) * 100;
    clay = (clay / total) * 100;
  }

  // USDA Standard Boundaries
  if (sand >= 85 && silt + 1.5 * clay < 15) return 'Sand';
  if (sand >= 70 && sand <= 90 && silt + 1.5 * clay >= 15 && silt + 2 * clay < 30) return 'Loamy Sand';
  if ((clay < 20 && sand > 52 && silt + 2 * clay >= 30) || (clay < 7 && silt < 50 && sand >= 43 && sand <= 52)) {
    return 'Sandy Loam';
  }
  if (clay >= 7 && clay <= 27 && silt >= 28 && silt <= 50 && sand < 52) return 'Loam';
  if ((silt >= 50 && clay >= 12 && clay <= 27) || (silt >= 50 && silt <= 80 && clay < 12)) return 'Silt Loam';
  if (silt >= 80 && clay < 12) return 'Silt';
  if (clay >= 20 && clay <= 35 && silt < 28 && sand > 45) return 'Sandy Clay Loam';
  if (clay >= 27 && clay <= 40 && sand >= 20 && sand <= 45) return 'Clay Loam';
  if (clay >= 27 && clay <= 40 && sand < 20) return 'Silty Clay Loam';
  if (clay >= 35 && sand > 45) return 'Sandy Clay';
  if (clay >= 40 && silt >= 40) return 'Silty Clay';
  if (clay >= 40) return 'Clay';

  return 'Loam';
}

/**
 * Regional General Soil Type Fallbacks
 * Grounded in ICAR/NBSS&LUP Soil Classification maps
 */
export const REGIONAL_SOIL_FALLBACKS: Record<
  string,
  {
    soilType: string;
    texture: string;
    ph: number;
    nitrogen: string;
    organicCarbon: number;
    source: string;
  }
> = {
  'Himachal Pradesh': {
    soilType: 'Brown Hill Soil',
    texture: 'Loam / Sandy Loam',
    ph: 6.2,
    nitrogen: 'Medium',
    organicCarbon: 0.95,
    source: 'ICAR Regional Hill Soil Survey',
  },
  'Jammu & Kashmir / Ladakh': {
    soilType: 'Mountain Forest Soil',
    texture: 'Silt Loam',
    ph: 6.5,
    nitrogen: 'Medium',
    organicCarbon: 0.85,
    source: 'Regional Agro-Climatic Survey',
  },
  'Uttarakhand': {
    soilType: 'Brown Forest Soil',
    texture: 'Loam',
    ph: 6.3,
    nitrogen: 'Medium',
    organicCarbon: 0.9,
    source: 'Regional Hill Soil Survey',
  },
  'Punjab': {
    soilType: 'Alluvial Loam',
    texture: 'Loam',
    ph: 7.4,
    nitrogen: 'Medium-Low',
    organicCarbon: 0.45,
    source: 'Indo-Gangetic Alluvial Survey',
  },
  'Haryana': {
    soilType: 'Alluvial (Sandy Loam)',
    texture: 'Sandy Loam',
    ph: 7.6,
    nitrogen: 'Low',
    organicCarbon: 0.4,
    source: 'Indo-Gangetic Alluvial Survey',
  },
  'Uttar Pradesh': {
    soilType: 'Alluvial Soil',
    texture: 'Clay Loam / Loam',
    ph: 7.2,
    nitrogen: 'Medium',
    organicCarbon: 0.5,
    source: 'Indo-Gangetic Alluvial Survey',
  },
  'Bihar': {
    soilType: 'Alluvial Silt Loam',
    texture: 'Silt Loam',
    ph: 7.1,
    nitrogen: 'Medium',
    organicCarbon: 0.55,
    source: 'Indo-Gangetic Alluvial Survey',
  },
  'West Bengal': {
    soilType: 'Deltaic Alluvium',
    texture: 'Clay Loam',
    ph: 6.5,
    nitrogen: 'Medium-High',
    organicCarbon: 0.65,
    source: 'Eastern Alluvial Survey',
  },
  'Maharashtra': {
    soilType: 'Black Regur Soil',
    texture: 'Clay / Clay Loam',
    ph: 7.8,
    nitrogen: 'Low-Medium',
    organicCarbon: 0.55,
    source: 'Deccan Trap Regur Soil Survey',
  },
  'Madhya Pradesh': {
    soilType: 'Medium Black Soil',
    texture: 'Clay Loam',
    ph: 7.5,
    nitrogen: 'Medium',
    organicCarbon: 0.5,
    source: 'Central Black Soil Survey',
  },
  'Gujarat': {
    soilType: 'Medium Black & Alluvial Loam',
    texture: 'Sandy Clay Loam',
    ph: 7.7,
    nitrogen: 'Low',
    organicCarbon: 0.42,
    source: 'Western Agro-Climatic Survey',
  },
  'Rajasthan': {
    soilType: 'Arid Sandy Soil',
    texture: 'Sand / Loamy Sand',
    ph: 8.1,
    nitrogen: 'Low',
    organicCarbon: 0.25,
    source: 'ICAR-CAZRI Desert Soil Survey',
  },
  'Kerala': {
    soilType: 'Coastal Laterite Soil',
    texture: 'Sandy Loam / Clayey Loam',
    ph: 5.4,
    nitrogen: 'High',
    organicCarbon: 1.1,
    source: 'Western Ghats Laterite Survey',
  },
  'Karnataka': {
    soilType: 'Red Loam & Coastal Laterite',
    texture: 'Red Sandy Loam',
    ph: 6.4,
    nitrogen: 'Medium',
    organicCarbon: 0.6,
    source: 'Southern Plateau Soil Survey',
  },
  'Goa': {
    soilType: 'Laterite Soil',
    texture: 'Loamy Sand',
    ph: 5.6,
    nitrogen: 'Medium',
    organicCarbon: 0.85,
    source: 'Konkan Coast Survey',
  },
  'Tamil Nadu': {
    soilType: 'Red Soil & Black Loam',
    texture: 'Sandy Loam',
    ph: 6.8,
    nitrogen: 'Medium-Low',
    organicCarbon: 0.5,
    source: 'Tamil Nadu Agro-Climatic Survey',
  },
  'Andhra Pradesh': {
    soilType: 'Red Sandy & Coastal Alluvium',
    texture: 'Loam',
    ph: 7.0,
    nitrogen: 'Medium',
    organicCarbon: 0.48,
    source: 'Coastal AP Soil Survey',
  },
  'Telangana': {
    soilType: 'Chalka (Red Sandy Loam)',
    texture: 'Sandy Loam',
    ph: 6.9,
    nitrogen: 'Low-Medium',
    organicCarbon: 0.45,
    source: 'Telangana Plateau Survey',
  },
  'Odisha': {
    soilType: 'Red & Yellow Soil',
    texture: 'Sandy Loam',
    ph: 6.1,
    nitrogen: 'Medium',
    organicCarbon: 0.58,
    source: 'Eastern Ghats Survey',
  },
  'Assam': {
    soilType: 'Brahmaputra Alluvial Acidic Soil',
    texture: 'Silt Loam',
    ph: 5.2,
    nitrogen: 'High',
    organicCarbon: 0.95,
    source: 'Assam Plains Soil Survey',
  },
};

/**
 * Determines current and next agricultural season from date
 */
export function getIndianAgriSeasons(date = new Date()): {
  currentSeason: 'Kharif' | 'Rabi' | 'Zaid';
  nextSeason: 'Kharif' | 'Rabi' | 'Zaid';
  activeMonth: number; // 1-12
  seasonDisplay: string;
} {
  const month = date.getMonth() + 1; // 1 to 12

  // Month breakdown:
  // Kharif: Sowing in Jun - Jul (5-7), Harvesting in Sep - Oct (9-10)
  // Rabi: Sowing in Oct - Dec (10-12), Harvesting in Feb - Apr (2-4)
  // Zaid: Sowing in Mar - Apr (3-4), Harvesting in May - Jun (5-6)

  let currentSeason: 'Kharif' | 'Rabi' | 'Zaid' = 'Rabi';
  let nextSeason: 'Kharif' | 'Rabi' | 'Zaid' = 'Zaid';
  let seasonDisplay = 'Rabi (Winter Sowing)';

  if (month >= 10 || month === 1) {
    currentSeason = 'Rabi';
    nextSeason = 'Zaid';
    seasonDisplay = 'Rabi (Winter Sowing: Oct - Dec)';
  } else if (month === 2) {
    currentSeason = 'Zaid';
    nextSeason = 'Kharif';
    seasonDisplay = 'Late Rabi / Transitioning to Zaid';
  } else if (month >= 3 && month <= 5) {
    currentSeason = 'Zaid';
    nextSeason = 'Kharif';
    seasonDisplay = 'Zaid (Summer Sowing: Mar - Apr)';
  } else if (month >= 6 && month <= 9) {
    currentSeason = 'Kharif';
    nextSeason = 'Rabi';
    seasonDisplay = 'Kharif (Monsoon Sowing: Jun - Jul)';
  }

  return { currentSeason, nextSeason, activeMonth: month, seasonDisplay };
}

/**
 * Rule-Based Agronomic Scoring Engine (Weight distribution: Temp 30, Elevation 20, Water 20, Soil 15, Season 15)
 */
export function scoreCropRuleBased(
  crop: AgronomicCrop,
  inputs: {
    temp: number;
    elevation: number;
    annualRainfallMm: number;
    soilTexture: string;
    soilPh: number;
    activeMonth: number;
    currentSeason: 'Kharif' | 'Rabi' | 'Zaid';
    nextSeason: 'Kharif' | 'Rabi' | 'Zaid';
    minWinterTemp: number;
  }
): {
  totalScore: number;
  tempScore: number;
  elevationScore: number;
  waterScore: number;
  soilScore: number;
  seasonScore: number;
  oneLineReason: string;
} {
  const { temp, elevation, annualRainfallMm, soilTexture, soilPh, activeMonth, currentSeason, nextSeason, minWinterTemp } = inputs;

  // 1. Temperature score (max 30)
  let tempScore = 0;
  if (temp >= crop.tempRange.optimalMin && temp <= crop.tempRange.optimalMax) {
    tempScore = 30;
  } else if (temp >= crop.tempRange.min && temp <= crop.tempRange.max) {
    const optimalMid = (crop.tempRange.optimalMin + crop.tempRange.optimalMax) / 2;
    const dist = Math.abs(temp - optimalMid);
    const maxDist = (crop.tempRange.max - crop.tempRange.min) / 2 || 1;
    tempScore = Math.max(10, Math.round(30 - (dist / maxDist) * 18));
  } else {
    tempScore = 4;
  }

  // 2. Elevation score (max 20)
  let elevationScore = 0;
  if (elevation >= crop.elevation.min && elevation <= crop.elevation.max) {
    elevationScore = 20;
  } else {
    const dist = elevation < crop.elevation.min ? crop.elevation.min - elevation : elevation - crop.elevation.max;
    if (dist <= 300) elevationScore = 10;
    else elevationScore = 0;
  }

  // 3. Water need vs Annual Rainfall score (max 20)
  let waterScore = 0;
  const waterDiffRatio = Math.abs(annualRainfallMm - crop.waterNeedMm) / Math.max(crop.waterNeedMm, 1);
  if (waterDiffRatio <= 0.25) {
    waterScore = 20;
  } else if (waterDiffRatio <= 0.5) {
    waterScore = 15;
  } else if (waterDiffRatio <= 0.75) {
    waterScore = 11;
  } else {
    waterScore = 7;
  }

  // 4. Soil texture & pH score (max 15)
  let soilScore = 0;
  // Texture (max 8)
  const normTexture = (soilTexture || '').toLowerCase();
  const textureMatches = crop.preferredTextures.some((t) => normTexture.includes(t.toLowerCase()) || t.toLowerCase().includes(normTexture));
  if (textureMatches) {
    soilScore += 8;
  } else {
    soilScore += 3;
  }
  // pH (max 7)
  if (soilPh >= crop.phRange[0] && soilPh <= crop.phRange[1]) {
    soilScore += 7;
  } else if (Math.abs(soilPh - crop.phRange[0]) <= 0.5 || Math.abs(soilPh - crop.phRange[1]) <= 0.5) {
    soilScore += 4;
  } else {
    soilScore += 1;
  }

  // 5. Season score (max 15)
  let seasonScore = 0;
  if (crop.sowingMonths.includes(activeMonth)) {
    seasonScore = 15;
  } else if (crop.seasons.includes(currentSeason)) {
    seasonScore = 12;
  } else if (crop.seasons.includes(nextSeason)) {
    seasonScore = 9;
  } else {
    seasonScore = 2;
  }

  // Frost penalty for frost-sensitive crops
  if (crop.frostSensitive && (minWinterTemp < 1 || temp < 3)) {
    tempScore = Math.max(2, tempScore - 15);
  }

  const totalScore = Math.min(96, Math.max(25, tempScore + elevationScore + waterScore + soilScore + seasonScore));

  const seasonName = crop.seasons.join('/');
  const oneLineReason = `Suits ${Math.round(elevation)} m elevation, ${seasonName} sowing, ${soilTexture} soil (pH ${soilPh.toFixed(1)}), and ${temp}°C climate.`;

  return {
    totalScore,
    tempScore,
    elevationScore,
    waterScore,
    soilScore,
    seasonScore,
    oneLineReason,
  };
}
