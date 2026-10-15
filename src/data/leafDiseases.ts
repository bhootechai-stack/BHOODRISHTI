import { LeafDisease } from '../types';

export const SAMPLE_DISEASED_LEAVES: LeafDisease[] = [
  {
    id: 'wheat-yellow-rust',
    crop: 'Wheat (गेहूं)',
    diseaseName: 'Yellow Rust / Stripe Rust (पीला रतुआ)',
    scientificName: 'Puccinia striiformis f. sp. tritici',
    confidence: 94.8,
    severity: 'High',
    symptoms: [
      'Bright yellow to orange-yellow pustules forming distinct parallel stripes along leaf veins.',
      'Powdery spore dust rubs off easily onto fingers or clothing.',
      'Accelerated chlorosis and drying of the flag leaf leading to shriveled grain fill.',
    ],
    chemicalRemedy: {
      compound: 'Propiconazole 25% EC (Tilt / Bumper) or Tebuconazole 25.9% EC',
      dosage: '200 ml mixed in 200 Litres of water per acre.',
      schedule: 'First spray at initial appearance of yellow stripes; repeat after 12-15 days if cool humid weather continues.',
      precautions: 'Ensure uniform spray coverage on lower and upper canopy before 11:00 AM or after 4:00 PM.',
    },
    organicRemedy: {
      title: 'Fermented Buttermilk + Copper Pot Spray (खट्टी छाछ + तांबा का घोल)',
      ingredients: [
        '5 Litres sour desi cow buttermilk (5-7 days old)',
        'Copper vessel or copper wire placed inside buttermilk for 5 days',
        '200 ml Neem oil (cold pressed 10,000 ppm)',
        '100 Litres clean water',
      ],
      preparation:
        'Store 5L sour buttermilk in a plastic or earthen pot with a copper piece submerged for 5 days until a greenish tint forms (copper lactate fungicide). Filter thoroughly and mix with 100L water and 200ml neem oil.',
      application:
        'Foliar spray across 1 acre in the evening. Acts as a broad-spectrum natural fungicide with copper ions blocking rust urediniospores.',
    },
  },
  {
    id: 'rice-blast',
    crop: 'Paddy / Rice (धान)',
    diseaseName: 'Rice Leaf Blast (झुलसा रोग)',
    scientificName: 'Magnaporthe oryzae',
    confidence: 91.3,
    severity: 'High',
    symptoms: [
      'Spindle-shaped or diamond-shaped lesions with grayish-white centers and brown margins.',
      'Spots coalesce during high relative humidity (>90%) causing leaf tips to scorch.',
      'Node and neck rot weakening the panicle base.',
    ],
    chemicalRemedy: {
      compound: 'Tricyclazole 75% WP (Beam / Baan) or Isoprothiolane 40% EC',
      dosage: '120 grams Tricyclazole in 150-200 Litres water per acre.',
      schedule: 'Apply at early tillering or panicle emergence when dew formation is prolonged.',
      precautions: 'Avoid excess split nitrogen applications (Urea) when blast symptoms are active.',
    },
    organicRemedy: {
      title: 'Dashparni Ark & Raw Garlic-Chili Extract (दशपर्णी अर्क)',
      ingredients: [
        '2 Litres fermented Dashparni Ark',
        '500g crushed garlic + 250g hot green chillies paste',
        '200g Desi cow dung ash',
        '150 Litres water',
      ],
      preparation:
        'Boil garlic-chili paste in 5L water for 15 mins. Cool, filter, and blend with fermented Dashparni herbal extract. Dissolve in 150L water per acre.',
      application:
        'Spray during morning hours. Garlic allicin compounds disrupt blast mycelium penetration while boosting leaf silica defenses.',
    },
  },
  {
    id: 'cotton-leaf-curl',
    crop: 'Cotton (कपास)',
    diseaseName: 'Cotton Leaf Curl Virus - CLCuV (पत्ता मरोड़)',
    scientificName: 'Begomovirus / Whitefly Vector',
    confidence: 88.6,
    severity: 'Moderate',
    symptoms: [
      'Upward and downward curling of leaf margins with prominent vein thickening.',
      'Enations (small leaf-like outgrowths) forming on the underside of main veins.',
      'Severe stunting and reduced boll formation.',
    ],
    chemicalRemedy: {
      compound: 'Diafenthiuron 50% WP (Pegasus) or Pyriproxyfen 10% EC for whitefly vector control',
      dosage: '250 grams Diafenthiuron in 200 Litres water per acre.',
      schedule: 'Spray as soon as whitefly population exceeds 6-8 nymphs/adults per leaf.',
      precautions: 'Rotate chemical groups (avoid back-to-back synthetic pyrethroids) to prevent whitefly resistance.',
    },
    organicRemedy: {
      title: 'Neem-Cow Urine Bio-Shield (नीमार्क + गोमूत्र काढ़ा)',
      ingredients: [
        '5 Litres fresh Desi cow urine (गोमूत्र)',
        '5 kg crushed Neem leaves (boiled in 10L water for 2 hours)',
        '250g turmeric powder (एंटी-वायरल हल्दी)',
        '150 Litres water',
      ],
      preparation:
        'Mix filtered boiled neem decoction with 5L aged cow urine and pure curcumin turmeric powder. Dilute in 150L water.',
      application:
        'Spray at 7-day intervals. Cow urine acts as a natural systemic antiviral stimulant while Azadirachtin repels whitefly vectors.',
    },
  },
  {
    id: 'sugarcane-red-rot',
    crop: 'Sugarcane (गन्ना)',
    diseaseName: 'Red Rot of Sugarcane (लाल सड़न)',
    scientificName: 'Colletotrichum falcatum',
    confidence: 93.1,
    severity: 'Severe',
    symptoms: [
      'Discoloration and withering of the 3rd and 4th upper leaves (spindle leaf drying).',
      'Longitudinal splitting reveals red internal pith with diagnostic white transverse bands.',
      'Alcoholic / sour fermentation odor inside infected stalks.',
    ],
    chemicalRemedy: {
      compound: 'Carbendazim 50% WP (Bavistin) or Carbendazim + Mancozeb (Saaf)',
      dosage: '250 grams per 100 Litres water for sett soaking before planting; foliar drench at base 500g/acre.',
      schedule: 'Pre-sowing sett treatment (30 mins dip) + root zone drenching at early cane emergence.',
      precautions: 'Rogue out and burn infected clumps immediately to prevent canal water dissemination.',
    },
    organicRemedy: {
      title: 'Trichoderma Viride Bio-Enriched FYM (ट्राइकोडर्मा जैविक उपचार)',
      ingredients: [
        '2.5 kg Trichoderma viride / harzianum (2x10^8 cfu/g)',
        '100 kg well-decomposed Farm Yard Manure (गोबर खाद)',
        '5 kg Jaggery (गुड़) syrup for fungal multiplication',
      ],
      preparation:
        'Mix Trichoderma in moist FYM with jaggery water. Cover with jute sack in shade for 7 days until dense green fungal spore mat develops.',
      application:
        'Broadcast in cane furrows near root zone before earthing-up. Trichoderma aggressively parasitizes Colletotrichum pathogen.',
    },
  },
  {
    id: 'tomato-early-blight',
    crop: 'Tomato / Potato (टमाटर / आलू)',
    diseaseName: 'Early Blight & Alternaria Spot (अगेती झुलसा)',
    scientificName: 'Alternaria solani',
    confidence: 96.2,
    severity: 'Moderate',
    symptoms: [
      'Concentric dark brown rings on older lower leaves resembling a "target board" pattern.',
      'Surrounding tissue turns chlorotic yellow, leading to premature leaf defoliation.',
      'Sunken brown spots with dark velvety margins on stem branches and fruit calyx.',
    ],
    chemicalRemedy: {
      compound: 'Mancozeb 75% WP (Dithane M-45) or Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
      dosage: '600g Mancozeb or 200ml Azoxystrobin blend in 200 Litres water per acre.',
      schedule: 'Start preventative spray at fruit setting; repeat at 10-day intervals if dew is heavy.',
      precautions: 'Do not overhead sprinkler irrigate; switch to drip to keep leaf canopy dry.',
    },
    organicRemedy: {
      title: 'Jeevamrit & Wood Ash Foliar Dust (जीवामृत + लकड़ी की राख)',
      ingredients: [
        '10 Litres liquid Jeevamrit (जीवामृत)',
        '5 kg sifted dry wood ash (लकड़ी की राख)',
        '100 Litres clean water',
      ],
      preparation:
        'Filter 10L mature Jeevamrit through double muslin cloth. Blend with water. Separately dust fine wood ash on wet foliage in early morning.',
      application:
        'Foliar spray Jeevamrit bi-weekly. Beneficial microbes outcompete Alternaria conidia while potassium in ash fortifies cell walls.',
    },
  },
];
