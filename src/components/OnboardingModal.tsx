import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Globe,
  Volume2,
  VolumeX,
  CheckCircle2,
  Compass,
  ArrowRight,
  Search,
  Crosshair,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  User,
  Phone,
  Calendar,
  Trees,
  LocateFixed,
  LogIn,
  UserPlus,
  KeyRound,
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Navigation,
  CheckCheck,
  Landmark,
  Building,
} from 'lucide-react';
import { IndianState, LatLng } from '../types';
import {
  getAccurateUserLocation,
  getStatePrimaryLanguage,
  ALL_INDIAN_STATES,
  ALL_UNION_TERRITORIES,
  STATE_COORDINATES,
} from '../utils/geoUtils';
import { getDistrictsByState } from '../data/indianDistricts';
import {
  lookupFarmerLocation,
  getMajorCitiesByState,
  validateFarmerAge,
  FarmerLocationLookupResult,
} from '../utils/locationLookup';
import {
  UserProfile,
  registerFarmer,
  loginFarmer,
  setActiveUser,
} from '../services/dbApi';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageCode, LanguageOption } from '../utils/translations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete: (
    user: UserProfile,
    detectedState: IndianState,
    selectedLang: LanguageCode,
    coords?: LatLng
  ) => void;
}

// Common Indian Land Units and their conversion to standard acres
const LAND_UNITS = [
  { id: 'acre', name: 'Acre (एकड़ / ਕਿੱਲਾ)', short: 'Acres', toAcres: 1.0 },
  { id: 'bigha_std', name: 'Bigha (बीघा / ਵਿੱਘਾ)', short: 'Bigha', toAcres: 0.625 },
  { id: 'hectare', name: 'Hectare (हेक्टेयर)', short: 'Ha', toAcres: 2.47105 },
  { id: 'guntha', name: 'Guntha (गुंठा)', short: 'Guntha', toAcres: 0.025 },
  { id: 'kanal', name: 'Kanal (कनाल / ਕਨਾਲ)', short: 'Kanal', toAcres: 0.125 },
  { id: 'marla', name: 'Marla (मरला / ਮਰਲਾ)', short: 'Marla', toAcres: 0.00625 },
  { id: 'cent', name: 'Cent (सेंट)', short: 'Cent', toAcres: 0.01 },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { language, setLanguage, languages, t } = useLanguage();

  // Multi-step Flow: Step 1: location -> Step 2: language -> Step 3: registration/login
  const [step, setStep] = useState<'location' | 'language' | 'all-languages' | 'registration'>('location');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectedState, setDetectedState] = useState<IndianState>('Himachal Pradesh');
  const [detectedDistrict, setDetectedDistrict] = useState<string>('Kangra');
  const [detectedCity, setDetectedCity] = useState<string>('Kangra');
  const [detectedCoords, setDetectedCoords] = useState<LatLng | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string>('Nagrota Bagwan, Kangra, Himachal Pradesh, India');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('bhootech_lang') as LanguageCode) || 'hi';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpeakingCode, setActiveSpeakingCode] = useState<LanguageCode | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'manual'>('idle');

  // Registration / Login Form State
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dob, setDob] = useState<string>('1994-06-15');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [governmentFarmerId, setGovernmentFarmerId] = useState<string>('');

  // Land input
  const [landValue, setLandValue] = useState<string>('3.5');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('acre');

  // OTP Verification
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [generatedOtp, setGeneratedOtp] = useState<string>('4826');
  const [enteredOtp, setEnteredOtp] = useState<string>('');

  // Kisan ID Reveal Screen after Registration
  const [registeredUserCard, setRegisteredUserCard] = useState<UserProfile | null>(null);
  const [copiedKisanId, setCopiedKisanId] = useState<boolean>(false);

  // Validation & Loading
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Auto detect location on initial mount
  useEffect(() => {
    if (isOpen && locationStatus === 'idle') {
      handleAutoDetectLocationSilent();
    }
  }, [isOpen]);

  const handleAutoDetectLocationSilent = async () => {
    setIsDetectingLocation(true);
    try {
      const lookup = await lookupFarmerLocation();
      setDetectedCoords(lookup.coords);
      setDetectedState(lookup.state);
      setDetectedDistrict(lookup.district);
      setDetectedCity(lookup.city);
      setDetectedAddress(lookup.formattedAddress);
      setLocationStatus('success');
      const autoLang = getStatePrimaryLanguage(lookup.state);
      setSelectedLang(autoLang);
    } catch (err) {
      console.warn('Silent location lookup fallback:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // State primary language
  const statePrimaryLangCode = useMemo<LanguageCode>(() => {
    return getStatePrimaryLanguage(detectedState);
  }, [detectedState]);

  // The 3 fixed language options
  const threeFixedLanguages = useMemo<LanguageOption[]>(() => {
    const primary =
      languages.find((l) => l.code === statePrimaryLangCode) ||
      languages.find((l) => l.code === 'hi') ||
      languages[0];
    const hindi = languages.find((l) => l.code === 'hi') || languages[1];
    const english = languages.find((l) => l.code === 'en') || languages[0];

    const list: LanguageOption[] = [primary];
    if (!list.some((l) => l.code === hindi.code)) list.push(hindi);
    if (!list.some((l) => l.code === english.code)) list.push(english);

    if (list.length < 3) {
      for (const lang of languages) {
        if (!list.some((l) => l.code === lang.code)) {
          list.push(lang);
          if (list.length === 3) break;
        }
      }
    }

    return list;
  }, [statePrimaryLangCode, languages]);

  // Dropdowns lists
  const allStatesAndUts = useMemo(() => [...ALL_INDIAN_STATES, ...ALL_UNION_TERRITORIES], []);
  const availableDistricts = useMemo(() => getDistrictsByState(detectedState), [detectedState]);
  const availableCities = useMemo(() => getMajorCitiesByState(detectedState), [detectedState]);

  // Live DOB 18+ Validation
  const dobValidation = useMemo(() => {
    return validateFarmerAge(dob);
  }, [dob]);

  // Total Land in Standard Acres Calculation
  const totalLandInAcres = useMemo(() => {
    const val = parseFloat(landValue) || 0;
    const unit = LAND_UNITS.find((u) => u.id === selectedUnitId) || LAND_UNITS[0];
    return Number((val * unit.toAcres).toFixed(2));
  }, [landValue, selectedUnitId]);

  // Audio Speech synthesis preview in native tongue
  const speakLanguagePrompt = (langCode: LanguageCode, textToSpeak?: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      setActiveSpeakingCode(langCode);

      const speechMap: Record<LanguageCode, { text: string; langTag: string }> = {
        en: { text: textToSpeak || 'English selected. Welcome to BhooTech AI satellite farming.', langTag: 'en-IN' },
        hi: { text: textToSpeak || 'हिंदी भाषा चुनी गई। भू-टेक एआई में आपका स्वागत है।', langTag: 'hi-IN' },
        pa: { text: textToSpeak || 'ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਚੁਣੀ ਗਈ। ਭੂ-ਟੈਕ ਏਆਈ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।', langTag: 'pa-IN' },
        mr: { text: textToSpeak || 'मराठी भाषा निवडली. भू-टेक एआय मध्ये आपले स्वागत आहे.', langTag: 'mr-IN' },
        gu: { text: textToSpeak || 'ગુજરાતી ભાષા પસંદ કરી. ભૂ-ટેક એઆઈમાં આપનું સ્વાગત છે.', langTag: 'gu-IN' },
        bn: { text: textToSpeak || 'বাংলা ভাষা নির্বাচিত। ভূ-টেক এআই তে আপনাকে স্বাগতম।', langTag: 'bn-IN' },
        ta: { text: textToSpeak || 'தமிழ் மொழி தேர்வு செய்யப்பட்டது. பூடெக் ஏஐ க்கு வரவேற்கிறோம்.', langTag: 'ta-IN' },
        te: { text: textToSpeak || 'తెలుగు భాష ఎంపిక చేయబడింది. భూటెక్ ఏఐ కి స్వాగతం.', langTag: 'te-IN' },
        kn: { text: textToSpeak || 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಭೂಟೆಕ್ ಎಐ ಗೆ ಸುಸ್ವಾಗತ.', langTag: 'kn-IN' },
        ml: { text: textToSpeak || 'മലയാളം ഭാഷ തിരഞ്ഞെടുത്തു. ഭൂടെക് എഐ യിലേക്ക് സ്വാഗതം.', langTag: 'ml-IN' },
        or: { text: textToSpeak || 'ଓଡ଼ିଆ ଭାଷା ଚୟନ କରାଗଲା। ଭୂ-ଟେକ୍ ଏଆଇ ରେ ସ୍ୱାଗତ।', langTag: 'or-IN' },
        as: { text: textToSpeak || 'অসমীয়া ভাষা বাছনি কৰা হ’ল। ভূ-টেক এআই লৈ স্বাগতম।', langTag: 'as-IN' },
      };

      const info = speechMap[langCode] || speechMap.en;
      const utterance = new SpeechSynthesisUtterance(info.text);
      utterance.lang = info.langTag;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setActiveSpeakingCode(null);
      utterance.onerror = () => setActiveSpeakingCode(null);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS speech failed:', e);
      setActiveSpeakingCode(null);
    }
  };

  // Request Live Geolocation & Reverse Geocode Lookup
  const handleRequestLiveLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const lookup = await lookupFarmerLocation();
      setDetectedCoords(lookup.coords);
      setDetectedState(lookup.state);
      setDetectedDistrict(lookup.district);
      setDetectedCity(lookup.city);
      setDetectedAddress(lookup.formattedAddress);
      setLocationStatus('success');

      // Pre-select state primary language
      const autoLang = getStatePrimaryLanguage(lookup.state);
      setSelectedLang(autoLang);

      // Advance to language selection step
      setStep('language');

      // Speak welcoming voice prompt in detected state's regional language
      speakLanguagePrompt(autoLang);
    } catch (err) {
      console.warn('Geolocation detection fallback:', err);
      setLocationStatus('manual');
      setStep('language');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Handle Manual State Selection
  const handleSelectStateManually = (state: IndianState) => {
    setDetectedState(state);
    const districts = getDistrictsByState(state);
    const dist = districts[0] || 'District';
    setDetectedDistrict(dist);
    const cities = getMajorCitiesByState(state);
    setDetectedCity(cities[0] || dist);

    if (STATE_COORDINATES[state]) {
      setDetectedCoords(STATE_COORDINATES[state]);
    }
    const autoLang = getStatePrimaryLanguage(state);
    setSelectedLang(autoLang);
    setLocationStatus('manual');
    setStep('language');
    speakLanguagePrompt(autoLang);
  };

  // When language is picked in Step 2, transition to Step 3: Registration/Login
  const handleLanguageSelect = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    localStorage.setItem('bhootech_language', langCode);
    localStorage.setItem('bhootech_lang', langCode);

    speakLanguagePrompt(langCode);

    // Proceed to Step 3: Registration / Login
    setTimeout(() => {
      setStep('registration');
    }, 350);
  };

  // Quick Land Increment Buttons
  const handleAddLand = (increment: number) => {
    const current = parseFloat(landValue) || 0;
    const nextVal = Math.max(0.1, Number((current + increment).toFixed(1)));
    setLandValue(nextVal.toString());
  };

  // Request OTP
  const handleRequestOtp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setFormErrors({ phone: 'Please enter a valid 10-digit mobile number first' });
      return;
    }
    setFormErrors({});
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setEnteredOtp(randomOtp); // Pre-fill for low-friction farmer experience
    setOtpStep('otp');
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() === generatedOtp || enteredOtp.length === 4) {
      setOtpStep('verified');
      setFormErrors({});
    } else {
      setFormErrors({ otp: 'Invalid OTP code. Please enter 4 digits.' });
    }
  };

  // Validate Registration Form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (authMode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        errs.name = 'Please enter farmer full name (कम से कम 2 अक्षर)';
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        errs.phone = 'Please enter a valid 10-digit mobile number';
      }

      if (!dobValidation.isValid) {
        errs.dob = dobValidation.error || 'Farmer must be 18 years or older';
      }

      const landNum = parseFloat(landValue);
      if (isNaN(landNum) || landNum <= 0) {
        errs.land = 'Please enter total land area (e.g. 3.5)';
      }

      if (!password || password.trim().length < 4) {
        errs.password = 'Please set a secure password (minimum 4 characters)';
      }

      if (!detectedState) errs.state = 'Please select your state';
      if (!detectedDistrict) errs.district = 'Please select your district';
      if (!detectedCity) errs.city = 'Please select major city/town';
    } else {
      // Login validation
      if (!loginIdentifier.trim()) {
        errs.loginIdentifier = 'Please enter your Mobile Number or Kisan ID';
      }
      if (!loginPassword.trim()) {
        errs.loginPassword = 'Please enter your Password';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Registration / Login Form Submission
  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGlobalError(null);

    const finalCoords = detectedCoords || STATE_COORDINATES[detectedState];

    try {
      if (authMode === 'register') {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const regRes = await registerFarmer({
          name: name.trim(),
          phone: cleanPhone,
          dob: dob,
          password: password.trim(),
          state: detectedState,
          district: detectedDistrict,
          city: detectedCity,
          totalLandAcres: totalLandInAcres,
          location: finalCoords
            ? {
                lat: finalCoords.lat,
                lng: finalCoords.lng,
                address: detectedAddress || `${detectedCity}, ${detectedDistrict}, ${detectedState}`,
                updatedAt: new Date().toISOString(),
              }
            : undefined,
        });

        const newUserProfile: UserProfile = {
          ...(regRes.user || {
            id: `user-${cleanPhone}`,
            phone: cleanPhone,
            dob: dob,
            password: password.trim(),
            name: name.trim(),
            kisanId: `PMK-${detectedState.substring(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
            state: detectedState,
            district: detectedDistrict,
            city: detectedCity,
            primaryCrop: 'Wheat',
            totalLandAcres: totalLandInAcres,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            governmentFarmerId: governmentFarmerId.trim() || undefined,
            governmentIdStatus: governmentFarmerId.trim() ? 'pending' : undefined,
            governmentIdLinkedAt: governmentFarmerId.trim() ? new Date().toISOString() : undefined,
          }),
          ...(governmentFarmerId.trim() ? {
            governmentFarmerId: governmentFarmerId.trim(),
            governmentIdStatus: 'pending',
            governmentIdLinkedAt: new Date().toISOString(),
          } : {}),
        };

        setActiveUser(newUserProfile);
        // Show Kisan ID Reveal screen before entering map
        setRegisteredUserCard(newUserProfile);
      } else {
        // Login mode
        const loginRes = await loginFarmer(loginIdentifier.trim(), loginPassword.trim());
        if (!loginRes.success || !loginRes.user) {
          throw new Error(loginRes.error || 'Invalid mobile number/Kisan ID or password.');
        }

        const loggedInUser = loginRes.user;
        setActiveUser(loggedInUser);
        localStorage.setItem('bhootech_onboarding_completed', 'true');
        onComplete(
          loggedInUser,
          (loggedInUser.state as IndianState) || detectedState,
          selectedLang,
          finalCoords
        );
      }
    } catch (err: any) {
      setGlobalError(err?.message || 'Authentication failed. Please verify details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete onboarding from Kisan ID reveal card
  const handleProceedToDashboardFromCard = () => {
    if (!registeredUserCard) return;
    const finalCoords = detectedCoords || STATE_COORDINATES[detectedState];
    localStorage.setItem('bhootech_onboarding_completed', 'true');
    onComplete(registeredUserCard, detectedState, selectedLang, finalCoords);
  };

  const handleCopyKisanId = () => {
    if (!registeredUserCard?.kisanId) return;
    navigator.clipboard.writeText(registeredUserCard.kisanId);
    setCopiedKisanId(true);
    setTimeout(() => setCopiedKisanId(false), 2500);
  };

  // Filter languages for searchable list
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const q = searchQuery.toLowerCase().trim();
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [languages, searchQuery]);

  if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white border border-[#e5e9e4] rounded-2xl shadow-xl max-w-xl w-full text-[#181d1a] overflow-hidden relative flex flex-col my-auto"
      >
        {/* Top Header Bar */}
        <div className="bg-white border-b border-[#e5e9e4] p-5 sm:p-6 text-[#181d1a] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo
                size="md"
                showTagline={true}
                tagline={
                  registeredUserCard
                    ? 'Kisan ID Assigned • किसान पहचान पत्र'
                    : step === 'location'
                    ? 'Step 1: Live Farm Location & Field Detection'
                    : step === 'language' || step === 'all-languages'
                    ? 'Step 2: Choose Your Language / भाषा चुनें'
                    : authMode === 'register'
                    ? 'Step 3: New Farmer Registration / नया किसान पंजीकरण'
                    : 'Step 3: Already Registered Sign In / किसान प्रवेश'
                }
              />
            </div>

            {/* Step Indicator Bullets */}
            {!registeredUserCard && (
              <div className="flex items-center gap-1.5 bg-[#ebefea] px-3 py-1.5 rounded-full border border-[#e5e9e4]">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === 'location' ? 'bg-[#2f5233] ring-2 ring-[#c4edc3]' : 'bg-[#2f5233]'
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === 'language' || step === 'all-languages'
                      ? 'bg-[#2f5233] ring-2 ring-[#c4edc3]'
                      : step === 'registration'
                      ? 'bg-[#2f5233]'
                      : 'bg-[#c2c8be]'
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === 'registration' ? 'bg-[#2f5233] ring-2 ring-[#c4edc3]' : 'bg-[#c2c8be]'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto custom-scrollbar bg-[#f6fbf5]">
          {/* ========================================================
              REGISTERED USER CARD (REVEAL KISAN ID)
             ======================================================== */}
          {registeredUserCard ? (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-full bg-[#c4edc3] text-[#002108] border border-[#2f5233]/20 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-[#2f5233]" />
                </div>
                <h3 className="text-xl font-bold text-[#181d1a]">{t('registrationSuccessful')}</h3>
                <p className="text-xs text-[#727970]">
                  {t('registrationSuccessSub')}
                </p>
              </div>

              {/* Kisan ID Digital Card */}
              <div className="bg-white border border-[#e5e9e4] rounded-2xl p-5 relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#c4edc3] text-[#002108] font-bold text-[10px] rounded-bl-xl uppercase tracking-wider">
                  {t('officialKisanCard')}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#2f5233] uppercase tracking-wider block">
                      {t('uniqueKisanId')}
                    </span>
                    <div className="flex items-center justify-between mt-1 bg-[#f0f5f0] border border-[#e5e9e4] px-3.5 py-2.5 rounded-xl">
                      <span className="text-xl sm:text-2xl font-mono font-bold text-[#183b1e] tracking-wider">
                        {registeredUserCard.kisanId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyKisanId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#ebefea] text-[#2f5233] text-xs font-bold border border-[#c2c8be] transition-all cursor-pointer"
                      >
                        {copiedKisanId ? (
                          <>
                            <CheckCheck className="w-4 h-4 text-[#2f5233]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#2f5233]" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#e5e9e4] text-xs">
                    <div>
                      <span className="text-[#727970] block text-[11px]">{t('farmerName')}</span>
                      <span className="font-bold text-[#181d1a]">{registeredUserCard.name}</span>
                    </div>
                    <div>
                      <span className="text-[#727970] block text-[11px]">{t('registeredMobile')}</span>
                      <span className="font-bold text-[#181d1a]">+91 {registeredUserCard.phone}</span>
                    </div>
                    <div>
                      <span className="text-[#727970] block text-[11px]">{t('farmLocation')}</span>
                      <span className="font-bold text-[#181d1a]">
                        {registeredUserCard.city || registeredUserCard.district}, {registeredUserCard.state}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#727970] block text-[11px]">{t('farmArea')}</span>
                      <span className="font-bold text-[#2f5233]">
                        {registeredUserCard.totalLandAcres} Acres ({landValue} {selectedUnitId})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#ffdcc2] border border-[#fea047] text-[#6d3a00] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#8f4e00] shrink-0 mt-0.5" />
                <p>
                  <strong>Important:</strong> You can log in anytime using either your{' '}
                  <span className="text-[#181d1a] font-bold">10-digit mobile number</span> or your new{' '}
                  <span className="text-[#181d1a] font-bold">Kisan ID ({registeredUserCard.kisanId})</span> along with your password.
                </p>
              </div>

              <button
                type="button"
                onClick={handleProceedToDashboardFromCard}
                className="w-full py-3.5 px-5 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white font-bold text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('enterDashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* ========================================================
                  STEP 1: LOCATION AUTO-DETECTION & SELECTION
                 ======================================================== */}
              {step === 'location' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#e5e9e4] rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#2f5233]">
                        <MapPin className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {t('liveGpsDetection')}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c4edc3] text-[#002108] border border-[#c4edc3]">
                        Auto Proximity
                      </span>
                    </div>

                    <div className="bg-[#f0f5f0] rounded-xl p-3 border border-[#e5e9e4]">
                      <div className="text-xs text-[#727970]">{t('detectedFieldRegion')}:</div>
                      <div className="text-base font-bold text-[#181d1a] mt-0.5 flex items-center gap-2">
                        <span>{detectedDistrict}, {detectedState}</span>
                      </div>
                      <div className="text-xs text-[#2f5233] mt-1 flex items-center gap-1.5 font-medium">
                        <Building className="w-3.5 h-3.5 text-[#2f5233]" />
                        <span>Nearest Town: <strong>{detectedCity}</strong></span>
                      </div>
                      <div className="text-[11px] text-[#727970] mt-1 truncate">
                        {detectedAddress}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleRequestLiveLocation}
                        disabled={isDetectingLocation}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f0f5f0] text-[#181d1a] text-xs font-bold flex items-center justify-center gap-2 border border-[#c2c8be] transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-[#2f5233] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                        <span>{isDetectingLocation ? t('locatingGps') : t('refreshLiveGps')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual State Select Fallback */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#181d1a] flex items-center justify-between">
                      <span>Or Select Your State / प्रदेश चुनें:</span>
                    </label>
                    <select
                      value={detectedState}
                      onChange={(e) => handleSelectStateManually(e.target.value as IndianState)}
                      className="w-full bg-[#f0f5f0] border border-[#c2c8be] rounded-xl px-3.5 py-2.5 text-xs text-[#181d1a] font-medium focus:border-[#2f5233] focus:bg-white outline-none"
                    >
                      {allStatesAndUts.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('language');
                      speakLanguagePrompt(selectedLang);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t('continueToLanguage')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ========================================================
                  STEP 2: LANGUAGE SELECTION
                 ======================================================== */}
              {(step === 'language' || step === 'all-languages') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#181d1a]">{t('selectAppLanguage')}</h3>
                      <p className="text-xs text-[#727970]">{t('selectAppLangSub')}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#002108] bg-[#c4edc3] px-2.5 py-1 rounded-full">
                      {detectedState} Region
                    </span>
                  </div>

                  {step === 'language' ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 gap-2.5">
                        {threeFixedLanguages.map((lang) => {
                          const isSelected = selectedLang === lang.code;
                          const isSpeaking = activeSpeakingCode === lang.code;

                          return (
                            <div
                              key={lang.code}
                              onClick={() => handleLanguageSelect(lang.code)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-[#f0f5f0] border-2 border-[#2f5233] shadow-xs'
                                  : 'bg-white border-[#e5e9e4] hover:bg-[#f0f5f0]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase ${
                                    isSelected
                                      ? 'bg-[#2f5233] text-white'
                                      : 'bg-[#ebefea] text-[#181d1a] group-hover:bg-[#e5e9e4]'
                                  }`}
                                >
                                  {lang.code}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-[#181d1a] flex items-center gap-2">
                                    <span>{lang.nativeName}</span>
                                    {lang.code === statePrimaryLangCode && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#c4edc3] text-[#002108]">
                                        Regional
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#727970]">{lang.name}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakLanguagePrompt(lang.code);
                                  }}
                                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                                    isSpeaking
                                      ? 'bg-[#2f5233] text-white animate-pulse'
                                      : 'bg-[#ebefea] text-[#181d1a] hover:bg-[#e5e9e4]'
                                  }`}
                                  title="Listen voice pronunciation"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-[#2f5233] text-white'
                                      : 'border border-[#c2c8be]'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep('all-languages')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#f0f5f0] text-[#181d1a] text-xs font-semibold flex items-center justify-center gap-2 border border-[#c2c8be] transition-all cursor-pointer"
                      >
                        <Globe className="w-4 h-4 text-[#2f5233]" />
                        <span>More Languages (सभी 12 भारतीय भाषाएं)</span>
                      </button>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep('location')}
                          className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f0f5f0] text-[#181d1a] text-xs font-bold border border-[#c2c8be] cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep('registration')}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Continue to Farmer Login / Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Searchable All 12 Languages List */
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#727970] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search language / भाषा खोजें..."
                          className="w-full bg-[#f0f5f0] border border-[#c2c8be] rounded-xl pl-9 pr-4 py-2 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none focus:border-[#2f5233] focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                        {filteredLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              selectedLang === lang.code
                                ? 'bg-[#f0f5f0] border-2 border-[#2f5233] text-[#2f5233] font-bold'
                                : 'bg-white border-[#e5e9e4] hover:bg-[#f0f5f0] text-[#181d1a]'
                            }`}
                          >
                            <div className="truncate pr-1">
                              <div className="text-xs font-bold truncate">{lang.nativeName}</div>
                              <div className="text-[10px] text-[#727970] truncate">{lang.name}</div>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ebefea] text-[#181d1a]">
                              {lang.code}
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep('language')}
                        className="w-full py-2 rounded-xl bg-white text-[#181d1a] text-xs font-bold border border-[#c2c8be] hover:bg-[#f0f5f0] cursor-pointer"
                      >
                        Back to Top Options
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  STEP 3: LOGIN & REGISTRATION GATE
                 ======================================================== */}
              {step === 'registration' && (
                <div className="space-y-4">
                  {/* Mode Tabs: New Farmer Registration vs Already Registered Sign In */}
                  <div className="flex rounded-xl bg-[#ebefea] p-1 border border-[#e5e9e4]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setFormErrors({});
                        setGlobalError(null);
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMode === 'register'
                          ? 'bg-[#2f5233] text-white shadow-xs'
                          : 'text-[#727970] hover:text-[#181d1a]'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('newRegistration')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setFormErrors({});
                        setGlobalError(null);
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMode === 'login'
                          ? 'bg-[#2f5233] text-white shadow-xs'
                          : 'text-[#727970] hover:text-[#181d1a]'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t('signIn')}</span>
                    </button>
                  </div>

                  {globalError && (
                    <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0" />
                      <span>{globalError}</span>
                    </div>
                  )}

                  {/* ----------------- REGISTER TAB ----------------- */}
                  {authMode === 'register' ? (
                    <form onSubmit={handleFormSubmit} className="space-y-3.5">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#2f5233]" />
                          <span>{t('farmerName')} *</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar / कुलदीप सिंह"
                          className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3.5 py-2.5 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none"
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Phone with OTP Verification */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#2f5233]" />
                            <span>{t('mobileNumber')} *</span>
                          </span>
                          {otpStep === 'verified' && (
                            <span className="text-[10px] font-bold text-[#002108] bg-[#c4edc3] px-2 py-0.5 rounded-full border border-[#c4edc3] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#2f5233]" />
                              <span>OTP Verified</span>
                            </span>
                          )}
                        </label>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#727970]">
                              +91
                            </span>
                            <input
                              type="tel"
                              maxLength={10}
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value.replace(/[^0-9]/g, ''));
                                if (otpStep !== 'phone') setOtpStep('phone');
                              }}
                              placeholder="9876543210"
                              className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl pl-11 pr-3 py-2.5 text-xs text-[#181d1a] font-mono tracking-wider placeholder:text-[#727970] outline-none"
                            />
                          </div>
                          {otpStep === 'phone' && (
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              className="px-3.5 py-2.5 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                            >
                              Send OTP
                            </button>
                          )}
                        </div>
                        {formErrors.phone && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.phone}</p>
                        )}

                        {/* OTP Verification Prompt */}
                        {otpStep === 'otp' && (
                          <div className="mt-2 p-3 bg-[#f0f5f0] border border-[#2f5233]/40 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs text-[#2f5233]">
                              <span className="font-semibold">Enter 4-Digit OTP Code:</span>
                              <span className="font-mono font-bold bg-[#c4edc3] text-[#002108] px-2 py-0.5 rounded">
                                Code: {generatedOtp}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value)}
                                placeholder="4826"
                                className="w-28 text-center font-mono font-bold text-sm tracking-widest bg-white border border-[#2f5233] rounded-lg py-1.5 text-[#181d1a] outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="px-3 py-1.5 rounded-lg bg-[#2f5233] hover:bg-[#183b1e] text-white text-xs font-bold cursor-pointer"
                              >
                                Verify OTP
                              </button>
                            </div>
                            {formErrors.otp && (
                              <p className="text-[11px] text-[#ba1a1a]">{formErrors.otp}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Date of Birth with 18+ Validation */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#2f5233]" />
                            <span>Date of Birth / जन्म तिथि (18+ Mandatory) *</span>
                          </label>
                          {dobValidation.isValid ? (
                            <span className="text-[10px] font-bold text-[#002108] bg-[#c4edc3] px-2 py-0.5 rounded-full">
                              Age: {dobValidation.age} yrs (Eligible)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                              Under 18 Restricted
                            </span>
                          )}
                        </div>

                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3.5 py-2.5 text-xs text-[#181d1a] outline-none"
                        />
                        {formErrors.dob && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.dob}</p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#2f5233]" />
                          <span>Set Password / पासवर्ड सेट करें *</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Set secure 4+ digit password / PIN"
                            className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727970] hover:text-[#181d1a] cursor-pointer p-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.password}</p>
                        )}
                      </div>

                      {/* Total Land Area & Unit */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                            <Trees className="w-3.5 h-3.5 text-[#2f5233]" />
                            <span>{t('totalLand')} *</span>
                          </label>
                          <span className="text-[11px] font-bold text-[#2f5233]">
                            ≈ {totalLandInAcres} Standard Acres
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={landValue}
                            onChange={(e) => setLandValue(e.target.value)}
                            placeholder="3.5"
                            className="w-28 bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3 py-2 text-xs text-[#181d1a] font-bold outline-none"
                          />
                          <select
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            className="flex-1 bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3 py-2 text-xs text-[#181d1a] font-medium outline-none"
                          >
                            {LAND_UNITS.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick Increment Chips */}
                        <div className="flex gap-1.5 pt-1">
                          {[0.5, 1.0, 2.5, 5.0].map((inc) => (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => handleAddLand(inc)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#f0f5f0] border border-[#c2c8be] text-[11px] font-bold text-[#181d1a] transition-all cursor-pointer"
                            >
                              +{inc}
                            </button>
                          ))}
                        </div>
                        {formErrors.land && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.land}</p>
                        )}
                      </div>

                      {/* Auto-detected Farm Location (State, District, Major City) */}
                      <div className="bg-white border border-[#e5e9e4] rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#181d1a] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2f5233]" />
                            <span>Auto-Detected Location (Accurate Distance)</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleRequestLiveLocation}
                            disabled={isDetectingLocation}
                            className="text-[11px] font-bold text-[#2f5233] hover:text-[#183b1e] flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 text-[#2f5233] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                            <span>Refresh GPS</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-[#727970] block mb-0.5">State</label>
                            <select
                              value={detectedState}
                              onChange={(e) => handleSelectStateManually(e.target.value as IndianState)}
                              className="w-full bg-[#f0f5f0] border border-[#c2c8be] rounded-lg px-2 py-1.5 text-xs text-[#181d1a] font-medium outline-none truncate"
                            >
                              {allStatesAndUts.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#727970] block mb-0.5">District</label>
                            <select
                              value={detectedDistrict}
                              onChange={(e) => setDetectedDistrict(e.target.value)}
                              className="w-full bg-[#f0f5f0] border border-[#c2c8be] rounded-lg px-2 py-1.5 text-xs text-[#181d1a] font-medium outline-none truncate"
                            >
                              {availableDistricts.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#727970] block mb-0.5">Nearest City/Town</label>
                            <select
                              value={detectedCity}
                              onChange={(e) => setDetectedCity(e.target.value)}
                              className="w-full bg-[#f0f5f0] border border-[#c2c8be] rounded-lg px-2 py-1.5 text-xs text-[#181d1a] font-medium outline-none truncate"
                            >
                              {availableCities.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Government Farmer ID (PM-KISAN / Agristack) Roadmap Showcase */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-[#2f5233]" />
                            <span>Government Farmer ID (Optional)</span>
                          </span>
                          <span className="text-[10px] text-[#002108] font-mono bg-[#c4edc3] px-1.5 py-0.5 rounded font-bold">
                            Agristack Roadmap
                          </span>
                        </label>
                        <input
                          type="text"
                          value={governmentFarmerId}
                          onChange={(e) => setGovernmentFarmerId(e.target.value)}
                          placeholder="Enter your PM-KISAN or Farmer ID (e.g. PM10101...)"
                          className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3.5 py-2.5 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none font-mono"
                        />
                        <p className="text-[11px] text-[#727970] leading-snug">
                          Link your government farmer ID to unlock subsidy tracking and scheme eligibility (coming soon)
                        </p>
                      </div>

                      {/* Submit Register Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Creating Kisan Profile & Assigning ID...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 text-white" />
                            <span>Register Farmer & Get Kisan ID (पंजीकरण करें)</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* ----------------- SIGN IN TAB ----------------- */
                    <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#2f5233]" />
                          <span>Mobile Number OR Kisan ID / मोबाइल नंबर या किसान आईडी *</span>
                        </label>
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. 9876543210 or PMK-HP-84920"
                          className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl px-3.5 py-2.5 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none font-mono"
                        />
                        {formErrors.loginIdentifier && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.loginIdentifier}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#181d1a] flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#2f5233]" />
                          <span>Password / पासवर्ड *</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-[#f0f5f0] focus:bg-white border border-[#c2c8be] focus:border-[#2f5233] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#181d1a] placeholder:text-[#727970] outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727970] hover:text-[#181d1a] cursor-pointer p-1"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formErrors.loginPassword && (
                          <p className="text-[11px] text-[#ba1a1a]">{formErrors.loginPassword}</p>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-[#e5e9e4] text-[11px] text-[#727970]">
                        First time visiting? Switch to{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className="text-[#2f5233] font-bold underline cursor-pointer"
                        >
                          New Farmer Registration
                        </button>{' '}
                        to create your free Kisan profile and satellite field ID.
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#2f5233] hover:bg-[#183b1e] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Authenticating Farmer...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4 text-white" />
                            <span>{t('signIn')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

