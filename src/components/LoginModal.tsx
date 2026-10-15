import React, { useState, useMemo, useEffect } from 'react';
import {
  Phone,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  LocateFixed,
  Trees,
  Check,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  X,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  loginFarmer,
  registerFarmer,
  setActiveUser,
} from '../services/dbApi';
import { BrandLogo } from './BrandLogo';
import { IndianState, LatLng } from '../types';
import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES } from '../utils/geoUtils';
import { getDistrictsByState } from '../data/indianDistricts';
import {
  lookupFarmerLocation,
  getMajorCitiesByState,
  validateFarmerAge,
  FarmerLocationLookupResult,
} from '../utils/locationLookup';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isMandatory?: boolean;
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

interface DemoKisanProfile {
  id: string;
  name: string;
  phone: string;
  dob: string;
  password?: string;
  kisanId: string;
  state: IndianState;
  district: string;
  village: string;
  primaryCrop: string;
  totalLandAcres: number;
  description: string;
}

const DEMO_KISAN_PROFILES: DemoKisanProfile[] = [
  {
    id: 'user-9876543210',
    name: 'Sardar Gurpreet Singh',
    phone: '9876543210',
    dob: '1985-05-15',
    password: 'kisan',
    kisanId: 'PMK-PB-84920',
    state: 'Punjab',
    district: 'Amritsar',
    village: 'Jandiala Guru',
    primaryCrop: 'Wheat (HD-2967)',
    totalLandAcres: 6.2,
    description: 'Wheat & Mustard Grower • Canal Irrigation • 6.2 Acres',
  },
  {
    id: 'user-9822012345',
    name: 'Dnyaneshwar Patil',
    phone: '9822012345',
    dob: '1990-08-22',
    password: 'kisan',
    kisanId: 'PMK-MH-33104',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Dindori',
    primaryCrop: 'Grapes (Thompson Seedless)',
    totalLandAcres: 4.5,
    description: 'Horticulture & Vineyard • Drip Fertigation • 4.5 Acres',
  },
  {
    id: 'user-9816012345',
    name: 'Ramesh Chandra Sharma',
    phone: '9816012345',
    dob: '1994-06-15',
    password: 'kisan',
    kisanId: 'PMK-HP-84920',
    state: 'Himachal Pradesh',
    district: 'Kangra',
    village: 'Nagrota Bagwan',
    primaryCrop: 'Wheat & Vegetables',
    totalLandAcres: 3.5,
    description: 'Terraced Precision Agro • Mountain Soil • 3.5 Acres',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isMandatory = false,
}) => {
  const [mode, setMode] = useState<'demo' | 'login' | 'register'>('demo');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields for Register
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dob, setDob] = useState<string>('1994-06-15');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('9876543210');
  const [loginPassword, setLoginPassword] = useState<string>('kisan');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Land Fields
  const [landValue, setLandValue] = useState<string>('3.5');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('acre');
  const [primaryCrop, setPrimaryCrop] = useState<string>('Wheat');

  // Location Fields (Auto-detected & Editable)
  const [selectedState, setSelectedState] = useState<IndianState>('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Amritsar');
  const [selectedCity, setSelectedCity] = useState<string>('Amritsar');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // OTP Simulation for Registration
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [generatedOtp, setGeneratedOtp] = useState<string>('4826');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Kisan ID Reveal
  const [registeredUserCard, setRegisteredUserCard] = useState<UserProfile | null>(null);
  const [copiedKisanId, setCopiedKisanId] = useState<boolean>(false);

  // Dropdown options
  const allStatesAndUts = useMemo(() => [...ALL_INDIAN_STATES, ...ALL_UNION_TERRITORIES], []);
  const availableDistricts = useMemo(() => getDistrictsByState(selectedState), [selectedState]);
  const availableCities = useMemo(() => getMajorCitiesByState(selectedState), [selectedState]);

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

  // Auto-detect location if modal opens in register mode
  useEffect(() => {
    if (isOpen && mode === 'register' && !selectedDistrict) {
      handleAutoDetectLocation();
    }
  }, [isOpen, mode]);

  const handleAutoDetectLocation = async () => {
    setIsDetectingGps(true);
    try {
      const res = await lookupFarmerLocation();
      if (res && res.state) {
        setSelectedState(res.state as IndianState);
        if (res.district) setSelectedDistrict(res.district);
        if (res.city) setSelectedCity(res.city);
      }
    } catch (e) {
      console.warn('Location detection fallback:', e);
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleStateChange = (newState: IndianState) => {
    setSelectedState(newState);
    const districts = getDistrictsByState(newState);
    if (districts.length > 0) setSelectedDistrict(districts[0]);
    const cities = getMajorCitiesByState(newState);
    if (cities.length > 0) setSelectedCity(cities[0]);
  };

  // Instant 1-Click Demo Login
  const handleQuickDemoLogin = async (profile: DemoKisanProfile) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginFarmer(profile.phone, profile.password || profile.dob);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        // Direct construct if network has delay
        const fallbackUser: UserProfile = {
          id: profile.id,
          phone: profile.phone,
          dob: profile.dob,
          name: profile.name,
          kisanId: profile.kisanId,
          state: profile.state,
          district: profile.district,
          village: profile.village,
          primaryCrop: profile.primaryCrop,
          totalLandAcres: profile.totalLandAcres,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setActiveUser(fallbackUser);
        onLoginSuccess(fallbackUser);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  // Regular Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setFieldErrors({ loginIdentifier: 'Please enter your Mobile Number or Kisan ID' });
      return;
    }
    if (!loginPassword.trim()) {
      setFieldErrors({ loginPassword: 'Password is required' });
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginFarmer(loginIdentifier.trim(), loginPassword.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your details or use 1-Click Demo.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign in connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Farmer name is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length !== 10) {
      errors.phone = 'Enter valid 10-digit mobile number';
    }
    if (!dobValidation.isValid) errors.dob = dobValidation.error || 'Invalid date of birth';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await registerFarmer({
        name: name.trim(),
        phone: phone.trim(),
        dob,
        password: password || dob,
        state: selectedState,
        district: selectedDistrict,
        city: selectedCity,
        primaryCrop: primaryCrop || 'Wheat',
        totalLandAcres: totalLandInAcres,
      });

      if (res.success && res.user) {
        setRegisteredUserCard(res.user);
      } else {
        setErrorMsg(res.error || 'Registration failed. Try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKisanId = () => {
    if (registeredUserCard?.kisanId) {
      navigator.clipboard.writeText(registeredUserCard.kisanId);
      setCopiedKisanId(true);
      setTimeout(() => setCopiedKisanId(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden w-full max-w-lg text-[#1E2B1F] flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#FBFAF5] p-4 sm:p-5 flex items-center justify-between border-b border-[#E6E1D3]">
          <div className="flex items-center gap-3">
            <BrandLogo tagline="Kisan Identity & Farm Telemetry" showTagline={true} size="md" />
          </div>

          {!isMandatory && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#6B7266] hover:text-[#1E2B1F] border border-[#D9D4C4] flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        {!registeredUserCard && (
          <div className="flex border-b border-[#E6E1D3] bg-[#FBFAF5] p-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('demo');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-[8px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'demo'
                  ? 'bg-[#2D5A36] text-white shadow-xs'
                  : 'bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#D9922B]" />
              <span>1-Click Demo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-[8px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#2D5A36] text-white shadow-xs'
                  : 'bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Quick Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-[8px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#2D5A36] text-white shadow-xs'
                  : 'bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Farmer</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-[8px] bg-[#F8E3E0] border border-[#F8B4B4] text-[#C0392B] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C0392B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {registeredUserCard ? (
            /* Registration Success Reveal Card */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-[14px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E2B1F]">Registration Successful!</h3>
                <p className="text-xs text-[#6B7266]">Your sovereign Indian Kisan ID has been issued.</p>
              </div>

              <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-4 text-left space-y-3 shadow-[0_1px_3px_rgba(40,50,35,0.06)]">
                <span className="text-[10px] font-bold text-[#2D5A36] uppercase tracking-wider block">
                  Official Kisan Card:
                </span>
                <div className="flex items-center justify-between bg-[#FBFAF5] px-4 py-3 rounded-[8px] border border-[#D9D4C4]">
                  <span className="text-xl font-mono font-bold text-[#2D5A36]">
                    {registeredUserCard.kisanId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKisanId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] text-xs font-semibold border border-[#E6E1D3] cursor-pointer"
                  >
                    {copiedKisanId ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKisanId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#2F3A2E] pt-1">
                  <div>
                    <span className="text-[#6B7266] text-[10px] block">Farmer Name</span>
                    <span className="font-bold text-[#1E2B1F]">{registeredUserCard.name}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7266] text-[10px] block">State & District</span>
                    <span className="font-bold text-[#1E2B1F]">
                      {registeredUserCard.state}, {registeredUserCard.district}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onLoginSuccess(registeredUserCard)}
                className="w-full h-11 bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs uppercase tracking-wider rounded-[8px] shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Enter Farm Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : mode === 'demo' ? (
            /* Tab 1: 1-Click Demo Kisan */
            <div className="space-y-3">
              <div className="bg-[#E3E8D8] border border-[#E6E1D3] p-3 rounded-[14px] flex items-center gap-2.5 text-xs text-[#2D5A36]">
                <Sparkles className="w-4 h-4 text-[#2D5A36] shrink-0" />
                <span>
                  <strong>Instant Evaluation:</strong> Tap any verified regional farmer profile below to sign in instantly with real agricultural data.
                </span>
              </div>

              <div className="space-y-2.5">
                {DEMO_KISAN_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(profile)}
                    className="w-full p-3.5 rounded-[14px] bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#E6E1D3] text-left transition-all group cursor-pointer flex items-center justify-between shadow-[0_1px_3px_rgba(40,50,35,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] flex items-center justify-center text-[#2D5A36] group-hover:scale-105 transition-transform shrink-0">
                        <User className="w-5 h-5 text-[#2D5A36]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1E2B1F] group-hover:text-[#2D5A36] transition-colors">
                            {profile.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[6px] bg-[#EEEADF] text-[#6B7266]">
                            {profile.kisanId}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7266] mt-0.5">{profile.description}</p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] group-hover:bg-[#2D5A36] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : mode === 'login' ? (
            /* Tab 2: Quick Sign In */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2F3A2E] mb-1 flex items-center justify-between">
                  <span>Mobile Number OR Kisan ID *</span>
                  <span className="text-[10px] text-[#6B7266]">Demo: 9876543210</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#2D5A36] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (fieldErrors.loginIdentifier) setFieldErrors((p) => ({ ...p, loginIdentifier: '' }));
                    }}
                    placeholder="Enter mobile (10 digits) or Kisan ID"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-sm focus:outline-none focus:border-[#2D5A36] font-mono"
                  />
                </div>
                {fieldErrors.loginIdentifier && (
                  <p className="text-[#C0392B] text-xs mt-1">{fieldErrors.loginIdentifier}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2F3A2E] mb-1 flex items-center justify-between">
                  <span>Password / Date of Birth *</span>
                  <span className="text-[10px] text-[#6B7266]">Demo: kisan</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#2D5A36] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (fieldErrors.loginPassword) setFieldErrors((p) => ({ ...p, loginPassword: '' }));
                    }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-sm focus:outline-none focus:border-[#2D5A36]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7266] hover:text-[#1E2B1F]"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.loginPassword && (
                  <p className="text-[#C0392B] text-xs mt-1">{fieldErrors.loginPassword}</p>
                )}
              </div>

              {/* Quick Fill Button */}
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('9876543210');
                  setLoginPassword('kisan');
                }}
                className="text-[11px] text-[#2D5A36] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3 text-[#2D5A36]" />
                <span>Fill Punjab Wheat Farmer credentials</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs uppercase tracking-wider rounded-[8px] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          ) : (
            /* Tab 3: New Registration */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2F3A2E] mb-1">
                  Farmer Full Name / किसान का नाम *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Sharma"
                  className="w-full px-3.5 py-2.5 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-sm focus:outline-none focus:border-[#2D5A36]"
                />
                {fieldErrors.name && <p className="text-[#C0392B] text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2F3A2E] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 digit number"
                    className="w-full px-3.5 py-2.5 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-sm focus:outline-none focus:border-[#2D5A36] font-mono"
                  />
                  {fieldErrors.phone && <p className="text-[#C0392B] text-xs mt-1">{fieldErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2F3A2E] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-sm focus:outline-none focus:border-[#2D5A36]"
                  />
                  {fieldErrors.dob && <p className="text-[#C0392B] text-xs mt-1">{fieldErrors.dob}</p>}
                </div>
              </div>

              {/* State & District with GPS */}
              <div className="pt-2 border-t border-[#E6E1D3]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#2F3A2E] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5A36]" />
                    <span>Location / राज्य व जिला</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={isDetectingGps}
                    className="text-[10px] text-[#2D5A36] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <LocateFixed className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Detecting...' : 'Auto-GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value as IndianState)}
                    className="w-full px-2.5 py-2 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-xs font-medium cursor-pointer"
                  >
                    {allStatesAndUts.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-xs font-medium cursor-pointer"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Land Holdings */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E1D3]">
                <div>
                  <span className="block text-xs font-semibold text-[#2F3A2E] mb-1">Land Area</span>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={landValue}
                      onChange={(e) => setLandValue(e.target.value)}
                      className="w-20 px-2.5 py-2 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-xs font-mono text-center"
                    />
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="flex-1 px-2 py-2 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-xs cursor-pointer"
                    >
                      {LAND_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.short}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#2F3A2E] mb-1">Primary Crop</span>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] text-[#2F3A2E] text-xs cursor-pointer"
                  >
                    {['Wheat', 'Paddy / Rice', 'Cotton', 'Mustard', 'Soybean', 'Grapes', 'Sugarcane', 'Maize'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs uppercase tracking-wider rounded-[8px] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{loading ? 'Creating Kisan Account...' : 'Register & Get Kisan ID'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
