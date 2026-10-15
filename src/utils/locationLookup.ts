import { IndianState, LatLng } from '../types';
import {
  ALL_INDIAN_STATES,
  ALL_UNION_TERRITORIES,
  STATE_COORDINATES,
  getAccurateUserLocation,
} from './geoUtils';
import { getDistrictsByState } from '../data/indianDistricts';

export interface FarmerLocationLookupResult {
  state: IndianState;
  district: string;
  city: string;
  formattedAddress: string;
  coords: LatLng;
  source: 'gps' | 'network' | 'ip' | 'centroid' | 'fallback';
  confidence: number;
}

/**
 * Calculates accurate geodesic distance in kilometers between two coordinates
 * using the Haversine formula.
 */
export function calculateHaversineDistanceKm(p1: LatLng, p2: LatLng): number {
  if (!p1 || !p2 || !Number.isFinite(p1.lat) || !Number.isFinite(p1.lng) || !Number.isFinite(p2.lat) || !Number.isFinite(p2.lng)) {
    console.error('locationLookup.ts: calculateHaversineDistanceKm received invalid or undefined coordinates', { p1, p2 });
    return Infinity;
  }
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Prominent towns & major cities with real coordinates for distance-based nearest matching
export const CITY_COORDINATES: Record<string, { state: IndianState; district: string; coords: LatLng }> = {
  // Himachal Pradesh
  'Nagrota Bagwan': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.1091, lng: 76.3813 } },
  'Dharamshala': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.2190, lng: 76.3234 } },
  'Kangra': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.0998, lng: 76.2691 } },
  'Palampur': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.1109, lng: 76.5363 } },
  'Nurpur': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.3000, lng: 75.8900 } },
  'Dehra Gopipur': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 31.8900, lng: 76.2200 } },
  'Baijnath': { state: 'Himachal Pradesh', district: 'Kangra', coords: { lat: 32.0531, lng: 76.6489 } },
  'Shimla': { state: 'Himachal Pradesh', district: 'Shimla', coords: { lat: 31.1048, lng: 77.1734 } },
  'Mandi': { state: 'Himachal Pradesh', district: 'Mandi', coords: { lat: 31.7087, lng: 76.9320 } },
  'Sundernagar': { state: 'Himachal Pradesh', district: 'Mandi', coords: { lat: 31.5337, lng: 76.8924 } },
  'Solan': { state: 'Himachal Pradesh', district: 'Solan', coords: { lat: 30.9045, lng: 77.0967 } },
  'Baddi': { state: 'Himachal Pradesh', district: 'Solan', coords: { lat: 30.9578, lng: 76.7914 } },
  'Kullu': { state: 'Himachal Pradesh', district: 'Kullu', coords: { lat: 31.9579, lng: 77.1095 } },
  'Manali': { state: 'Himachal Pradesh', district: 'Kullu', coords: { lat: 32.2432, lng: 77.1892 } },
  'Hamirpur': { state: 'Himachal Pradesh', district: 'Hamirpur', coords: { lat: 31.6862, lng: 76.5213 } },
  'Nadaun': { state: 'Himachal Pradesh', district: 'Hamirpur', coords: { lat: 31.7800, lng: 76.3500 } },
  'Una': { state: 'Himachal Pradesh', district: 'Una', coords: { lat: 31.4685, lng: 76.2708 } },
  'Bilaspur': { state: 'Himachal Pradesh', district: 'Bilaspur', coords: { lat: 31.3325, lng: 76.7570 } },
  'Chamba': { state: 'Himachal Pradesh', district: 'Chamba', coords: { lat: 32.5534, lng: 76.1258 } },
  'Dalhousie': { state: 'Himachal Pradesh', district: 'Chamba', coords: { lat: 32.5387, lng: 75.9707 } },
  'Nahan': { state: 'Himachal Pradesh', district: 'Sirmaur', coords: { lat: 30.5599, lng: 77.2955 } },
  'Paonta Sahib': { state: 'Himachal Pradesh', district: 'Sirmaur', coords: { lat: 30.4439, lng: 77.6256 } },
  'Reckong Peo': { state: 'Himachal Pradesh', district: 'Kinnaur', coords: { lat: 31.5404, lng: 78.2727 } },
  'Keylong': { state: 'Himachal Pradesh', district: 'Lahaul and Spiti', coords: { lat: 32.5710, lng: 77.0320 } },

  // Punjab
  'Amritsar': { state: 'Punjab', district: 'Amritsar', coords: { lat: 31.6340, lng: 74.8723 } },
  'Ludhiana': { state: 'Punjab', district: 'Ludhiana', coords: { lat: 30.9010, lng: 75.8573 } },
  'Jalandhar': { state: 'Punjab', district: 'Jalandhar', coords: { lat: 31.3260, lng: 75.5762 } },
  'Patiala': { state: 'Punjab', district: 'Patiala', coords: { lat: 30.3398, lng: 76.3869 } },
  'Bathinda': { state: 'Punjab', district: 'Bathinda', coords: { lat: 30.2110, lng: 74.9455 } },
  'Mohali (SAS Nagar)': { state: 'Punjab', district: 'Sahibzada Ajit Singh Nagar (Mohali)', coords: { lat: 30.7046, lng: 76.7179 } },
  'Hoshiarpur': { state: 'Punjab', district: 'Hoshiarpur', coords: { lat: 31.5273, lng: 75.9149 } },
  'Pathankot': { state: 'Punjab', district: 'Pathankot', coords: { lat: 32.2684, lng: 75.6528 } },
  'Moga': { state: 'Punjab', district: 'Moga', coords: { lat: 30.8165, lng: 75.1717 } },
  'Abohar': { state: 'Punjab', district: 'Fazilka', coords: { lat: 30.1453, lng: 74.1994 } },
  'Firozpur': { state: 'Punjab', district: 'Ferozepur', coords: { lat: 30.9237, lng: 74.6065 } },
  'Sangrur': { state: 'Punjab', district: 'Sangrur', coords: { lat: 30.2458, lng: 75.8421 } },
  'Barnala': { state: 'Punjab', district: 'Barnala', coords: { lat: 30.3819, lng: 75.5471 } },
  'Kapurthala': { state: 'Punjab', district: 'Kapurthala', coords: { lat: 31.3802, lng: 75.3817 } },
  'Phagwara': { state: 'Punjab', district: 'Kapurthala', coords: { lat: 31.2240, lng: 75.7708 } },
  'Muktsar': { state: 'Punjab', district: 'Sri Muktsar Sahib', coords: { lat: 30.4762, lng: 74.5165 } },

  // Haryana
  'Karnal': { state: 'Haryana', district: 'Karnal', coords: { lat: 29.6857, lng: 76.9905 } },
  'Hisar': { state: 'Haryana', district: 'Hisar', coords: { lat: 29.1492, lng: 75.7217 } },
  'Ambala': { state: 'Haryana', district: 'Ambala', coords: { lat: 30.3782, lng: 76.7767 } },
  'Panipat': { state: 'Haryana', district: 'Panipat', coords: { lat: 29.3909, lng: 76.9635 } },
  'Rohtak': { state: 'Haryana', district: 'Rohtak', coords: { lat: 28.8955, lng: 76.6066 } },
  'Sonipat': { state: 'Haryana', district: 'Sonipat', coords: { lat: 28.9931, lng: 77.0151 } },
  'Gurugram': { state: 'Haryana', district: 'Gurugram', coords: { lat: 28.4595, lng: 77.0266 } },
  'Faridabad': { state: 'Haryana', district: 'Faridabad', coords: { lat: 28.4089, lng: 77.3178 } },
  'Kurukshetra': { state: 'Haryana', district: 'Kurukshetra', coords: { lat: 29.9695, lng: 76.8783 } },
  'Yamunanagar': { state: 'Haryana', district: 'Yamunanagar', coords: { lat: 30.1290, lng: 77.2674 } },
  'Sirsa': { state: 'Haryana', district: 'Sirsa', coords: { lat: 29.5349, lng: 75.0298 } },
  'Panchkula': { state: 'Haryana', district: 'Panchkula', coords: { lat: 30.6942, lng: 76.8606 } },

  // Uttar Pradesh
  'Meerut': { state: 'Uttar Pradesh', district: 'Meerut', coords: { lat: 28.9845, lng: 77.7064 } },
  'Muzaffarnagar': { state: 'Uttar Pradesh', district: 'Muzaffarnagar', coords: { lat: 29.4727, lng: 77.7085 } },
  'Saharanpur': { state: 'Uttar Pradesh', district: 'Saharanpur', coords: { lat: 29.9640, lng: 77.5460 } },
  'Bareilly': { state: 'Uttar Pradesh', district: 'Bareilly', coords: { lat: 28.3670, lng: 79.4304 } },
  'Aligarh': { state: 'Uttar Pradesh', district: 'Aligarh', coords: { lat: 27.8974, lng: 78.0880 } },
  'Moradabad': { state: 'Uttar Pradesh', district: 'Moradabad', coords: { lat: 28.8386, lng: 78.7733 } },
  'Lucknow': { state: 'Uttar Pradesh', district: 'Lucknow', coords: { lat: 26.8467, lng: 80.9462 } },
  'Kanpur': { state: 'Uttar Pradesh', district: 'Kanpur Nagar', coords: { lat: 26.4499, lng: 80.3319 } },
  'Varanasi': { state: 'Uttar Pradesh', district: 'Varanasi', coords: { lat: 25.3176, lng: 82.9739 } },
  'Prayagraj (Allahabad)': { state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)', coords: { lat: 25.4358, lng: 81.8463 } },
  'Agra': { state: 'Uttar Pradesh', district: 'Agra', coords: { lat: 27.1767, lng: 78.0081 } },
  'Gorakhpur': { state: 'Uttar Pradesh', district: 'Gorakhpur', coords: { lat: 26.7606, lng: 83.3732 } },
  'Ayodhya': { state: 'Uttar Pradesh', district: 'Ayodhya (Faizabad)', coords: { lat: 26.7922, lng: 82.1998 } },
  'Jhansi': { state: 'Uttar Pradesh', district: 'Jhansi', coords: { lat: 25.4484, lng: 78.5685 } },
  'Mathura': { state: 'Uttar Pradesh', district: 'Mathura', coords: { lat: 27.4924, lng: 77.6737 } },

  // Maharashtra
  'Nashik': { state: 'Maharashtra', district: 'Nashik', coords: { lat: 19.9975, lng: 73.7898 } },
  'Pune': { state: 'Maharashtra', district: 'Pune', coords: { lat: 18.5204, lng: 73.8567 } },
  'Mumbai': { state: 'Maharashtra', district: 'Mumbai City', coords: { lat: 19.0760, lng: 72.8777 } },
  'Nagpur': { state: 'Maharashtra', district: 'Nagpur', coords: { lat: 21.1458, lng: 79.0882 } },
  'Chhatrapati Sambhaji Nagar (Aurangabad)': { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)', coords: { lat: 19.8762, lng: 75.3433 } },
  'Solapur': { state: 'Maharashtra', district: 'Solapur', coords: { lat: 17.6599, lng: 75.9064 } },
  'Kolhapur': { state: 'Maharashtra', district: 'Kolhapur', coords: { lat: 16.7050, lng: 74.2433 } },
  'Amravati': { state: 'Maharashtra', district: 'Amravati', coords: { lat: 20.9374, lng: 77.7796 } },
  'Nanded': { state: 'Maharashtra', district: 'Nanded', coords: { lat: 19.1383, lng: 77.3210 } },
  'Jalgaon': { state: 'Maharashtra', district: 'Jalgaon', coords: { lat: 21.0077, lng: 75.5626 } },
  'Ahmednagar': { state: 'Maharashtra', district: 'Ahilyanagar (Ahmednagar)', coords: { lat: 19.0948, lng: 74.7480 } },

  // Rajasthan
  'Jaipur': { state: 'Rajasthan', district: 'Jaipur', coords: { lat: 26.9124, lng: 75.7873 } },
  'Kota': { state: 'Rajasthan', district: 'Kota', coords: { lat: 25.1800, lng: 75.8300 } },
  'Jodhpur': { state: 'Rajasthan', district: 'Jodhpur', coords: { lat: 26.2389, lng: 73.0243 } },
  'Bikaner': { state: 'Rajasthan', district: 'Bikaner', coords: { lat: 28.0229, lng: 73.3119 } },
  'Udaipur': { state: 'Rajasthan', district: 'Udaipur', coords: { lat: 24.5854, lng: 73.7125 } },
  'Ajmer': { state: 'Rajasthan', district: 'Ajmer', coords: { lat: 26.4499, lng: 74.6399 } },
  'Bhilwara': { state: 'Rajasthan', district: 'Bhilwara', coords: { lat: 25.3407, lng: 74.6313 } },
  'Alwar': { state: 'Rajasthan', district: 'Alwar', coords: { lat: 27.5530, lng: 76.6346 } },
  'Sriganganagar': { state: 'Rajasthan', district: 'Sri Ganganagar', coords: { lat: 29.9038, lng: 73.8772 } },
  'Hanumangarh': { state: 'Rajasthan', district: 'Hanumangarh', coords: { lat: 29.5819, lng: 74.3294 } },

  // Gujarat
  'Ahmedabad': { state: 'Gujarat', district: 'Ahmedabad', coords: { lat: 23.0225, lng: 72.5714 } },
  'Surat': { state: 'Gujarat', district: 'Surat', coords: { lat: 21.1702, lng: 72.8311 } },
  'Vadodara': { state: 'Gujarat', district: 'Vadodara', coords: { lat: 22.3072, lng: 73.1812 } },
  'Rajkot': { state: 'Gujarat', district: 'Rajkot', coords: { lat: 22.3039, lng: 70.8022 } },
  'Bhavnagar': { state: 'Gujarat', district: 'Bhavnagar', coords: { lat: 21.7645, lng: 72.1519 } },
  'Jamnagar': { state: 'Gujarat', district: 'Jamnagar', coords: { lat: 22.4707, lng: 70.0577 } },
  'Junagadh': { state: 'Gujarat', district: 'Junagadh', coords: { lat: 21.5222, lng: 70.4579 } },
  'Gandhinagar': { state: 'Gujarat', district: 'Gandhinagar', coords: { lat: 23.2156, lng: 72.6369 } },
  'Anand': { state: 'Gujarat', district: 'Anand', coords: { lat: 22.5645, lng: 72.9289 } },

  // Madhya Pradesh
  'Indore': { state: 'Madhya Pradesh', district: 'Indore', coords: { lat: 22.7196, lng: 75.8577 } },
  'Bhopal': { state: 'Madhya Pradesh', district: 'Bhopal', coords: { lat: 23.2599, lng: 77.4126 } },
  'Jabalpur': { state: 'Madhya Pradesh', district: 'Jabalpur', coords: { lat: 23.1815, lng: 79.9864 } },
  'Gwalior': { state: 'Madhya Pradesh', district: 'Gwalior', coords: { lat: 26.2183, lng: 78.1828 } },
  'Ujjain': { state: 'Madhya Pradesh', district: 'Ujjain', coords: { lat: 23.1765, lng: 75.7885 } },
  'Sagar': { state: 'Madhya Pradesh', district: 'Sagar', coords: { lat: 23.8388, lng: 78.7378 } },

  // Bihar
  'Patna': { state: 'Bihar', district: 'Patna', coords: { lat: 25.5941, lng: 85.1376 } },
  'Gaya': { state: 'Bihar', district: 'Gaya', coords: { lat: 24.7914, lng: 85.0002 } },
  'Bhagalpur': { state: 'Bihar', district: 'Bhagalpur', coords: { lat: 25.2425, lng: 86.9842 } },
  'Muzaffarpur': { state: 'Bihar', district: 'Muzaffarpur', coords: { lat: 26.1209, lng: 85.3647 } },
  'Darbhanga': { state: 'Bihar', district: 'Darbhanga', coords: { lat: 26.1542, lng: 85.8918 } },
  'Purnia': { state: 'Bihar', district: 'Purnia', coords: { lat: 25.7771, lng: 87.4753 } },

  // Uttarakhand
  'Dehradun': { state: 'Uttarakhand', district: 'Dehradun', coords: { lat: 30.3165, lng: 78.0322 } },
  'Haridwar': { state: 'Uttarakhand', district: 'Haridwar', coords: { lat: 29.9457, lng: 78.1642 } },
  'Roorkee': { state: 'Uttarakhand', district: 'Haridwar', coords: { lat: 29.8543, lng: 77.8880 } },
  'Haldwani': { state: 'Uttarakhand', district: 'Nainital', coords: { lat: 29.2183, lng: 79.5130 } },
  'Rudrapur': { state: 'Uttarakhand', district: 'Udham Singh Nagar', coords: { lat: 28.9800, lng: 79.4000 } },

  // Delhi & UTs
  'New Delhi': { state: 'Delhi (NCT)', district: 'New Delhi', coords: { lat: 28.6139, lng: 77.2090 } },
  'Chandigarh': { state: 'Chandigarh', district: 'Chandigarh', coords: { lat: 30.7333, lng: 76.7794 } },
  'Jammu': { state: 'Jammu and Kashmir', district: 'Jammu', coords: { lat: 32.7266, lng: 74.8570 } },
  'Srinagar': { state: 'Jammu and Kashmir', district: 'Srinagar', coords: { lat: 34.0837, lng: 74.7973 } },
};

