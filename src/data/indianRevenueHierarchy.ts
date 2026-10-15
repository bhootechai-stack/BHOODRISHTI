import { IndianState } from '../types';
import { STATE_DISTRICTS_MAP, getDistrictsByState } from './indianDistricts';

/**
 * Authentic Tehsils / Talukas / Sub-divisions mapped by District name.
 */
export const DISTRICT_TEHSILS_MAP: Record<string, string[]> = {
  // --- PUNJAB ---
  'Ludhiana': ['Ludhiana East', 'Ludhiana West', 'Jagraon', 'Khanna', 'Payal', 'Raikot', 'Samrala'],
  'Amritsar': ['Amritsar-1', 'Amritsar-2', 'Ajnala', 'Baba Bakala', 'Majitha', 'Lopoke', 'Attari'],
  'Jalandhar': ['Jalandhar-1', 'Jalandhar-2', 'Phillaur', 'Nakodar', 'Shahkot', 'Adampur', 'Goraya'],
  'Patiala': ['Patiala', 'Nabha', 'Rajpura', 'Samana', 'Patran', 'Dudhan Sadhan', 'Bhunerheri'],
  'Bathinda': ['Bathinda', 'Talwandi Sabo', 'Maur', 'Rampura Phul', 'Goniana', 'Nathana', 'Bhagta Bhaika'],
  'Sangrur': ['Sangrur', 'Dhuri', 'Sunam', 'Moonak', 'Dirba', 'Bhawanigarh', 'Lehragaga'],
  'Hoshiarpur': ['Hoshiarpur', 'Dasuya', 'Mukerian', 'Garhshankar', 'Tanda', 'Bhunga'],
  'Gurdaspur': ['Gurdaspur', 'Batala', 'Dera Baba Nanak', 'Dina Nagar', 'Fatehgarh Churian', 'Kahnuwan'],
  'Ferozepur': ['Ferozepur', 'Zira', 'Guruharsahai', 'Mamdot', 'Mudki'],
  'Fazilka': ['Fazilka', 'Abohar', 'Jalalabad', 'Khuian Sarwar', 'Arniwala'],
  'Mansa': ['Mansa', 'Budhlada', 'Sardulgarh', 'Jhunir', 'Bhikhi'],
  'Kapurthala': ['Kapurthala', 'Phagwara', 'Sultanpur Lodhi', 'Bholath', 'Nadala', 'Dhilwan'],
  'Moga': ['Moga', 'Baghapurana', 'Nihal Singh Wala', 'Dharamkot', 'Badhni Kalan'],
  'Sahibzada Ajit Singh Nagar (Mohali)': ['Mohali (SAS Nagar)', 'Kharar', 'Dera Bassi', 'Majri', 'Banur'],
  'Muktsar (Sri Muktsar Sahib)': ['Sri Muktsar Sahib', 'Malout', 'Gidderbaha', 'Bariwala', 'Lambi'],
  'Faridkot': ['Faridkot', 'Kotkapura', 'Jaitu', 'Sadiq'],
  'Fatehgarh Sahib': ['Sirhind (Fatehgarh Sahib)', 'Amloh', 'Khamanon', 'Bassi Pathana'],
  'Rupnagar (Ropar)': ['Rupnagar (Ropar)', 'Anandpur Sahib', 'Chamkaur Sahib', 'Nangal', 'Morinda'],
  'Tarn Taran': ['Tarn Taran', 'Patti', 'Khadoor Sahib', 'Bhikhiwind', 'Chohla Sahib'],
  'Barnala': ['Barnala', 'Tapa', 'Mehal Kalan', 'Sehna'],
  'Pathankot': ['Pathankot', 'Dhar Kalan', 'Narot Jaimal Singh', 'Sujanpur'],
  'Malerkotla': ['Malerkotla', 'Amargarh', 'Ahmedgarh'],
  'Shahid Bhagat Singh Nagar (Nawanshahr)': ['Nawanshahr', 'Balachaur', 'Banga', 'Aur'],

  // --- HARYANA ---
  'Karnal': ['Karnal', 'Assandh', 'Gharaunda', 'Indri', 'Nilokheri', 'Nissing'],
  'Kurukshetra': ['Thanesar', 'Pehowa', 'Shahbad', 'Ladwa', 'Ismailabad'],
  'Hisar': ['Hisar', 'Hansi', 'Barwala', 'Narnaund', 'Adampur', 'Agroha', 'Uklana'],
  'Sirsa': ['Sirsa', 'Ellenabad', 'Rania', 'Dabwali', 'Kalanwali', 'Nathusari Chopta'],
  'Ambala': ['Ambala', 'Ambala Cantt', 'Barara', 'Naraingarh', 'Saha', 'Shehzadpur'],
  'Fatehabad': ['Fatehabad', 'Tohana', 'Ratia', 'Bhuna', 'Bhattu Kalan'],
  'Rohtak': ['Rohtak', 'Meham', 'Sampla', 'Kalanaur'],
  'Sonipat': ['Sonipat', 'Ganaur', 'Gohana', 'Kharkhoda', 'Rai', 'Mundlana'],
  'Panipat': ['Panipat', 'Samalkha', 'Israna', 'Bapoli', 'Madlauda'],
  'Jind': ['Jind', 'Narwana', 'Safidon', 'Julana', 'Uchana', 'Alewa'],
  'Gurugram': ['Gurugram', 'Badshahpur', 'Pataudi', 'Sohna', 'Farrukhnagar', 'Manesar', 'Wazirabad'],
  'Faridabad': ['Faridabad', 'Ballabgarh', 'Badkhal', 'Dhauj', 'Tigaon'],
  'Yamunanagar': ['Jagadhri', 'Bilaspur', 'Chhachhrauli', 'Radaur', 'Sadhaura'],
  'Bhiwani': ['Bhiwani', 'Bawani Khera', 'Loharu', 'Siwani', 'Tosham'],
  'Rewari': ['Rewari', 'Bawal', 'Kosli', 'Manethi', 'Dahina'],
  'Jhajjar': ['Jhajjar', 'Bahadurgarh', 'Beri', 'Badli', 'Matanhail'],
  'Palwal': ['Palwal', 'Hodal', 'Hathin', 'Hassanpur'],
  'Kaithal': ['Kaithal', 'Guhla', 'Kalayat', 'Pundri', 'Rajound', 'Siwan'],
  'Mahendragarh': ['Narnaul', 'Mahendragarh', 'Kanina', 'Nangal Chaudhry', 'Ateli'],
  'Nuh': ['Nuh', 'Ferozepur Jhirka', 'Punhana', 'Taoru', 'Nagina'],
  'Panchkula': ['Panchkula', 'Kalka', 'Raipur Rani', 'Morni'],
  'Charkhi Dadri': ['Charkhi Dadri', 'Badhra', 'Bond Kalan'],

  // --- UTTAR PRADESH ---
  'Lucknow': ['Lucknow Sadar', 'Bakshi Ka Talab', 'Mohanlalganj', 'Malihabad', 'Sarojini Nagar'],
  'Varanasi': ['Varanasi Sadar', 'Pindra', 'Rajatalab'],
  'Agra': ['Agra Sadar', 'Fatehabad', 'Kheragarh', 'Bah', 'Etmadpur', 'Kiraoli'],
  'Prayagraj': ['Prayagraj Sadar', 'Phulpur', 'Soraon', 'Handia', 'Karchhana', 'Meja', 'Bara', 'Koraon'],
  'Kanpur Nagar': ['Kanpur Sadar', 'Bilhaur', 'Ghatampur', 'Narwal'],
  'Meerut': ['Meerut Sadar', 'Mawana', 'Sardhana'],
  'Gautam Buddha Nagar (Noida)': ['Dadri', 'Noida Sadar', 'Jewar'],
  'Ghaziabad': ['Ghaziabad Sadar', 'Modinagar', 'Loni'],
  'Mathura': ['Mathura Sadar', 'Chhata', 'Mant', 'Mahavan', 'Goverdhan'],
  'Gorakhpur': ['Gorakhpur Sadar', 'Chauri Chaura', 'Bansgaon', 'Khajni', 'Sahjanwa', 'Campierganj', 'Gola'],
  'Ayodhya': ['Ayodhya Sadar', 'Bikapur', 'Milkipur', 'Rudauli', 'Sohawal'],
  'Bareilly': ['Bareilly Sadar', 'Aonla', 'Baheri', 'Faridpur', 'Mirganj', 'Nawabganj'],
  'Aligarh': ['Koil (Aligarh Sadar)', 'Atrauli', 'Chharra', 'Gabhana', 'Iglas', 'Khair'],
  'Moradabad': ['Moradabad Sadar', 'Bilari', 'Kanth', 'Thakurdwara'],
  'Saharanpur': ['Saharanpur Sadar', 'Behat', 'Deoband', 'Nakur', 'Rampur Maniharan'],
  'Muzaffarnagar': ['Muzaffarnagar Sadar', 'Budhana', 'Jansath', 'Khatoli'],
  'Bulandshahr': ['Bulandshahr Sadar', 'Anupshahr', 'Debai', 'Khurja', 'Shikarpur', 'Syana', 'Sikandrabad'],
  'Bijnor': ['Bijnor Sadar', 'Chandpur', 'Dhampur', 'Nagina', 'Najibabad'],
  'Jhansi': ['Jhansi Sadar', 'Garautha', 'Mauranipur', 'Moth', 'Tahrauli'],

  // --- MAHARASHTRA ---
  'Pune': ['Haveli', 'Pune City', 'Baramati', 'Shirur', 'Junnar', 'Ambegaon', 'Khed', 'Maval', 'Mulshi', 'Velhe', 'Bhor', 'Purandar', 'Indapur', 'Daund'],
  'Nashik': ['Nashik', 'Niphad', 'Sinnar', 'Dindori', 'Malegaon', 'Yeola', 'Satana (Baglan)', 'Kalwan', 'Chandwad', 'Igatpuri', 'Trimbakeshwar'],
  'Nagpur': ['Nagpur Urban', 'Nagpur Rural', 'Kamptee', 'Hingna', 'Katol', 'Narkhed', 'Savner', 'Kalameshwar', 'Ramtek', 'Mouda', 'Umred'],
  'Ahmednagar (Ahilyanagar)': ['Nagar', 'Rahuri', 'Shrirampur', 'Sangamner', 'Kopargaon', 'Akole', 'Parner', 'Pathardi', 'Shevgaon', 'Nevasa', 'Rahata'],
  'Chhatrapati Sambhajinagar (Aurangabad)': ['Aurangabad', 'Paithan', 'Gangapur', 'Vaijapur', 'Kannad', 'Khuldabad', 'Sillod', 'Phulambri'],
  'Kolhapur': ['Karvir', 'Hatkanangle', 'Shirol', 'Radhanagari', 'Kagal', 'Gadhinglaj', 'Panhala', 'Shahuwadi'],
  'Solapur': ['Solapur North', 'Solapur South', 'Barshi', 'Pandharpur', 'Akkalkot', 'Madha', 'Karmala', 'Sangola', 'Mangalwedha', 'Mohol'],
  'Satara': ['Satara', 'Karad', 'Wai', 'Phaltan', 'Mahabaleshwar', 'Koregaon', 'Khatav', 'Man', 'Patan'],
  'Thane': ['Thane', 'Kalyan', 'Murbad', 'Bhiwandi', 'Shahapur', 'Ulhasnagar', 'Ambernath'],
  'Jalgaon': ['Jalgaon', 'Bhusawal', 'Chalisgaon', 'Chopda', 'Jamner', 'Pachora', 'Raver', 'Yawal', 'Amalner'],
  'Amravati': ['Amravati', 'Achalpur', 'Anjangaon Surji', 'Chandur Bazar', 'Daryapur', 'Morshi', 'Warud', 'Dhamangaon'],

  // --- RAJASTHAN ---
  'Jaipur': ['Jaipur Sadar', 'Sanganer', 'Amer', 'Bassi', 'Chaksu', 'Jamwa Ramgarh', 'Kotputli', 'Shahpura', 'Chomu', 'Phagi'],
  'Jodhpur': ['Jodhpur', 'Luni', 'Bilara', 'Osian', 'Bhopalgarh', 'Baori', 'Shergarh', 'Balesar', 'Phalodi'],
  'Bikaner': ['Bikaner', 'Nokha', 'Kolayat', 'Loonkaransar', 'Dungargarh', 'Khajuwala', 'Poogal'],
  'Udaipur': ['Girwa (Udaipur)', 'Badgaon', 'Mavli', 'Vallabhnagar', 'Kotra', 'Jhadol', 'Salumber', 'Kherwara', 'Gogunda'],
  'Kota': ['Ladpura (Kota)', 'Digod', 'Sangod', 'Pipalda', 'Ramganj Mandi', 'Kanwas'],
  'Ajmer': ['Ajmer', 'Beawar', 'Nasirabad', 'Kishangarh', 'Kekri', 'Sarwar', 'Pisangan'],
  'Sri Ganganagar': ['Ganganagar', 'Karanpur', 'Sadulshahar', 'Raisinghnagar', 'Suratgarh', 'Padampur', 'Vijayanagar', 'Gharsana'],
  'Alwar': ['Alwar', 'Behror', 'Kotkasim', 'Laxmangarh', 'Mandawar', 'Rajgarh', 'Ramgarh', 'Thanagazi', 'Tijara'],
  'Bharatpur': ['Bharatpur', 'Bayana', 'Deeg', 'Kaman', 'Kumher', 'Nadbai', 'Nagar', 'Rupbas', 'Weir'],
  'Bhilwara': ['Bhilwara', 'Asind', 'Banera', 'Beejoliya', 'Hurda', 'Jahazpur', 'Kotri', 'Mandal', 'Mandalgarh', 'Raipur', 'Sahada', 'Shahpura'],

  // --- GUJARAT ---
  'Ahmedabad': ['Ahmedabad City', 'Daskroi', 'Sanand', 'Bavla', 'Dholka', 'Viramgam', 'Mandal', 'Dhandhuka', 'Dholera'],
  'Surat': ['Surat City', 'Choryasi', 'Olpad', 'Kamrej', 'Mangrol', 'Mandvi', 'Bardoli', 'Mahuva', 'Palsana'],
  'Rajkot': ['Rajkot', 'Kotda Sangani', 'Lodhika', 'Gondal', 'Jamkandorna', 'Upleta', 'Dhoraji', 'Jetpur', 'Jasdan', 'Paddhari'],
  'Vadodara': ['Vadodara', 'Padra', 'Karjan', 'Dabhoi', 'Waghodia', 'Savli', 'Desar', 'Sinor'],
  'Bhavnagar': ['Bhavnagar', 'Ghogha', 'Sihor', 'Umrala', 'Gariadhar', 'Palitana', 'Talaja', 'Mahuva', 'Jesar'],
  'Junagadh': ['Junagadh', 'Keshod', 'Mangrol', 'Manavadar', 'Malia Hatina', 'Talala', 'Visavadar', 'Bhesan', 'Mendarda'],

  // --- MADHYA PRADESH ---
  'Indore': ['Indore', 'Mhow (Dr. Ambedkar Nagar)', 'Sanwer', 'Depalpur', 'Hatod', 'Rau'],
  'Bhopal': ['Huzur (Bhopal)', 'Berasia', 'Kolar'],
  'Ujjain': ['Ujjain', 'Badnagar', 'Khachrod', 'Mahidpur', 'Nagda', 'Tarana', 'Ghatiya'],
  'Jabalpur': ['Jabalpur', 'Panagar', 'Patan', 'Sihora', 'Kundam', 'Shahpura', 'Majholi'],
  'Gwalior': ['Gwalior', 'Gird', 'Dabra', 'Bhitarwar', 'Chinour'],

  // --- BIHAR ---
  'Patna': ['Patna Sadar', 'Danapur', 'Barh', 'Masaurhi', 'Paliganj', 'Bikram', 'Mokama', 'Bakhtiarpur', 'Fatuha', 'Phulwari Sharif', 'Bihta', 'Maner'],
  'Gaya': ['Gaya Sadar', 'Bodh Gaya', 'Sherghati', 'Tekari', 'Wazirganj', 'Neemchak Bathani', 'Imamganj', 'Manpur', 'Barachatti'],
  'Muzaffarpur': ['Musahri (Sadar)', 'Kanti', 'Motipur', 'Sahebganj', 'Paroo', 'Saraiya', 'Marwan', 'Kurhani', 'Sakra', 'Minapur', 'Bochahan', 'Gaighat', 'Katra'],

  // --- WEST BENGAL ---
  'North 24 Parganas': ['Barasat', 'Barrackpore', 'Bongaon', 'Basirhat', 'Bidhannagar', 'Habra', 'Rajarhat'],
  'South 24 Parganas': ['Alipore', 'Baruipur', 'Canning', 'Diamond Harbour', 'Kakdwip', 'Bhangar', 'Budge Budge'],
  'Purba Bardhaman': ['Bardhaman Sadar North', 'Bardhaman Sadar South', 'Kalna', 'Katwa', 'Memari', 'Galsi'],

  // --- KARNATAKA ---
  'Bengaluru Urban': ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal', 'Yelahanka', 'K.R. Puram'],
  'Mysuru': ['Mysuru', 'Hunsur', 'K.R. Nagar', 'Nanjangud', 'H.D. Kote', 'Piriyapatna', 'T. Narasipura', 'Saragur'],
  'Belagavi': ['Belagavi', 'Athani', 'Bailhongal', 'Chikkodi', 'Gokak', 'Hukkeri', 'Khanapur', 'Ramdurg', 'Raybag', 'Saundatti'],

  // --- TAMIL NADU ---
  'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam', 'Sulur', 'Annur', 'Kinathukadavu', 'Valparai', 'Madukkarai', 'Perur'],
  'Madurai': ['Madurai North', 'Madurai South', 'Madurai West', 'Madurai East', 'Melur', 'Thirumangalam', 'Usilampatti', 'Vadipatti', 'Peraiyur'],
  'Thanjavur': ['Thanjavur', 'Kumbakonam', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Budalur', 'Orathanadu', 'Thiruvaiyaru'],

  // --- ANDHRA PRADESH ---
  'Guntur': ['Guntur', 'Tenali', 'Ponnur', 'Bapatla', 'Mangalagiri', 'Tadikonda', 'Medikonduru'],
  'Krishna': ['Machilipatnam', 'Gudivada', 'Vijayawada', 'Nuzvid', 'Kanchikacherla', 'Avanigadda', 'Vuyyuru'],

  // --- TELANGANA ---
  'Hyderabad': ['Charminar', 'Secunderabad', 'Amberpet', 'Khairatabad', 'Golconda', 'Asif Nagar', 'Musheerabad', 'Shaikpet'],
  'Ranga Reddy': ['Rajendranagar', 'Serilingampally', 'Chevella', 'Ibrahimpatnam', 'Maheshwaram', 'Shadnagar', 'Shamshabad'],
  'Warangal': ['Warangal', 'Khila Warangal', 'Geesugonda', 'Wardhannapet', 'Narsampet', 'Parkal', 'Rayaparthy'],

  // --- DELHI (NCT) ---
  'Central Delhi': ['Kotwali', 'Civil Lines', 'Karol Bagh'],
  'East Delhi': ['Gandhi Nagar', 'Preet Vihar', 'Mayur Vihar'],
  'New Delhi': ['Chanakyapuri', 'Delhi Cantonment', 'Vasant Vihar'],
  'North Delhi': ['Alipur', 'Narela', 'Model Town'],
  'North East Delhi': ['Seelampur', 'Yamuna Vihar', 'Karawal Nagar'],
  'North West Delhi': ['Saraswati Vihar', 'Rohini', 'Kanjhawala'],
  'Shahdara': ['Shahdara', 'Seemapuri', 'Vivek Vihar'],
  'South Delhi': ['Saket', 'Hauz Khas', 'Mehrauli'],
  'South East Delhi': ['Defence Colony', 'Kalkaji', 'Sarita Vihar'],
  'South West Delhi': ['Dwarka', 'Najafgarh', 'Kapashera'],
  'West Delhi': ['Patel Nagar', 'Punjabi Bagh', 'Rajouri Garden'],

  // --- JAMMU AND KASHMIR ---
  'Jammu': ['Jammu', 'Jammu South', 'Jammu North', 'Akhnoor', 'R.S. Pura', 'Bishnah', 'Marh', 'Dansal', 'Chowki Choura', 'Khour'],
  'Srinagar': ['Srinagar Central', 'Srinagar North', 'Srinagar South', 'Eidgah', 'Khanyar', 'Pantha Chowk', 'Shalteng', 'Chanapora'],
};

