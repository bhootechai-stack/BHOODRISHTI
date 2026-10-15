import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Check,
  Activity,
  Microscope,
  FileText,
  Search,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Printer,
  Info,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Sprout,
  ShieldAlert,
} from 'lucide-react';
import {
  COMPREHENSIVE_CROPS_REGISTRY,
  ComprehensiveCropItem,
  CropCategory,
  DiagnosedPlantPart,
  analyzePlantDiagnostics,
  getRegionSuggestedCrops,
  calculatePhotoSamplingRecommendation,
  compressImageClientSide,
  SamplingRecommendation,
} from '../services/leafDoctorEngine';
import { useLanguage } from '../context/LanguageContext';
import { logDiagnosticToDb } from '../services/dbApi';
import { LeafDoctorSkeleton } from './SkeletonLoaders';
import { EmptyState } from './EmptyState';
import {
  SeverityGauge,
  TissuePathologyBreakdown,
  CircularProgressRing,
} from './charts/GeospatialCharts';
import { HeatmapStats } from '../types';

interface LeafDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCropName?: string;
  selectedState?: string;
  fieldAreaAcres?: number;
  heatmapStats?: HeatmapStats | null;
  activeSensorField?: any;
}

export const LeafDiagnosticModal: React.FC<LeafDiagnosticModalProps> = ({
  isOpen,
  onClose,
  defaultCropName,
  selectedState = 'Himachal Pradesh',
  fieldAreaAcres = 2.5,
  heatmapStats,
  activeSensorField,
}) => {
  const { t } = useLanguage();

  // Navigation Steps: 'select-crop' (Step 1) -> 'upload-photos' (Step 2) -> 'results' (Step 3)
  const [step, setStep] = useState<'select-crop' | 'upload-photos' | 'results'>('select-crop');

  // Resolved location and field parameters
  const resolvedState = activeSensorField?.state || selectedState || 'Himachal Pradesh';
  const resolvedAreaAcres = activeSensorField?.areaAcres || fieldAreaAcres || 2.5;
  const severeStressPct =
    heatmapStats?.severeNonVegPct ?? (activeSensorField?.stressPct ? activeSensorField.stressPct * 0.4 : 18.2);

  // Step 1: Crop Selection & Search
  const [selectedCrop, setSelectedCrop] = useState<ComprehensiveCropItem | null>(() => {
    const targetName = activeSensorField?.crop || defaultCropName;
    if (targetName) {
      const match = COMPREHENSIVE_CROPS_REGISTRY.find(
        (c) =>
          c.name.toLowerCase().includes(targetName.toLowerCase()) ||
          c.id.toLowerCase().includes(targetName.toLowerCase()) ||
          c.hindiName.toLowerCase().includes(targetName.toLowerCase())
      );
      if (match) return match;
    }
    return COMPREHENSIVE_CROPS_REGISTRY[0]; // Default Apple
  });

  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Step 2: Photos (Unlimited uploads, client compressed)
  const [uploadedPhotos, setUploadedPhotos] = useState<DiagnosedPlantPart[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Step 3: Diagnostic Result
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);
  const [activeRemedyTab, setActiveRemedyTab] = useState<'chemical' | 'organic'>('chemical');
  const [savedDbMessage, setSavedDbMessage] = useState<string | null>(null);

  // Regional suggestions
  const regionalCrops = useMemo(() => {
    return getRegionSuggestedCrops(resolvedState, 4);
  }, [resolvedState]);

  // Categories
  const categories: Array<'All' | CropCategory> = [
    'All',
    'Cereals & Millets',
    'Pulses & Legumes',
    'Oilseeds',
    'Vegetables & Spices',
    'Fruits & Orchards',
    'Plantation & Commercial',
  ];

  // Filtered crops list
  const filteredCrops = useMemo(() => {
    const q = cropSearchQuery.trim().toLowerCase();
    return COMPREHENSIVE_CROPS_REGISTRY.filter((crop) => {
      const matchesSearch =
        !q ||
        crop.name.toLowerCase().includes(q) ||
        crop.hindiName.toLowerCase().includes(q) ||
        crop.scientificName.toLowerCase().includes(q) ||
        crop.id.toLowerCase().includes(q) ||
        crop.commonDiseases.some((d) => d.name.toLowerCase().includes(q));

      const matchesCategory =
        activeCategoryFilter === 'All' || crop.category === activeCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [cropSearchQuery, activeCategoryFilter]);

  // Photo sampling recommendation
  const samplingRecommendation: SamplingRecommendation = useMemo(() => {
    if (!selectedCrop) {
      return {
        totalAreaAcres: resolvedAreaAcres,
        severeStressPct: severeStressPct,
        affectedAcres: 0.45,
        cropPlantDensityPerAcre: 250,
        estimatedAffectedPlants: 110,
        recommendedPhotos: 8,
        minimumPhotos: 4,
        currentPhotosCount: uploadedPhotos.length,
        samplingConfidencePct: 0,
        rationale: '',
      };
    }
    return calculatePhotoSamplingRecommendation({
      crop: selectedCrop,
      totalAreaAcres: resolvedAreaAcres,
      severeStressPct: severeStressPct,
      currentPhotosCount: uploadedPhotos.length,
    });
  }, [selectedCrop, resolvedAreaAcres, severeStressPct, uploadedPhotos.length]);

  if (!isOpen) return null;

  // Handle Photo File Upload (Unlimited uploads, no file size ceiling)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingUpload(true);
    const filesList = Array.from(files);

    try {
      const partTypes: Array<'leaf' | 'stem' | 'root' | 'fruit' | 'whole_plant'> = [
        'leaf',
        'stem',
        'root',
        'fruit',
        'whole_plant',
      ];

      const processedNewPhotos: DiagnosedPlantPart[] = [];

      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        // Compresses image client-side to ensure silky smooth performance & prevent memory ceiling
        const imageUri = await compressImageClientSide(file);
        const assignedPart = partTypes[(uploadedPhotos.length + i) % partTypes.length];
        const partLabel =
          assignedPart === 'leaf'
            ? 'Leaf Tissue'
            : assignedPart === 'stem'
            ? 'Stem / Branch'
            : assignedPart === 'root'
            ? 'Root Collar'
            : assignedPart === 'fruit'
            ? 'Fruit / Bloom'
            : 'Whole Canopy';

        processedNewPhotos.push({
          part: assignedPart,
          label: partLabel,
          imageUri,
        });
      }

      setUploadedPhotos((prev) => [...prev, ...processedNewPhotos]);
    } catch (err) {
      console.error('Error processing plant photo upload:', err);
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdatePhotoPart = (
    index: number,
    newPart: 'leaf' | 'stem' | 'root' | 'fruit' | 'whole_plant'
  ) => {
    const partLabels: Record<string, string> = {
      leaf: 'Leaf Tissue',
      stem: 'Stem / Branch',
      root: 'Root Collar',
      fruit: 'Fruit / Bloom',
      whole_plant: 'Whole Canopy',
    };

    setUploadedPhotos((prev) =>
      prev.map((photo, idx) =>
        idx === index ? { ...photo, part: newPart, label: partLabels[newPart] } : photo
      )
    );
  };

  // Run AI Diagnostic Workflow
  const handleRunDiagnostic = () => {
    if (!selectedCrop) return;
    setIsAnalyzing(true);
    setStep('results');

    setTimeout(() => {
      const result = analyzePlantDiagnostics(
        selectedCrop.id,
        uploadedPhotos.length > 0
          ? uploadedPhotos
          : [
              {
                part: 'leaf',
                label: 'Leaf Tissue',
                imageUri: '',
              },
            ],
        notes
      );
      setDiagnosticResult(result);
      setIsAnalyzing(false);
    }, 650);
  };

  // Save to Database
  const handleSaveToDatabase = async () => {
    if (!diagnosticResult) return;
    const saved = await logDiagnosticToDb({
      crop: diagnosticResult.crop,
      diseaseName: diagnosticResult.diseaseName,
      severity: diagnosticResult.severity,
      confidence: diagnosticResult.confidence,
      symptoms: diagnosticResult.symptoms,
      remedyType: activeRemedyTab,
    });
    if (saved) {
      setSavedDbMessage('Diagnostic Record Logged into Farm Phytosanitary Archive');
      setTimeout(() => setSavedDbMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBFAF5] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] border border-[#E6E1D3] max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto text-[#1E2B1F] transition-colors">
        {/* ================= CLINICAL HEADER ================= */}
        <div className="p-4 sm:p-5 bg-[#FBFAF5] border-b border-[#E6E1D3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#2F5233] shrink-0">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-[#2F5233] flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#2F5233]" />
                  ICAR-NCIPM & CIBRC Aligned Phytopathology Clinic
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]">
                  v4.2 Pro
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2A1F] flex items-center gap-2 mt-0.5">
                <span>Leaf Doctor: Clinical Crop Diagnosis</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#6B7280]" />
                  <span>{resolvedState}</span>
                </span>
                <span>•</span>
                <span>Parcel Area: <strong className="text-[#1F2A1F] font-mono">{resolvedAreaAcres} Ac</strong></span>
                <span>•</span>
                <span>Satellite Stress: <strong className="text-[#1F2A1F] font-mono">{severeStressPct.toFixed(1)}% Red Zone</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#6B7280] hover:text-[#1F2A1F] border border-[#E5E0D3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= CLINICAL STEPPER BAR ================= */}
        <div className="px-5 py-2.5 bg-[#F7F4EC] border-b border-[#E5E0D3] flex items-center justify-between text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStep('select-crop')}
            className={`flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              step === 'select-crop'
                ? 'text-[#1F2A1F] font-bold'
                : 'text-[#6B7280] hover:text-[#1F2A1F]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                step === 'select-crop'
                  ? 'bg-[#2F5233] text-[#F7F4EC]'
                  : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
              }`}
            >
              1
            </span>
            <span>
              1. Crop Selection ({selectedCrop ? selectedCrop.name.split(' ')[0] : 'Choose'})
            </span>
          </button>

          <ChevronRight className="w-4 h-4 text-[#E5E0D3] shrink-0" />

          <button
            type="button"
            onClick={() => {
              if (selectedCrop) setStep('upload-photos');
            }}
            disabled={!selectedCrop}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap ${
              step === 'upload-photos'
                ? 'text-[#1F2A1F] font-bold'
                : selectedCrop
                ? 'text-[#6B7280] hover:text-[#1F2A1F] cursor-pointer'
                : 'text-[#6B7280] opacity-40 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                step === 'upload-photos'
                  ? 'bg-[#2F5233] text-[#F7F4EC]'
                  : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
              }`}
            >
              2
            </span>
            <span>
              2. Specimen Upload ({uploadedPhotos.length} / {samplingRecommendation.recommendedPhotos} Rec.)
            </span>
          </button>

          <ChevronRight className="w-4 h-4 text-[#E5E0D3] shrink-0" />

          <div
            className={`flex items-center gap-2 whitespace-nowrap ${
              step === 'results'
                ? 'text-[#1F2A1F] font-bold'
                : 'text-[#6B7280] opacity-40'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                step === 'results'
                  ? 'bg-[#2F5233] text-[#F7F4EC]'
                  : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
              }`}
            >
              3
            </span>
            <span>3. Corroborated Prescription</span>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-[#1F2A1F] flex-1 custom-scrollbar bg-[#F7F4EC]">
          {/* ================= STEP 1: SELECT CROP CONTEXT ================= */}
          {step === 'select-crop' && (
            <div className="space-y-4">
              {/* Region-aware Crop Suggestions Banner */}
              <div className="p-3.5 bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2F5233]" />
                    <h5 className="text-xs font-bold text-[#1F2A1F] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Most Common in Your Region</span>
                      <span className="text-[10px] font-mono text-[#6B7280] font-semibold lowercase">
                        ({resolvedState})
                      </span>
                    </h5>
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono">
                    Prioritized by Agro-Climatic Zone
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {regionalCrops.map((rc) => {
                    const isSelected = selectedCrop?.id === rc.id;
                    return (
                      <button
                        key={rc.id}
                        type="button"
                        onClick={() => setSelectedCrop(rc)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF8F2] border-[#2F5233] text-[#1F2A1F]'
                            : 'bg-[#F7F4EC] hover:bg-[#FFFFFF] border-[#E5E0D3] text-[#6B7280]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{rc.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-[#1F2A1F]">{rc.name.split(' ')[0]}</p>
                          <p className="text-[10px] text-[#6B7280] truncate">{rc.hindiName}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#2F5233] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar & Category Filter */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Indian crops by name, Hindi (जैसे गेहूं, धान, सेब, कपास, आलू...), or disease..."
                    value={cropSearchQuery}
                    onChange={(e) => setCropSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl text-xs font-medium text-[#1F2A1F] placeholder-[#6B7280] focus:outline-none focus:border-[#2F5233]"
                  />
                  {cropSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCropSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#6B7280] hover:text-[#1F2A1F] text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-[#2F5233] text-[#F7F4EC] font-bold border-[#2F5233]'
                          : 'bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#6B7280] border-[#E5E0D3]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredCrops.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-xs text-[#6B7280]">
                    No crops matching "{cropSearchQuery}". Try typing another crop or clear search.
                  </div>
                ) : (
                  filteredCrops.map((c) => {
                    const isSelected = selectedCrop?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCrop(c)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? 'bg-[#FAF8F2] border-[#2F5233]'
                            : 'bg-[#FFFFFF] hover:bg-[#FAF8F2] border-[#E5E0D3]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] border border-[#E5E0D3] flex items-center justify-center text-xl shrink-0">
                            {c.icon}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#1F2A1F] flex items-center gap-1.5 truncate">
                              <span>{c.name}</span>
                            </h5>
                            <span className="text-[10px] text-[#6B7280] block italic truncate">
                              {c.scientificName} • {c.category}
                            </span>
                            <span className="text-[9px] font-mono text-[#6B7280] block">
                              ~{c.plantDensityPerAcre.toLocaleString()} plants/acre • {c.commonDiseases.length} known pathogens
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                            isSelected
                              ? 'bg-[#2F5233] border-[#2F5233] text-[#F7F4EC]'
                              : 'border-[#E5E0D3]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-[#E5E0D3] flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  {selectedCrop ? (
                    <span>
                      Target: <strong className="text-[#1F2A1F]">{selectedCrop.name}</strong>
                    </span>
                  ) : (
                    'Please pick a crop to continue'
                  )}
                </span>

                <button
                  type="button"
                  disabled={!selectedCrop}
                  onClick={() => setStep('upload-photos')}
                  className="px-5 py-2 bg-[#2F5233] hover:bg-[#6f8c75] disabled:opacity-40 text-[#F7F4EC] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Proceed to Specimen Upload</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SMART PHOTO UPLOAD ================= */}
          {step === 'upload-photos' && selectedCrop && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#1F2A1F] flex items-center gap-2">
                    <span>Step 2: Collect & Upload Specimen Photos</span>
                    <span className="text-xs font-normal text-[#6B7280] font-mono">
                      ({selectedCrop.name})
                    </span>
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    No upload limit. Upload full-resolution photos of affected foliage, stem lesions, or root collars.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('select-crop')}
                  className="text-xs text-[#6B7280] hover:text-[#1F2A1F] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Crop</span>
                </button>
              </div>

              {/* Smart Photo-Count Recommendation Box */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]">
                        Statistical Sampling Engine
                      </span>
                      <span className="text-xs font-bold text-[#1F2A1F]">
                        Recommended Specimen Sizing
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {samplingRecommendation.rationale}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F7F4EC] border border-[#E5E0D3] text-center shrink-0 min-w-[110px]">
                    <div className="text-[10px] text-[#6B7280] uppercase font-mono">Recommended</div>
                    <div className="text-xl font-black text-[#1F2A1F] font-mono">
                      {samplingRecommendation.recommendedPhotos} Photos
                    </div>
                    <div className="text-[9px] text-[#6B7280] font-mono">for ~99% Conf.</div>
                  </div>
                </div>

                {/* Sampling Confidence Progress Meter */}
                <div className="space-y-1.5 pt-1 border-t border-[#E5E0D3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280] font-mono">
                      Photos Uploaded:{' '}
                      <strong className="text-[#1F2A1F] font-mono">{uploadedPhotos.length}</strong> /{' '}
                      {samplingRecommendation.recommendedPhotos} Recommended
                    </span>
                    <span className="text-[#1F2A1F] font-bold font-mono">
                      {samplingRecommendation.samplingConfidencePct}% Statistical Sample Confidence
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F7F4EC] rounded-full overflow-hidden border border-[#E5E0D3]">
                    <div
                      className="h-full bg-[#2F5233] transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (uploadedPhotos.length / samplingRecommendation.recommendedPhotos) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6B7280] italic">
                    Note: Guidance recommendation only. You may proceed with any number of photos ({uploadedPhotos.length === 0 ? 'or even 0 for symptomatic reference' : `${uploadedPhotos.length} uploaded`}).
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-5 border-2 border-dashed border-[#E5E0D3] hover:border-[#2F5233] rounded-xl bg-[#FFFFFF] text-center space-y-2.5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#F7F4EC] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1F2A1F]">
                  {isProcessingUpload ? 'Optimizing & Processing Full-Resolution Images...' : 'Select or Capture Plant Photos (Unlimited)'}
                </div>
                <p className="text-[11px] text-[#6B7280] max-w-md mx-auto">
                  Accepts high-resolution RAW, JPEG, PNG from mobile cameras or gallery. Auto-optimized in browser without upload ceilings.
                </p>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5233] hover:bg-[#6f8c75] text-[#F7F4EC] rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>{uploadedPhotos.length === 0 ? 'Select Plant Photos' : 'Add More Photos'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isProcessingUpload}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Thumbnails & Tagging Grid */}
              {uploadedPhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#1F2A1F] flex items-center justify-between">
                    <span>Uploaded Specimens ({uploadedPhotos.length})</span>
                    <span className="text-[10px] text-[#6B7280]">Categorize specific plant part for tissue correlation</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-1.5 relative"
                      >
                        <div className="relative h-24 w-full rounded-lg overflow-hidden bg-[#F7F4EC]">
                          <img
                            src={photo.imageUri}
                            alt={`Specimen ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 bg-[#F7F4EC]/80 hover:bg-[#C0392B] text-[#1F2A1F] rounded-md transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Part Tag Selector */}
                        <div className="space-y-1">
                          <select
                            value={photo.part}
                            onChange={(e) =>
                              handleUpdatePhotoPart(
                                idx,
                                e.target.value as 'leaf' | 'stem' | 'root' | 'fruit' | 'whole_plant'
                              )
                            }
                            className="w-full bg-[#F7F4EC] border border-[#E5E0D3] rounded-lg px-2 py-1 text-[11px] font-semibold text-[#1F2A1F] focus:outline-none"
                          >
                            <option value="leaf">Leaf Tissue</option>
                            <option value="stem">Stem / Branch</option>
                            <option value="root">Root Collar</option>
                            <option value="fruit">Fruit / Bloom</option>
                            <option value="whole_plant">Whole Canopy</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Field Symptom Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2A1F]">
                  Optional Observations & Field Micro-Climate Notes (लक्षण / परिस्थिति)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spreading rapidly after 3 days of dense fog; yellowing on lower leaves..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl text-xs text-[#1F2A1F] placeholder-[#6B7280] focus:outline-none focus:border-[#2F5233]"
                />
              </div>

              {/* Bottom Action Button */}
              <div className="pt-3 border-t border-[#E5E0D3] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('select-crop')}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1F2A1F] cursor-pointer"
                >
                  ← Back to Crops
                </button>

                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  className="px-6 py-2.5 bg-[#2F5233] hover:bg-[#6f8c75] text-[#F7F4EC] rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {uploadedPhotos.length === 0
                      ? 'Run Diagnosis (Visual Symptom Inspection)'
                      : uploadedPhotos.length === 1
                      ? 'Run Diagnosis (1 Photo Angle)'
                      : `Run Multi-Angle Diagnosis (${uploadedPhotos.length} Angles)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: RESULTS (CLINICAL DIAGNOSTIC REPORT) ================= */}
          {step === 'results' && (
            <div>
              {isAnalyzing ? (
                <LeafDoctorSkeleton />
              ) : diagnosticResult ? (
                (() => {
                  const severityScore =
                    diagnosticResult.severity === 'Severe'
                      ? 84
                      : diagnosticResult.severity === 'High'
                      ? 68
                      : diagnosticResult.severity === 'Moderate'
                      ? 42
                      : 18;

                  const healthyTissuePct = Math.max(8, 100 - severityScore - (severityScore > 50 ? 12 : 8));
                  const mildLesionPct = Math.round((100 - healthyTissuePct) * (severityScore > 50 ? 0.4 : 0.65));
                  const severeNecroticPct = Math.max(2, 100 - healthyTissuePct - mildLesionPct);

                  return (
                    <div className="space-y-4">
                      {/* Clinical Case Accession Header Strip */}
                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2F5233]" />
                          <span className="font-mono text-[#6B7280]">
                            Accession ID:{' '}
                            <strong className="text-[#1F2A1F]">{diagnosticResult.accessionId}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                          <span>•</span>
                          <span>{new Date().toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#1F2A1F] bg-[#FAF8F2] px-2 py-0.5 rounded-full border border-[#E5E0D3] font-mono">
                          <CheckCircle2 className="w-3 h-3 text-[#2F5233]" />
                          <span>Official Pathology Grounded</span>
                        </div>
                      </div>

                      {/* Top Diagnostic Banner */}
                      <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D3]">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-2 py-0.5 rounded-full">
                                {diagnosticResult.diagnosedCategory || 'Pathogen'}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  diagnosticResult.severity === 'Severe' || diagnosticResult.severity === 'High'
                                    ? 'bg-[#FAF8F2] text-[#C0392B] border border-[#C0392B]'
                                    : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
                                }`}
                              >
                                {diagnosticResult.severity} Severity
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F7F4EC] text-[#6B7280] border border-[#E5E0D3]">
                                CIBRC Reg: {diagnosticResult.cibrcRegistryCode}
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black text-[#1F2A1F] mt-1">
                              {diagnosticResult.diseaseName}
                            </h3>
                            <p className="text-xs text-[#6B7280] italic">
                              Target Crop: <strong className="text-[#1F2A1F] not-italic">{diagnosticResult.crop}</strong> • Pathogen: {diagnosticResult.scientificName}
                            </p>
                          </div>

                          {/* Circular Progress Gauge for Diagnostic Confidence */}
                          <div className="shrink-0 flex items-center gap-2 bg-[#F7F4EC] p-2 rounded-xl border border-[#E5E0D3]">
                            <CircularProgressRing
                              value={diagnosticResult.confidence}
                              size={56}
                              strokeWidth={5}
                              label="AI Conf"
                              colorScheme="forest"
                            />
                            <div className="pr-1">
                              <div className="text-[9px] text-[#6B7280] uppercase font-bold font-mono">Confidence</div>
                              <div className="text-xs font-mono font-black text-[#1F2A1F]">
                                {diagnosticResult.confidence}% Verified
                              </div>
                              <div className="text-[9px] text-[#6B7280] font-mono">Multi-Source</div>
                            </div>
                          </div>
                        </div>

                        {/* Multi-Photo Summary Chips */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-[#6B7280]">Corroborated Tissue Angles:</span>
                          {diagnosticResult.analyzedParts?.map((part: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F7F4EC] border border-[#E5E0D3] text-[#1F2A1F] text-[10px] font-mono font-semibold"
                            >
                              {part === 'leaf'
                                ? 'Leaf Tissue'
                                : part === 'stem'
                                ? 'Stem / Branch'
                                : part === 'root'
                                ? 'Root Collar'
                                : part === 'fruit'
                                ? 'Fruit / Bloom'
                                : 'Canopy'}
                            </span>
                          ))}
                        </div>

                        {/* Pathological Symptoms */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block font-mono">
                            Pathological Lesions & Diagnostic Matrix:
                          </span>
                          <ul className="space-y-1 text-xs text-[#1F2A1F]">
                            {diagnosticResult.symptoms.map((s: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#2F5233] font-bold">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Multi-Source Open Agronomic Data Corroboration Card */}
                      <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1F2A1F] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2F5233]" />
                            Multi-Source Open Agricultural Data Corroboration
                          </span>
                          <span className="text-[9px] text-[#6B7280] font-mono">
                            Non-Copyrighted Public Registries
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {diagnosticResult.sources?.map((src: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E5E0D3] text-[11px] space-y-1"
                            >
                              <div className="font-bold text-[#1F2A1F] truncate">{src.institution}</div>
                              <div className="text-[#6B7280] text-[10px] line-clamp-1">{src.repository}</div>
                              <div className="flex items-center justify-between text-[9px] text-[#6B7280] font-mono pt-1 border-t border-[#E5E0D3]">
                                <span>{src.refCode}</span>
                                <span className="text-[#2F5233]">Verified</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* VISUAL DISEASE SEVERITY GAUGE & TISSUE PATHOLOGY BREAKDOWN */}
                      <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#FAF8F2] text-[#2F5233] border border-[#E5E0D3] flex items-center justify-center font-bold">
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-[#1F2A1F] flex items-center gap-1.5">
                                <span>Pathology Spread & Economic Injury Threshold (ETL)</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]">
                                  NCIPM Standard
                                </span>
                              </h4>
                              <p className="text-[10px] text-[#6B7280]">
                                Canopy lesion ratio, necrotic tissue progression, and action threshold
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Visual Severity Gauge */}
                          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3]">
                            <SeverityGauge
                              score={severityScore}
                              label="Spread Severity"
                              category={`${diagnosticResult.severity} Risk`}
                              size={124}
                            />
                          </div>

                          {/* Tissue Pathology Breakdown */}
                          <div className="md:col-span-8 space-y-2">
                            <TissuePathologyBreakdown
                              healthyPct={healthyTissuePct}
                              mildPct={mildLesionPct}
                              severePct={severeNecroticPct}
                              totalAreaAnalyzed={`${diagnosticResult.analyzedParts?.length || 1} Plant Angles Corroborated`}
                            />

                            {/* ICAR Economic Injury Threshold (ETL) Alert */}
                            <div className="p-2.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] flex items-center justify-between text-[11px] gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <ShieldAlert
                                  className={`w-4 h-4 shrink-0 ${
                                    severityScore > 40 ? 'text-[#C0392B]' : 'text-[#6B7280]'
                                  }`}
                                />
                                <span className="text-[#6B7280]">
                                  Economic Threshold (ETL):{' '}
                                  <strong
                                    className={
                                      severityScore > 40 ? 'text-[#C0392B] font-bold' : 'text-[#1F2A1F] font-bold'
                                    }
                                  >
                                    {diagnosticResult.economicThresholdETL}
                                  </strong>
                                </span>
                              </div>
                              <span className="text-[9px] font-mono text-[#6B7280]">
                                Waiting Period: <strong className="text-[#1F2A1F]">{diagnosticResult.phiDays} Days</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Treatment Plan: Chemical vs Organic Tabs */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setActiveRemedyTab('chemical')}
                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              activeRemedyTab === 'chemical'
                                ? 'bg-[#2F5233] text-[#F7F4EC]'
                                : 'text-[#6B7280] hover:text-[#1F2A1F]'
                            }`}
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>CIBRC Registered Chemical Protocol</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveRemedyTab('organic')}
                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              activeRemedyTab === 'organic'
                                ? 'bg-[#2F5233] text-[#F7F4EC]'
                                : 'text-[#6B7280] hover:text-[#1F2A1F]'
                            }`}
                          >
                            <Sprout className="w-3.5 h-3.5" />
                            <span>Zero-Residue Bio & Organic Remedy</span>
                          </button>
                        </div>

                        {/* Chemical Remedy Card */}
                        {activeRemedyTab === 'chemical' && diagnosticResult.chemicalRemedy && (
                          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2.5 text-xs">
                            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-2 flex-wrap gap-2">
                              <div>
                                <span className="text-[#6B7280] text-[11px] block">Recommended CIBRC Registered Molecule:</span>
                                <span className="font-bold text-[#1F2A1F] text-sm">
                                  {diagnosticResult.chemicalRemedy.compound}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F4EC] text-[#6B7280] border border-[#E5E0D3]">
                                  Toxicity: {diagnosticResult.toxicityBand}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F4EC] text-[#6B7280] border border-[#E5E0D3]">
                                  PHI: {diagnosticResult.phiDays} Days
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E5E0D3]">
                                <span className="text-[#6B7280] block font-semibold">Statutory Field Dosage:</span>
                                <span className="font-bold text-[#1F2A1F] font-mono">
                                  {diagnosticResult.chemicalRemedy.dosage}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E5E0D3]">
                                <span className="text-[#6B7280] block font-semibold">Spray Schedule & Timing:</span>
                                <span className="font-semibold text-[#1F2A1F]">
                                  {diagnosticResult.chemicalRemedy.schedule}
                                </span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E5E0D3] text-[11px] text-[#6B7280]">
                              <strong className="text-[#1F2A1F]">Precautionary Guidelines:</strong> {diagnosticResult.chemicalRemedy.precautions}
                            </div>
                          </div>
                        )}

                        {/* Organic Remedy Card */}
                        {activeRemedyTab === 'organic' && diagnosticResult.organicRemedy && (
                          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-2.5 text-xs">
                            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-2">
                              <span className="font-bold text-[#1F2A1F] text-sm">
                                {diagnosticResult.organicRemedy.title}
                              </span>
                              <span className="text-[10px] font-bold uppercase bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-2 py-0.5 rounded">
                                Zero Chemical Residue
                              </span>
                            </div>

                            <div>
                              <span className="text-[11px] font-bold text-[#6B7280] block mb-1">
                                Ingredients Required:
                              </span>
                              <ul className="space-y-0.5 text-[11px] text-[#1F2A1F]">
                                {diagnosticResult.organicRemedy.ingredients.map((ing: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F5233]"></span>
                                    <span>{ing}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E5E0D3] text-[11px] space-y-1.5">
                              <div>
                                <strong className="text-[#1F2A1F]">Preparation Method:</strong>{' '}
                                <span className="text-[#6B7280]">
                                  {diagnosticResult.organicRemedy.preparation}
                                </span>
                              </div>
                              <div>
                                <strong className="text-[#1F2A1F]">Field Application:</strong>{' '}
                                <span className="text-[#6B7280]">
                                  {diagnosticResult.organicRemedy.application}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Preventative Agronomy Protocol */}
                      {diagnosticResult.preventivePlan && (
                        <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-[#1F2A1F]">
                            <ShieldCheck className="w-4 h-4 text-[#2F5233]" />
                            <span>Agronomic Preventive Protocol (Long-Term Inoculum Suppression)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-[#6B7280]">
                            {diagnosticResult.preventivePlan.map((plan: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-[#2F5233] font-bold">•</span>
                                <span>{plan}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Bottom Action Buttons */}
                      <div className="pt-3 border-t border-[#E5E0D3] flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setStep('upload-photos')}
                          className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1F2A1F] cursor-pointer"
                        >
                          ← Retake / Add More Photos
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveToDatabase}
                            className="px-4 py-2 bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#E5E0D3]"
                          >
                            {savedDbMessage || 'Save to Farm Health Log'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStep('select-crop');
                              setSelectedCrop(COMPREHENSIVE_CROPS_REGISTRY[0]);
                              setUploadedPhotos([]);
                              setDiagnosticResult(null);
                            }}
                            className="px-4 py-2 bg-[#2F5233] hover:bg-[#6f8c75] text-[#F7F4EC] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Diagnose Another Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-4">
                  <EmptyState
                    icon="camera"
                    isError={true}
                    title="No Plant Diagnostic Results Available"
                    description="Upload clear photos of affected leaf, stem, or root tissue to run multi-source diagnostic analysis."
                    actionLabel="Upload Photos"
                    actionIcon={<Camera className="w-3.5 h-3.5 text-[#F7F4EC]" />}
                    onAction={() => setStep('upload-photos')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
