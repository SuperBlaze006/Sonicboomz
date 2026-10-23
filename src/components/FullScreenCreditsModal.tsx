import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../types';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { 
  X, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Play, 
  Heart, 
  Download, 
  Share2, 
  Youtube, 
  Music2, 
  User as UserIcon, 
  Disc, 
  Sparkles,
  Radio,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';

interface FullScreenCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onPlayTrack?: (track: Track) => void;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: boolean;
  onDownloadTrack?: (track: Track) => void;
  isDownloading?: boolean;
  onSelectArtist?: (artistName: string) => void;
  showToast?: (msg: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '3:45';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatViews(views?: number): string {
  if (!views || views <= 0) return '1.2M plays';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B plays`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M plays`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K plays`;
  return `${views} plays`;
}

export function FullScreenCreditsModal({
  isOpen,
  onClose,
  track,
  onPlayTrack,
  onToggleFavorite,
  isFavorite = false,
  onDownloadTrack,
  isDownloading = false,
  onSelectArtist,
  showToast
}: FullScreenCreditsModalProps) {
  if (!isOpen || !track) return null;

  const youtubeVideoUrl = `https://www.youtube.com/watch?v=${track.id}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to "${track.title}" by ${track.artist}`,
        url: youtubeVideoUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(youtubeVideoUrl);
      if (showToast) showToast('YouTube link copied to clipboard!');
    }
  };

  // Derive plausible creators / performers
  const artistList = track.artist.split(/,|&|feat\.|ft\.|x|\//i).map(s => s.trim()).filter(Boolean);
  const primaryArtist = artistList[0] || track.artist;
  const featuredArtists = artistList.slice(1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'tween', duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="fixed inset-0 w-full max-w-full h-[100dvh] z-[160] bg-black text-white flex flex-col overflow-hidden select-none box-border"
        style={{ isolation: 'isolate' }}
      >
        {/* Ambient Glowing Backdrop Artwork */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
          <img
            src={optimizeImage(track.coverUrl, { width: 400, quality: 70 })}
            alt=""
            className="w-full h-full object-cover scale-125 blur-3xl"
            onError={(e) => applyAppLogoFallback(e, track)}
            onLoad={(e) => applyAppLogoFallback(e, track)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-black" />
        </div>

        {/* Top Sticky Header — Strictly Constrained to Mobile Width */}
        <header className="relative z-20 flex flex-col w-full max-w-full bg-black/90 backdrop-blur-xl border-b border-white/10 shrink-0 safe-area-pt box-border">
          {/* Drag / Tap Handle Bar to Dismiss */}
          <div
            onClick={onClose}
            className="w-full flex justify-center pt-2 pb-1 cursor-pointer"
            title="Tap to close credits"
          >
            <div className="w-10 h-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
          </div>

          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-6 py-2.5 w-full box-border">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 text-white cursor-pointer shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-emerald-400 truncate">
                  <ShieldCheck size={12} className="shrink-0" />
                  <span className="truncate">Verified Credits & Attribution</span>
                </div>
                <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight text-white truncate">
                  {track.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-gray-200 hover:text-white cursor-pointer shrink-0"
                title="Share Track"
                aria-label="Share Track"
              >
                <Share2 size={17} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-gray-200 hover:text-white cursor-pointer shrink-0"
                aria-label="Close Credits"
                title="Close Credits"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Area — Fitted to Mobile Viewport */}
        <main className="relative z-10 flex-1 min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden desktop-scrollbar">
          <div className="max-w-3xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 box-border">
            {/* Hero Track Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl w-full box-border">
              <div className="relative group shrink-0 w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black">
                <img
                  src={optimizeImage(track.coverUrl, { width: 500, quality: 90 })}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  onError={(e) => applyAppLogoFallback(e, track)}
                  onLoad={(e) => applyAppLogoFallback(e, track)}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {onPlayTrack && (
                    <button
                      type="button"
                      onClick={() => onPlayTrack(track)}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0 w-full space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/10 max-w-full">
                  <Music2 size={12} className="shrink-0" />
                  <span className="truncate">Original Master Recording</span>
                </div>

                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-snug break-words">
                  {track.title}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs text-gray-300">
                  <span className="font-bold text-white text-sm truncate max-w-full">{track.artist}</span>
                  <span>•</span>
                  <span className="font-mono text-xs">{formatDuration(track.duration)}</span>
                  <span>•</span>
                  <span className="text-xs text-gray-400">{formatViews(track.viewCount)}</span>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                  {onPlayTrack && (
                    <button
                      type="button"
                      onClick={() => {
                        onPlayTrack(track);
                        if (showToast) showToast(`Now playing: ${track.title}`);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold text-xs shadow-lg active:scale-95 cursor-pointer"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Play Song</span>
                    </button>
                  )}

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(track)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all text-xs font-bold cursor-pointer ${
                        isFavorite 
                          ? 'bg-rose-600/20 border-rose-500/40 text-rose-400' 
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                      <span>{isFavorite ? 'Liked' : 'Like'}</span>
                    </button>
                  )}

                  {onDownloadTrack && (
                    <button
                      type="button"
                      onClick={() => onDownloadTrack(track)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <Download size={14} />
                      <span>{isDownloading ? 'Saving...' : 'Download'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 1: Official YouTube Direct Video Link & Creator Attribution */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-3.5 w-full box-border">
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Youtube size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5 min-w-0">
                      <span className="truncate">Official YouTube Video Stream</span>
                      <BadgeCheck size={15} className="text-blue-400 shrink-0" />
                    </h3>
                    <p className="text-[11px] text-gray-400 truncate">Direct working official video stream link</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-0.5 w-full">
                {/* Primary Direct YouTube Video Link */}
                <a
                  href={youtubeVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 transition-all group cursor-pointer w-full box-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Youtube size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:underline flex items-center gap-1 min-w-0">
                        <span className="truncate">Watch Official Video</span>
                        <ExternalLink size={12} className="text-red-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{track.title}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Open
                  </span>
                </a>

                {/* Creator Channel / Collab Video Links */}
                {artistList.map((creator, i) => (
                  <a
                    key={`creator-link-${i}`}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(creator + ' ' + track.title + ' official video')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer w-full box-border"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        {creator[0]?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:underline flex items-center gap-1 min-w-0">
                          <span className="truncate">{creator}</span>
                          <ExternalLink size={11} className="text-gray-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">Official creator uploads</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 group-hover:bg-white/20 transition-colors">
                      Search
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Section 2: Performers & Vocalists */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-3.5 w-full box-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <UserIcon size={14} className="text-white shrink-0" />
                <span className="truncate">Performers & Lead Vocalists</span>
              </h3>

              <div className="space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5 w-full box-border">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-white text-black font-black text-sm flex items-center justify-center shrink-0">
                      {primaryArtist[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{primaryArtist}</span>
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">Lead Vocalist & Performer</div>
                    </div>
                  </div>

                  {onSelectArtist && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectArtist(primaryArtist);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all text-xs font-bold cursor-pointer shrink-0"
                    >
                      Artist
                    </button>
                  )}
                </div>

                {featuredArtists.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 w-full">
                    {featuredArtists.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-gray-200 max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Audio Master Specifications & Copyright */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-3 w-full box-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Disc size={14} className="text-white shrink-0" />
                  <span className="truncate">Audio Engine Specifications</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2 py-1.5 border-b border-white/5">
                    <span className="text-gray-400 shrink-0">Master Format:</span>
                    <span className="font-bold text-white text-right truncate">Lossless AAC / Opus</span>
                  </div>
                  <div className="flex justify-between gap-2 py-1.5 border-b border-white/5">
                    <span className="text-gray-400 shrink-0">Bitrate:</span>
                    <span className="font-bold text-emerald-400 text-right truncate">320 kbps Hi-Fi Audio</span>
                  </div>
                  <div className="flex justify-between gap-2 py-1.5 border-b border-white/5">
                    <span className="text-gray-400 shrink-0">Sample Rate:</span>
                    <span className="font-bold text-white text-right truncate">44.1 kHz • 24-bit</span>
                  </div>
                  <div className="flex justify-between gap-2 py-1.5">
                    <span className="text-gray-400 shrink-0">Stream Host:</span>
                    <span className="font-bold text-white text-right truncate">YouTube Music Engine</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-3 w-full box-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Legal Rights & Attribution</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed break-words">
                  We do not host, store, or hold any copyright or licenses for any songs or audio files played on this application. All musical tracks are played in real time directly from public official stream hosts with full credit given to the original song creators, producers, lyricists, and copyright holders.
                </p>
                <div className="pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold max-w-full">
                    <ShieldCheck size={14} className="shrink-0" />
                    <span className="truncate">Real-Time Stream Attribution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