/**
 * Authentic Patwar Circles / Revenue Circles / Talathi Sajjás mapped by Tehsil name.
 */
export const TEHSIL_PATWAR_MAP: Record<string, string[]> = {
  // Ludhiana Tehsils
  'Ludhiana East': [
    'Circle 1 - Gill Halka',
    'Circle 2 - Sahnewal Halka',
    'Circle 3 - Pakhowal Halka',
    'Circle 4 - Meharban Halka',
    'Circle 5 - Jamalpur Halka',
    'Circle 6 - Tibba Halka',
    'Circle 7 - Dhandari Kalan Halka',
    'Circle 8 - Jugiana Halka',
  ],
  'Ludhiana West': [
    'Circle 1 - Ayali Kalan Halka',
    'Circle 2 - Barewal Awana Halka',
    'Circle 3 - Sunet Halka',
    'Circle 4 - Dad Halka',
    'Circle 5 - Tharike Halka',
    'Circle 6 - Baddowal Halka',
    'Circle 7 - Lalton Kalan Halka',
    'Circle 8 - Haibowal Halka',
  ],
  'Jagraon': [
    'Circle 1 - Jagraon Sadar Halka',
    'Circle 2 - Sidhwan Bet Halka',
    'Circle 3 - Swaddi Khas Halka',
    'Circle 4 - Kaunke Kalan Halka',
    'Circle 5 - Akhara Halka',
    'Circle 6 - Gidderwindi Halka',
    'Circle 7 - Chhapar Halka',
  ],
  'Khanna': [
    'Circle 1 - Khanna Sadar Halka',
    'Circle 2 - Ikolaha Halka',
    'Circle 3 - Rahoun Halka',
    'Circle 4 - Libra Halka',
    'Circle 5 - Rasulra Halka',
    'Circle 6 - Rohno Kalan Halka',
  ],
  'Payal': [
    'Circle 1 - Payal Rural Halka',
    'Circle 2 - Doraha Halka',
    'Circle 3 - Malaud Halka',
    'Circle 4 - Dhamot Halka',
    'Circle 5 - Sihan Daud Halka',
    'Circle 6 - Ghaloti Halka',
  ],
  'Raikot': [
    'Circle 1 - Raikot City Halka',
    'Circle 2 - Bassian Halka',
    'Circle 3 - Johlan Halka',
    'Circle 4 - Talwandi Rai Halka',
    'Circle 5 - Halwara Halka',
    'Circle 6 - Andlu Halka',
  ],
  'Samrala': [
    'Circle 1 - Samrala Sadar Halka',
    'Circle 2 - Machhiwara Halka',
    'Circle 3 - Bondli Halka',
    'Circle 4 - Otalan Halka',
    'Circle 5 - Behlolpur Halka',
    'Circle 6 - Seh Halka',
  ],

  // Amritsar Tehsils
  'Amritsar-1': [
    'Circle 1 - Sadar Amritsar Halka',
    'Circle 2 - Verka Halka',
    'Circle 3 - Vallah Halka',
    'Circle 4 - Sultanwind Halka',
    'Circle 5 - Chheharta Halka',
  ],
  'Amritsar-2': [
    'Circle 1 - Khasa Halka',
    'Circle 2 - Jandiala Guru Halka',
    'Circle 3 - Manawala Halka',
    'Circle 4 - Mehta Halka',
  ],
  'Ajnala': [
    'Circle 1 - Ajnala Central Halka',
    'Circle 2 - Ramdas Halka',
    'Circle 3 - Chogawan Halka',
    'Circle 4 - Bhindi Saidan Halka',
    'Circle 5 - Gagomahal Halka',
  ],
  'Baba Bakala': [
    'Circle 1 - Baba Bakala Sadar',
    'Circle 2 - Rayya Halka',
    'Circle 3 - Beas Halka',
    'Circle 4 - Butala Halka',
  ],

  // Jalandhar Tehsils
  'Jalandhar-1': [
    'Circle 1 - Jalandhar Sadar Halka',
    'Circle 2 - Kartarpur Halka',
    'Circle 3 - Maqsudan Halka',
    'Circle 4 - Lambra Halka',
  ],
  'Jalandhar-2': [
    'Circle 1 - Jalandhar Cantt Halka',
    'Circle 2 - Jamsher Halka',
    'Circle 3 - Alawalpur Halka',
    'Circle 4 - Bhogpur Halka',
  ],
  'Phillaur': [
    'Circle 1 - Phillaur Sadar Halka',
    'Circle 2 - Goraya Halka',
    'Circle 3 - Apra Halka',
    'Circle 4 - Bilga Halka',
    'Circle 5 - Rurka Kalan Halka',
  ],
  'Nakodar': [
    'Circle 1 - Nakodar Sadar Halka',
    'Circle 2 - Nurmahal Halka',
    'Circle 3 - Mehatpur Halka',
    'Circle 4 - Shankar Halka',
  ],

  // Patiala Tehsils
  'Patiala': [
    'Circle 1 - Patiala Sadar Halka',
    'Circle 2 - Sanaur Halka',
    'Circle 3 - Kalyan Halka',
    'Circle 4 - Bahadurgarh Halka',
    'Circle 5 - Dakala Halka',
  ],
  'Nabha': [
    'Circle 1 - Nabha Sadar Halka',
    'Circle 2 - Bhadson Halka',
    'Circle 3 - Rohti Chhanna Halka',
    'Circle 4 - Thuhi Halka',
  ],
  'Rajpura': [
    'Circle 1 - Rajpura Sadar Halka',
    'Circle 2 - Ghanaur Halka',
    'Circle 3 - Shambhu Halka',
    'Circle 4 - Jansua Halka',
  ],

  // Karnal Tehsils (Haryana)
  'Karnal': [
    'Circle 1 - Karnal Sadar Halka',
    'Circle 2 - Kunjpura Halka',
    'Circle 3 - Taraori Halka',
    'Circle 4 - Kachhwa Halka',
    'Circle 5 - Jundla Halka',
  ],
  'Assandh': [
    'Circle 1 - Assandh City Halka',
    'Circle 2 - Salwan Halka',
    'Circle 3 - Jai Singh Pura Halka',
    'Circle 4 - Rahra Halka',
  ],
  'Gharaunda': [
    'Circle 1 - Gharaunda Sadar',
    'Circle 2 - Bastara Halka',
    'Circle 3 - Chaura Halka',
    'Circle 4 - Kohand Halka',
  ],

  // Lucknow Tehsils (UP)
  'Lucknow Sadar': [
    'Circle 1 - Sadar Revenue Circle',
    'Circle 2 - Chinhat Revenue Halka',
    'Circle 3 - Kakori Revenue Halka',
    'Circle 4 - Gosainganj Revenue Halka',
  ],
  'Mohanlalganj': [
    'Circle 1 - Mohanlalganj Sadar Halka',
    'Circle 2 - Nagram Halka',
    'Circle 3 - Sisendi Halka',
    'Circle 4 - Khujauli Halka',
  ],
  'Bakshi Ka Talab': [
    'Circle 1 - BKT Sadar Halka',
    'Circle 2 - Itaunja Halka',
    'Circle 3 - Mahona Halka',
    'Circle 4 - Asti Halka',
  ],

  // Pune Tehsils (Maharashtra - Talathi Sajjá)
  'Haveli': [
    'Sajjá 1 - Hadapsar / Manjri Sajjá',
    'Sajjá 2 - Wagholi / Kharadi Sajjá',
    'Sajjá 3 - Kothrud / Bavdhan Sajjá',
    'Sajjá 4 - Dhayari / Narhe Sajjá',
    'Sajjá 5 - Khadakwasla Sajjá',
    'Sajjá 6 - Loni Kalbhor Sajjá',
  ],
  'Baramati': [
    'Sajjá 1 - Baramati Sadar Sajjá',
    'Sajjá 2 - Malegaon Budruk Sajjá',
    'Sajjá 3 - Supa Sajjá',
    'Sajjá 4 - Morgaon Sajjá',
    'Sajjá 5 - Songaon Sajjá',
  ],
  'Shirur': [
    'Sajjá 1 - Shirur Sadar Sajjá',
    'Sajjá 2 - Shikrapur Sajjá',
    'Sajjá 3 - Sanaswadi Sajjá',
    'Sajjá 4 - Nighoj Sajjá',
    'Sajjá 5 - Mandavgan Pharata Sajjá',
  ],

  // Jaipur Tehsils (Rajasthan)
  'Jaipur Sadar': [
    'Halka 1 - Jhotwara Revenue Circle',
    'Halka 2 - Mansarovar Revenue Circle',
    'Halka 3 - Jagatpura Revenue Circle',
    'Halka 4 - Vidyadhar Nagar Revenue Circle',
  ],
  'Sanganer': [
    'Halka 1 - Sanganer Sadar Halka',
    'Halka 2 - Muhana Mandi Halka',
    'Halka 3 - Watika Halka',
    'Halka 4 - Diggi Malpura Road Halka',
  ],
};