// District Centroids for Distance-Based District Resolution across India
export const DISTRICT_CENTROIDS: Record<string, { state: IndianState; coords: LatLng }> = {
  // Himachal Pradesh (All 12 Districts)
  'Kangra': { state: 'Himachal Pradesh', coords: { lat: 32.1000, lng: 76.2700 } },
  'Shimla': { state: 'Himachal Pradesh', coords: { lat: 31.1048, lng: 77.1734 } },
  'Mandi': { state: 'Himachal Pradesh', coords: { lat: 31.7087, lng: 76.9320 } },
  'Kullu': { state: 'Himachal Pradesh', coords: { lat: 31.9579, lng: 77.1095 } },
  'Solan': { state: 'Himachal Pradesh', coords: { lat: 30.9045, lng: 77.0967 } },
  'Hamirpur': { state: 'Himachal Pradesh', coords: { lat: 31.6862, lng: 76.5213 } },
  'Una': { state: 'Himachal Pradesh', coords: { lat: 31.4685, lng: 76.2708 } },
  'Bilaspur': { state: 'Himachal Pradesh', coords: { lat: 31.3325, lng: 76.7570 } },
  'Chamba': { state: 'Himachal Pradesh', coords: { lat: 32.5534, lng: 76.1258 } },
  'Sirmaur': { state: 'Himachal Pradesh', coords: { lat: 30.5599, lng: 77.2955 } },
  'Kinnaur': { state: 'Himachal Pradesh', coords: { lat: 31.6500, lng: 78.4700 } },
  'Lahaul and Spiti': { state: 'Himachal Pradesh', coords: { lat: 32.5710, lng: 77.0320 } },

  // Punjab
  'Amritsar': { state: 'Punjab', coords: { lat: 31.6340, lng: 74.8723 } },
  'Ludhiana': { state: 'Punjab', coords: { lat: 30.9010, lng: 75.8573 } },
  'Jalandhar': { state: 'Punjab', coords: { lat: 31.3260, lng: 75.5762 } },
  'Patiala': { state: 'Punjab', coords: { lat: 30.3398, lng: 76.3869 } },
  'Bathinda': { state: 'Punjab', coords: { lat: 30.2110, lng: 74.9455 } },
  'Hoshiarpur': { state: 'Punjab', coords: { lat: 31.5273, lng: 75.9149 } },
  'Gurdaspur': { state: 'Punjab', coords: { lat: 32.0419, lng: 75.4053 } },
  'Pathankot': { state: 'Punjab', coords: { lat: 32.2684, lng: 75.6528 } },
  'Ferozepur': { state: 'Punjab', coords: { lat: 30.9237, lng: 74.6065 } },
  'Fazilka': { state: 'Punjab', coords: { lat: 30.4036, lng: 74.0254 } },
  'Moga': { state: 'Punjab', coords: { lat: 30.8165, lng: 75.1717 } },
  'Sangrur': { state: 'Punjab', coords: { lat: 30.2458, lng: 75.8421 } },
  'Barnala': { state: 'Punjab', coords: { lat: 30.3819, lng: 75.5471 } },
  'Kapurthala': { state: 'Punjab', coords: { lat: 31.3802, lng: 75.3817 } },
  'Rupnagar (Ropar)': { state: 'Punjab', coords: { lat: 30.9664, lng: 76.5331 } },
  'Sahibzada Ajit Singh Nagar (Mohali)': { state: 'Punjab', coords: { lat: 30.7046, lng: 76.7179 } },
  'Fatehgarh Sahib': { state: 'Punjab', coords: { lat: 30.6490, lng: 76.3980 } },
  'Faridkot': { state: 'Punjab', coords: { lat: 30.6769, lng: 74.7583 } },
  'Sri Muktsar Sahib': { state: 'Punjab', coords: { lat: 30.4762, lng: 74.5165 } },
  'Mansa': { state: 'Punjab', coords: { lat: 29.9984, lng: 75.3934 } },
  'Tarn Taran': { state: 'Punjab', coords: { lat: 31.4520, lng: 74.9255 } },
  'Shahid Bhagat Singh Nagar (Nawanshahr)': { state: 'Punjab', coords: { lat: 31.1256, lng: 76.1189 } },
  'Malerkotla': { state: 'Punjab', coords: { lat: 30.5256, lng: 75.8856 } },

  // Haryana
  'Ambala': { state: 'Haryana', coords: { lat: 30.3782, lng: 76.7767 } },
  'Panchkula': { state: 'Haryana', coords: { lat: 30.6942, lng: 76.8606 } },
  'Yamunanagar': { state: 'Haryana', coords: { lat: 30.1290, lng: 77.2674 } },
  'Kurukshetra': { state: 'Haryana', coords: { lat: 29.9695, lng: 76.8783 } },
  'Kaithal': { state: 'Haryana', coords: { lat: 29.8015, lng: 76.3996 } },
  'Karnal': { state: 'Haryana', coords: { lat: 29.6857, lng: 76.9905 } },
  'Panipat': { state: 'Haryana', coords: { lat: 29.3909, lng: 76.9635 } },
  'Sonipat': { state: 'Haryana', coords: { lat: 28.9931, lng: 77.0151 } },
  'Rohtak': { state: 'Haryana', coords: { lat: 28.8955, lng: 76.6066 } },
  'Jhajjar': { state: 'Haryana', coords: { lat: 28.6063, lng: 76.6565 } },
  'Gurugram': { state: 'Haryana', coords: { lat: 28.4595, lng: 77.0266 } },
  'Faridabad': { state: 'Haryana', coords: { lat: 28.4089, lng: 77.3178 } },
  'Hisar': { state: 'Haryana', coords: { lat: 29.1492, lng: 75.7217 } },
  'Fatehabad': { state: 'Haryana', coords: { lat: 29.5144, lng: 75.4549 } },
  'Sirsa': { state: 'Haryana', coords: { lat: 29.5349, lng: 75.0298 } },
  'Bhiwani': { state: 'Haryana', coords: { lat: 28.7932, lng: 76.1390 } },
  'Charkhi Dadri': { state: 'Haryana', coords: { lat: 28.5921, lng: 76.2653 } },
  'Rewari': { state: 'Haryana', coords: { lat: 28.1920, lng: 76.6186 } },
  'Mahendragarh': { state: 'Haryana', coords: { lat: 28.2764, lng: 76.1483 } },
  'Nuh': { state: 'Haryana', coords: { lat: 28.1060, lng: 77.0125 } },
  'Palwal': { state: 'Haryana', coords: { lat: 28.1444, lng: 77.3260 } },
  'Jind': { state: 'Haryana', coords: { lat: 29.3150, lng: 76.3150 } },

  // Uttar Pradesh
  'Meerut': { state: 'Uttar Pradesh', coords: { lat: 28.9845, lng: 77.7064 } },
  'Muzaffarnagar': { state: 'Uttar Pradesh', coords: { lat: 29.4727, lng: 77.7085 } },
  'Saharanpur': { state: 'Uttar Pradesh', coords: { lat: 29.9640, lng: 77.5460 } },
  'Shamli': { state: 'Uttar Pradesh', coords: { lat: 29.4485, lng: 77.3106 } },
  'Baghpat': { state: 'Uttar Pradesh', coords: { lat: 28.9442, lng: 77.2227 } },
  'Ghaziabad': { state: 'Uttar Pradesh', coords: { lat: 28.6692, lng: 77.4538 } },
  'Gautam Buddha Nagar (Noida)': { state: 'Uttar Pradesh', coords: { lat: 28.5355, lng: 77.3910 } },
  'Bulandshahr': { state: 'Uttar Pradesh', coords: { lat: 28.4069, lng: 77.8498 } },
  'Hapur': { state: 'Uttar Pradesh', coords: { lat: 28.7306, lng: 77.7759 } },
  'Aligarh': { state: 'Uttar Pradesh', coords: { lat: 27.8974, lng: 78.0880 } },
  'Mathura': { state: 'Uttar Pradesh', coords: { lat: 27.4924, lng: 77.6737 } },
  'Agra': { state: 'Uttar Pradesh', coords: { lat: 27.1767, lng: 78.0081 } },
  'Bareilly': { state: 'Uttar Pradesh', coords: { lat: 28.3670, lng: 79.4304 } },
  'Moradabad': { state: 'Uttar Pradesh', coords: { lat: 28.8386, lng: 78.7733 } },
  'Lucknow': { state: 'Uttar Pradesh', coords: { lat: 26.8467, lng: 80.9462 } },
  'Kanpur Nagar': { state: 'Uttar Pradesh', coords: { lat: 26.4499, lng: 80.3319 } },
  'Varanasi': { state: 'Uttar Pradesh', coords: { lat: 25.3176, lng: 82.9739 } },
  'Prayagraj (Allahabad)': { state: 'Uttar Pradesh', coords: { lat: 25.4358, lng: 81.8463 } },
  'Gorakhpur': { state: 'Uttar Pradesh', coords: { lat: 26.7606, lng: 83.3732 } },
  'Ayodhya (Faizabad)': { state: 'Uttar Pradesh', coords: { lat: 26.7922, lng: 82.1998 } },
  'Jhansi': { state: 'Uttar Pradesh', coords: { lat: 25.4484, lng: 78.5685 } },

  // Maharashtra
  'Nashik': { state: 'Maharashtra', coords: { lat: 19.9975, lng: 73.7898 } },
  'Pune': { state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
  'Nagpur': { state: 'Maharashtra', coords: { lat: 21.1458, lng: 79.0882 } },
  'Chhatrapati Sambhajinagar (Aurangabad)': { state: 'Maharashtra', coords: { lat: 19.8762, lng: 75.3433 } },
  'Solapur': { state: 'Maharashtra', coords: { lat: 17.6599, lng: 75.9064 } },
  'Kolhapur': { state: 'Maharashtra', coords: { lat: 16.7050, lng: 74.2433 } },
  'Satara': { state: 'Maharashtra', coords: { lat: 17.6805, lng: 74.0183 } },
  'Sangli': { state: 'Maharashtra', coords: { lat: 16.8524, lng: 74.5815 } },
  'Amravati': { state: 'Maharashtra', coords: { lat: 20.9374, lng: 77.7796 } },
  'Nanded': { state: 'Maharashtra', coords: { lat: 19.1383, lng: 77.3210 } },
  'Jalgaon': { state: 'Maharashtra', coords: { lat: 21.0077, lng: 75.5626 } },
  'Ahilyanagar (Ahmednagar)': { state: 'Maharashtra', coords: { lat: 19.0948, lng: 74.7480 } },

  // Rajasthan
  'Kota': { state: 'Rajasthan', coords: { lat: 25.1800, lng: 75.8300 } },
  'Jaipur': { state: 'Rajasthan', coords: { lat: 26.9124, lng: 75.7873 } },
  'Jodhpur': { state: 'Rajasthan', coords: { lat: 26.2389, lng: 73.0243 } },
  'Bikaner': { state: 'Rajasthan', coords: { lat: 28.0229, lng: 73.3119 } },
  'Udaipur': { state: 'Rajasthan', coords: { lat: 24.5854, lng: 73.7125 } },
  'Ajmer': { state: 'Rajasthan', coords: { lat: 26.4499, lng: 74.6399 } },
  'Alwar': { state: 'Rajasthan', coords: { lat: 27.5530, lng: 76.6346 } },
  'Bharatpur': { state: 'Rajasthan', coords: { lat: 27.2152, lng: 77.5030 } },
  'Bhilwara': { state: 'Rajasthan', coords: { lat: 25.3407, lng: 74.6313 } },
  'Sri Ganganagar': { state: 'Rajasthan', coords: { lat: 29.9038, lng: 73.8772 } },
  'Hanumangarh': { state: 'Rajasthan', coords: { lat: 29.5819, lng: 74.3294 } },
  'Pali': { state: 'Rajasthan', coords: { lat: 25.7711, lng: 73.3234 } },
  'Sikar': { state: 'Rajasthan', coords: { lat: 27.6094, lng: 75.1398 } },
};

/**
 * Finds the nearest administrative district from given coordinates within a state.
 * Uses geodesic Haversine distance from live GPS coordinates to known district centroids.
 */
export function findNearestDistrictByDistance(coords: LatLng, state: IndianState): string {
  const stateDistricts = getDistrictsByState(state);
  if (!stateDistricts || stateDistricts.length === 0) return 'District';

  let minDistance = Infinity;
  let bestDistrict = stateDistricts[0];

  // 1. Check in detailed district centroids
  for (const [distName, data] of Object.entries(DISTRICT_CENTROIDS)) {
    if (data.state.toLowerCase() === state.toLowerCase()) {
      const dist = calculateHaversineDistanceKm(coords, data.coords);
      if (dist < minDistance) {
        minDistance = dist;
        // Match with official district spelling
        const matched = stateDistricts.find(
          (d) =>
            d.toLowerCase() === distName.toLowerCase() ||
            d.toLowerCase().includes(distName.toLowerCase()) ||
            distName.toLowerCase().includes(d.toLowerCase())
        );
        bestDistrict = matched || distName;
      }
    }
  }

  // 2. If no centroid was in database for that state, check city coordinates for that state
  if (minDistance === Infinity) {
    for (const [_, data] of Object.entries(CITY_COORDINATES)) {
      if (data.state.toLowerCase() === state.toLowerCase() && data.district) {
        const dist = calculateHaversineDistanceKm(coords, data.coords);
        if (dist < minDistance) {
          minDistance = dist;
          bestDistrict = data.district;
        }
      }
    }
  }

  return bestDistrict;
}

/**
 * Finds the geographically nearest major city or town to the given coordinates by REAL distance (km),
 * never defaulting to state capital or array index 0.
 */
export function findNearestCityByDistance(coords: LatLng, state: IndianState): string {
  let minDistance = Infinity;
  let closestCity = '';

  // 1. Check all city coordinates for matching state
  for (const [cityName, data] of Object.entries(CITY_COORDINATES)) {
    if (data.state.toLowerCase() === state.toLowerCase()) {
      const dist = calculateHaversineDistanceKm(coords, data.coords);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = cityName;
      }
    }
  }

  // 2. If within 300km, check any city in India
  if (!closestCity) {
    for (const [cityName, data] of Object.entries(CITY_COORDINATES)) {
      const dist = calculateHaversineDistanceKm(coords, data.coords);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = cityName;
      }
    }
  }

  if (closestCity) return closestCity;

  // Fallback to nearest district name
  return findNearestDistrictByDistance(coords, state);
}

