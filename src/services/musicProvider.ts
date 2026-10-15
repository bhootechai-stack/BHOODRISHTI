/**
 * Legal Music Provider Adapter for BhooTech AI Companion
 * Adheres to copyright compliance by providing legal, official search and stream links
 * via official web players (YouTube Music, Spotify, JioSaavn).
 * No scraping, no pirated audio downloads, no DRM bypassing.
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'haryanvi' | 'punjabi' | 'bhajan' | 'bansuri' | 'bhojpuri' | 'marathi' | 'himachali' | 'general';
  provider: 'YouTube Music' | 'Spotify' | 'JioSaavn';
  url: string;
  thumbnail?: string;
  description: string;
}

export interface MusicSearchResult {
  query: string;
  track: MusicTrack;
  alternateTracks?: MusicTrack[];
  providerUrl: string;
}

// Curated legal tracks and official search mappings for Indian regional farmer entertainment
export const CURATED_MUSIC_CATALOG: Record<string, MusicTrack[]> = {
  haryanvi: [
    {
      id: 'hr-1',
      title: 'Haryanvi Desi Kisan Ragni & Folk Hits',
      artist: 'Desi Haryana Folk Masters',
      category: 'haryanvi',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Haryanvi+Kisan+Ragni+Folk+Songs',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      description: 'पारंपरिक हरियाणवी रागनी, लोकगीत और ताऊ की महफ़िल की धुनें',
    },
    {
      id: 'hr-2',
      title: 'Top Haryanvi Melodies & Dhol Beats',
      artist: 'Regional Haryanvi Artists',
      category: 'haryanvi',
      provider: 'Spotify',
      url: 'https://open.spotify.com/search/Haryanvi%20Top%20Hits',
      thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80',
      description: 'ऊर्जावान हरियाणवी देसी धुनें और खेत के सफर के गाने',
    },
  ],
  punjabi: [
    {
      id: 'pb-1',
      title: 'Punjabi Folk & Farming Songs (ਕਿਸਾਨ ਗੀਤ)',
      artist: 'Legendary Punjabi Folk Artists',
      category: 'punjabi',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Punjabi+Folk+Kisan+Geet',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
      description: 'ਪੰਜਾਬੀ ਸੱਭਿਆਚਾਰਕ ਲੋਕ ਗੀਤ ਅਤੇ ਖੇਤਾਂ ਦੀ ਰੌਣਕ',
    },
    {
      id: 'pb-2',
      title: 'Pure Punjabi Bhangra & Melodies',
      artist: 'Top Punjabi Singers',
      category: 'punjabi',
      provider: 'Spotify',
      url: 'https://open.spotify.com/search/Punjabi%20Folk%20Hits',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80',
      description: 'ਚੜ੍ਹਦੀ ਕਲਾ ਦੇ ਗੀਤ ਅਤੇ ਮਧੁਰ ਪੰਜਾਬੀ ਸੰਗੀਤ',
    },
  ],
  bhajan: [
    {
      id: 'bj-1',
      title: 'प्रातःकालीन शिव भजन एवं ॐ नमः शिवाय धुन',
      artist: 'भक्ति संगीत एवं मन्त्र',
      category: 'bhajan',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Morning+Shiv+Bhajan+and+Aarti',
      thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=200&auto=format&fit=crop&q=80',
      description: 'सुबह खेत में मन को शांति देने वाली दिव्य शिव भक्ति धुन',
    },
    {
      id: 'bj-2',
      title: 'श्री हनुमान चालीसा एवं संकटमोचन पाठ',
      artist: 'पवित्र भजन संग्रह',
      category: 'bhajan',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Shri+Hanuman+Chalisa+Hariharan',
      thumbnail: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=200&auto=format&fit=crop&q=80',
      description: 'सकारात्मक ऊर्जा और शक्ति का संचार करने वाली भक्ति धुन',
    },
    {
      id: 'bj-3',
      title: 'मधुर कृष्ण भजन एवं प्रभाती',
      artist: 'भक्ति सागर',
      category: 'bhajan',
      provider: 'Spotify',
      url: 'https://open.spotify.com/search/Krishna%20Bhajan%20Morning',
      thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&auto=format&fit=crop&q=80',
      description: 'अमृत वेला की मधुर बांसुरी और कृष्ण भजन',
    },
  ],
  bansuri: [
    {
      id: 'bn-1',
      title: 'मन को शांत करने वाली शुद्ध भारतीय बांसुरी धुन (Bansuri Raga)',
      artist: 'भारतीय शास्त्रीय वादक',
      category: 'bansuri',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Indian+Classical+Flute+Bansuri+Meditation',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      description: 'खेत में काम करते समय और विश्राम के समय मन को शांति देने वाला राग',
    },
    {
      id: 'bn-2',
      title: 'सावन की बारिश एवं कोमल बाँसुरी राग',
      artist: 'नेचर साउंडस्केप्स एवं बांसुरी',
      category: 'bansuri',
      provider: 'Spotify',
      url: 'https://open.spotify.com/search/Indian%20Flute%20Rain%20Relaxation',
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
      description: 'मिट्टी की सोंधी खुशबू और बारिश की बूंदों के साथ बांसुरी',
    },
  ],
  himachali: [
    {
      id: 'hm-1',
      title: 'हिमाचली पहाड़ी नाटी एवं पारंपरिक लोकगीत',
      artist: 'पहाड़ी लोक गायक',
      category: 'himachali',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Himachali+Pahari+Nati+Folk+Songs',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop&q=80',
      description: 'शिमला, कांगड़ा, मंडी और कुल्लू की प्रसिद्ध पहाड़ी नाटी और धुनें',
    },
  ],
  bhojpuri: [
    {
      id: 'bh-1',
      title: 'पारंपरिक भोजपुरी निर्गुण एवं सोहर भजन',
      artist: 'भोजपुरी लोक गायक',
      category: 'bhojpuri',
      provider: 'YouTube Music',
      url: 'https://music.youtube.com/search?q=Bhojpuri+Nirgun+and+Bhajan',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      description: 'देहाती लोक संगीत और आध्यात्मिक निर्गुण',
    },
  ],
};

/**
 * Searches and adapts music requests to legitimate streaming providers.
 */
