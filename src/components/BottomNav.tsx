import React from 'react';
import { Home, Flame, Users, ListMusic, Download } from 'lucide-react';

export type ActiveNavTab = 'home' | 'trending' | 'artists' | 'playlists' | 'downloads';

interface BottomNavProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  playlistsCount?: number;
  favoritesCount?: number;
  downloadsCount?: number;
}

export function BottomNav({
  activeTab,
  onSelectTab,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'home' as ActiveNavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'trending' as ActiveNavTab,
      label: 'Trending',
      icon: Flame,
    },
    {
      id: 'artists' as ActiveNavTab,
      label: 'Artists',
      icon: Users,
    },
    {
      id: 'playlists' as ActiveNavTab,
      label: 'Playlists',
      icon: ListMusic,
    },
    {
      id: 'downloads' as ActiveNavTab,
      label: 'Downloads',
      icon: Download,
    },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121320]/95 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 px-2 py-2 safe-area-pb"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[var(--theme-accent-text,var(--theme-color))] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`transition-transform duration-200 ${isActive ? 'scale-105' : ''}`}
              />
              <span className="text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

