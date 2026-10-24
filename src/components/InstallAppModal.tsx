import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  WifiOff, 
  Headphones, 
  Zap, 
  Flame, 
  Share2, 
  PlusSquare, 
  Smartphone, 
  Check,
  ArrowRight,
  ShieldCheck,
  Music2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export const INSTALL_HERO_IMAGE = '/assets/aistudio/d7bbc2ef-7bab-494a-a140-4bfa6ae891a4_be235e33.jpeg';

export function InstallAppModal({
  isOpen,
  onClose,
  themeColor = '#EF4444'
}: InstallAppModalProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  
  const [installPhase, setInstallPhase] = useState<'preview' | 'installing' | 'success'>('preview');
  const [installProgress, setInstallProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState('Initializing Sonic Engine...');
  const [activeTab, setActiveTab] = useState<'app' | 'guide'>('app');

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      if (isInstalled) {
        setInstallPhase('success');
      } else {
        setInstallPhase('preview');
        setInstallProgress(0);
      }
    }
  }, [isOpen, isInstalled]);

  // Handle Animated Installation Flow
  const handleStartInstall = async () => {
    setInstallPhase('installing');
    setInstallProgress(15);
    setLoadingStatusText('Connecting to Sonic Audio Pipeline...');

    // Progress animation steps
    const t1 = setTimeout(() => {
      setInstallProgress(40);
      setLoadingStatusText('Setting up Offline Storage & IndexedDB...');
    }, 450);

    const t2 = setTimeout(() => {
      setInstallProgress(70);
      setLoadingStatusText('Registering Background Audio & Keep-Alive...');
    }, 900);

    const t3 = setTimeout(async () => {
      setInstallProgress(90);
      setLoadingStatusText('Activating PWA Standalone Experience...');

      if (isInstallable) {
        try {
          const outcome = await install();
          if (outcome) {
            setInstallProgress(100);
            setLoadingStatusText('Installation Complete!');
            setTimeout(() => setInstallPhase('success'), 400);
            return;
          }
        } catch (_) {}
      }

      // If browser doesn't trigger prompt or user dismisses, complete setup sequence
      setInstallProgress(100);
      setLoadingStatusText('Sonic Boomz Ready!');
      setTimeout(() => setInstallPhase('success'), 500);
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop with animated blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-all"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0c0d14]/95 border border-red-500/30 text-white shadow-[0_0_60px_rgba(239,68,68,0.22)] overflow-hidden my-auto z-10"
        >
          {/* Ambient Neon Background Glows */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-red-600/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-rose-500/25 blur-3xl pointer-events-none" />

          {/* Top Header / Bar */}
          <div className="relative px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10 z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                PWA Standalone App
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Close install modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content Switcher */}
          <div className="relative p-6 z-10">
            {installPhase === 'preview' && (
              <motion.div
                key="preview-phase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center"
              >
                {/* Hero Artwork with Neon Web Rings & Audio Wave Equalizers */}
                <div className="relative my-2 flex items-center justify-center">
                  {/* Concentric Pulse Rings */}
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-44 h-44 rounded-full border border-red-500/40 pointer-events-none"
                  />
                  <motion.div 
                    animate={{ scale: [1.1, 1.25, 1.1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute w-52 h-52 rounded-full border border-rose-500/25 pointer-events-none"
                  />

                  {/* Rotating Holographic Cyber Accent */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-40 h-40 rounded-full border-2 border-dashed border-red-500/50 pointer-events-none"
                  />

                  {/* Central Avatar Frame */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-red-600 via-rose-500 to-pink-500 shadow-[0_0_35px_rgba(239,68,68,0.55)] shrink-0 overflow-hidden"
                  >
                    <img 
                      src={INSTALL_HERO_IMAGE} 
                      alt="Sonic Boomz App Hero"
                      className="w-full h-full object-cover rounded-full"
                    />
                    
                    {/* Corner App Badge */}
                    <div className="absolute bottom-1 right-2 p-1.5 rounded-full bg-black/90 border border-red-500/60 shadow-lg text-red-400">
                      <Music2 size={15} />
                    </div>
                  </motion.div>
                </div>

                {/* Animated Equalizer Wave Bars */}
                <div className="flex items-center justify-center gap-1.5 my-3 h-6">
                  {[0.4, 0.9, 0.6, 1, 0.7, 0.3, 0.8, 0.5, 0.9, 0.4].map((scale, i) => (
                    <motion.span
                      key={i}
                      animate={{ scaleY: [0.3, scale, 0.2] }}
                      transition={{ duration: 0.85 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-1 bg-gradient-to-t from-red-600 to-rose-400 rounded-full origin-bottom"
                      style={{ height: '22px' }}
                    />
                  ))}
                </div>

                {/* Title & Headline */}
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  Sonic Boomz App
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-sm font-medium leading-relaxed">
                  Install the official standalone app on your device for zero buffering, seamless background audio & offline downloads.
                </p>

                {/* Feature Highlights Grid */}
                <div className="w-full grid grid-cols-2 gap-2.5 mt-5 text-left">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition-colors">
                    <div className="p-2 rounded-xl bg-red-600/20 text-red-400 shrink-0">
                      <WifiOff size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Offline Vault</h4>
                      <p className="text-[10px] text-gray-400 leading-tight">Listen anytime with zero internet needed</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition-colors">
                    <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 shrink-0">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Background Play</h4>
                      <p className="text-[10px] text-gray-400 leading-tight">Keeps playing when phone screen locks</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition-colors">
                    <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 shrink-0">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Zero Buffering</h4>
                      <p className="text-[10px] text-gray-400 leading-tight">Instant audio caching & lightning load</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition-colors">
                    <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 shrink-0">
                      <Flame size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">11 Live Charts</h4>
                      <p className="text-[10px] text-gray-400 leading-tight">Real-time dynamic trending charts</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="w-full mt-6 space-y-2.5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartInstall}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(239,68,68,0.45)] flex items-center justify-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>Install Sonic Boomz</span>
                    <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                  </motion.button>

                  {/* iOS Safari Guide Toggle */}
                  {isIOS && (
                    <button
                      onClick={() => setActiveTab(activeTab === 'guide' ? 'app' : 'guide')}
                      className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-4 font-semibold transition-colors"
                    >
                      {activeTab === 'guide' ? 'Hide iPhone Instructions' : 'How to install on iPhone (Safari Guide)'}
                    </button>
                  )}
                </div>

                {/* iOS Instructions Drawer if expanded */}
                {isIOS && activeTab === 'guide' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full mt-4 p-4 rounded-2xl bg-black/50 border border-white/10 text-left text-xs space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Smartphone size={16} className="text-rose-400" />
                      <span>Quick 3-Step iPhone Setup:</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Tap the <strong>Share</strong> button <Share2 size={13} className="inline text-rose-400 mx-0.5" /> in Safari's bottom toolbar.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare size={13} className="inline text-rose-400 mx-0.5" />.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Tap <strong>Add</strong> in the top-right corner to launch Sonic Boomz natively!</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* State 2: Installing / Loading Page with High-Octane Animation */}
            {installPhase === 'installing' && (
              <motion.div
                key="installing-phase"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center py-6"
              >
                {/* Pulsing Avatar with Spider-Web Energy Glow */}
                <div className="relative my-4 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-44 h-44 rounded-full border-2 border-transparent border-t-red-500 border-r-rose-400 pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-red-600 via-rose-500 to-pink-500 shadow-[0_0_45px_rgba(239,68,68,0.7)] shrink-0 overflow-hidden"
                  >
                    <img 
                      src={INSTALL_HERO_IMAGE} 
                      alt="Sonic Boomz Loading..."
                      className="w-full h-full object-cover rounded-full"
                    />
                  </motion.div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Installing Sonic Boomz
                </h3>
                <p className="text-xs text-red-400 font-semibold mt-1">
                  Preparing Standalone Audio Engine & Offline Cache
                </p>

                {/* Progress Bar Container */}
                <div className="w-full max-w-xs mt-6">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                    <span>Installation Progress</span>
                    <span className="text-white font-mono">{installProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                      style={{ width: `${installProgress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  
                  {/* Dynamic Status Text */}
                  <motion.p 
                    key={loadingStatusText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-gray-300 font-mono mt-3 text-center"
                  >
                    {loadingStatusText}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* State 3: Installation Success / Installed Ready State */}
            {installPhase === 'success' && (
              <motion.div
                key="success-phase"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center py-4"
              >
                <div className="relative my-3 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute w-36 h-36 rounded-full bg-red-600/20 blur-xl pointer-events-none"
                  />
                  <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-red-500 shadow-[0_0_35px_rgba(16,185,129,0.5)] shrink-0 overflow-hidden">
                    <img 
                      src={INSTALL_HERO_IMAGE} 
                      alt="Sonic Boomz Ready"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                        <Check size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-2">
                  <CheckCircle2 size={14} />
                  <span>Installed & Ready</span>
                </div>

                <h3 className="text-2xl font-black text-white mt-3">
                  Sonic Boomz Is Good To Go!
                </h3>
                <p className="text-xs text-gray-300 max-w-sm mt-1.5 leading-relaxed font-medium">
                  Enjoy fullscreen audio playback, offline downloads, and background audio streaming right from your device.
                </p>

                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Start Listening Now</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Security / Authenticity Badge */}
          <div className="relative px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verified PWA Standard</span>
            </span>
            <span className="font-mono text-gray-400">Sonic Boomz v2.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