export function searchLegalMusic(userQuery: string, dialectId?: string): MusicSearchResult {
  const clean = userQuery.toLowerCase().trim();

  // 1. Detect category from query or spoken dialect
  let matchedCategory: keyof typeof CURATED_MUSIC_CATALOG = 'bansuri';

  if (clean.includes('bhajan') || clean.includes('aarti') || clean.includes('shiv') || clean.includes('krishna') || clean.includes('hanuman') || clean.includes('bhakti')) {
    matchedCategory = 'bhajan';
  } else if (clean.includes('haryanvi') || clean.includes('ragni') || clean.includes('tau') || (dialectId === 'haryanvi' && (clean.includes('gaana') || clean.includes('gana')))) {
    matchedCategory = 'haryanvi';
  } else if (clean.includes('punjabi') || clean.includes('bhangra') || (dialectId?.startsWith('punjabi') && (clean.includes('gaana') || clean.includes('geet')))) {
    matchedCategory = 'punjabi';
  } else if (clean.includes('himachali') || clean.includes('pahari') || clean.includes('nati') || dialectId === 'himachali') {
    matchedCategory = 'himachali';
  } else if (clean.includes('bhojpuri') || clean.includes('nirgun') || dialectId === 'bhojpuri' || dialectId === 'awadhi_dehati') {
    matchedCategory = 'bhojpuri';
  } else if (clean.includes('flute') || clean.includes('bansuri') || clean.includes('raga') || clean.includes('dhun') || clean.includes('rain') || clean.includes('shanti')) {
    matchedCategory = 'bansuri';
  } else {
    // Dynamic legal query search
    const cleanSearchQuery = clean
      .replace(/^(chala|baja|gaana|gana|song|music|play|suna|sunao|de|ek|kuch)\s+/gi, '')
      .replace(/\s+(chala|baja|gaana|gana|song|music|play|suna|sunao|de)$/gi, '')
      .trim();

    const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(cleanSearchQuery || 'Indian rural folk hits')}`;
    return {
      query: userQuery,
      track: {
        id: `search-${Date.now()}`,
        title: cleanSearchQuery ? `"${cleanSearchQuery}" - आधिकारिक संगीत खोज` : 'लोकप्रिय भारतीय किसान धुनें एवं संगीत',
        artist: 'YouTube Music & Official Artists',
        category: 'general',
        provider: 'YouTube Music',
        url: searchUrl,
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        description: 'आधिकारिक वैध संगीत मंच पर तुरंत सुनें, खेत में काम करते समय एक क्लिक में आनंद लें।',
      },
      providerUrl: searchUrl,
    };
  }

  const catalog = CURATED_MUSIC_CATALOG[matchedCategory] || CURATED_MUSIC_CATALOG['bansuri'];
  const primaryTrack = catalog[0];
  const alternates = catalog.slice(1);

  return {
    query: userQuery,
    track: primaryTrack,
    alternateTracks: alternates,
    providerUrl: primaryTrack.url,
  };
}
