import React from 'react';
import { Track } from '../types';
import { 
  Heart, 
  Play, 
  Shuffle, 
  Download, 
  X, 
  Music, 
  Settings as SettingsIcon,
  Menu,
  Sparkles
} from 'lucide-react';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';

interface FavoritesViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  favorites: Track[];
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  onNavigateHome: () => void;
  onSelectArtist?: (artistName: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function FavoritesView({
  onOpenSidebar,
  onOpenSettings,
  favorites,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  onNavigateHome,
  onSelectArtist,
}: FavoritesViewProps) {
  const handleShufflePlay = () => {
    if (favorites.length === 0) return;
    const randomIndex = Math.floor(Math.random() * favorites.length);
    onPlayTrack(favorites[randomIndex], randomIndex, favorites);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] pb-44 px-4 sm:px-6 relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between pt-10 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-fav-sidebar-open"
            onClick={onOpenSidebar}
            className="p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-color)]">Your Library</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span>Favorites</span>
              <Heart size={22} className="text-red-500 fill-red-500" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-fav-open-settings"
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Settings Studio"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {favorites.length > 0 ? (
        <>
          {/* Action Header */}
          <div className="flex items-center justify-between py-3 mb-3 border-b border-black/5 dark:border-white/5">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {favorites.length} {favorites.length === 1 ? 'song' : 'songs'} saved
            </span>
            <div className="flex items-center gap-2">
              <button
                id="btn-shuffle-favorites"
                onClick={handleShufflePlay}
                className="px-4 py-2 rounded-full bg-neutral-200/90 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Shuffle size={14} className="text-neutral-900 dark:text-white shrink-0" />
                <span>Shuffle</span>
              </button>
              <button
                id="btn-play-all-favorites"
                onClick={() => onPlayTrack(favorites[0], 0, favorites)}
                className="px-4 py-1.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Play size={14} fill="currentColor" />
                <span>Play All</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-1">
            {favorites.map((track, idx) => (
              <div
                key={`fav-${track.id}-${idx}`}
                onClick={() => onPlayTrack(track, idx, favorites)}
                className="flex items-center gap-3 sm:gap-4 p-3 -mx-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="relative shrink-0">
                  <img
                    src={optimizeImage(track.coverUrl, { width: 150, quality: 80 })}
                    alt={track.title}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => applyAppLogoFallback(e, track)}
                    onLoad={(e) => applyAppLogoFallback(e, track)}
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                  </div>
                  {track.duration && track.duration > 0 && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-white/90">
                      {formatDuration(track.duration)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                    {track.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 block max-w-full">
                    {track.artist}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownloadTrack(track); }}
                    className="p-2 text-[var(--theme-color)] hover:opacity-80 transition-opacity"
                    title="Download track"
                  >
                    {isDownloading === track.id ? (
                      <div className="w-4 h-4 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                    className="p-2 text-red-500 hover:text-gray-400 transition-colors"
                    title="Remove from favorites"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-24 text-center text-gray-500 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400">
            <Heart size={28} />
          </div>
          <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">No favorite songs yet</h3>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Tap the heart icon on any song while browsing or playing to build your personal library.
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-3 px-5 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Discover Music</span>
          </button>
        </div>
      )}
    </div>
  );
}
