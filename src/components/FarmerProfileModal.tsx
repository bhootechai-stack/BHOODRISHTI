import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  Sprout,
  ShieldCheck,
  LogOut,
  Layers,
  Database,
  CheckCircle2,
  Navigation,
  Compass,
  LocateFixed,
  Loader2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Edit3,
  Save,
  Check,
  Zap,
  Landmark,
} from 'lucide-react';
import { UserProfile, UserLocation, saveFarmerLocation, updateFarmerProfile, setActiveUser, syncUserToSupabase } from '../services/dbApi';
import { GovernmentFarmerIdCard } from './GovernmentFarmerIdCard';
import { reverseGeocodeLocation, ALL_INDIAN_STATES } from '../utils/geoUtils';
import { LatLng, IndianState } from '../types';
import { getPrimaryUnitForState } from '../data/indianUnits';
import { getDistrictsByState } from '../data/indianDistricts';
import { useLocation } from '../context/LocationContext';

interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  farmCount: number;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onFlyToLocation?: (loc: LatLng) => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  farmCount,
  onUpdateUser,
  onFlyToLocation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const { coords: sharedCoords, retryLocation: refreshLocation } = useLocation();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto sync active farmer profile to Supabase users table on modal open
  useEffect(() => {
    if (isOpen && user) {
      syncUserToSupabase(user)
        .then((res) => {
          if (res.success) {
            console.log('Farmer profile auto-synced to Supabase');
          }
        })
        .catch((e) => console.warn('Auto sync profile note:', e));
    }
  }, [isOpen, user?.id, user?.name, user?.phone]);

  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDob, setEditDob] = useState(user?.dob || '');
  const [editState, setEditState] = useState<IndianState>((user?.state as IndianState) || 'Punjab');
  const [editDistrict, setEditDistrict] = useState(user?.district || '');
  const [editTehsil, setEditTehsil] = useState(user?.tehsil || '');
  const [editPatwarCircle, setEditPatwarCircle] = useState(user?.patwarCircle || '');
  const [editVillage, setEditVillage] = useState(user?.village || '');
  const [editAddress, setEditAddress] = useState(user?.location?.address || '');
  const [editPrimaryCrop, setEditPrimaryCrop] = useState(user?.primaryCrop || 'Wheat');
  const [editTotalLand, setEditTotalLand] = useState(user?.totalLandAcres || 2.5);
  const [editGovernmentId, setEditGovernmentId] = useState(user?.governmentFarmerId || '');

  if (!isOpen || !user) return null;

  const handleSyncFarmerToSupabase = async () => {
    setIsSyncingSupabase(true);
    setStatusMessage(null);
    try {
      const res = await syncUserToSupabase(user);
      setIsSyncingSupabase(false);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `${user.name} (+91 ${user.phone}) successfully pushed to Supabase public.users table!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Failed to sync to Supabase users table.',
        });
      }
    } catch (e: any) {
      setIsSyncingSupabase(false);
      setStatusMessage({
        type: 'error',
        text: `Error syncing profile: ${e?.message || 'Unknown error'}`,
      });
    }
  };

  const handleStartEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditDob(user.dob);
    setEditState((user.state as IndianState) || 'Punjab');
    setEditDistrict(user.district || '');
    setEditTehsil(user.tehsil || '');
    setEditPatwarCircle(user.patwarCircle || '');
    setEditVillage(user.village || '');
    setEditAddress(user.location?.address || '');
    setEditPrimaryCrop(user.primaryCrop || 'Wheat');
    setEditTotalLand(user.totalLandAcres || 2.5);
    setEditGovernmentId(user.governmentFarmerId || '');
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      setStatusMessage({ type: 'error', text: 'Name and Phone number are required.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const updates: Partial<UserProfile> = {
        name: editName.trim(),
        phone: editPhone.trim(),
        dob: editDob.trim(),
        state: editState,
        district: editDistrict.trim(),
        tehsil: editTehsil.trim(),
        patwarCircle: editPatwarCircle.trim(),
        village: editVillage.trim(),
        primaryCrop: editPrimaryCrop.trim(),
        totalLandAcres: Number(editTotalLand) || 0,
        governmentFarmerId: editGovernmentId.trim() || undefined,
        governmentIdStatus: editGovernmentId.trim() ? (user.governmentIdStatus || 'pending') : undefined,
        location: user.location
          ? {
              ...user.location,
              address: editAddress.trim() || user.location.address,
              updatedAt: new Date().toISOString(),
            }
          : editAddress.trim()
          ? {
              lat: 31.634,
              lng: 74.8723,
              accuracyMeters: 10,
              address: editAddress.trim(),
              updatedAt: new Date().toISOString(),
            }
          : undefined,
      };

      const result = await updateFarmerProfile(updates);
      setIsSaving(false);

      if (result.success && result.user) {
        setActiveUser(result.user);
        if (onUpdateUser) {
          onUpdateUser(result.user);
        }
        setIsEditing(false);
        setStatusMessage({
          type: 'success',
          text: 'Profile updated & synced directly to Supabase users table!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to update profile in database.',
        });
      }
    } catch (err: any) {
      setIsSaving(false);
      setStatusMessage({
        type: 'error',
        text: `Error updating profile: ${err?.message || 'Unknown error'}`,
      });
    }
  };

  const handleDetectAndSaveLiveLocation = async () => {
    setIsDetectingGps(true);
    setStatusMessage(null);

    try {
      let targetCoords = sharedCoords;
      if (!targetCoords || !Number.isFinite(targetCoords.lat) || !Number.isFinite(targetCoords.lng)) {
        await refreshLocation();
        targetCoords = sharedCoords;
      }

      if (!targetCoords || !Number.isFinite(targetCoords.lat) || !Number.isFinite(targetCoords.lng)) {
        setIsDetectingGps(false);
        setStatusMessage({
          type: 'error',
          text: 'Unable to acquire live GPS fix.',
        });
        return;
      }

      const lat = targetCoords.lat;
      const lng = targetCoords.lng;
      const accuracy = targetCoords.accuracy || 5;

      // Attempt reverse geocoding
      const geoInfo = await reverseGeocodeLocation(lat, lng);

      const newLocation: UserLocation = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        accuracyMeters: Math.round(accuracy),
        address: geoInfo.address,
        updatedAt: new Date().toISOString(),
      };

      // Save permanently to server database & user profile (and Supabase users table)
      const res = await saveFarmerLocation(newLocation);

      setIsDetectingGps(false);

      if (res.success && res.user) {
        setActiveUser(res.user);
        if (onUpdateUser) {
          onUpdateUser(res.user);
        }
        setStatusMessage({
          type: 'success',
          text: `Live location saved & synced to Supabase: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to save location to database profile.',
        });
      }
    } catch (err: any) {
      setIsDetectingGps(false);
      setStatusMessage({
        type: 'error',
        text: `Error saving location: ${err?.message || 'Unknown error'}`,
      });
    }
  };

  const handleFlyToSavedLocation = () => {
    if (user?.location && Number.isFinite(user.location.lat) && Number.isFinite(user.location.lng) && onFlyToLocation) {
      onFlyToLocation({ lat: user.location.lat, lng: user.location.lng });
      onClose();
    } else {
      console.error('FarmerProfileModal.tsx: handleFlyToSavedLocation aborted, user location is undefined or invalid', user?.location);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f6fbf5] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] border border-[#e5e9e4] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto text-[#181d1a] transition-colors">
        {/* Passbook / Identity Card Header */}
        <div className="p-5 sm:p-6 bg-[#f6fbf5] text-[#181d1a] flex items-center justify-between border-b border-[#e5e9e4] relative shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[14px] bg-[#E3E8D8] border border-[#E6E1D3] p-1 flex items-center justify-center text-[#2D5A36]">
              <User className="w-6 h-6 text-[#2D5A36]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1E2B1F] tracking-tight">
                  {user.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                  Kisan Passbook
                </span>
              </div>
              <p className="text-xs text-[#6B7266] font-mono mt-0.5">
                ID: {user.kisanId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3 py-1.5 rounded-[8px] bg-[#FBFAF5] hover:bg-[#EEEADF] text-[#2D5A36] border border-[#D9D4C4] text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                title="Edit Farmer Profile"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2D5A36]" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] bg-[#FBFAF5] hover:bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F] border border-[#D9D4C4] flex items-center justify-center transition-all duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details or Edit Form */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-[#2F3A2E] custom-scrollbar">
          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2 border animate-in fade-in duration-200 ${
                statusMessage.type === 'success'
                  ? 'bg-[#E3E8D8] text-[#2D5A36] border-[#2D5A36]/40'
                  : 'bg-[#F8E3E0] text-[#C0392B] border-[#C0392B]/40'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A36]" />
                ) : (
                  <X className="w-4 h-4 text-[#C0392B]" />
                )}
              </div>
              <p className="leading-snug">{statusMessage.text}</p>
            </div>
          )}

          {isEditing ? (
            /* EDIT PROFILE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A36] flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile &amp; Sync to Supabase</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[#6B7266] hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Farmer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Gurpreet Singh"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Mobile Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    DOB Password (DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. 15-08-1985"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    State
                  </label>
                  <select
                    value={editState}
                    onChange={(e) => {
                      const st = e.target.value as IndianState;
                      setEditState(st);
                      const dists = getDistrictsByState(st);
                      if (dists.length > 0) setEditDistrict(dists[0]);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                  >
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Amritsar"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Tehsil / Sub-District
                  </label>
                  <input
                    type="text"
                    value={editTehsil}
                    onChange={(e) => setEditTehsil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Ajnala"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Patwar Circle / Halka
                  </label>
                  <input
                    type="text"
                    value={editPatwarCircle}
                    onChange={(e) => setEditPatwarCircle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Chogawan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Mauza / Village
                  </label>
                  <input
                    type="text"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Ballian"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Primary Sown Crop
                  </label>
                  <input
                    type="text"
                    value={editPrimaryCrop}
                    onChange={(e) => setEditPrimaryCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. Wheat / Paddy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                    Total Land (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editTotalLand}
                    onChange={(e) => setEditTotalLand(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                    placeholder="e.g. 5.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                  Government Farmer ID (PM-KISAN / Agristack)
                </label>
                <input
                  type="text"
                  value={editGovernmentId}
                  onChange={(e) => setEditGovernmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                  placeholder="Enter your PM-KISAN or Farmer ID (e.g. PM10101...)"
                />
                <p className="text-[10px] text-[#6B7266] mt-1">
                  Link your government farmer ID to unlock subsidy tracking and scheme eligibility (coming soon)
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2F3A2E] mb-1">
                  Full Address / Area Notes
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF5] border border-[#E6E1D3] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#2D5A36]"
                  placeholder="e.g. Village Ballian, Near Canal, Amritsar, Punjab"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2D5A36] hover:bg-[#23472A] text-white rounded-[8px] shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Syncing to Supabase...' : 'Save & Sync to Supabase'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#FBFAF5] hover:bg-[#EEEADF] text-[#2D5A36] border border-[#E6E1D3] transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* VIEW DETAILS MODE */
            <>
              {/* PERMANENT LIVE GPS LOCATION CARD */}
              <div className="bg-[#FBFAF5] rounded-2xl p-4 border border-[#E6E1D3] space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#2D5A36] text-white rounded-[8px] flex items-center justify-center shadow-xs">
                      <LocateFixed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#181d1a] flex items-center gap-1.5">
                        <span>स्थायी जीपीएस लोकेशन</span>
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider bg-[#c4edc3] text-[#002108] border border-[#c4edc3] px-1.5 py-0.5 rounded font-bold">
                          Live Base
                        </span>
                      </h4>
                      <p className="text-[10px] text-[#727970]">Permanent GPS Location Linked to Profile</p>
                    </div>
                  </div>

                  {user.location && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#002108] bg-[#c4edc3] px-2 py-0.5 rounded-full border border-[#c4edc3]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2f5233]"></span>
                      Active Link
                    </span>
                  )}
                </div>

                {user.location ? (
                  <div className="bg-[#F4F1E8] rounded-xl p-3.5 border border-[#E6E1D3] space-y-2.5 text-xs transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[#727970] font-medium flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#2f5233]" />
                        GPS Coordinates:
                      </span>
                      <span className="font-mono font-bold text-[#183b1e] bg-[#ffffff] border border-[#e5e9e4] px-2.5 py-0.5 rounded-lg">
                        {user.location && Number.isFinite(user.location.lat) && Number.isFinite(user.location.lng)
                          ? `${user.location.lat.toFixed(5)}°N, ${user.location.lng.toFixed(5)}°E`
                          : (console.error('FarmerProfileModal.tsx: user.location coordinates undefined or invalid', user.location), 'GPS Pending')}
                      </span>
                    </div>

                    {user.location.address && (
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#e5e9e4] text-[11px]">
                        <span className="text-[#727970] shrink-0">Address / Area:</span>
                        <span className="font-medium text-[#181d1a] text-right leading-tight">
                          {user.location.address}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-[#e5e9e4] text-[10px] text-[#727970]">
                      <span>Accuracy: ±{user.location.accuracyMeters || 5}m</span>
                      <span>
                        Saved: {new Date(user.location.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Location Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDetectAndSaveLiveLocation}
                        disabled={isDetectingGps}
                        className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-[#FBFAF5] hover:bg-[#EEEADF] text-[#2D5A36] border border-[#E6E1D3] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isDetectingGps ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#2D5A36] animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-[#2D5A36]" />
                        )}
                        <span>{isDetectingGps ? 'Updating...' : 'Update GPS'}</span>
                      </button>

                      {onFlyToLocation && (
                        <button
                          type="button"
                          onClick={handleFlyToSavedLocation}
                          className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-[#2D5A36] hover:bg-[#23472A] text-white rounded-[8px] shadow-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-white" />
                          <span>Fly Map Here</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F4F1E8] rounded-xl p-4 border border-dashed border-[#E6E1D3] text-center space-y-3">
                    <p className="text-xs text-[#2F3A2E] leading-snug">
                      No permanent live GPS location is linked to this Kisan profile yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleDetectAndSaveLiveLocation}
                      disabled={isDetectingGps}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#2D5A36] hover:bg-[#23472A] text-white rounded-[8px] shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isDetectingGps ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4 text-white" />
                      )}
                      <span>{isDetectingGps ? 'Detecting High-Accuracy GPS...' : 'Add My Live Location & Save'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* GOVERNMENT FARMER ID (AGRISTACK / PM-KISAN ROADMAP SHOWCASE) */}
              <GovernmentFarmerIdCard user={user} onUpdateUser={onUpdateUser} />

              {/* Standard Profile Info Fields */}
              <div className="bg-[#FBFAF5] rounded-2xl p-4 border border-[#E6E1D3] space-y-3 transition-colors">
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#E6E1D3]">
                  <span className="text-[#6B7266] flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#6B7266]" />
                    Contact Mobile
                  </span>
                  <strong className="text-white font-mono">+91 {user.phone}</strong>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[#E6E1D3]">
                  <span className="text-[#6B7266] flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#6B7266]" />
                    DOB Password
                  </span>
                  <strong className="text-white font-mono">{user.dob}</strong>
                </div>

                <div className="flex items-start justify-between text-xs py-1 border-b border-[#E6E1D3]">
                  <span className="text-[#6B7266] flex items-center gap-1.5 font-medium shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#6B7266]" />
                    Revenue Location
                  </span>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {user.state} {user.district ? `• ${user.district}` : ''}
                    </div>
                    {(user.tehsil || user.patwarCircle) && (
                      <div className="text-[11px] text-[#2F3A2E] font-medium">
                        {user.tehsil ? `Tehsil: ${user.tehsil}` : ''}
                        {user.tehsil && user.patwarCircle ? ' | ' : ''}
                        {user.patwarCircle ? `Halka: ${user.patwarCircle}` : ''}
                      </div>
                    )}
                    {user.village && (
                      <div className="text-[10px] text-[#6B7266]">
                        Mauza/Village: {user.village}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[#E6E1D3]">
                  <span className="text-[#6B7266] flex items-center gap-1.5 font-medium">
                    <Sprout className="w-3.5 h-3.5 text-[#2D5A36]" />
                    Primary Crop
                  </span>
                  <strong className="text-[#2D5A36]">{user.primaryCrop}</strong>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#6B7266] flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-[#6B7266]" />
                    Total Registered Land
                  </span>
                  <div className="text-right">
                    {(() => {
                      const stateKey = (user.state as IndianState) || 'Punjab';
                      const unit = getPrimaryUnitForState(stateKey);
                      const localVal = ((user.totalLandAcres * 4046.8564) / unit.sqMeters).toFixed(2);
                      return (
                        <div>
                          <strong className="text-white font-bold block">
                            {localVal} {unit.name} {unit.localName ? `(${unit.localName})` : ''}
                          </strong>
                          <span className="text-[11px] text-[#6B7266]">
                            {user.totalLandAcres} Acres • {(user.totalLandAcres * 4046.86).toLocaleString()} m²
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Supabase User Profile Sync Action Button */}
              <button
                type="button"
                onClick={handleSyncFarmerToSupabase}
                disabled={isSyncingSupabase}
                className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-[#2D5A36] hover:bg-[#23472A] text-white rounded-[8px] shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncingSupabase ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                )}
                <span>
                  {isSyncingSupabase
                    ? 'Pushing Profile to Supabase users table...'
                    : `Sync "${user.name}" to Supabase (public.users)`}
                </span>
              </button>

              {/* User Isolation Guarantee */}
              <div className="bg-[#FBFAF5] rounded-xl p-3 border border-[#E6E1D3] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A36] shrink-0 mt-0.5" />
                <div className="text-xs text-[#2F3A2E]">
                  <p className="font-bold text-white">Isolated Private Session (Supabase Linked)</p>
                  <p className="text-[11px] text-[#6B7266] mt-0.5">
                    Your personal farm plots ({farmCount} active records), permanent GPS base, and profile records are synced securely with Supabase.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-[#C0392B] border border-rose-800/60 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out / Switch Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#FBFAF5] hover:bg-[#EEEADF] text-[#2D5A36] border border-[#E6E1D3] rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