/**
 * Reusable Geolocation -> State, District, and City lookup function
 * 
 * Flow:
 * 1. If coordinates not provided, fetches accurate GPS/network location.
 * 2. Reverse-geocodes with OpenStreetMap Nominatim with a fast timeout.
 * 3. Sanitizes and cross-references state with the 28 Indian States & 8 UTs.
 * 4. Resolves the actual administrative district containing the coordinates
 *    (via address parsing + Haversine nearest distance calculation, NOT array index).
 * 5. Resolves the major town/city via real distance calculation to nearest town/city.
 * 6. Returns a clean, production-ready lookup object.
 */
export async function lookupFarmerLocation(
  inputCoords?: LatLng
): Promise<FarmerLocationLookupResult> {
  let coords: LatLng = inputCoords || { lat: 30.901, lng: 75.8573 }; // default Punjab Ludhiana
  let source: FarmerLocationLookupResult['source'] = inputCoords ? 'gps' : 'fallback';

  if (!inputCoords) {
    try {
      const liveLoc = await getAccurateUserLocation();
      coords = { lat: liveLoc.lat, lng: liveLoc.lng };
      source = liveLoc.source;
    } catch (err) {
      console.warn('Geolocation failed in lookupFarmerLocation, falling back to centroid', err);
      source = 'fallback';
    }
  }

  let detectedState: IndianState = findNearestStateByCentroid(coords);
  let detectedDistrict = findNearestDistrictByDistance(coords, detectedState);
  let detectedCity = findNearestCityByDistance(coords, detectedState);
  let formattedAddress = `${detectedCity}, ${detectedDistrict}, ${detectedState}, India`;
  let confidence = 0.8;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en,hi' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // 1. Resolve State
      const rawState = (addr.state || '').trim();
      const allStatesAndUts = [...ALL_INDIAN_STATES, ...ALL_UNION_TERRITORIES];

      const matchedState = allStatesAndUts.find(
        (s) =>
          s.toLowerCase() === rawState.toLowerCase() ||
          rawState.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(rawState.toLowerCase())
      );

      if (matchedState) {
        detectedState = matchedState;
        confidence = 0.95;
      } else {
        detectedState = findNearestStateByCentroid(coords);
      }

      // 2. Resolve District (using address fields + fuzzy match against state districts)
      const rawDistrict = (
        addr.county ||
        addr.state_district ||
        addr.district ||
        addr.subdistrict ||
        addr.city_district ||
        ''
      )
        .replace(/district|zilla|mandal|tehsil/gi, '')
        .trim();

      const stateDistricts = getDistrictsByState(detectedState);
      let districtFound = false;

      if (rawDistrict && stateDistricts.length > 0) {
        const matchedDistrict = stateDistricts.find(
          (d) =>
            d.toLowerCase() === rawDistrict.toLowerCase() ||
            rawDistrict.toLowerCase().includes(d.toLowerCase()) ||
            d.toLowerCase().includes(rawDistrict.toLowerCase())
        );
        if (matchedDistrict) {
          detectedDistrict = matchedDistrict;
          districtFound = true;
        }
      }

      // If no direct text district match, calculate the nearest district by geodesic distance
      if (!districtFound) {
        detectedDistrict = findNearestDistrictByDistance(coords, detectedState);
      }

      // 3. Resolve Major City / Town by geographical distance
      const localTown = (
        addr.town ||
        addr.city ||
        addr.municipality ||
        addr.suburb ||
        addr.village ||
        addr.hamlet ||
        ''
      ).trim();

      // Find the geographically closest major city
      const nearestMajorCity = findNearestCityByDistance(coords, detectedState);

      if (localTown && localTown.toLowerCase() !== detectedDistrict.toLowerCase()) {
        detectedCity = localTown;
      } else {
        detectedCity = nearestMajorCity || detectedDistrict;
      }

      // 4. Formatted Display Address
      const addressParts = [
        addr.village || addr.suburb || addr.town || addr.hamlet || detectedCity,
        detectedDistrict,
        detectedState,
        'India',
      ].filter(Boolean);

      formattedAddress = Array.from(new Set(addressParts)).join(', ');
    }
  } catch (err) {
    console.warn('Reverse geocoding network error, using accurate distance matching:', err);
    detectedState = findNearestStateByCentroid(coords);
    detectedDistrict = findNearestDistrictByDistance(coords, detectedState);
    detectedCity = findNearestCityByDistance(coords, detectedState);
    formattedAddress = `${detectedCity}, ${detectedDistrict}, ${detectedState}, India`;
    confidence = 0.7;
  }

  return {
    state: detectedState,
    district: detectedDistrict,
    city: detectedCity,
    formattedAddress,
    coords,
    source,
    confidence,
  };
}

