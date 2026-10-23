import React from 'react';
import { 
  Home, 
  Flame, 
  Users, 
  ListMusic, 
  Download, 
  Settings, 
  Heart, 
  Sun, 
  Moon, 
  User as UserIcon, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  Wifi
} from 'lucide-react';
import { BlazeLogo } from './BlazeLogo';
import { ActiveNavTab } from './BottomNav';
import { User } from 'firebase/auth';
import { UserProfileData } from '../lib/firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface DesktopSidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  themeColor: string;
  user?: User | null;
  userProfile?: UserProfileData | null;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  playlistsCount: number;
  favoritesCount: number;
  downloadsCount: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export function DesktopSidebar({
  activeTab,
  onSelectTab,
  themeColor,
  user,
  userProfile,
  onOpenSettings,
  onOpenAuth,
  playlistsCount,
  favoritesCount,
  downloadsCount,
  theme,
  toggleTheme,
}: DesktopSidebarProps) {
  const primaryNavItems = [
    { id: 'home' as ActiveNavTab, label: 'Home', icon: Home, badge: null },
    { id: 'trending' as ActiveNavTab, label: 'Trending Charts', icon: Flame, badge: 'Live' },
    { id: 'artists' as ActiveNavTab, label: 'Artists Directory', icon: Users, badge: null },
    { id: 'playlists' as ActiveNavTab, label: 'Playlists & Library', icon: ListMusic, badge: playlistsCount > 0 ? String(playlistsCount) : null },
    { id: 'downloads' as ActiveNavTab, label: 'Offline Downloads', icon: Download, badge: downloadsCount > 0 ? String(downloadsCount) : null },
  ];

  return (
    <aside 
      className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-full z-30 select-none border-r border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#111220]/95 backdrop-blur-2xl transition-colors duration-200"
      aria-label="Desktop Navigation"
    >
      {/* Top Brand Zone */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <BlazeLogo themeColor={themeColor} size="md" showText={true} />
      </div>

      {/* User Account Tile */}
      <div className="px-3 pt-3.5 pb-2">
        <div 
          onClick={user ? onOpenSettings : onOpenAuth}
          className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
          title={user ? "View Sonic Boomz Account & Sync" : "Sign in to Sonic Boomz Account"}
        >
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || "User"} 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-[var(--theme-color)] shadow-sm shrink-0" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
            />
          ) : (
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
              style={{ 
                backgroundColor: themeColor,
                color: themeColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
              }}
            >
              {user ? (user.displayName || user.email || 'U')[0].toUpperCase() : <UserIcon size={16} />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate group-hover:text-[var(--theme-color)] transition-colors">
              {user ? (user.displayName || user.email?.split('@')[0]) : 'Sonic Boomz Guest'}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
              {user ? (
                <>
                  <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                  <span className="text-emerald-500 font-semibold truncate">Sonic Boomz Synced</span>
                </>
              ) : (
                <span className="text-[var(--theme-color)] font-semibold truncate">Sign in to Sonic Boomz</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 desktop-scrollbar">
        {/* Main Menu */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 block mb-1.5">
            Discover
          </span>

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] shadow-sm scale-[1.01]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive 
                      ? 'bg-black/20 text-white' 
                      : 'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Collection / Library Shortcuts */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 block mb-1.5">
            Your Library
          </span>

          <button
            onClick={() => onSelectTab('playlists')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === 'playlists'
                ? 'text-gray-900 dark:text-white font-bold bg-black/5 dark:bg-white/5'
                : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Heart size={12} fill="white" />
              </div>
              <span className="truncate">Liked Songs</span>
            </div>
            {favoritesCount > 0 && (
              <span className="text-[10px] font-mono text-gray-400">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('downloads')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === 'downloads'
                ? 'text-gray-900 dark:text-white font-bold bg-black/5 dark:bg-white/5'
                : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
                <Download size={12} />
              </div>
              <span className="truncate">Saved Offline</span>
            </div>
            {downloadsCount > 0 && (
              <span className="text-[10px] font-mono text-gray-400">
                {downloadsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Utility Bar */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-2 bg-black/[0.02] dark:bg-white/[0.02]">
        <PWAInstallButton className="w-full justify-center" />
        <div className="flex items-center gap-2">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} className="text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
            title="Studio Settings & Equalizer"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Quiet Desktop Footer Marker */}
        <div className="pt-2 px-1 flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>Sonic Boomz</span>
          <span>Desktop Engine</span>
        </div>
      </div>
    </aside>
  );
}
