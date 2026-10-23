import React from 'react';
import { Home, Flame, Users, ListMusic, Download, X, Settings, User as UserIcon, LogIn } from 'lucide-react';
import { BlazeLogo } from './BlazeLogo';
import { ActiveNavTab } from './BottomNav';
import { User } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  themeColor: string;
  user?: User | null;
  onOpenSettings?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  themeColor,
  user,
  onOpenSettings,
}: SidebarProps) {
  const navItems = [
    { id: 'home' as ActiveNavTab, label: 'Home', icon: Home },
    { id: 'trending' as ActiveNavTab, label: 'Trending Charts', icon: Flame },
    { id: 'artists' as ActiveNavTab, label: 'Artists', icon: Users },
    { id: 'playlists' as ActiveNavTab, label: 'Playlists', icon: ListMusic },
    { id: 'downloads' as ActiveNavTab, label: 'Offline Downloads', icon: Download },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-[#121320] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl border-r border-black/10 dark:border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
          <BlazeLogo themeColor={themeColor} size="md" showText={true} />
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>
        
        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-5 scrollbar-thin">
          
          {/* User Account Card */}
          <div 
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-[var(--theme-color)]" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                style={{ 
                  backgroundColor: themeColor,
                  color: themeColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
                }}
              >
                {user ? (user.displayName || user.email || 'U')[0].toUpperCase() : <UserIcon size={18} />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">
                {user ? (user.displayName || user.email?.split('@')[0]) : 'Sonic Boomz Guest'}
              </p>
              <p className="text-[11px] text-[var(--theme-color)] font-medium flex items-center gap-1">
                {user ? 'Sonic Boomz Synced' : 'Sign in to Sonic Boomz'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
              {user ? 'Account' : 'Sign In'}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 block mb-2">
              Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                    isActive
                      ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-md scale-[1.02]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Shortcut */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Settings size={20} />
              <span>Studio & Settings</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-[11px] font-bold text-gray-400">Sonic Boomz</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Mobile • Tablet • Desktop</p>
        </div>
      </div>
    </>
  );
}
