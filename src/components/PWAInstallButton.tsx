import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode (installed as an app), do not show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between shadow-lg ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Install Sonic Boomz</h4>
              <p className="text-xs text-white/80">Play offline & seamless background audio</p>
            </div>
          </div>
          <button
            onClick={install}
            className="px-4 py-2 rounded-xl bg-white text-red-600 font-bold text-xs shadow-md hover:bg-neutral-100 active:scale-95 transition-all"
          >
            Install
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-md transition-all ${className}`}
        title="Install Sonic Boomz app"
        aria-label="Install Sonic Boomz App"
      >
        <Download size={13} className="shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-700/60 bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-medium backdrop-blur-md shadow-sm transition-all ${className}`}
          aria-label="Install on iPhone / iPad"
        >
          <Smartphone size={13} className="text-rose-400 shrink-0" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-white shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mb-4">
                <Share2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Install Sonic Boomz</h3>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                Enjoy background audio playback and offline music on your iPhone:
              </p>
              <div className="mt-3.5 space-y-2.5 text-xs text-neutral-300 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari bottom bar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Tap <strong>Add</strong> at top right to complete install.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
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
