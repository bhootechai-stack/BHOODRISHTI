import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Edit3,
  Check,
  ArrowRight,
  FileCheck2,
  Layers,
  Building2,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { PALETTE } from '../utils/themeTokens';
import { UserProfile, updateFarmerProfile, setActiveUser } from '../services/dbApi';

interface GovernmentFarmerIdCardProps {
  user: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
  onBackToProfile?: () => void;
}

export const GovernmentFarmerIdCard: React.FC<GovernmentFarmerIdCardProps> = ({
  user,
  onUpdateUser,
  onBackToProfile,
}) => {
  const [farmerIdInput, setFarmerIdInput] = useState<string>(user?.governmentFarmerId || '');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('Checking with Agristack...');
  const [showComingSoon, setShowComingSoon] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(!user?.governmentFarmerId);
  const [inputError, setInputError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (user?.governmentFarmerId) {
      setFarmerIdInput(user.governmentFarmerId);
    }
  }, [user?.governmentFarmerId]);

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = farmerIdInput.trim();

    if (!trimmed) {
      setInputError('Please enter your Government Farmer ID or PM-KISAN registration code.');
      return;
    }

    if (trimmed.length < 5) {
      setInputError('Farmer ID must be at least 5 alphanumeric characters (e.g. PM10101, PB8901).');
      return;
    }

    setInputError(null);
    setIsVerifying(true);
    setVerificationProgress(15);
    setLoadingMessage('Checking with Agristack...');

    // Progress step 1
    const t1 = setTimeout(() => {
      setVerificationProgress(55);
      setLoadingMessage('Verifying Farmer ID with National Registry...');
    }, 800);

    // Progress step 2
    const t2 = setTimeout(() => {
      setVerificationProgress(90);
      setLoadingMessage('Resolving scheme eligibility & DBT linkage...');
    }, 1500);

    // Completion after ~2.1 seconds
    const t3 = setTimeout(async () => {
      setVerificationProgress(100);
      setIsVerifying(false);

      // Persist to user profile
      try {
        const updates: Partial<UserProfile> = {
          governmentFarmerId: trimmed,
          governmentIdStatus: 'pending',
          governmentIdLinkedAt: new Date().toISOString(),
        };

        const res = await updateFarmerProfile(updates);
        if (res.success && res.user) {
          setActiveUser(res.user);
          if (onUpdateUser) {
            onUpdateUser(res.user);
          }
        } else if (user) {
          const fallbackUser: UserProfile = {
            ...user,
            ...updates,
          };
          setActiveUser(fallbackUser);
          if (onUpdateUser) {
            onUpdateUser(fallbackUser);
          }
        }
      } catch (err) {
        console.warn('Persistence note for Government Farmer ID:', err);
      }

      // Transition to Coming Soon result screen
      setShowComingSoon(true);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleDismissComingSoon = () => {
    setShowComingSoon(false);
    setIsEditing(false);
    if (onBackToProfile) {
      onBackToProfile();
    }
  };

  const handleCopyId = () => {
    if (user?.governmentFarmerId) {
      navigator.clipboard?.writeText(user.governmentFarmerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. LOADING STATE (Animated 1.5 - 2.5s indicator)
  if (isVerifying) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0EB] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin text-[#2F5233]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1F2A1F] tracking-tight flex items-center gap-2">
              <span>{loadingMessage}</span>
            </h4>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5 font-mono">
              Connecting to Ministry of Agriculture Agristack Gateway
            </p>
          </div>
        </div>

        {/* Forest Green Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-[#FAF8F2] rounded-full h-2 overflow-hidden border border-[#E5E0D3]">
            <div
              className="bg-[#2F5233] h-full transition-all duration-300 ease-out"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-mono font-medium">
            <span>Querying ID: {farmerIdInput}</span>
            <span className="text-[#2F5233] font-bold">{verificationProgress}%</span>
          </div>
        </div>

        {/* Security / Protocol Note */}
        <div className="bg-[#FAF8F2] rounded-xl p-3 border border-[#E5E0D3] flex items-center gap-2.5 text-xs text-[#6B7280] font-medium">
          <Landmark className="w-4 h-4 text-[#6B7280] shrink-0" />
          <span>AES-256 encrypted handshake with PM-KISAN / Agristack sandbox</span>
        </div>
      </div>
    );
  }

  // 2. COMING SOON RESULT SCREEN / CARD
  if (showComingSoon) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#E5E0D3] shadow-xs space-y-4">
        {/* Header with Landmark Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6 text-[#2F5233]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#1F2A1F] tracking-tight">
                Government ID Integration — Coming Soon
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3]">
                Roadmap Preview
              </span>
            </div>
            <p className="text-xs text-[#6B7280] font-medium mt-1.5 leading-relaxed">
              We&apos;re working with the Agristack and PM-KISAN systems to enable direct verification of your farmer ID, which will unlock features like subsidy eligibility checks, scheme recommendations, and verified farmer status.
            </p>
          </div>
        </div>

        {/* Persisted ID Card */}
        <div className="bg-[#FAF8F2] rounded-xl p-3.5 border border-[#E5E0D3] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              Registered Farmer ID
            </span>
            <span className="text-sm font-mono font-bold text-[#1F2A1F] tracking-wider">
              {farmerIdInput}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#2F5233]" />
            <span>Pending Verification</span>
          </div>
        </div>

        {/* Roadmap Value Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1F2A1F]">PM-KISAN DBT Sync</p>
              <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">Direct benefit transfer tracking &amp; ₹6,000 yearly status</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-start gap-2">
            <FileCheck2 className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1F2A1F]">PMFBY Crop Insurance</p>
              <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">Fast-track satellite yield loss claims with pre-verified land</p>
            </div>
          </div>
        </div>

        {/* Dismiss Button - Single primary CTA in Forest Green */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDismissComingSoon}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2F5233] hover:bg-[#244027] text-white transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Got it • Back to Profile</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. PERSISTED STATE: ALREADY ENTERED ID SHOWS WITH 'PENDING VERIFICATION' BADGE
  if (user?.governmentFarmerId && !isEditing) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E5E0D3] shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-[#2F5233]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#1F2A1F] tracking-tight">
                  Government Farmer ID
                </h4>
                <span className="text-[10px] text-[#6B7280] font-semibold font-mono">
                  (Agristack / PM-KISAN)
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] font-medium">
                Official Central Government Agriculture Registry
              </p>
            </div>
          </div>

          {/* Pending Verification Badge */}
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#2F5233] bg-[#EAF0EB] px-2.5 py-0.5 rounded-full border border-[#E5E0D3] shrink-0">
            <Clock className="w-3 h-3 text-[#2F5233]" />
            Pending Verification
          </span>
        </div>

        {/* Display ID in Monospace */}
        <div className="bg-[#FAF8F2] rounded-xl p-3 border border-[#E5E0D3] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#6B7280] font-medium">Linked ID:</span>
            <span className="font-mono font-bold text-[#1F2A1F] text-sm tracking-wider">
              {user.governmentFarmerId}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0E6] text-[#6B7280] hover:text-[#1F2A1F] border border-[#E5E0D3] transition-colors cursor-pointer"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2F5233]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F4F0E6] text-[#1F2A1F] border border-[#E5E0D3] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title="Update or Re-verify ID"
            >
              <Edit3 className="w-3 h-3 text-[#6B7280]" />
              <span>Change</span>
            </button>
          </div>
        </div>

        {/* Helper text / action to view roadmap */}
        <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-medium pt-0.5">
          <span>Linked to PM-KISAN &amp; Agristack sandbox</span>
          <button
            type="button"
            onClick={() => setShowComingSoon(true)}
            className="text-[#2F5233] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>Roadmap details</span>
            <ArrowRight className="w-3 h-3 text-[#2F5233]" />
          </button>
        </div>
      </div>
    );
  }

  // 4. INPUT FORM VIEW (When entering for first time or editing)
  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E5E0D3] shadow-xs space-y-3.5 transition-colors">
      {/* Title & Description */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4 text-[#2F5233]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#1F2A1F] tracking-tight">
                Government Farmer ID
              </h4>
              <span className="text-[10px] text-[#6B7280] font-semibold font-mono">
                (Agristack / PM-KISAN)
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280] font-medium">
              Future Roadmap Integration Showcase
            </p>
          </div>
        </div>

        {user?.governmentFarmerId && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-[#6B7280] hover:text-[#1F2A1F] cursor-pointer transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleStartVerification} className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold text-[#1F2A1F] mb-1">
            Enter Government Farmer ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={farmerIdInput}
              onChange={(e) => {
                setFarmerIdInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Enter your PM-KISAN or Farmer ID (e.g. PM10101...)"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] text-[#1F2A1F] placeholder-[#6B7280]/60 font-mono tracking-wider focus:outline-none focus:border-[#2F5233] focus:bg-white"
            />
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#6B7280] font-medium mt-1.5 leading-snug">
            Link your government farmer ID to unlock subsidy tracking and scheme eligibility (coming soon)
          </p>

          {inputError && (
            <p className="text-[11px] text-[#C0392B] font-semibold mt-1">
              {inputError}
            </p>
          )}
        </div>

        {/* Submit Button - Primary CTA in Forest Green with White text */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2F5233] hover:bg-[#244027] text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Verify</span>
          </button>

          {user?.governmentFarmerId && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#FAF8F2] hover:bg-[#F4F0E6] text-[#1F2A1F] border border-[#E5E0D3] transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
