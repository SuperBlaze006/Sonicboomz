import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

export const OUTER_APP_HERO_IMAGE = '/assets/aistudio/speaydi_2a8f00f0.jpeg';

interface AppLaunchLoadingScreenProps {
  onFinish?: () => void;
  onOpenInstall?: () => void;
  isInstallable?: boolean;
}

export function AppLaunchLoadingScreen({
  onFinish,
  onOpenInstall,
  isInstallable = false
}: AppLaunchLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(20);
  const [statusMessage, setStatusMessage] = useState('Initializing Sonic Engine...');

  useEffect(() => {
    // Check if session has already seen initial splash in this tab
    const hasSeenSplash = sessionStorage.getItem('sonic_splash_shown');
    if (hasSeenSplash) {
      setIsVisible(false);
      onFinish?.();
      return;
    }

    const t1 = setTimeout(() => {
      setLoadingProgress(55);
      setStatusMessage('Syncing 11 Real-Time Trending Charts...');
    }, 250);

    const t2 = setTimeout(() => {
      setLoadingProgress(88);
      setStatusMessage('Optimizing Offline Cache & Media Engine...');
    }, 550);

    const t3 = setTimeout(() => {
      setLoadingProgress(100);
      setStatusMessage('Sonic Boomz Ready!');
    }, 850);

    const t4 = setTimeout(() => {
      sessionStorage.setItem('sonic_splash_shown', 'true');
      setIsVisible(false);
      onFinish?.();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  const handleSkip = () => {
    sessionStorage.setItem('sonic_splash_shown', 'true');
    setIsVisible(false);
    onFinish?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="app-launch-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-between p-6 bg-[#06050a] select-none cursor-pointer overflow-hidden"
        >
          {/* Ambient Purple Cyber Light Fields */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-purple-600/25 blur-[110px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-fuchsia-600/25 blur-[110px] pointer-events-none" />

          {/* Top Brand Bar */}
          <div className="w-full flex items-center justify-between z-10 pt-safe">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <span className="text-xs font-black tracking-widest text-purple-400 uppercase">
                Sonic Boomz • Official App
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Center Stage: Clean Purple Spider-Man Artwork with Glowing Orbit Rings */}
          <div className="flex flex-col items-center text-center my-auto z-10">
            <div className="relative flex items-center justify-center my-4">
              {/* Concentric Purple Pulse Rings */}
              <motion.div
                animate={{ scale: [1, 1.22, 1], opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-purple-500/40 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1.1, 1.32, 1.1], opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
                className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-fuchsia-500/25 pointer-events-none"
              />

              {/* Rotating Holographic Accent Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full border border-dashed border-purple-400/50 pointer-events-none"
              />

              {/* Main Circular Artwork Container (Clean image with zero overlaid text) */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
                transition={{
                  scale: { duration: 0.5, type: 'spring' },
                  y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 shadow-[0_0_55px_rgba(168,85,247,0.55)] overflow-hidden"
              >
                <img
                  src={OUTER_APP_HERO_IMAGE}
                  alt="Sonic Boomz Outer App Hero"
                  className="w-full h-full object-cover rounded-full select-none"
                  loading="eager"
                />
              </motion.div>
            </div>

            {/* Glowing Equalizer Bars */}
            <div className="flex items-center justify-center gap-1.5 mt-3 h-7">
              {[0.5, 0.9, 0.3, 1, 0.7, 0.4, 0.85, 0.6, 0.95, 0.35, 0.8].map((val, idx) => (
                <motion.span
                  key={idx}
                  animate={{ scaleY: [0.2, val, 0.15] }}
                  transition={{
                    duration: 0.75 + (idx % 4) * 0.18,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-1 bg-gradient-to-t from-purple-600 via-fuchsia-500 to-violet-300 rounded-full origin-bottom"
                  style={{ height: '24px' }}
                />
              ))}
            </div>

            {/* Brand Title below the artwork */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4"
            >
              SONIC BOOMZ
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-purple-200/80 font-medium max-w-xs mt-1"
            >
              High-Fidelity Audio • 11 Live Charts • Offline Mode
            </motion.p>
          </div>

          {/* Bottom Progress Bar & Optional Install Action */}
          <div className="w-full max-w-xs flex flex-col items-center z-10 pb-safe">
            {/* Loading Meter */}
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-bold text-purple-300/70 mb-1.5 font-mono">
                <span>LOADING AUDIO ENGINE</span>
                <span className="text-white">{loadingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-violet-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                  style={{ width: `${loadingProgress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-purple-300/80 font-mono mt-2 text-center truncate">
                {statusMessage}
              </p>
            </div>

            {/* Quick Install Option Button on Splash Screen */}
            {isInstallable && onOpenInstall && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInstall();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all active:scale-95"
              >
                <Download size={14} className="text-purple-300" />
                <span>Install Standalone App</span>
              </motion.button>
            )}

            <p className="text-[10px] text-gray-500 mt-4">
              Tap anywhere to enter
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
