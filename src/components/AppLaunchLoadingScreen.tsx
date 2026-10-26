import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const INNER_APP_LOGO = '/app-logo.svg';

interface AppLaunchLoadingScreenProps {
  onFinish?: () => void;
  onOpenInstall?: () => void;
}

export function AppLaunchLoadingScreen({ onFinish }: AppLaunchLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if session has already seen initial splash in this tab
    const hasSeenSplash = sessionStorage.getItem('sonic_splash_shown');
    if (hasSeenSplash) {
      setIsVisible(false);
      onFinish?.();
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('sonic_splash_shown', 'true');
      setIsVisible(false);
      onFinish?.();
    }, 1350);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleDismiss = () => {
    sessionStorage.setItem('sonic_splash_shown', 'true');
    setIsVisible(false);
    onFinish?.();
  };

  if (!isVisible) return null;

  // Wave bars frequency profile for 3D sonic wave visualizer
  const waveBars = [
    { height: 18, delay: 0.05, duration: 0.8 },
    { height: 32, delay: 0.15, duration: 0.7 },
    { height: 50, delay: 0.25, duration: 0.9 },
    { height: 28, delay: 0.1, duration: 0.75 },
    { height: 64, delay: 0.3, duration: 1.0 },
    { height: 42, delay: 0.2, duration: 0.85 },
    { height: 75, delay: 0.35, duration: 1.1 },
    { height: 48, delay: 0.18, duration: 0.8 },
    { height: 60, delay: 0.28, duration: 0.95 },
    { height: 36, delay: 0.12, duration: 0.72 },
    { height: 55, delay: 0.22, duration: 0.9 },
    { height: 30, delay: 0.08, duration: 0.78 },
    { height: 20, delay: 0.02, duration: 0.82 }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="app-launch-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-[#06050a] select-none cursor-pointer overflow-hidden"
        >
          {/* Ambient Purple Cyber Light Fields */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-purple-600/25 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-fuchsia-600/25 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />

          {/* Center Stage: Inner App Logo with Glowing Pulse Rings & 3D Sonic Wave */}
          <div className="flex flex-col items-center justify-center text-center z-10 space-y-10">
            {/* Logo Container with Orbit Rings */}
            <div className="relative flex items-center justify-center">
              {/* Concentric Purple Pulse Rings */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.65, 0.25] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-purple-500/40 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1.1, 1.35, 1.1], opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
                className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-fuchsia-500/25 pointer-events-none"
              />

              {/* Rotating Dashed Holographic Orbit Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute w-48 h-48 sm:w-54 sm:h-54 rounded-full border border-dashed border-purple-400/45 pointer-events-none"
              />

              {/* Main Circular Inner App Logo Container */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
                transition={{
                  scale: { duration: 0.45, type: 'spring' },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-600 shadow-[0_0_60px_rgba(168,85,247,0.65)] overflow-hidden flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={INNER_APP_LOGO}
                    alt="Sonic Boomz"
                    className="w-full h-full object-cover rounded-full select-none"
                    loading="eager"
                  />
                </div>
              </motion.div>
            </div>

            {/* 3D Sonic Wave Visualizer Animation (Zero Text, Pure Dynamic Visual) */}
            <div className="relative flex items-center justify-center gap-1.5 h-20 px-8 py-2">
              {/* Subtle 3D Depth Floor Shadow/Reflection */}
              <div className="absolute -bottom-2 w-48 h-4 rounded-full bg-purple-500/20 blur-md pointer-events-none" />

              {waveBars.map((bar, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    scaleY: [0.15, 1, 0.25, 0.85, 0.15],
                    opacity: [0.55, 1, 0.65, 0.95, 0.55]
                  }}
                  transition={{
                    duration: bar.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: bar.delay
                  }}
                  style={{
                    height: `${bar.height}px`,
                    width: '4px'
                  }}
                  className="rounded-full bg-gradient-to-t from-purple-600 via-fuchsia-400 to-white shadow-[0_0_12px_rgba(217,70,239,0.7)] origin-center"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
