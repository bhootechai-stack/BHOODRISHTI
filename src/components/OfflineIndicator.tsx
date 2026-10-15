import React, { useEffect, useState } from 'react';
import { WifiOff, Database, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { offlineAgriCache, CacheAgriStats } from '../services/offlineAgriCache';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState<CacheAgriStats | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      const s = await offlineAgriCache.getStats();
      if (mounted) setStats(s);
    };
    loadStats();
    return () => {
      mounted = false;
    };
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 transition-all duration-200">
      <div className="bg-[#FFFFFF] border border-[#E5E0D3] text-[#1F2A1F] rounded-xl p-3 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[#1F2A1F] flex items-center gap-1.5 flex-wrap">
              <span>Offline Mode Active</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                Cache API
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] truncate">
              {stats && stats.totalEntries > 0
                ? `${stats.mandiCount} Mandi rates & ${stats.advisoryCount} Advisories cached locally`
                : 'Serving verified local agricultural data & crop benchmarks'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-[10px] text-[#2F5233] font-semibold bg-[#FAF8F2] px-2 py-1 rounded-lg border border-[#E5E0D3]">
          <Database className="w-3 h-3 text-[#2F5233]" />
          <span>Local Sync</span>
        </div>
      </div>
    </div>
  );
};