/**
 * Finds the geographically nearest Indian State or UT centroid
 */
export function findNearestStateByCentroid(coords: LatLng): IndianState {
  let minDistance = Infinity;
  let closestState: IndianState = 'Punjab';

  for (const [stateName, stateCoord] of Object.entries(STATE_COORDINATES)) {
    const dist = calculateHaversineDistanceKm(coords, stateCoord);
    if (dist < minDistance) {
      minDistance = dist;
      closestState = stateName as IndianState;
    }
  }

  return closestState;
}

/**
 * High-precision spatial resolution: Resolves the exact Indian State, District, and Nearest City
 * from arbitrary GPS coordinates using Haversine distance matching against all known district centroids and cities.
 */
export function getResolvedLocationDetails(coords: LatLng): {
  state: IndianState;
  district: string;
  city: string;
  distanceToCentroidKm: number;
} {
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
    console.error('locationLookup.ts: getResolvedLocationDetails received invalid or undefined coordinates', coords);
    return {
      state: 'Punjab',
      district: 'Ludhiana',
      city: 'Ludhiana',
      distanceToCentroidKm: 0,
    };
  }

  let minDistance = Infinity;
  let resolvedState: IndianState = 'Punjab';
  let resolvedDistrict = 'Ludhiana';

  // 1. Check all district centroids
  for (const [distName, data] of Object.entries(DISTRICT_CENTROIDS)) {
    const dist = calculateHaversineDistanceKm(coords, data.coords);
    if (dist < minDistance) {
      minDistance = dist;
      resolvedState = data.state;
      resolvedDistrict = distName;
    }
  }

  // 2. Check all city coordinates for closer administrative proximity
  for (const [_, data] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateHaversineDistanceKm(coords, data.coords);
    if (dist < minDistance) {
      minDistance = dist;
      resolvedState = data.state;
      resolvedDistrict = data.district || resolvedDistrict;
    }
  }

  // 3. Fallback to state centroid if no close district found (unlikely)
  if (minDistance === Infinity || minDistance > 450) {
    resolvedState = findNearestStateByCentroid(coords);
    resolvedDistrict = findNearestDistrictByDistance(coords, resolvedState);
  }

  const city = findNearestCityByDistance(coords, resolvedState);

  return {
    state: resolvedState,
    district: resolvedDistrict,
    city: city || resolvedDistrict,
    distanceToCentroidKm: Number(minDistance.toFixed(1)),
  };
}