/**
 * Returns available Tehsils / Talukas for a given District.
 * If not in the dictionary, generates clean, standard administrative sub-divisions.
 */
export function getTehsilsByDistrict(district: string, state?: string): string[] {
  if (!district) return [];
  
  const trimmed = district.trim();
  // Exact match
  if (DISTRICT_TEHSILS_MAP[trimmed] && DISTRICT_TEHSILS_MAP[trimmed].length > 0) {
    return DISTRICT_TEHSILS_MAP[trimmed];
  }

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [dName, tehsils] of Object.entries(DISTRICT_TEHSILS_MAP)) {
    if (dName.toLowerCase() === lower || dName.toLowerCase().includes(lower) || lower.includes(dName.toLowerCase())) {
      return tehsils;
    }
  }

  // State-specific terminologies
  const isMaharashtra = state?.toLowerCase().includes('maharashtra');
  const isSouth = state && ['tamil nadu', 'karnataka', 'andhra pradesh', 'telangana', 'kerala'].some((s) => state.toLowerCase().includes(s));
  const isGujarat = state?.toLowerCase().includes('gujarat');

  const unitType = isMaharashtra || isGujarat ? 'Taluka' : isSouth ? 'Taluk' : 'Tehsil';

  // Smart administrative subdivision generator
  return [
    `${trimmed} Sadar (${unitType})`,
    `${trimmed} North / Uttar (${unitType})`,
    `${trimmed} South / Dakshin (${unitType})`,
    `${trimmed} East / Purvi (${unitType})`,
    `${trimmed} West / Paschim (${unitType})`,
    `${trimmed} Rural (${unitType})`,
  ];
}

