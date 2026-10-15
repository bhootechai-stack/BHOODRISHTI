import { IndianState, StateUnitGroup, LandUnit } from '../types';

export const INDIAN_STATE_UNITS: StateUnitGroup[] = [
  {
    state: 'Punjab',
    commonName: 'Punjab & Chandigarh',
    primaryUnit: 'killa_pb',
    units: [
      {
        id: 'killa_pb',
        name: 'Killa (Acre)',
        localName: 'ਕਿੱਲਾ',
        sqMeters: 4046.8564,
        description: 'Standard northern field unit (1 Killa = 8 Kanal = 1 Acre = 4,046.86 m²)',
      },
      {
        id: 'kanal_pb',
        name: 'Kanal',
        localName: 'ਕਨਾਲ',
        sqMeters: 505.857,
        description: '1/8th of a Killa (1 Kanal = 20 Marlas = 505.86 m²)',
      },
      {
        id: 'marla_pb',
        name: 'Marla',
        localName: 'ਮਰਲਾ',
        sqMeters: 25.2928,
        description: '1/20th of a Kanal (1 Marla = 9 Sarsahi = 25.29 m² = 272.25 sq ft)',
      },
      {
        id: 'sarsahi_pb',
        name: 'Sarsahi',
        localName: 'ਸਰਸਾਹੀ',
        sqMeters: 2.8103,
        description: '1/9th of a Marla (2.81 m²)',
      },
    ],
  },
  {
    state: 'Haryana',
    commonName: 'Haryana',
    primaryUnit: 'killa_hr',
    units: [
      {
        id: 'killa_hr',
        name: 'Killa (Acre)',
        localName: 'किल्ला',
        sqMeters: 4046.8564,
        description: '1 Killa = 8 Kanals = 4,046.86 m² (1 Acre)',
      },
      {
        id: 'kanal_hr',
        name: 'Kanal',
        localName: 'कनाल',
        sqMeters: 505.857,
        description: '1 Kanal = 20 Marlas = 505.86 m²',
      },
      {
        id: 'marla_hr',
        name: 'Marla',
        localName: 'मरला',
        sqMeters: 25.2928,
        description: '1 Marla = 25.29 m²',
      },
      {
        id: 'bigha_hr',
        name: 'Bigha (South Haryana)',
        localName: 'बीघा',
        sqMeters: 2529.285,
        description: 'Pucca Bigha used in parts of Haryana (2,529.29 m²)',
      },
    ],
  },
  {
    state: 'Himachal Pradesh',
    commonName: 'Himachal Pradesh',
    primaryUnit: 'bigha_hp',
    units: [
      {
        id: 'bigha_hp',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 809.37,
        description: '1 Bigha (HP) = 20 Biswa = 809.37 m² (~0.20 Acre)',
      },
      {
        id: 'biswa_hp',
        name: 'Biswa',
        localName: 'बिस्वा',
        sqMeters: 40.47,
        description: '1 Biswa (HP) = 1/20th Bigha = 40.47 m²',
      },
      {
        id: 'biswansi_hp',
        name: 'Biswansi',
        localName: 'बिस्वांसी',
        sqMeters: 2.023,
        description: '1 Biswansi = 1/20th Biswa = 2.02 m²',
      },
    ],
  },
  {
    state: 'Uttarakhand',
    commonName: 'Uttarakhand',
    primaryUnit: 'bigha_uk',
    units: [
      {
        id: 'bigha_uk',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 689.86,
        description: '1 Bigha (Uttarakhand) = 20 Biswa = 689.86 m²',
      },
      {
        id: 'biswa_uk',
        name: 'Biswa',
        localName: 'बिस्वा',
        sqMeters: 34.49,
        description: '1 Biswa (Uttarakhand) = 1/20th Bigha = 34.49 m²',
      },
      {
        id: 'nali_uk',
        name: 'Nali (Kumaon/Garhwal)',
        localName: 'नाली',
        sqMeters: 200.7,
        description: '1 Nali = 2,160 sq ft = 200.70 m²',
      },
    ],
  },
  {
    state: 'Jammu & Kashmir / Ladakh',
    commonName: 'Jammu & Kashmir / Ladakh',
    primaryUnit: 'kanal_jk',
    units: [
      {
        id: 'kanal_jk',
        name: 'Kanal',
        localName: 'کنال / कनाल',
        sqMeters: 505.85,
        description: '1 Kanal = 20 Marla = 5,445 sq ft = 505.85 m²',
      },
      {
        id: 'marla_jk',
        name: 'Marla',
        localName: 'مرلہ / मरला',
        sqMeters: 25.29,
        description: '1 Marla = 272.25 sq ft = 25.29 m²',
      },
      {
        id: 'sarsahi_jk',
        name: 'Sarsahi',
        localName: 'सरसाही',
        sqMeters: 2.81,
        description: '1/9th Marla = 2.81 m²',
      },
    ],
  },
  {
    state: 'Uttar Pradesh',
    commonName: 'Uttar Pradesh',
    primaryUnit: 'pucca_bigha_up',
    units: [
      {
        id: 'pucca_bigha_up',
        name: 'Pucca Bigha',
        localName: 'पक्का बीघा',
        sqMeters: 2529.285,
        description: '1 Pucca Bigha = 20 Biswa = 3,025 sq yards = 0.625 Acre (2,529.29 m²)',
      },
      {
        id: 'kaccha_bigha_up',
        name: 'Kaccha Bigha',
        localName: 'कच्चा बीघा',
        sqMeters: 843.095,
        description: '1 Kaccha Bigha = 1/3 Pucca Bigha = 1,008.33 sq yards (843.10 m²)',
      },
      {
        id: 'biswa_up',
        name: 'Biswa (Pucca)',
        localName: 'बिस्वा',
        sqMeters: 126.464,
        description: '1/20th of a Pucca Bigha = 126.46 m² = 151.25 sq yards',
      },
      {
        id: 'biswa_kaccha_up',
        name: 'Biswa (Kaccha)',
        localName: 'कच्चा बिस्वा',
        sqMeters: 42.155,
        description: '1/20th of a Kaccha Bigha = 42.15 m²',
      },
      {
        id: 'biswansi_up',
        name: 'Biswansi',
        localName: 'बिस्वांसी',
        sqMeters: 6.323,
        description: '1/20th of a Biswa = 6.32 m²',
      },
    ],
  },
  {
    state: 'Rajasthan',
    commonName: 'Rajasthan',
    primaryUnit: 'bigha_rj',
    units: [
      {
        id: 'bigha_rj',
        name: 'Bigha (Pucca)',
        localName: 'पक्का बीघा',
        sqMeters: 2529.285,
        description: '1 Pucca Bigha = 20 Biswa = 2,529.29 m² (0.625 Acre)',
      },
      {
        id: 'kaccha_bigha_rj',
        name: 'Kaccha Bigha',
        localName: 'कच्चा बीघा',
        sqMeters: 1618.74,
        description: 'Used in western desert zones = 1,618.74 m² (0.4 Acre)',
      },
      {
        id: 'biswa_rj',
        name: 'Biswa',
        localName: 'बिस्वा',
        sqMeters: 126.464,
        description: '1/20th of a Bigha = 126.46 m²',
      },
    ],
  },
  {
    state: 'Madhya Pradesh',
    commonName: 'Madhya Pradesh',
    primaryUnit: 'bigha_mp',
    units: [
      {
        id: 'bigha_mp',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 1337.8,
        description: 'Standard Bigha (MP) = 20 Kattha = 1,337.80 m²',
      },
      {
        id: 'biswa_mp',
        name: 'Biswa',
        localName: 'बिस्वा',
        sqMeters: 66.89,
        description: '1/20th Bigha = 66.89 m²',
      },
      {
        id: 'pucca_bigha_mp',
        name: 'Pucca Bigha (Chambal/Malwa)',
        localName: 'पक्का बीघा',
        sqMeters: 2529.285,
        description: 'Traditional Pucca Bigha = 2,529.29 m² (0.625 Acre)',
      },
    ],
  },
  {
    state: 'Chhattisgarh',
    commonName: 'Chhattisgarh',
    primaryUnit: 'decimal_cg',
    units: [
      {
        id: 'decimal_cg',
        name: 'Decimal',
        localName: 'डेसिमल',
        sqMeters: 40.47,
        description: '1 Decimal = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'bigha_cg',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 1337.8,
        description: '1 Bigha = 20 Kattha = 1,337.80 m²',
      },
      {
        id: 'kattha_cg',
        name: 'Kattha',
        localName: 'कट्ठा',
        sqMeters: 66.89,
        description: '1/20th of a Bigha = 66.89 m²',
      },
    ],
  },
  {
    state: 'Gujarat',
    commonName: 'Gujarat',
    primaryUnit: 'bigha_gj_std',
    units: [
      {
        id: 'bigha_gj_std',
        name: 'Bigha',
        localName: 'બીઘા',
        sqMeters: 1618.74,
        description: '1 Bigha (Gujarat standard) = 16 Gunthas = 1,618.74 m² (0.40 Acre)',
      },
      {
        id: 'vigha_gj',
        name: 'Vigha',
        localName: 'વીઘા (સૌરાષ્ટ્ર)',
        sqMeters: 1338.75,
        description: '1 Vigha (Saurashtra) = 1,338.75 m²',
      },
      {
        id: 'vasa_gj',
        name: 'Vasa',
        localName: 'વસા',
        sqMeters: 118.9,
        description: '1 Vasa = 1/20th Vigha = 118.90 m²',
      },
      {
        id: 'guntha_gj',
        name: 'Guntha',
        localName: 'ગુંઠા',
        sqMeters: 101.1714,
        description: '1 Guntha = 1,089 sq ft = 101.17 m²',
      },
    ],
  },
  {
    state: 'Maharashtra',
    commonName: 'Maharashtra',
    primaryUnit: 'guntha_mh',
    units: [
      {
        id: 'guntha_mh',
        name: 'Guntha',
        localName: 'गुंठा',
        sqMeters: 101.1714,
        description: 'Standard Maharashtra unit (1 Guntha = 1,089 sq ft = 1/40 Acre = 101.17 m²)',
      },
      {
        id: 'acre_mh',
        name: 'Acre (40 Gunthas)',
        localName: 'एकर',
        sqMeters: 4046.8564,
        description: '1 Acre = 40 Gunthas = 4,046.86 m²',
      },
      {
        id: 'bigha_mh',
        name: 'Bigha (Vidarbha)',
        localName: 'बिघा',
        sqMeters: 2529.285,
        description: 'Used regionally in Vidarbha (2,529.29 m²)',
      },
    ],
  },
  {
    state: 'Goa',
    commonName: 'Goa',
    primaryUnit: 'kolli_goa',
    units: [
      {
        id: 'kolli_goa',
        name: 'Kolli',
        localName: 'कॉलली',
        sqMeters: 270.0,
        description: '1 Kolli (Goan traditional revenue unit) = 270.00 m²',
      },
      {
        id: 'guntha_goa',
        name: 'Guntha',
        localName: 'गुंठा',
        sqMeters: 101.1714,
        description: '1 Guntha = 1,089 sq ft = 101.17 m²',
      },
      {
        id: 'sqm_goa',
        name: 'Sq Meters',
        localName: 'चौरस मीटर',
        sqMeters: 1.0,
        description: 'Direct cadastral register standard',
      },
    ],
  },
  {
    state: 'Bihar',
    commonName: 'Bihar',
    primaryUnit: 'bigha_br',
    units: [
      {
        id: 'bigha_br',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 2529.285,
        description: '1 Bigha = 20 Kattha = 27,225 sq ft = 0.625 Acre (2,529.29 m²)',
      },
      {
        id: 'kattha_br',
        name: 'Kattha',
        localName: 'कट्ठा',
        sqMeters: 126.464,
        description: '1 Kattha = 20 Dhur = 1,361.25 sq ft = 126.46 m²',
      },
      {
        id: 'dhur_br',
        name: 'Dhur',
        localName: 'धुर',
        sqMeters: 6.323,
        description: '1 Dhur = 20 Dhurki = 68.06 sq ft = 6.32 m²',
      },
      {
        id: 'dhurki_br',
        name: 'Dhurki',
        localName: 'धुरकी',
        sqMeters: 0.316,
        description: '1 Dhurki = 3.4 sq ft = 0.316 m²',
      },
    ],
  },
  {
    state: 'Jharkhand',
    commonName: 'Jharkhand',
    primaryUnit: 'bigha_jh',
    units: [
      {
        id: 'bigha_jh',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 2529.28,
        description: '1 Bigha = 20 Kattha = 2,529.28 m² (0.625 Acre)',
      },
      {
        id: 'kattha_jh',
        name: 'Kattha',
        localName: 'कट्ठा',
        sqMeters: 126.46,
        description: '1 Kattha = 20 Dhur = 126.46 m²',
      },
      {
        id: 'dhur_jh',
        name: 'Dhur',
        localName: 'धुर',
        sqMeters: 6.32,
        description: '1 Dhur = 6.32 m²',
      },
      {
        id: 'decimal_jh',
        name: 'Decimal / Dismil',
        localName: 'डिसमिल',
        sqMeters: 40.47,
        description: '1 Dismil = 435.6 sq ft = 40.47 m²',
      },
    ],
  },
  {
    state: 'West Bengal',
    commonName: 'West Bengal',
    primaryUnit: 'bigha_wb',
    units: [
      {
        id: 'bigha_wb',
        name: 'Bigha',
        localName: 'বিঘা',
        sqMeters: 1337.8038,
        description: '1 Bigha = 20 Kattha = 14,400 sq ft = 0.3306 Acre (1,337.80 m²)',
      },
      {
        id: 'kattha_wb',
        name: 'Kattha / Cottah',
        localName: 'কাঠা',
        sqMeters: 66.8902,
        description: '1 Kattha = 16 Chhatak = 720 sq ft = 66.89 m²',
      },
      {
        id: 'chhatak_wb',
        name: 'Chhatak',
        localName: 'ছটাক',
        sqMeters: 4.1806,
        description: '1 Chhatak = 45 sq ft = 4.18 m²',
      },
      {
        id: 'decimal_wb',
        name: 'Decimal / Satak',
        localName: 'শতক',
        sqMeters: 40.4686,
        description: '1 Satak / Decimal = 435.6 sq ft = 40.47 m²',
      },
    ],
  },
  {
    state: 'Odisha',
    commonName: 'Odisha',
    primaryUnit: 'gunth_od',
    units: [
      {
        id: 'gunth_od',
        name: 'Gunth / Guntha',
        localName: 'ଗୁଣ୍ଠ',
        sqMeters: 101.17,
        description: '1 Gunth = 1,089 sq ft = 101.17 m²',
      },
      {
        id: 'decimal_od',
        name: 'Decimal',
        localName: 'ଡେସିମିଲ',
        sqMeters: 40.47,
        description: '1 Decimal = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'bigha_od',
        name: 'Bigha',
        localName: 'ବିଘା',
        sqMeters: 2529.28,
        description: '1 Bigha = 20 Gunth = 2,529.28 m²',
      },
      {
        id: 'man_od',
        name: 'Maan / Mana',
        localName: 'ମାଣ',
        sqMeters: 4046.86,
        description: '1 Mana = 25 Guntha = 1 Acre (4,046.86 m²)',
      },
    ],
  },
  {
    state: 'Karnataka',
    commonName: 'Karnataka',
    primaryUnit: 'guntha_ka',
    units: [
      {
        id: 'guntha_ka',
        name: 'Guntha',
        localName: 'ಗುಂಟೆ',
        sqMeters: 101.1714,
        description: '1 Guntha = 1,089 sq ft = 1/40 Acre = 101.17 m²',
      },
      {
        id: 'cent_ka',
        name: 'Cent (Coastal KA)',
        localName: 'ಸೆಂಟ್',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'acre_ka',
        name: 'Acre (40 Gunthas)',
        localName: 'ಎಕರೆ',
        sqMeters: 4046.8564,
        description: '1 Acre = 40 Gunthas = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Tamil Nadu',
    commonName: 'Tamil Nadu',
    primaryUnit: 'cent_tn',
    units: [
      {
        id: 'cent_tn',
        name: 'Cent',
        localName: 'சென்ட்',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 1/100th Acre = 40.47 m²',
      },
      {
        id: 'ground_tn',
        name: 'Ground',
        localName: 'கிரவுண்ட்',
        sqMeters: 222.967,
        description: '1 Ground = 2,400 sq ft = 5.51 Cents = 222.97 m²',
      },
      {
        id: 'guntha_south',
        name: 'Guntha',
        localName: 'குந்தா',
        sqMeters: 101.1714,
        description: '1 Guntha = 1,089 sq ft = 2.5 Cents = 101.17 m²',
      },
      {
        id: 'ankanam_tn',
        name: 'Ankanam',
        localName: 'அங்கணம்',
        sqMeters: 6.689,
        description: '1 Ankanam = 72 sq ft = 6.69 m²',
      },
    ],
  },
  {
    state: 'Andhra Pradesh',
    commonName: 'Andhra Pradesh',
    primaryUnit: 'guntha_ap',
    units: [
      {
        id: 'guntha_ap',
        name: 'Gunta / Guntha',
        localName: 'గుంట',
        sqMeters: 101.1714,
        description: '1 Gunta = 1,089 sq ft = 1/40th Acre = 101.17 m²',
      },
      {
        id: 'cent_ap',
        name: 'Cent',
        localName: 'సెంట్',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 1/100th Acre = 40.47 m²',
      },
      {
        id: 'ankanam_ap',
        name: 'Ankanam',
        localName: 'అంకణం',
        sqMeters: 6.689,
        description: '1 Ankanam = 72 sq ft (Rayalaseema / Nellore)',
      },
    ],
  },
  {
    state: 'Telangana',
    commonName: 'Telangana',
    primaryUnit: 'guntha_tg',
    units: [
      {
        id: 'guntha_tg',
        name: 'Gunta / Guntha',
        localName: 'గుంట',
        sqMeters: 101.1714,
        description: '1 Gunta = 1,089 sq ft = 1/40th Acre = 101.17 m²',
      },
      {
        id: 'cent_tg',
        name: 'Cent',
        localName: 'సెంట్',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'acre_tg',
        name: 'Acre (40 Guntas)',
        localName: 'ఎకరం',
        sqMeters: 4046.8564,
        description: '1 Acre = 40 Guntas = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Kerala',
    commonName: 'Kerala',
    primaryUnit: 'cent_kl',
    units: [
      {
        id: 'cent_kl',
        name: 'Cent',
        localName: 'സെന്റ്',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'acre_kl',
        name: 'Acre (100 Cents)',
        localName: 'ഏക്കർ',
        sqMeters: 4046.8564,
        description: '1 Acre = 100 Cents = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Assam',
    commonName: 'Assam',
    primaryUnit: 'bigha_as',
    units: [
      {
        id: 'bigha_as',
        name: 'Bigha',
        localName: 'বিঘা',
        sqMeters: 1337.8038,
        description: '1 Bigha = 5 Kattha = 14,400 sq ft = 0.3306 Acre (1,337.80 m²)',
      },
      {
        id: 'kattha_as',
        name: 'Kattha',
        localName: 'কঠা',
        sqMeters: 267.5608,
        description: '1 Kattha = 20 Lechas = 2,880 sq ft = 267.56 m²',
      },
      {
        id: 'lecha_as',
        name: 'Lecha',
        localName: 'লেচা',
        sqMeters: 13.378,
        description: '1 Lecha = 144 sq ft = 13.38 m²',
      },
    ],
  },
  {
    state: 'Tripura',
    commonName: 'Tripura',
    primaryUnit: 'kani_tr',
    units: [
      {
        id: 'bigha_tr',
        name: 'Bigha',
        localName: 'বিঘা',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'kani_tr',
        name: 'Kani',
        localName: 'কানি',
        sqMeters: 1618.74,
        description: '1 Kani = 24 Ganda = 1,618.74 m² (~0.40 Acre)',
      },
      {
        id: 'ganda_tr',
        name: 'Ganda',
        localName: 'গণ্ডা',
        sqMeters: 67.45,
        description: '1 Ganda = 1/24th Kani = 67.45 m²',
      },
      {
        id: 'katha_tr',
        name: 'Katha',
        localName: 'কাঠা',
        sqMeters: 66.89,
        description: '1/20th Bigha = 66.89 m²',
      },
    ],
  },
  {
    state: 'Manipur',
    commonName: 'Manipur',
    primaryUnit: 'bigha_mn',
    units: [
      {
        id: 'bigha_mn',
        name: 'Bigha',
        localName: 'বিঘা',
        sqMeters: 1337.8,
        description: '1 Bigha (Manipur standard) = 1,337.80 m²',
      },
      {
        id: 'katha_mn',
        name: 'Katha',
        localName: 'কঠা',
        sqMeters: 267.56,
        description: '1 Katha = 267.56 m²',
      },
      {
        id: 'sangam_mn',
        name: 'Sangam',
        localName: 'সাঙ্গম',
        sqMeters: 4046.86,
        description: '1 Sangam = 1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Meghalaya',
    commonName: 'Meghalaya',
    primaryUnit: 'bigha_ml',
    units: [
      {
        id: 'bigha_ml',
        name: 'Bigha',
        localName: 'Bigha',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'katha_ml',
        name: 'Katha',
        localName: 'Katha',
        sqMeters: 267.56,
        description: '1 Katha = 267.56 m²',
      },
      {
        id: 'acre_ml',
        name: 'Acre',
        localName: 'Acre',
        sqMeters: 4046.86,
        description: '1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Nagaland',
    commonName: 'Nagaland',
    primaryUnit: 'bigha_nl',
    units: [
      {
        id: 'bigha_nl',
        name: 'Bigha',
        localName: 'Bigha',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'katha_nl',
        name: 'Katha',
        localName: 'Katha',
        sqMeters: 267.56,
        description: '1 Katha = 267.56 m²',
      },
      {
        id: 'hectare_nl',
        name: 'Hectare',
        localName: 'Hectare',
        sqMeters: 10000.0,
        description: 'Jhum terrace registry standard (10,000 m²)',
      },
    ],
  },
  {
    state: 'Mizoram',
    commonName: 'Mizoram',
    primaryUnit: 'bigha_mz',
    units: [
      {
        id: 'bigha_mz',
        name: 'Bigha',
        localName: 'Bigha',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'tin_mz',
        name: 'Tin Seed Area',
        localName: 'Tin',
        sqMeters: 809.37,
        description: 'Traditional 1 Tin sowing plot = ~809.37 m²',
      },
      {
        id: 'hectare_mz',
        name: 'Hectare',
        localName: 'Hectare',
        sqMeters: 10000.0,
        description: '1 Hectare = 10,000 m²',
      },
    ],
  },
  {
    state: 'Arunachal Pradesh',
    commonName: 'Arunachal Pradesh',
    primaryUnit: 'bigha_ar',
    units: [
      {
        id: 'bigha_ar',
        name: 'Bigha',
        localName: 'Bigha',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'katha_ar',
        name: 'Katha',
        localName: 'Katha',
        sqMeters: 267.56,
        description: '1 Katha = 267.56 m²',
      },
      {
        id: 'acre_ar',
        name: 'Acre',
        localName: 'Acre',
        sqMeters: 4046.86,
        description: '1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Sikkim',
    commonName: 'Sikkim',
    primaryUnit: 'bigha_sk',
    units: [
      {
        id: 'bigha_sk',
        name: 'Bigha',
        localName: 'बीघा',
        sqMeters: 1337.8,
        description: '1 Bigha = 1,337.80 m²',
      },
      {
        id: 'katha_sk',
        name: 'Katha',
        localName: 'कट्ठा',
        sqMeters: 66.89,
        description: '1 Katha = 66.89 m²',
      },
      {
        id: 'kani_sk',
        name: 'Kani / Seed Unit',
        localName: 'कानी',
        sqMeters: 1618.74,
        description: '1 Kani = 1,618.74 m²',
      },
    ],
  },
  {
    state: 'Jammu and Kashmir',
    commonName: 'Jammu & Kashmir (UT)',
    primaryUnit: 'kanal_jk_ut',
    units: [
      {
        id: 'kanal_jk_ut',
        name: 'Kanal',
        localName: 'کنال / कनाल',
        sqMeters: 505.85,
        description: '1 Kanal = 20 Marla = 5,445 sq ft = 505.85 m²',
      },
      {
        id: 'marla_jk_ut',
        name: 'Marla',
        localName: 'مرلہ / मरला',
        sqMeters: 25.29,
        description: '1 Marla = 272.25 sq ft = 25.29 m²',
      },
      {
        id: 'sarsahi_jk_ut',
        name: 'Sarsahi',
        localName: 'सरसाही',
        sqMeters: 2.81,
        description: '1/9th Marla = 2.81 m²',
      },
    ],
  },
  {
    state: 'Ladakh',
    commonName: 'Ladakh (UT)',
    primaryUnit: 'kanal_ladakh',
    units: [
      {
        id: 'kanal_ladakh',
        name: 'Kanal',
        localName: 'Kanal',
        sqMeters: 505.85,
        description: '1 Kanal = 20 Marla = 505.85 m²',
      },
      {
        id: 'khal_ladakh',
        name: 'Khal (Seed measure)',
        localName: 'Khal',
        sqMeters: 607.0,
        description: 'Traditional sowing unit = ~607 m²',
      },
      {
        id: 'marla_ladakh',
        name: 'Marla',
        localName: 'Marla',
        sqMeters: 25.29,
        description: '1 Marla = 25.29 m²',
      },
    ],
  },
  {
    state: 'Delhi (NCT)',
    commonName: 'Delhi (NCT)',
    primaryUnit: 'bigha_dl',
    units: [
      {
        id: 'bigha_dl',
        name: 'Bigha (Delhi)',
        localName: 'बीघा',
        sqMeters: 842.8,
        description: '1 Bigha (Delhi) = 20 Biswa = 842.80 m²',
      },
      {
        id: 'biswa_dl',
        name: 'Biswa',
        localName: 'बिस्वा',
        sqMeters: 42.14,
        description: '1 Biswa = 42.14 m²',
      },
      {
        id: 'killa_dl',
        name: 'Killa / Acre',
        localName: 'किल्ला / एकड़',
        sqMeters: 4046.8564,
        description: '1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Chandigarh',
    commonName: 'Chandigarh (UT)',
    primaryUnit: 'killa_chd',
    units: [
      {
        id: 'killa_chd',
        name: 'Killa (Acre)',
        localName: 'ਕਿੱਲਾ / किल्ला',
        sqMeters: 4046.8564,
        description: '1 Killa = 8 Kanal = 4,046.86 m²',
      },
      {
        id: 'kanal_chd',
        name: 'Kanal',
        localName: 'ਕਨਾਲ',
        sqMeters: 505.857,
        description: '1 Kanal = 20 Marlas = 505.86 m²',
      },
      {
        id: 'marla_chd',
        name: 'Marla',
        localName: 'ਮਰਲਾ',
        sqMeters: 25.2928,
        description: '1 Marla = 25.29 m²',
      },
    ],
  },
  {
    state: 'Puducherry',
    commonName: 'Puducherry (UT)',
    primaryUnit: 'kuzhi_py',
    units: [
      {
        id: 'kuzhi_py',
        name: 'Kuzhi',
        localName: 'குழி',
        sqMeters: 13.378,
        description: '1 Kuzhi = 144 sq ft = 13.38 m²',
      },
      {
        id: 'kani_py',
        name: 'Kani',
        localName: 'காணி',
        sqMeters: 5347.2,
        description: '1 Kani = 400 Kuzhi = 5,347.20 m²',
      },
      {
        id: 'ground_py',
        name: 'Ground',
        localName: 'கிரவுண்டு',
        sqMeters: 222.96,
        description: '1 Ground = 2,400 sq ft = 222.96 m²',
      },
    ],
  },
  {
    state: 'Andaman and Nicobar Islands',
    commonName: 'Andaman & Nicobar Islands (UT)',
    primaryUnit: 'hectare_an',
    units: [
      {
        id: 'hectare_an',
        name: 'Hectare',
        localName: 'हेक्टेयर',
        sqMeters: 10000,
        description: '1 Hectare = 10,000 m² (2.471 Acres)',
      },
      {
        id: 'acre_an',
        name: 'Acre',
        localName: 'एकड़',
        sqMeters: 4046.8564,
        description: '1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    commonName: 'Dadra & Nagar Haveli and Daman & Diu (UT)',
    primaryUnit: 'vigha_dnh',
    units: [
      {
        id: 'vigha_dnh',
        name: 'Vigha / Bigha',
        localName: 'વીઘા / बीघा',
        sqMeters: 2378.0,
        description: '1 Vigha = 2,378.00 m²',
      },
      {
        id: 'guntha_dnh',
        name: 'Guntha',
        localName: 'गुंठा',
        sqMeters: 101.17,
        description: '1 Guntha = 101.17 m²',
      },
      {
        id: 'acre_dnh',
        name: 'Acre',
        localName: 'एकड़',
        sqMeters: 4046.8564,
        description: '1 Acre = 4,046.86 m²',
      },
    ],
  },
  {
    state: 'Lakshadweep',
    commonName: 'Lakshadweep (UT)',
    primaryUnit: 'cent_lk',
    units: [
      {
        id: 'cent_lk',
        name: 'Cent',
        localName: 'സെന്റ്',
        sqMeters: 40.4686,
        description: '1 Cent = 435.6 sq ft = 40.47 m²',
      },
      {
        id: 'acre_lk',
        name: 'Acre',
        localName: 'ഏക്കർ',
        sqMeters: 4046.8564,
        description: '1 Acre = 100 Cents = 4,046.86 m²',
      },
    ],
  },
];

export const STANDARD_UNITS = [
  { id: 'sqm', name: 'Square Meters (m²)', sqMeters: 1 },
  { id: 'acre', name: 'Acres', sqMeters: 4046.8564 },
  { id: 'hectare', name: 'Hectares (ha)', sqMeters: 10000 },
  { id: 'sqft', name: 'Square Feet (sq ft)', sqMeters: 0.092903 },
];

export function findUnitById(unitId: string) {
  for (const group of INDIAN_STATE_UNITS) {
    const found = group.units.find((u) => u.id === unitId);
    if (found) return { unit: found, group };
  }
  return null;
}

export function getStateUnitsGroup(state: IndianState): StateUnitGroup {
  const group = INDIAN_STATE_UNITS.find((g) => g.state === state);
  return group || INDIAN_STATE_UNITS[0];
}

export function getPrimaryUnitForState(state: IndianState): LandUnit {
  const group = getStateUnitsGroup(state);
  const primary = group.units.find((u) => u.id === group.primaryUnit) || group.units[0];
  return primary;
}

export function convertSqmToUnit(areaSqm: number, unit: LandUnit): number {
  if (!unit || !unit.sqMeters || unit.sqMeters <= 0) return areaSqm / 4046.8564;
  return Number((areaSqm / unit.sqMeters).toFixed(3));
}

export function convertArea(
  value: number,
  fromSqMeters: number
): {
  sqMeters: number;
  acres: number;
  hectares: number;
  sqFeet: number;
} {
  const sqMeters = value * fromSqMeters;
  return {
    sqMeters: Number(sqMeters.toFixed(2)),
    acres: Number((sqMeters / 4046.8564).toFixed(4)),
    hectares: Number((sqMeters / 10000).toFixed(4)),
    sqFeet: Number((sqMeters / 0.092903).toFixed(1)),
  };
}

export function formatAreaInLocalUnit(
  areaSqm: number,
  unit?: LandUnit | null,
  options?: {
    showLocalScript?: boolean;
    showAcresSecondary?: boolean;
    showSqmSecondary?: boolean;
  }
): {
  primaryText: string;
  secondaryText: string;
  fullBadgeText: string;
  valueInUnit: number;
} {
  const targetUnit = unit || INDIAN_STATE_UNITS[0].units[0];
  const valueInUnit = Number((areaSqm / targetUnit.sqMeters).toFixed(3));
  const acres = Number((areaSqm / 4046.8564).toFixed(3));
  const sqmFormatted = areaSqm.toLocaleString(undefined, { maximumFractionDigits: 1 });

  const localNameStr = (options?.showLocalScript !== false && targetUnit.localName)
    ? ` (${targetUnit.localName})`
    : '';

  const primaryText = `${valueInUnit} ${targetUnit.name}${localNameStr}`;

  // Check if unit is essentially an Acre/Killa of standard size
  const isStandardAcre = Math.abs(targetUnit.sqMeters - 4046.8564) < 1;

  let secondaryText = '';
  if (isStandardAcre) {
    secondaryText = `${sqmFormatted} m²`;
  } else {
    secondaryText = `${acres} Acres • ${sqmFormatted} m²`;
  }

  const fullBadgeText = isStandardAcre
    ? `${valueInUnit} ${targetUnit.name}${localNameStr} (${sqmFormatted} m²)`
    : `${valueInUnit} ${targetUnit.name}${localNameStr} (${acres} Acres • ${sqmFormatted} m²)`;

  return {
    primaryText,
    secondaryText,
    fullBadgeText,
    valueInUnit,
  };
}
