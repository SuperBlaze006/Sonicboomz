import React from 'react';
import { User } from 'firebase/auth';
import { UserProfileData } from '../lib/firebase';
import { AuthPage } from './AuthPage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  toggleTheme?: () => void;
  themeColor?: string;
  setThemeColor?: (color: string) => void;
  cachedTracksCount: number;
  favoritesCount?: number;
  playlistsCount?: number;
  onClearCache?: () => void;
  user?: User | null;
  userProfile?: UserProfileData | null;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
  showToast?: (msg: string) => void;
  onOpenFullAuth?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  themeColor = '#FFFFFF',
  cachedTracksCount,
  favoritesCount = 0,
  playlistsCount = 0,
  onClearCache,
  user = null,
  userProfile = null,
  onManualSync,
  isSyncing = false,
  showToast,
}: SettingsModalProps) {
  return (
    <AuthPage
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      userProfile={userProfile}
      theme={theme}
      toggleTheme={toggleTheme}
      themeColor={themeColor}
      onManualSync={onManualSync}
      isSyncing={isSyncing}
      showToast={showToast}
      onClearCache={onClearCache}
      cachedTracksCount={cachedTracksCount}
      favoritesCount={favoritesCount}
      playlistsCount={playlistsCount}
    />
  );
}