/**
 * Returns available Patwar Circles / Revenue Halkas / Talathi Sajjás for a given Tehsil.
 */
export function getPatwarCirclesByTehsil(tehsil: string, district?: string, state?: string): string[] {
  if (!tehsil) return [];
  const trimmed = tehsil.trim();

  // Exact match
  if (TEHSIL_PATWAR_MAP[trimmed] && TEHSIL_PATWAR_MAP[trimmed].length > 0) {
    return TEHSIL_PATWAR_MAP[trimmed];
  }

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [tName, circles] of Object.entries(TEHSIL_PATWAR_MAP)) {
    if (tName.toLowerCase() === lower || tName.toLowerCase().includes(lower) || lower.includes(tName.toLowerCase())) {
      return circles;
    }
  }

  // Terminology based on State
  const stLower = (state || '').toLowerCase();
  if (stLower.includes('maharashtra') || stLower.includes('goa')) {
    return [
      `Sajjá 1 - ${trimmed} Sadar (तलाठी सज्जा)`,
      `Sajjá 2 - ${trimmed} Gramin (ग्रामीण सज्जा)`,
      `Sajjá 3 - ${trimmed} Uttar (उत्तर मंडळ)`,
      `Sajjá 4 - ${trimmed} Dakshin (दक्षिण मंडळ)`,
      `Sajjá 5 - ${trimmed} Purva (पूर्व मंडळ)`,
      `Sajjá 6 - ${trimmed} Pashchim (पश्चिम मंडळ)`,
    ];
  }

  if (stLower.includes('gujarat')) {
    return [
      `Circle 1 - ${trimmed} Talati Mandal (તલાટી સર્કલ)`,
      `Circle 2 - ${trimmed} Gam Talati Mandal`,
      `Circle 3 - ${trimmed} Uttar Mandal`,
      `Circle 4 - ${trimmed} Dakshin Mandal`,
      `Circle 5 - ${trimmed} Purva Mandal`,
    ];
  }

  if (stLower.includes('tamil') || stLower.includes('karnataka') || stLower.includes('andhra') || stLower.includes('telangana')) {
    return [
      `Firka 1 - ${trimmed} Central Firka (RI Circle)`,
      `Firka 2 - ${trimmed} North Firka`,
      `Firka 3 - ${trimmed} South Firka`,
      `Firka 4 - ${trimmed} East Firka`,
      `Firka 5 - ${trimmed} Rural Firka`,
    ];
  }

  // Default North / Central / Pan-India Revenue terminology
  const cleanTehsil = trimmed.replace(/\(.*?\)/g, '').trim();
  return [
    `Circle 1 - ${cleanTehsil} Sadar Halka (पटवार हलका)`,
    `Circle 2 - ${cleanTehsil} North / Uttar Halka`,
    `Circle 3 - ${cleanTehsil} South / Dakshin Halka`,
    `Circle 4 - ${cleanTehsil} East / Purvi Halka`,
    `Circle 5 - ${cleanTehsil} West / Paschim Halka`,
    `Circle 6 - ${cleanTehsil} Rural / Dehati Halka`,
  ];
}
