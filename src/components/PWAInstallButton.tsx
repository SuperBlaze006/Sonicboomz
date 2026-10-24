import React, { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallAppModal, INSTALL_HERO_IMAGE } from './InstallAppModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'banner' | 'pill';
  onOpenModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  onOpenModal
}) => {
  const { isInstalled } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed as a standalone PWA, don't show the prompt
  if (isInstalled) {
    return null;
  }

  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div 
          onClick={handleOpen}
          className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-purple-950/60 border border-purple-500/30 text-white flex items-center justify-between shadow-xl cursor-pointer hover:border-purple-500/60 transition-all group ${className}`}
        >
          {/* Subtle glow */}
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-600/20 blur-xl pointer-events-none group-hover:bg-purple-600/30 transition-all" />

          <div className="flex items-center gap-3.5 z-10">
            {/* Outer app hero thumbnail */}
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-fuchsia-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] shrink-0 overflow-hidden">
              <img 
                src={INSTALL_HERO_IMAGE} 
                alt="Sonic Boomz" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm leading-tight text-white">Install Sonic Boomz</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40">App</span>
              </div>
              <p className="text-xs text-neutral-300">Offline playback, zero lag & background audio</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="z-10 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold backdrop-blur-md active:scale-95 transition-all cursor-pointer ${className}`}
          title="Install Sonic Boomz App"
          aria-label="Install Sonic Boomz App"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-purple-500/50">
            <img src={INSTALL_HERO_IMAGE} alt="App" className="w-full h-full object-cover" />
          </div>
          <span>Install App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 active:scale-95 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all cursor-pointer border border-purple-400/30 ${className}`}
          title="Install Sonic Boomz app"
          aria-label="Install Sonic Boomz App"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/60">
            <img src={INSTALL_HERO_IMAGE} alt="App" className="w-full h-full object-cover" />
          </div>
          <span className="tracking-wide">Install App</span>
          <Sparkles size={12} className="text-yellow-200 animate-pulse" />
        </button>
      )}

      {/* Render the install modal if opened via local state */}
      {!onOpenModal && (
        <InstallAppModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
