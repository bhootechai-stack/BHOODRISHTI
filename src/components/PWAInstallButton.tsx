import React, { useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#2D5A36] hover:bg-[#23472A] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer ${className}`}
        title="Install BhooTech AI app on your phone for offline agricultural monitoring"
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span>{variant === 'full' ? 'Install BhooTech AI App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#2D5A36] border border-[#D9D4C4] text-xs font-semibold transition-colors cursor-pointer ${className}`}
          title="Install on iPhone / iPad for offline agricultural access"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#2D5A36]" />
          <span>{variant === 'full' ? 'Install on iPhone' : 'Install'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-[14px] bg-[#FBFAF5] border border-[#E6E1D3] p-5 shadow-[0_1px_3px_rgba(40,50,35,0.06)] text-[#2F3A2E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#2D5A36]" />
                  <h3 className="text-sm font-bold text-[#1E2B1F]">Install on iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#6B7266] hover:text-[#1E2B1F] p-1 rounded-[6px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#6B7266] space-y-2.5 leading-relaxed">
                <p className="text-[#1E2B1F]">To use BhooTech AI offline in the field:</p>
                <div className="p-3 bg-[#FBFAF5] rounded-[8px] space-y-2 border border-[#D9D4C4]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E3E8D8] text-[#2D5A36] font-bold flex items-center justify-center text-[11px]">1</span>
                    <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-[#2D5A36]" /> in Safari.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E3E8D8] text-[#2D5A36] font-bold flex items-center justify-center text-[11px]">2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B7266]">
                  Mandi rates, crop advisories, and weather are stored locally via Cache API.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full h-11 rounded-[8px] bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
