import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import {
  offlineAgriCache,
  OfflineSyncStatusInfo,
} from '../services/offlineAgriCache';

interface OfflineSyncStatusIndicatorProps {
  variant?: 'badge' | 'card' | 'interactive';
  onSyncComplete?: () => void;
  className?: string;
}

export const OfflineSyncStatusIndicator: React.FC<OfflineSyncStatusIndicatorProps> = ({
  variant = 'badge',
  onSyncComplete,
  className = '',
}) => {
  const [syncInfo, setSyncInfo] = useState<OfflineSyncStatusInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const refreshStatus = useCallback(async () => {
    try {
      const info = await offlineAgriCache.getOfflineSyncStatus();
      setSyncInfo(info);
    } catch (e) {
      console.warn('Error evaluating offline sync status:', e);
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    const handleOnline = () => refreshStatus();
    const handleOffline = () => refreshStatus();
    const handleCustomSync = () => refreshStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleCustomSync);

    if ('serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SW_AGRI_FETCH_SUCCESS') {
          refreshStatus();
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('storage', handleCustomSync);
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleCustomSync);
    };
  }, [refreshStatus]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineAgriCache.triggerAgriSync();
      await refreshStatus();
      onSyncComplete?.();
    } catch (e) {
      console.warn('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!syncInfo) return null;

  const configMap = {
    Synced: {
      border: 'border-[#E6E1D3]',
      bg: 'bg-[#FBFAF5]',
      text: 'text-[#2D5A36]',
      badgeBg: 'bg-[#E3E8D8]',
      badgeText: 'text-[#2D5A36]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A36]" />,
      dot: 'bg-[#2D5A36]',
      heroIcon: <CheckCircle2 className="w-5 h-5 text-[#2D5A36]" />,
      tag: 'Synced (ताज़ा)',
    },
    'Pending Sync': {
      border: 'border-[#FDE68A]',
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#D9922B]',
      badgeBg: 'bg-[#FFFBEB]',
      badgeText: 'text-[#D9922B]',
      icon: <Clock className="w-3.5 h-3.5 text-[#D9922B] animate-pulse" />,
      dot: 'bg-[#D9922B]',
      heroIcon: <Clock className="w-5 h-5 text-[#D9922B]" />,
      tag: 'Pending Sync (लंबित)',
    },
    Outdated: {
      border: 'border-[#F8B4B4]',
      bg: 'bg-[#F8E3E0]',
      text: 'text-[#C0392B]',
      badgeBg: 'bg-[#F8E3E0]',
      badgeText: 'text-[#C0392B]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#C0392B]" />,
      dot: 'bg-[#C0392B]',
      heroIcon: <AlertTriangle className="w-5 h-5 text-[#C0392B]" />,
      tag: 'Outdated (पुराना)',
    },
  }[syncInfo.state];

  // 1. COMPACT BADGE VARIANT
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] ${configMap.badgeBg} ${configMap.badgeText} border ${configMap.border} text-xs font-mono font-bold select-none transition-all ${className}`}
        title={`Offline Sync Status: ${syncInfo.state}. Last SW Fetch: ${syncInfo.lastFetchRelativeTime}`}
      >
        {configMap.icon}
        <span>Offline Sync: <strong>{syncInfo.state}</strong></span>
        <span className="text-[10px] opacity-75 font-normal">({syncInfo.lastFetchRelativeTime})</span>
      </div>
    );
  }

  // 2. INTERACTIVE CARD VARIANT
  return (
    <div
      className={`rounded-[14px] border border-[#E6E1D3] bg-[#FBFAF5] p-3.5 sm:p-4 text-[#2F3A2E] shadow-[0_1px_3px_rgba(40,50,35,0.06)] transition-all space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] flex items-center justify-center shrink-0">
            {configMap.heroIcon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#1E2B1F] tracking-tight">
                Offline Sync Status
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-[6px] ${configMap.badgeBg} ${configMap.badgeText} border ${configMap.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${configMap.dot}`} />
                {syncInfo.state}
              </span>
              {syncInfo.isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#2D5A36] font-mono">
                  <Wifi className="w-3 h-3 text-[#2D5A36]" />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D9922B] font-mono">
                  <WifiOff className="w-3 h-3 text-[#D9922B]" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7266] mt-0.5">
              {syncInfo.subLabel} • Last successful Service Worker fetch: <strong>{syncInfo.lastFetchRelativeTime}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing || !syncInfo.isOnline}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-all cursor-pointer ${
              syncInfo.isOnline
                ? 'bg-[#2D5A36] hover:bg-[#23472A] text-white border-[#2D5A36]'
                : 'bg-[#FBFAF5] text-[#9A9D92] border-[#D9D4C4] cursor-not-allowed'
            }`}
            title={syncInfo.isOnline ? 'Trigger immediate Service Worker sync' : 'Connect to internet to sync'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-white' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-[8px] text-[#6B7266] hover:text-[#1E2B1F] hover:bg-[#F4F0E6] transition-colors cursor-pointer"
            title="Toggle sync details and threshold guidelines"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#6B7266] leading-relaxed">
        {syncInfo.description}
      </p>

      {/* Expandable Details & Timestamp Inspection */}
      {showDetails && (
        <div className="pt-2 border-t border-[#E6E1D3] space-y-2 text-xs text-[#2F3A2E]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] space-y-1">
              <span className="text-[#6B7266] font-mono uppercase text-[10px]">Exact SW Timestamp</span>
              <div className="font-mono text-[#2D5A36] font-bold truncate">
                {syncInfo.lastFetchTimestamp
                  ? new Date(syncInfo.lastFetchTimestamp).toLocaleString()
                  : 'No verified fetch timestamp'}
              </div>
            </div>
            <div className="p-2.5 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] space-y-1">
              <span className="text-[#6B7266] font-mono uppercase text-[10px]">Data Age</span>
              <div className="font-mono text-[#1E2B1F] font-bold">
                {syncInfo.ageHours !== null ? `${syncInfo.ageHours} hours old` : 'Unknown'}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#FBFAF5] rounded-[8px] border border-[#E6E1D3] text-[11px] text-[#6B7266] space-y-1">
            <div className="font-bold text-[#1E2B1F] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#2D5A36]" />
              <span>Service Worker Cache Validity Thresholds</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li><strong className="text-[#2D5A36]">Synced:</strong> Fetched &lt; 12 hours ago. Live APMC quotes & disease models.</li>
              <li><strong className="text-[#D9922B]">Pending Sync:</strong> Fetched 12–36 hours ago or offline with pending update.</li>
              <li><strong className="text-[#C0392B]">Outdated:</strong> Fetched &ge; 36 hours ago. Mandi prices may have changed.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
