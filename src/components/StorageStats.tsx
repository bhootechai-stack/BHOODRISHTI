import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Database,
  Store,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  PieChart,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { offlineAgriCache, StorageQuotaInfo } from '../services/offlineAgriCache';

interface StorageStatsProps {
  onRefreshParent?: () => void;
  className?: string;
}

export const StorageStats: React.FC<StorageStatsProps> = ({
  onRefreshParent,
  className = '',
}) => {
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<boolean>(false);
  const [cachedKeys, setCachedKeys] = useState<string[]>([]);
  const [isPersisted, setIsPersisted] = useState<boolean>(false);
  const [persisting, setPersisting] = useState<boolean>(false);

  const fetchStorageData = useCallback(async () => {
    setLoading(true);
    try {
      const info = await offlineAgriCache.getStorageQuota();
      setQuotaInfo(info);
      setIsPersisted(info.isPersisted);

      if ('caches' in window) {
        const cache = await window.caches.open('bhootech-agricultural-data-v1');
        const keys = await cache.keys();
        setCachedKeys(keys.map((k) => k.url));
      }
    } catch (e) {
      console.warn('[StorageStats] Error calculating cache storage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageData();
  }, [fetchStorageData]);

  const handleClearCache = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setLoading(true);
    const success = await offlineAgriCache.clearAgriCache();
    setConfirmClear(false);
    if (success) {
      setActionNotice('Offline agricultural dataset cache cleared successfully.');
      await fetchStorageData();
      onRefreshParent?.();
      setTimeout(() => setActionNotice(null), 3500);
    }
    setLoading(false);
  };

  const handleRequestPersistence = async () => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      setPersisting(true);
      try {
        const granted = await navigator.storage.persist();
        setIsPersisted(granted);
        if (granted) {
          setActionNotice('Persistent storage granted. Offline agricultural data is protected from browser eviction.');
        } else {
          setActionNotice('Browser kept default storage policy (sufficient for standard offline caching).');
        }
        setTimeout(() => setActionNotice(null), 4000);
      } catch (err) {
        console.warn('Error requesting persistent storage:', err);
      } finally {
        setPersisting(false);
      }
    }
  };

  if (!quotaInfo) return null;

  const agriShareOfQuotaPct =
    quotaInfo.totalQuotaBytes > 0
      ? Number(((quotaInfo.agriCacheBytes / quotaInfo.totalQuotaBytes) * 100).toFixed(4))
      : 0;

  return (
    <div className={`bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] p-4 sm:p-6 text-[#2F3A2E] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-5 ${className}`}>
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E1D3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5 text-[#2D5A36]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-[#1E2B1F] tracking-tight">
                Storage Stats • Cache API Usage
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A36]" />
                Offline Quota Monitor
              </span>
            </div>
            <p className="text-xs text-[#6B7266]">
              Total storage used by offline agricultural datasets compared to your device browser limit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={fetchStorageData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#2D5A36] text-xs font-semibold border border-[#D9D4C4] transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate Storage Quota"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2D5A36]' : ''}`} />
            <span>Refresh Stats</span>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer border ${
              confirmClear
                ? 'bg-[#C0392B] hover:bg-[#A93226] text-white border-[#C0392B]'
                : 'bg-[#FBFAF5] hover:bg-[#F8E3E0] text-[#6B7266] hover:text-[#C0392B] border-[#D9D4C4] hover:border-[#F8B4B4]'
            }`}
            title="Clear offline agricultural datasets"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#C0392B]" />
            <span>{confirmClear ? 'Confirm Purge?' : 'Clear Cache'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] text-xs px-3.5 py-2.5 rounded-[8px] flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2D5A36] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* HERO COMPARISON CARD: Agri Datasets vs Browser Limit */}
      <div className="p-4 sm:p-5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#2D5A36] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Offline Datasets vs. Browser Limit</span>
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#1E2B1F] flex items-baseline gap-2">
              <span className="text-[#2D5A36] font-mono">{quotaInfo.agriCacheFormatted}</span>
              <span className="text-[#6B7266] text-sm font-normal">used of</span>
              <span className="text-[#1E2B1F] font-mono">{quotaInfo.totalQuotaFormatted}</span>
              <span className="text-xs text-[#6B7266] font-normal">allocated limit</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-[6px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
              {agriShareOfQuotaPct < 0.01 ? '< 0.01%' : `${agriShareOfQuotaPct}%`} of Limit
            </span>
            <span className="text-[11px] font-semibold text-[#6B7266] hidden md:inline">
              (Plenty of room for offline data)
            </span>
          </div>
        </div>

        {/* Visual Storage Consumption Gauge Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-[#E3E0D3] rounded-full overflow-hidden flex">
            {/* Agri Cache share */}
            <div
              style={{ width: `${Math.min(100, Math.max(4, (quotaInfo.agriCacheBytes / Math.max(1, quotaInfo.totalUsageBytes)) * 100))}%` }}
              className="h-full bg-[#2D5A36] transition-all duration-500"
              title={`Offline Agri Cache: ${quotaInfo.agriCacheFormatted}`}
            />
            {/* Other Origin Cache (static shell, fonts) */}
            <div
              style={{ width: '12%' }}
              className="h-full bg-[#6B7266]/40 transition-all duration-500"
              title={`App Shell & Static Assets: ${quotaInfo.staticCacheFormatted}`}
            />
          </div>

          {/* Bar Legend */}
          <div className="flex items-center justify-between text-[11px] text-[#6B7266] pt-0.5 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A36]" />
                <span className="text-[#1E2B1F] font-medium">Offline Agricultural Cache</span>
                <span className="text-[#6B7266] font-mono">({quotaInfo.agriCacheFormatted})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B7266]" />
                <span className="text-[#1E2B1F] font-medium">App Shell</span>
                <span className="text-[#6B7266] font-mono">({quotaInfo.staticCacheFormatted})</span>
              </span>
            </div>

            <span className="text-[10px] text-[#2D5A36] font-mono">
              Total Origin Used: {quotaInfo.totalUsageFormatted} ({quotaInfo.usagePercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* 4-COLUMN STAT TILES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tile 1: Total Offline Agricultural Data */}
        <div className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Agri Datasets</span>
            <Database className="w-4 h-4 text-[#2D5A36]" />
          </div>
          <div className="text-lg font-bold text-[#2D5A36] font-mono">
            {quotaInfo.agriCacheFormatted}
          </div>
          <p className="text-[11px] text-[#6B7266]">
            {quotaInfo.mandiCount + quotaInfo.advisoryCount} cached offline items
          </p>
        </div>

        {/* Tile 2: APMC Mandi Rates */}
        <div className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mandi Rates</span>
            <Store className="w-4 h-4 text-[#2D5A36]" />
          </div>
          <div className="text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.mandiFormatted}
          </div>
          <p className="text-[11px] text-[#6B7266]">
            {quotaInfo.mandiCount} APMC market quotes
          </p>
        </div>

        {/* Tile 3: Crop Disease & Agronomic Advisories */}
        <div className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Crop Advisories</span>
            <Sparkles className="w-4 h-4 text-[#2D5A36]" />
          </div>
          <div className="text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.advisoryFormatted}
          </div>
          <p className="text-[11px] text-[#6B7266]">
            {quotaInfo.advisoryCount} disease & risk models
          </p>
        </div>

        {/* Tile 4: Browser Limit & Persistence */}
        <div className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Browser Limit</span>
            <Smartphone className="w-4 h-4 text-[#6B7266]" />
          </div>
          <div className="text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.totalQuotaFormatted}
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-[#6B7266]">
              {isPersisted ? 'Persistent' : 'Best-effort'}
            </span>
            {!isPersisted && (
              <button
                type="button"
                onClick={handleRequestPersistence}
                disabled={persisting}
                className="text-[9px] font-bold text-[#2D5A36] hover:underline cursor-pointer"
                title="Protect cached data from browser eviction"
              >
                Protect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED DATASET BREAKDOWN TABLE */}
      <div className="bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] overflow-hidden">
        <div className="p-3 bg-[#E3E8D8] border-b border-[#E6E1D3] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2D5A36]" />
            <span>Offline Agricultural Dataset Breakdown</span>
          </span>
          <span className="text-[10px] text-[#6B7266] font-mono">
            Cache: bhootech-agricultural-data-v1
          </span>
        </div>

        <div className="divide-y divide-[#E6E1D3] text-xs">
          {/* Row 1: Mandi Quotes */}
          <div className="p-3 flex items-center justify-between hover:bg-[#F4F0E6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-[#1E2B1F]">APMC Mandi Rates & Price Horizons</div>
                <div className="text-[10px] text-[#6B7266]">Top mandi quotes, distance matrices, 30-day forecast trajectories</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[#2D5A36]">{quotaInfo.mandiFormatted}</div>
              <div className="text-[10px] text-[#6B7266]">{quotaInfo.mandiCount} records</div>
            </div>
          </div>

          {/* Row 2: Crop Advisories */}
          <div className="p-3 flex items-center justify-between hover:bg-[#F4F0E6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-[#1E2B1F]">Crop Pathology & Hyper-Local Advisories</div>
                <div className="text-[10px] text-[#6B7266]">ICAR treatment protocols, micro-irrigation advice, weighted risk indices</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[#2D5A36]">{quotaInfo.advisoryFormatted}</div>
              <div className="text-[10px] text-[#6B7266]">{quotaInfo.advisoryCount} records</div>
            </div>
          </div>

          {/* Row 3: App Shell & PWA Runtime */}
          <div className="p-3 flex items-center justify-between hover:bg-[#F4F0E6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-[#E3E0D3] text-[#6B7266] flex items-center justify-center">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-[#1E2B1F]">PWA App Shell & Icons</div>
                <div className="text-[10px] text-[#6B7266]">HTML offline entrypoint, vector icons, manifest, service worker scripts</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[#1E2B1F]">{quotaInfo.staticCacheFormatted}</div>
              <div className="text-[10px] text-[#6B7266]">Runtime core</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable URLs Inspector */}
      {cachedKeys.length > 0 && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowKeys(!showKeys)}
            className="text-[11px] text-[#6B7266] hover:text-[#2D5A36] flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
          >
            {showKeys ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Inspect Cached Agricultural Endpoints ({cachedKeys.length} URLs stored)</span>
          </button>

          {showKeys && (
            <div className="mt-2 p-3 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] font-mono text-[10px] text-[#2F3A2E] space-y-1.5 max-h-36 overflow-y-auto">
              {cachedKeys.map((keyUrl, idx) => (
                <div key={idx} className="flex items-center gap-2 truncate">
                  <span className="text-[#2D5A36] font-bold">GET</span>
                  <span className="truncate text-[#6B7266]">{keyUrl.replace(window.location.origin, '')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info Callout */}
      <div className="p-3 bg-[#FBFAF5] rounded-[8px] border border-[#E6E1D3] text-xs text-[#6B7266] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#2D5A36] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-[#1E2B1F]">Offline Guarantee:</strong> All cached mandi rates and crop advisories are stored directly in your browser's local Cache API. They can be queried in zero-connectivity fields without cellular mobile data usage and do not expire until overwritten by fresh market syncs.
        </p>
      </div>
    </div>
  );
};
