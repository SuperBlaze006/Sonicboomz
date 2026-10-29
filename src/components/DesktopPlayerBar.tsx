import React, { useState } from 'react';
import { Track } from '../types';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Download, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize2,
  ListMusic
} from 'lucide-react';

interface DesktopPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 0 | 1 | 2;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  isDownloading: boolean;
  themeColor: string;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenOverlay: () => void;
  onSelectArtist?: (artistName: string) => void;
}

function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function DesktopPlayerBar({
  currentTrack,
  isPlaying,
  progress,
  duration,
  isShuffle,
  repeatMode,
  volume,
  isMuted,
  isFavorite,
  isDownloading,
  themeColor,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onDownload,
  onVolumeChange,
  onToggleMute,
  onOpenOverlay,
  onSelectArtist,
}: DesktopPlayerBarProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  if (!currentTrack) {
    return (
      <footer 
        className="hidden md:flex h-20 w-full shrink-0 bg-white/95 dark:bg-[#121322]/95 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 z-40 px-6 items-center justify-between select-none shadow-2xl transition-colors duration-200"
        aria-label="Desktop Player Controls"
      >
        <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-400">
            <ListMusic size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Sonic Boomz Player</div>
            <div className="text-[11px] text-gray-400">Select any track to start listening</div>
          </div>
        </div>

        <div className="flex flex-col items-center max-w-xl w-2/5 min-w-[320px] gap-1.5 opacity-40 select-none">
          <div className="flex items-center gap-4">
            <button disabled className="text-gray-400 p-1 cursor-default"><SkipBack size={18} /></button>
            <button disabled className="p-2.5 rounded-full bg-black/10 dark:bg-white/10 text-gray-400 cursor-default"><Play size={18} className="ml-0.5" /></button>
            <button disabled className="text-gray-400 p-1 cursor-default"><SkipForward size={18} /></button>
          </div>
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-gray-400">
            <span>0:00</span>
            <div className="h-1 flex-1 bg-black/10 dark:bg-white/10 rounded-full" />
            <span>0:00</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          <div className="flex items-center gap-2 w-32">
            <button 
              onClick={onToggleMute}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={17} /> : volume < 0.5 ? <Volume1 size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--theme-color)]"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </footer>
    );
  }

  const effectiveDuration = duration > 0 ? duration : (currentTrack.duration || 180);
  const displayedProgress = isSeeking ? seekValue : progress;
  const progressPercent = Math.min(100, Math.max(0, (displayedProgress / effectiveDuration) * 100));
  const currentVolume = isMuted ? 0 : volume;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
    setSeekValue(progress);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    setIsSeeking(false);
    onSeek(val);
  };

  return (
    <footer 
      className="hidden md:flex h-20 w-full shrink-0 bg-white/95 dark:bg-[#121322]/95 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 z-40 px-6 items-center justify-between select-none shadow-2xl transition-colors duration-200"
      aria-label="Desktop Player Controls"
    >
      {/* ------------------------------------------------------------- */}
      {/* ZONE 1: Track Information (Left) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
        {/* Album Artwork with Hover Play/Expand Overlay */}
        <div 
          onClick={onOpenOverlay}
          className="relative w-13 h-13 rounded-xl overflow-hidden shadow-md cursor-pointer group shrink-0 bg-black/10 dark:bg-white/10"
          title="Click to view full player"
        >
          <img
            src={optimizeImage(currentTrack.coverUrl, { width: 140, quality: 80 })}
            alt={currentTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => applyAppLogoFallback(e, currentTrack)}
            onLoad={(e) => applyAppLogoFallback(e, currentTrack)}
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <div 
            onClick={onOpenOverlay}
            className="text-sm font-bold truncate text-gray-900 dark:text-white hover:underline cursor-pointer"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </div>

          <div 
            onClick={() => onSelectArtist && onSelectArtist(currentTrack.artist)}
            className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-[var(--theme-color)] hover:underline cursor-pointer mt-0.5"
            title={currentTrack.artist}
          >
            {currentTrack.artist}
          </div>
        </div>

        {/* Quick Actions (Favorite & Download) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            aria-label="Favorite"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--theme-color)] transition-colors cursor-pointer disabled:opacity-50"
            title="Download for offline playback"
            aria-label="Download"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ZONE 2: Playback Controls & Scrubber Timeline (Center) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl px-4">
        {/* Buttons Row */}
        <div className="flex items-center gap-4">
          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isShuffle ? 'text-[var(--theme-color)]' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
            aria-label="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          {/* Previous Track */}
          <button
            onClick={onPrev}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Previous Song"
            aria-label="Previous"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="p-2.5 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-black/10 dark:border-white/20 flex items-center justify-center"
            style={{
              backgroundColor: themeColor,
              color: themeColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
            }}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Next Song"
            aria-label="Next"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>

          {/* Repeat Mode Button */}
          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-full transition-colors cursor-pointer relative ${
              repeatMode > 0 ? 'text-[var(--theme-color)]' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={repeatMode === 2 ? "Repeat Track" : repeatMode === 1 ? "Repeat Queue" : "Repeat Off"}
            aria-label="Repeat"
          >
            {repeatMode === 2 ? <Repeat1 size={17} /> : <Repeat size={17} />}
            {repeatMode > 0 && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--theme-color)]" />
            )}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="w-full flex items-center gap-2.5 text-[11px] font-mono font-medium text-gray-400">
          <span className="w-9 text-right shrink-0">
            {formatTime(displayedProgress)}
          </span>

          <div className="relative flex-1 flex items-center group cursor-pointer h-4">
            {/* Background Track */}
            <div className="w-full h-1 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: themeColor 
                }}
              />
            </div>

            {/* Native Slider Input (Transparent on top for precision scrubbing) */}
            <input
              type="range"
              min={0}
              max={effectiveDuration}
              step={0.5}
              value={displayedProgress}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Timeline seek"
            />
          </div>

          <span className="w-9 text-left shrink-0">
            {formatTime(effectiveDuration)}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ZONE 3: Volume & Expanded View Utilities (Right) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* Fullscreen Player Expander Button */}
        <button
          onClick={onOpenOverlay}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Open Fullscreen Player & Queue"
        >
          <ListMusic size={18} />
          <span className="hidden xl:inline">Player & Queue</span>
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || currentVolume === 0 ? (
              <VolumeX size={18} />
            ) : currentVolume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          {/* Volume Slider */}
          <div className="relative w-20 lg:w-24 flex items-center group cursor-pointer h-4">
            <div className="w-full h-1 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${currentVolume * 100}%`,
                  backgroundColor: themeColor 
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={currentVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Volume control"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