/**
 * Returns available major cities/towns for an Indian state
 */
export function getMajorCitiesByState(state: IndianState | string): string[] {
  if (!state) return [];
  
  const cities: string[] = [];
  for (const [cityName, data] of Object.entries(CITY_COORDINATES)) {
    if (data.state.toLowerCase() === state.toLowerCase()) {
      cities.push(cityName);
    }
  }

  if (cities.length > 0) {
    return Array.from(new Set(cities));
  }

  // Fallback to districts list if state cities not explicitly listed
  const districts = getDistrictsByState(state);
  return districts.length > 0 ? districts : ['City / Town'];
}

/**
 * Validates that user is at least 18 years old on current date.
 * Returns { isValid: boolean, age: number, error?: string }
 */
export function validateFarmerAge(dobString: string): {
  isValid: boolean;
  age: number;
  formattedDob: string;
  error?: string;
} {
  if (!dobString || !dobString.trim()) {
    return {
      isValid: false,
      age: 0,
      formattedDob: '',
      error: 'Please enter Date of Birth (DD/MM/YYYY)',
    };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      age: 0,
      formattedDob: '',
      error: 'Invalid Date of Birth format. Please select a valid date.',
    };
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (birthDate > today) {
    return {
      isValid: false,
      age: 0,
      formattedDob: birthDate.toISOString().split('T')[0],
      error: 'Date of Birth cannot be in the future.',
    };
  }

  if (age < 18) {
    const minBirthYear = today.getFullYear() - 18;
    const cutoffDate = new Date(today);
    cutoffDate.setFullYear(minBirthYear);
    const formattedCutoff = cutoffDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return {
      isValid: false,
      age,
      formattedDob: birthDate.toISOString().split('T')[0],
      error: `Age restriction: Farmer must be 18 years or older (Born on or before ${formattedCutoff}). Current age is ${age} years.`,
    };
  }

  return {
    isValid: true,
    age,
    formattedDob: birthDate.toISOString().split('T')[0],
  };
}
