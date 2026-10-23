import React from 'react';
import { SavedTrack } from '../lib/indexedDb';
import { 
  Download, 
  Play, 
  Trash2, 
  Music, 
  Settings as SettingsIcon,
  Menu,
  Sparkles,
  HardDrive,
  FileDown
} from 'lucide-react';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';

interface DownloadsViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  offlineTracks: SavedTrack[];
  onPlayOfflineTrack: (track: SavedTrack, index: number, list: SavedTrack[]) => void;
  onDeleteOfflineTrack?: (id: string) => void;
  onNavigateHome: () => void;
  onSelectArtist?: (artistName: string) => void;
}

export function DownloadsView({
  onOpenSidebar,
  onOpenSettings,
  offlineTracks,
  onPlayOfflineTrack,
  onDeleteOfflineTrack,
  onNavigateHome,
  onSelectArtist,
}: DownloadsViewProps) {
  const handleExportMp3 = (e: React.MouseEvent, track: SavedTrack) => {
    e.stopPropagation();
    try {
      const url = URL.createObjectURL(track.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(track.artist || 'Artist').replace(/[/\\?%*:|"<>]/g, '')} - ${(track.title || 'Track').replace(/[/\\?%*:|"<>]/g, '')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.warn('Failed to export MP3 file:', err);
    }
  };

  return (
    <div className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-12">
        {/* Header */}
      <header className="flex items-center justify-between pt-4 sm:pt-6 md:pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-dl-sidebar-open"
            onClick={onOpenSidebar}
            className="md:hidden p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-color)]">Offline Storage</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span>Downloads</span>
              <Download size={22} className="text-[var(--theme-color)]" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-dl-open-settings"
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Settings Studio"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {offlineTracks.length > 0 ? (
        <>
          {/* Storage Banner */}
          <div className="flex items-center justify-between p-3.5 mb-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <HardDrive size={18} className="text-[var(--theme-color)]" />
              <div>
                <p className="text-xs font-bold leading-none">{offlineTracks.length} tracks available offline</p>
                <p className="text-[11px] text-gray-400 mt-1">High-quality lossless audio saved locally</p>
              </div>
            </div>
            <button
              onClick={() => onPlayOfflineTrack(offlineTracks[0], 0, offlineTracks)}
              className="px-3.5 py-1.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Play size={13} fill="currentColor" />
              <span>Play Offline</span>
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col gap-1">
            {offlineTracks.map((track, idx) => (
              <div
                key={`offline-${track.id}-${idx}`}
                onClick={() => onPlayOfflineTrack(track, idx, offlineTracks)}
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
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    <span className="truncate">
                      {track.artist}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Offline Ready</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleExportMp3(e, track)}
                    className="p-2 text-gray-400 hover:text-[var(--theme-color)] transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                    title="Save MP3 file to device"
                  >
                    <FileDown size={18} />
                  </button>

                  {onDeleteOfflineTrack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOfflineTrack(track.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                      title="Delete downloaded song"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-24 text-center text-gray-500 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400">
            <Download size={28} />
          </div>
          <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">No offline music downloaded</h3>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Tap the download button on any song to save it directly to your device for unlimited playback without internet.
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-3 px-5 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Browse Music</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
