import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  rounded?: boolean;
}

export function AppLogo({
  size = 'md',
  showText = true,
  className = '',
  rounded = true
}: AppLogoProps) {
  const sizeMap: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 40;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-black shadow-lg ${rounded ? 'rounded-2xl' : 'rounded-none'}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <img
          src="/app-logo.svg"
          alt="Sonic Boomz"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0 text-left">
          <span className="font-black tracking-tight leading-none text-base sm:text-lg text-gray-900 dark:text-white">
            Sonic Boomz
          </span>
        </div>
      )}
    </div>
  );
}
