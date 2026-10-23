import React from 'react';
import { AppLogo } from './AppLogo';

interface BlazeLogoProps {
  themeColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function BlazeLogo({ 
  size = 'md', 
  showText = true, 
  className = '' 
}: BlazeLogoProps) {
  return (
    <AppLogo 
      size={size} 
      showText={showText} 
      className={className} 
    />
  );
}
