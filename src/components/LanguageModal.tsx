import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Check,
  X,
  Sparkles,
  Volume2,
  Mic,
  MessageSquare,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/translations';
import { SPOKEN_DIALECTS, SpokenDialect } from '../utils/dialectDefinitions';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  greeting: string;
  region: string;
  speakers: string;
}

const INDIAN_LANGUAGES_META: LanguageMetadata[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', greeting: 'राम-राम किसान भाई', region: 'North & Central India', speakers: '528M+' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ', region: 'Punjab & North India', speakers: '33M+' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', greeting: 'राम-कृष्ण हरी, नमस्कार', region: 'Maharashtra & Goa', speakers: '83M+' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', greeting: 'જય શ્રી કૃષ્ણ, નમસ્તે', region: 'Gujarat & Saurashtra', speakers: '55M+' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', greeting: 'வணக்கம் விவசாய தோழரே', region: 'Tamil Nadu & Puducherry', speakers: '69M+' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', greeting: 'నమస్కారం రైతు సోదరా', region: 'Andhra Pradesh & Telangana', speakers: '81M+' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', greeting: 'নমস্কার কৃষক বন্ধু', region: 'West Bengal & Tripura', speakers: '97M+' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೆ', region: 'Karnataka', speakers: '44M+' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', greeting: 'നമസ്കാരം കർഷക സുഹൃത്തേ', region: 'Kerala & Lakshadweep', speakers: '35M+' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', greeting: 'ନମସ୍କାର ଚାଷୀ ଭାଇ', region: 'Odisha', speakers: '38M+' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', greeting: 'নমস্কাৰ কৃষক ভাই', region: 'Assam & North-East', speakers: '15M+' },
  { code: 'en', name: 'English', nativeName: 'English', greeting: 'Welcome Farmer Friend', region: 'Pan-India / Global', speakers: 'Pan-India' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, spokenDialect, setSpokenDialect, spokenDialectObj } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dialect' | 'written'>('dialect');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewingDialectId, setPreviewingDialectId] = useState<string | null>(null);

  const filteredDialects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SPOKEN_DIALECTS;
    return SPOKEN_DIALECTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nativeName.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.greetingSample.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INDIAN_LANGUAGES_META;
    return INDIAN_LANGUAGES_META.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.greeting.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const playDialectSample = (dialect: SpokenDialect, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      setPreviewingDialectId(dialect.id);
      const utterance = new SpeechSynthesisUtterance(dialect.conversationalPhrases.howAreYou);
      utterance.lang = dialect.voiceLangCode;
      utterance.pitch = dialect.speechPitch;
      utterance.rate = dialect.speechRate;
      utterance.onend = () => setPreviewingDialectId(null);
      utterance.onerror = () => setPreviewingDialectId(null);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setPreviewingDialectId(null);
    }
  };

  const handleSelectDialect = (dialectId: string) => {
    setSpokenDialect(dialectId);
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden w-full max-w-2xl text-[#1E2B1F] flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#FBFAF5] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#E6E1D3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#E3E8D8] flex items-center justify-center text-[#2D5A36] border border-[#E6E1D3]">
              <Globe className="w-5 h-5 text-[#2D5A36]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1E2B1F]">
                  Language & Dialect Settings
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-[6px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                  Voice & Screen Independent
                </span>
              </div>
              <p className="text-xs text-[#6B7266] font-medium">
                बोलने की बोली और स्क्रीन की भाषा अलग-अलग चुनें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#6B7266] hover:text-[#1E2B1F] border border-[#D9D4C4] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Distinct Tabs for Spoken vs Written */}
        <div className="grid grid-cols-2 p-2 bg-[#FBFAF5] border-b border-[#E6E1D3] gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('dialect')}
            className={`py-2.5 px-3 rounded-[8px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dialect'
                ? 'bg-[#2D5A36] text-white shadow-xs'
                : 'bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-none">1. Spoken Dialect (बोलने की बोली)</div>
              <span className="text-[10px] font-normal opacity-90">
                AI की बोली: {spokenDialectObj.nativeName}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('written')}
            className={`py-2.5 px-3 rounded-[8px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'written'
                ? 'bg-[#2D5A36] text-white shadow-xs'
                : 'bg-[#EEEADF] text-[#6B7266] hover:text-[#1E2B1F]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-none">2. Screen Language (स्क्रीन की भाषा)</div>
              <span className="text-[10px] font-normal opacity-90">
                UI: {INDIAN_LANGUAGES_META.find((l) => l.code === language)?.nativeName || 'English'}
              </span>
            </div>
          </button>
        </div>

        {/* Current Active Selection Status Banner */}
        <div className="bg-[#E3E8D8] px-4 py-2 border-b border-[#E6E1D3] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#2D5A36]">
            <span className="font-bold">AI साथी बोलेगा:</span>
            <span className="bg-[#FBFAF5] border border-[#E6E1D3] text-[#2D5A36] px-2 py-0.5 rounded-[6px] font-medium">
              {spokenDialectObj.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#2D5A36]">
            <span className="font-bold">स्क्रीन भाषा:</span>
            <span className="bg-[#FBFAF5] border border-[#E6E1D3] text-[#2D5A36] px-2 py-0.5 rounded-[6px] font-medium">
              {INDIAN_LANGUAGES_META.find((l) => l.code === language)?.name || 'English'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 bg-[#FBFAF5] border-b border-[#E6E1D3]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'dialect'
                  ? 'हरियाणवी, अवधी, मालवा, काठियावाड़ी या राज्य खोजें...'
                  : 'Search written interface language (Hindi, Punjabi, English)...'
              }
              className="w-full bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] pl-10 pr-4 py-2 text-sm text-[#2F3A2E] placeholder-[#9A9D92] focus:outline-none focus:border-[#2D5A36]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7266] hover:text-[#1E2B1F] text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4F1E8] flex-1">
          {activeTab === 'dialect' ? (
            // Spoken Dialects Tab
            filteredDialects.map((d) => {
              const isSelected = spokenDialect === d.id;
              const isPlaying = previewingDialectId === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDialect(d.id)}
                  className={`p-4 rounded-[14px] border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FBFAF5] border-[#2D5A36] ring-2 ring-[#2D5A36]/30 shadow-[0_1px_3px_rgba(40,50,35,0.06)]'
                      : 'bg-[#FBFAF5] hover:bg-[#F4F0E6] border-[#E6E1D3] text-[#2F3A2E]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-[#1E2B1F] tracking-wide block">
                          {d.nativeName}
                        </span>
                        <span className="text-xs font-medium text-[#6B7266]">
                          {d.name}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#2D5A36] text-white flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#2D5A36] font-medium italic mt-2 line-clamp-2">
                      "{d.greetingSample}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between text-[11px] text-[#6B7266]">
                    <span className="truncate">{d.region}</span>
                    <button
                      type="button"
                      onClick={(e) => playDialectSample(d, e)}
                      className={`px-2 py-0.5 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-[#2D5A36] text-white'
                          : 'bg-[#FBFAF5] text-[#2D5A36] border border-[#D9D4C4] hover:bg-[#F4F0E6]'
                      }`}
                      title="Listen to dialect voice sample"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlaying ? 'Playing...' : 'Sample'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Written Languages Tab
            filteredLanguages.map((item) => {
              const isSelected = language === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`p-4 rounded-[14px] text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FBFAF5] border-[#2D5A36] ring-2 ring-[#2D5A36]/30 shadow-[0_1px_3px_rgba(40,50,35,0.06)]'
                      : 'bg-[#FBFAF5] hover:bg-[#F4F0E6] border-[#E6E1D3] text-[#2F3A2E]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-xl sm:text-2xl font-bold text-[#1E2B1F] tracking-wide block">
                          {item.nativeName}
                        </span>
                        <span className="text-xs font-medium text-[#6B7266]">
                          {item.name}
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-[#2D5A36] text-white flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[6px] bg-[#EEEADF] text-[#6B7266]">
                          {item.speakers}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#2D5A36] font-medium italic mt-2 line-clamp-1">
                      "{item.greeting}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between text-[11px] text-[#6B7266]">
                    <span className="truncate">{item.region}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer with Done Button */}
        <div className="p-3.5 bg-[#FBFAF5] border-t border-[#E6E1D3] flex items-center justify-between text-xs text-[#6B7266]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A36]" />
            <span>Updates voice companion and interface instantly.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-[8px] bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>Confirm & Close</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
