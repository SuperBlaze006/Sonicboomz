import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track, Playlist } from '../types';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Info, 
  MoreVertical,
  ListPlus,
  ListStart,
  ListEnd,
  Plus,
  Check,
  ShieldCheck, 
  Music, 
  User as UserIcon,
  X,
  ExternalLink,
  Download
} from 'lucide-react';
import { FullScreenCreditsModal } from './FullScreenCreditsModal';

interface PlayerOverlayProps {
  queue: any[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 0 | 1 | 2;
  favorites: Track[];
  playlists: Playlist[];
  onPlayPause: () => void;
  onClose: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (track: Track) => boolean | void;
  onPlayIndex: (index: number) => void;
  onSelectArtist?: (artistName: string) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onCreatePlaylistAndAdd: (name: string, track: Track) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onDownloadTrack?: (track: Track) => void;
  isDownloading?: string | null;
  isAuthenticated?: boolean;
  onRequireSignIn?: () => void;
}

interface CreditsData {
  title?: string;
  artist?: string;
  featuredArtists?: string[];
  album?: string;
  releaseYear?: string;
  genre?: string;
  recordLabel?: string;
  writers?: string[];
  producers?: string[];
  audioSpecs?: {
    quality: string;
    sampleRate: string;
    channels: string;
    encoding: string;
    dynamicRange: string;
  };
  ownershipStatement?: string;
  loading?: boolean;
}

function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function PlayerOverlay({ 
  queue, 
  currentIndex, 
  isPlaying, 
  progress, 
  duration, 
  isShuffle, 
  repeatMode, 
  favorites, 
  playlists,
  onPlayPause, 
  onClose, 
  onSeek, 
  onNext, 
  onPrev, 
  onToggleShuffle, 
  onToggleRepeat, 
  onToggleFavorite,
  onSelectArtist,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
  onPlayNext,
  onAddToQueue,
  onDownloadTrack,
  isDownloading,
  isAuthenticated = false,
  onRequireSignIn,
}: PlayerOverlayProps) {
  const currentTrack: Track = queue[currentIndex] || {};
  const isFavorite = favorites.some(f => f.id === currentTrack.id);
  const effectiveDuration = duration > 0 ? duration : (currentTrack.duration || 180);

  // Seeking & dynamic scrub state
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const displayProgress = isSeeking ? seekValue : progress;
  const progressRatio = Math.max(0, Math.min(1, effectiveDuration > 0 ? displayProgress / effectiveDuration : 0));

  // Modals & Bottom Sheets
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [useAppLogoFallback, setUseAppLogoFallback] = useState(false);

  useEffect(() => {
    setUseAppLogoFallback(!currentTrack?.coverUrl || currentTrack.coverUrl === '/app-logo.svg');
  }, [currentTrack?.id, currentTrack?.coverUrl]);

  // New Playlist inline creation
  const [isCreatingNewPlaylist, setIsCreatingNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Real credits state
  const [creditsData, setCreditsData] = useState<CreditsData>({
    loading: false
  });

  // Fetch real song credits whenever current track changes
  useEffect(() => {
    if (!currentTrack?.title) return;

    let isMounted = true;
    setCreditsData(prev => ({ ...prev, loading: true }));

    fetch(`/api/credits?id=${encodeURIComponent(currentTrack.id || '')}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist || '')}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setCreditsData({
          title: data.title || currentTrack.title,
          artist: data.artist || currentTrack.artist,
          featuredArtists: data.featuredArtists || [],
          album: data.album || `${currentTrack.title} - Single`,
          releaseYear: data.releaseYear || '2024',
          genre: data.genre || 'General',
          recordLabel: data.recordLabel || `${data.artist || currentTrack.artist} Official / Universal Music Group / T-Series`,
          writers: data.writers?.length ? data.writers : [data.artist || currentTrack.artist || 'Original Lyricist'],
          producers: data.producers?.length ? data.producers : ['Original Sound Engineering & Master Studio'],
          audioSpecs: data.audioSpecs || {
            quality: '320 kbps High Fidelity Lossless',
            sampleRate: '44.1 kHz',
            channels: 'Stereo',
            encoding: 'Direct Stream Pure Audio',
            dynamicRange: 'Master Quality Authenticated'
          },
          ownershipStatement: data.ownershipStatement || 'All musical works, sound recordings, performances, and lyrics belong exclusively to the original artists, composers, lyricists, and authorized record labels.',
          loading: false
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setCreditsData({
          title: currentTrack.title,
          artist: currentTrack.artist,
          featuredArtists: [],
          album: `${currentTrack.title} - Single`,
          releaseYear: '2024',
          genre: 'Contemporary',
          recordLabel: `${currentTrack.artist || 'Original Recording Artist'} / Original Label`,
          writers: [currentTrack.artist || 'Original Songwriter'],
          producers: ['Original Sound Engineering & Master Studio'],
          audioSpecs: {
            quality: '320 kbps High Fidelity Lossless',
            sampleRate: '44.1 kHz',
            channels: 'Stereo',
            encoding: 'Direct Stream Pure Audio',
            dynamicRange: 'Master Quality Authenticated'
          },
          ownershipStatement: 'All musical works, sound recordings, performances, and lyrics belong exclusively to the original artists, composers, lyricists, and authorized record labels.',
          loading: false
        });
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Desktop keyboard escape handler to minimize player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreditsModal) {
          setShowCreditsModal(false);
        } else if (showOptionsSheet) {
          setShowOptionsSheet(false);
        } else if (showPlaylistSelector) {
          setShowPlaylistSelector(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showCreditsModal, showOptionsSheet, showPlaylistSelector]);

  // =========================================================================
  // DYNAMIC AUDIO VOCAL TIMELAPSE WAVEFORM SCRUBBER
  // =========================================================================
  const waveformBarsCount = 56;
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [wavePhase, setWavePhase] = useState<number>(0);

  // Smooth live cadence animation when audio is actively playing
  useEffect(() => {
    if (!isPlaying) return;
    let rafId: number;
    let lastTick = performance.now();

    const step = (now: number) => {
      if (now - lastTick >= 45) {
        setWavePhase((prev) => (prev + 0.28) % (Math.PI * 20));
        lastTick = now;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const waveformBars = useMemo(() => {
    const bars: number[] = [];
    const seedStr = `${currentTrack?.id || ''}${currentTrack?.title || 'track'}${currentTrack?.artist || ''}`;
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      hash ^= seedStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const seed = Math.abs(hash % 10000) / 10000;

    for (let i = 0; i < waveformBarsCount; i++) {
      const p = i / (waveformBarsCount - 1);

      // Realistic song structure envelope: intro -> verse -> chorus 1 -> bridge dip -> chorus 2 peak -> outro
      const introOutroEnvelope = Math.pow(Math.sin(p * Math.PI), 0.55);
      const chorus1 = Math.exp(-Math.pow((p - 0.32) / 0.14, 2)) * 0.32;
      const bridgeDip = -Math.exp(-Math.pow((p - 0.56) / 0.08, 2)) * 0.22;
      const chorus2 = Math.exp(-Math.pow((p - 0.76) / 0.15, 2)) * 0.38;

      // Multi-frequency vocal & percussion transients deterministic to each track
      const transientFast = Math.sin(i * 2.35 + seed * 40) * 0.16;
      const transientMid = Math.cos(i * 0.85 + seed * 25) * 0.14;
      const beatPulse = ((i * 7 + Math.floor(seed * 19)) % 4 === 0) ? 0.12 : -0.04;

      const raw =
        0.26 +
        introOutroEnvelope * 0.38 +
        chorus1 +
        bridgeDip +
        chorus2 +
        transientFast +
        transientMid +
        beatPulse;

      bars.push(Math.min(98, Math.max(18, Math.round(raw * 100))));
    }
    return bars;
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist]);

  // Interactive Waveform Scrubbing
  const waveformRef = useRef<HTMLDivElement>(null);

  const getPointerRatio = (clientX: number): number => {
    if (!waveformRef.current) return 0;
    const rect = waveformRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return clampedX / rect.width;
  };

  const calculateSeekFromPointer = (clientX: number): number => {
    const ratio = getPointerRatio(clientX);
    const target = ratio * effectiveDuration;
    setSeekValue(target);
    setHoverRatio(ratio);
    return target;
  };

  const handleWaveformPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSeeking(true);
    calculateSeekFromPointer(e.clientX);
  };

  const handleWaveformPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSeeking) {
      calculateSeekFromPointer(e.clientX);
    } else if (e.pointerType === 'mouse') {
      setHoverRatio(getPointerRatio(e.clientX));
    }
  };

  const handleWaveformPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const finalSeek = calculateSeekFromPointer(e.clientX);
    setIsSeeking(false);
    setHoverRatio(null);
    onSeek(finalSeek);
  };

  const handleWaveformPointerLeave = () => {
    if (!isSeeking) {
      setHoverRatio(null);
    }
  };

  // =========================================================================
  // HORIZONTAL CAROUSEL SWIPING (LEFT & RIGHT) & VERTICAL DISMISS (FLOW DOWN)
  // =========================================================================
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleGestureStart = (clientX: number, clientY: number) => {
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    isDraggingRef.current = true;
  };

  const handleGestureMove = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || !isDraggingRef.current) return;
    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;

    // Track horizontal displacement in real-time
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset(dx * 0.85);
    }
  };

  const handleGestureEnd = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || !isDraggingRef.current) return;
    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
    const dt = Math.max(1, Date.now() - touchStartRef.current.time);
    const vx = dx / dt;
    const vy = dy / dt;

    isDraggingRef.current = false;
    touchStartRef.current = null;
    setDragOffset(0);

    // 1. Flow Up to Down (Dismiss player if pulled down)
    if (dy > 75 || (dy > 40 && vy > 0.35)) {
      if (Math.abs(dy) > Math.abs(dx)) {
        onClose();
        return;
      }
    }

    // 2. Slide to Left (Next Track) or Slide to Right (Previous Track)
    if (dx < -45 || (dx < -25 && vx < -0.3)) {
      onNext();
    } else if (dx > 45 || (dx > 25 && vx > 0.3)) {
      onPrev();
    }
  };

  // Top header dismiss handle gesture
  const topHandleTouchRef = useRef<number | null>(null);
  const handleTopPullStart = (clientY: number) => {
    topHandleTouchRef.current = clientY;
  };
  const handleTopPullEnd = (clientY: number) => {
    if (topHandleTouchRef.current !== null) {
      const dy = clientY - topHandleTouchRef.current;
      if (dy > 50) {
        onClose();
      }
      topHandleTouchRef.current = null;
    }
  };

  const handleCreateNewPlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !currentTrack) return;
    onCreatePlaylistAndAdd(newPlaylistName.trim(), currentTrack);
    setNewPlaylistName('');
    setIsCreatingNewPlaylist(false);
  };

  // Carousel item index preparation
  const prevTrack = currentIndex > 0 ? queue[currentIndex - 1] : null;
  const nextTrack = currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;

  const isAnyModalOpen = showOptionsSheet || showPlaylistSelector || showCreditsModal;

  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 290, damping: 28, mass: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#080808] text-white safe-area-pt safe-area-pb select-none overflow-hidden"
    >
      {/* Dynamic Ambient Aura Background */}
      <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-300 ${isAnyModalOpen ? 'opacity-0' : 'opacity-100'}`}>
        {(useAppLogoFallback ? '/app-logo.svg' : currentTrack.coverUrl) && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-150 transition-all duration-1000"
            style={{ backgroundImage: `url(${useAppLogoFallback ? '/app-logo.svg' : currentTrack.coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#0a0a10]/95 to-[#080808]" />
      </div>

      {/* Top Header Row (Single Unified Row: Minimize, Visible Gray Drag Handle, Credits & Options) */}
      <header 
        className="flex items-center justify-between px-5 pt-3 pb-2 z-20 shrink-0 max-w-xl lg:max-w-2xl mx-auto w-full"
        onTouchStart={(e) => handleTopPullStart(e.touches[0].clientY)}
        onTouchEnd={(e) => handleTopPullEnd(e.changedTouches[0].clientY)}
      >
        {/* Minimize Button */}
        <button 
          id="btn-player-dismiss"
          onClick={onClose} 
          className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-90 transition-all rounded-full text-gray-200 cursor-pointer shadow-md"
          aria-label="Minimize Player"
          title="Minimize player"
        >
          <ChevronDown size={22} />
        </button>

        {/* Center: Small Centered Low-Contrast Gray Drag Handle Line & "Playing" Label */}
        <div 
          className="flex flex-col items-center justify-center cursor-pointer group py-1"
          onClick={onClose}
          title="Swipe down or tap to minimize"
        >
          <div className="w-9 h-1 rounded-full bg-white/35 group-hover:bg-white/60 shadow-sm transition-all mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Playing
          </span>
        </div>

        {/* Right Actions: Credits ('i' sign) & Three-Dot Options */}
        <div className="flex items-center gap-2">
          {/* Song Credits button ('i' sign) */}
          <button
            id="btn-song-credits"
            onClick={() => setShowCreditsModal(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-90 transition-all rounded-full text-gray-200 hover:text-[var(--theme-color)] cursor-pointer shadow-md"
            aria-label="View Song Credits"
            title="Song Credits & Ownership"
          >
            <Info size={20} />
          </button>

          {/* Three-Dot Options Button */}
          <button
            id="btn-player-more-options"
            onClick={() => setShowOptionsSheet(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-90 transition-all rounded-full text-gray-200 hover:text-white cursor-pointer shadow-md"
            aria-label="Track Options"
            title="Options & Playlists"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN TRACK CAROUSEL (SMOOTH HORIZONTAL SLIDERS LEFT & RIGHT) */}
      {/* ===================================================================== */}
      <div 
        className="flex-1 min-h-0 relative flex items-center justify-center w-full my-auto overflow-hidden px-4"
        onTouchStart={(e) => handleGestureStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleGestureMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={(e) => handleGestureEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
        onMouseDown={(e) => handleGestureStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleGestureMove(e.clientX, e.clientY)}
        onMouseUp={(e) => handleGestureEnd(e.clientX, e.clientY)}
        onMouseLeave={(e) => handleGestureEnd(e.clientX, e.clientY)}
      >
        {/* Left Side Previous Track Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 sm:left-8 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 cursor-pointer shadow-xl hidden sm:flex items-center justify-center"
            aria-label="Previous Track"
            title="Slide to previous song"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Side Next Track Arrow */}
        {currentIndex < queue.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 sm:right-8 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 cursor-pointer shadow-xl hidden sm:flex items-center justify-center"
            aria-label="Next Track"
            title="Slide to next song"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Previous Track Card (peeking on left) */}
        {prevTrack && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-0 -translate-x-[75%] sm:-translate-x-[65%] w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] aspect-square rounded-2xl overflow-hidden opacity-30 hover:opacity-50 scale-90 transition-all cursor-pointer z-0 pointer-events-auto shrink-0 shadow-lg border border-white/5"
          >
            <img 
              src={optimizeImage(prevTrack.coverUrl, { width: 400, quality: 75 })} 
              alt={prevTrack.title}
              className="w-full h-full object-cover object-center select-none"
              draggable={false}
              onError={(e) => applyAppLogoFallback(e, prevTrack)}
              onLoad={(e) => applyAppLogoFallback(e, prevTrack)}
            />
          </div>
        )}

        {/* Active Center Track Card (Fixed Uniform Square Widget & Clean Photo) */}
        <motion.div
          key={currentTrack.id || currentIndex}
          style={{ 
            x: dragOffset,
            willChange: 'transform'
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[360px] sm:h-[360px] aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shrink-0 select-none"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <img 
              src={useAppLogoFallback ? '/app-logo.svg' : optimizeImage(currentTrack.coverUrl, { width: 600, quality: 90 })} 
              alt={currentTrack.title}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              draggable={false}
              onError={(e) => {
                applyAppLogoFallback(e, currentTrack);
                setUseAppLogoFallback(true);
              }}
              onLoad={(e) => {
                if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) {
                  applyAppLogoFallback(e, currentTrack);
                  setUseAppLogoFallback(true);
                }
              }}
            />
          </div>
        </motion.div>

        {/* Next Track Card (peeking on right) */}
        {nextTrack && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-0 translate-x-[75%] sm:translate-x-[65%] w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] aspect-square rounded-2xl overflow-hidden opacity-30 hover:opacity-50 scale-90 transition-all cursor-pointer z-0 pointer-events-auto shrink-0 shadow-lg border border-white/5"
          >
            <img 
              src={optimizeImage(nextTrack.coverUrl, { width: 400, quality: 75 })} 
              alt={nextTrack.title}
              className="w-full h-full object-cover object-center select-none"
              draggable={false}
              onError={(e) => applyAppLogoFallback(e, nextTrack)}
              onLoad={(e) => applyAppLogoFallback(e, nextTrack)}
            />
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TRACK METADATA, DYNAMIC AUDIO TIMELAPSE & CONTROLS SECTION */}
      {/* ===================================================================== */}
      <div className="w-full max-w-md mx-auto px-6 pb-6 pt-2 z-20 flex flex-col justify-end">
        {/* Track Title, Clickable Artist Profile & Heart Favorite Button ONLY */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black truncate tracking-tight text-white">
              {currentTrack.title}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (currentTrack.artist && onSelectArtist) {
                  onClose();
                  onSelectArtist(currentTrack.artist);
                }
              }}
              className="text-sm font-semibold text-gray-400 hover:text-[var(--theme-color)] hover:underline truncate block text-left transition-colors cursor-pointer mt-0.5"
              title="View full artist catalog"
            >
              {currentTrack.artist || 'Unknown Artist'}
            </button>
          </div>

          <div className="flex items-center shrink-0">
            {/* Heart Favorite / Like Button ONLY (Add to playlist is in three-dot menu as requested) */}
            <button 
              id="btn-player-favorite"
              onClick={() => onToggleFavorite(currentTrack)}
              className={`p-3 rounded-full transition-all active:scale-90 ${
                isFavorite 
                  ? 'text-red-500 bg-red-500/15' 
                  : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/15'
              }`}
              title={isFavorite ? 'Unlike' : 'Like'}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DYNAMIC AUDIO VOCAL TIMELAPSE WAVEFORM SCRUBBER */}
        {/* ===================================================================== */}
        <div className="w-full mb-4">
          <div 
            ref={waveformRef}
            id="player-dynamic-vocal-timelapse"
            role="slider"
            aria-label="Audio waveform seekbar"
            aria-valuemin={0}
            aria-valuemax={Math.round(effectiveDuration)}
            aria-valuenow={Math.round(displayProgress)}
            onPointerDown={handleWaveformPointerDown}
            onPointerMove={handleWaveformPointerMove}
            onPointerUp={handleWaveformPointerUp}
            onPointerCancel={handleWaveformPointerUp}
            onPointerLeave={handleWaveformPointerLeave}
            className="relative h-14 flex items-center justify-between gap-[2.5px] sm:gap-[3px] px-1 cursor-pointer group select-none touch-none"
            title="Drag or tap to scrub through the song"
          >
            {/* Floating Scrub Time Pill (Visible while actively dragging/seeking or hovering) */}
            {(isSeeking || hoverRatio !== null) && (
              <div
                className="pointer-events-none absolute -top-7 z-30 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black tracking-wider shadow-[0_4px_14px_rgba(255,255,255,0.35)] transition-transform duration-75"
                style={{
                  left: `${Math.min(94, Math.max(6, (isSeeking ? progressRatio : (hoverRatio ?? progressRatio)) * 100))}%`,
                }}
              >
                {formatTime((isSeeking ? progressRatio : (hoverRatio ?? progressRatio)) * effectiveDuration)}
              </div>
            )}

            {/* Subtle Center Horizon Axis Line */}
            <div className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] bg-white/[0.07] rounded-full" />

            {/* Live Playhead Indicator Glow Line */}
            <div
              className="pointer-events-none absolute top-1 bottom-1 z-20 w-[2px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_4px_#ffffff] transition-[left,transform] duration-75"
              style={{
                left: `${progressRatio * 100}%`,
                transform: `translateX(-50%) scaleY(${isSeeking ? 1.08 : 0.92})`,
                opacity: effectiveDuration > 0 ? 0.95 : 0,
              }}
            />

            {waveformBars.map((baseHeight, index) => {
              const barRatio = index / (waveformBarsCount - 1);
              const distFromPlayhead = Math.abs(barRatio - progressRatio);
              const isCompleted = barRatio <= progressRatio;
              const isAtPlayhead = distFromPlayhead < (1.4 / waveformBarsCount);
              const isNearPlayhead = distFromPlayhead < 0.085;

              // Hover / scrub preview zone between playhead and pointer
              const activePointerRatio = isSeeking ? progressRatio : hoverRatio;
              const isInPreviewRange =
                activePointerRatio !== null &&
                ((barRatio >= progressRatio && barRatio <= activePointerRatio) ||
                  (barRatio <= progressRatio && barRatio >= activePointerRatio));

              // Magnetic lens magnification near finger/cursor when scrubbing or hovering
              const distFromPointer =
                activePointerRatio !== null ? Math.abs(barRatio - activePointerRatio) : 1;
              const pointerBoost =
                activePointerRatio !== null && distFromPointer < 0.11
                  ? Math.cos((distFromPointer / 0.11) * (Math.PI / 2)) * 18
                  : 0;

              // Live real-time acoustic modulation when playing
              let liveDelta = 0;
              if (isPlaying && !isSeeking) {
                const wave1 = Math.sin(wavePhase + index * 0.65);
                const wave2 = Math.cos(wavePhase * 1.45 - index * 0.4);
                if (isNearPlayhead) {
                  // Strongest live vocal/beat bounce right around the playhead
                  const proximity = 1 - distFromPlayhead / 0.085;
                  liveDelta = (wave1 * 0.6 + wave2 * 0.4) * (16 * proximity + 6);
                } else if (isCompleted) {
                  // Subtle rhythmic breathing across played bars
                  liveDelta = (wave1 * 0.5 + wave2 * 0.5) * 5.5;
                } else {
                  // Gentle shimmer on upcoming bars
                  liveDelta = wave1 * 1.8;
                }
              }

              const dynamicHeight = Math.min(
                100,
                Math.max(14, Math.round(baseHeight + liveDelta + pointerBoost))
              );

              return (
                <div
                  key={index}
                  className="flex-1 flex items-center justify-center h-full z-10"
                >
                  <div
                    className="w-full rounded-full transition-[height,background-color,box-shadow,transform] duration-100 ease-out"
                    style={{
                      height: `${dynamicHeight}%`,
                      minHeight: '5px',
                      maxHeight: '100%',
                      backgroundColor: isAtPlayhead
                        ? '#ffffff'
                        : isCompleted
                        ? '#ffffff'
                        : isInPreviewRange
                        ? 'rgba(255, 255, 255, 0.55)'
                        : 'rgba(255, 255, 255, 0.24)',
                      boxShadow: isAtPlayhead
                        ? '0 0 12px rgba(255, 255, 255, 0.95), 0 0 4px rgba(255, 255, 255, 0.8)'
                        : isCompleted
                        ? '0 0 6px rgba(255, 255, 255, 0.35)'
                        : 'none',
                      transform: isAtPlayhead
                        ? 'scaleX(1.25)'
                        : isNearPlayhead && isPlaying
                        ? 'scaleX(1.08)'
                        : 'scaleX(1)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Timestamps */}
          <div className="flex justify-between text-[11px] font-bold text-gray-400 px-1 mt-1.5">
            <span className={isSeeking ? 'text-white font-extrabold' : 'text-white/90'}>
              {formatTime(displayProgress)}
            </span>
            <span className="text-white/60">{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Primary Playback Transport Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Shuffle Toggle */}
          <button 
            id="btn-player-shuffle"
            onClick={onToggleShuffle} 
            className={`p-3 rounded-full transition-all active:scale-90 ${
              isShuffle ? 'text-[var(--theme-color)] bg-[var(--theme-color)]/10' : 'text-gray-400 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
          >
            <Shuffle size={20} />
          </button>

          {/* Previous Track */}
          <button 
            id="btn-player-prev"
            onClick={onPrev} 
            className="p-3 text-white/90 hover:text-white active:scale-90 transition-all rounded-full hover:bg-white/10 cursor-pointer"
            title="Previous Track"
          >
            <SkipBack size={26} />
          </button>

          {/* Big Play / Pause Button with Radiant Ambient Ring */}
          <button 
            id="btn-player-play-pause"
            onClick={onPlayPause} 
            className="p-5 bg-[var(--theme-color)] hover:opacity-95 text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] rounded-full shadow-2xl transition-all transform active:scale-95 flex items-center justify-center relative group cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <div className="absolute inset-0 rounded-full bg-[var(--theme-color)] filter blur-md opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none" />
            {isPlaying ? (
              <Pause size={28} fill="currentColor" className="relative z-10" />
            ) : (
              <Play size={28} fill="currentColor" className="relative z-10 ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button 
            id="btn-player-next"
            onClick={onNext} 
            className="p-3 text-white/90 hover:text-white active:scale-90 transition-all rounded-full hover:bg-white/10 cursor-pointer"
            title="Next Track"
          >
            <SkipForward size={26} />
          </button>

          {/* Repeat Mode Toggle */}
          <button 
            id="btn-player-repeat"
            onClick={onToggleRepeat} 
            className={`p-3 rounded-full transition-all active:scale-90 ${
              repeatMode > 0 ? 'text-[var(--theme-color)] bg-[var(--theme-color)]/10' : 'text-gray-400 hover:text-white'
            }`}
            title={repeatMode === 2 ? 'Repeat One' : repeatMode === 1 ? 'Repeat All' : 'Repeat Off'}
          >
            {repeatMode === 2 ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. THREE-DOT TRACK OPTIONS BOTTOM SHEET */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showOptionsSheet && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-0"
            style={{ isolation: 'isolate' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowOptionsSheet(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.95 }}
              dragMomentum={false}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 45 || info.velocity.y > 200) {
                  setShowOptionsSheet(false);
                }
              }}
              onTouchStart={(e) => {
                topHandleTouchRef.current = e.touches[0].clientY;
              }}
              onTouchEnd={(e) => {
                if (topHandleTouchRef.current !== null) {
                  const dy = e.changedTouches[0].clientY - topHandleTouchRef.current;
                  if (dy > 50) {
                    setShowOptionsSheet(false);
                  }
                  topHandleTouchRef.current = null;
                }
              }}
              className="relative z-10 w-full max-w-lg bg-[#11121d] border-t border-white/15 rounded-t-[32px] px-5 pt-3 pb-8 shadow-2xl flex flex-col gap-3.5 text-white touch-none select-none"
              style={{ isolation: 'isolate', willChange: 'transform' }}
            >
              {/* Interactive Drag-Down Handle Line */}
              <div
                onClick={() => setShowOptionsSheet(false)}
                className="w-full py-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group"
                title="Slide down or tap to close"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/35 group-hover:bg-white/60 transition-colors" />
              </div>

              {/* Song Header Info */}
              <div className="flex items-center gap-3.5 pb-3.5 border-b border-white/10">
                <img 
                  src={useAppLogoFallback ? '/app-logo.svg' : optimizeImage(currentTrack.coverUrl, { width: 100, quality: 80 })} 
                  alt={currentTrack.title}
                  className="w-13 h-13 rounded-2xl object-cover shadow-md border border-white/10 shrink-0"
                  onError={(e) => {
                    applyAppLogoFallback(e, currentTrack);
                    setUseAppLogoFallback(true);
                  }}
                  onLoad={(e) => {
                    if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) {
                      applyAppLogoFallback(e, currentTrack);
                      setUseAppLogoFallback(true);
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-base truncate">{currentTrack.title}</h3>
                  <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOptionsSheet(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-gray-200 hover:text-white cursor-pointer shrink-0"
                  aria-label="Close options"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Options List */}
              <div className="space-y-1">
                {/* Add to Playlist */}
                <button
                  id="opt-add-to-playlist"
                  onClick={() => {
                    setShowOptionsSheet(false);
                    setShowPlaylistSelector(true);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                >
                  <div className="p-2.5 rounded-xl bg-[var(--theme-color)]/20 text-[var(--theme-color)]">
                    <ListPlus size={20} />
                  </div>
                  <div className="flex-1">
                    <div>Add to Playlist</div>
                    <div className="text-xs text-gray-400 font-normal">Choose existing or create new playlist</div>
                  </div>
                </button>

                {/* Play Next */}
                <button
                  id="opt-play-next"
                  onClick={() => {
                    onPlayNext(currentTrack);
                    setShowOptionsSheet(false);
                    triggerToast('Added to play next');
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <ListStart size={20} />
                  </div>
                  <div className="flex-1">
                    <div>Play Next</div>
                    <div className="text-xs text-gray-400 font-normal">Insert song right after current track</div>
                  </div>
                </button>

                {/* Add to Queue */}
                <button
                  id="opt-add-to-queue"
                  onClick={() => {
                    onAddToQueue(currentTrack);
                    setShowOptionsSheet(false);
                    triggerToast('Added to end of queue');
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                >
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <ListEnd size={20} />
                  </div>
                  <div className="flex-1">
                    <div>Add to Queue</div>
                    <div className="text-xs text-gray-400 font-normal">Play at the end of current list</div>
                  </div>
                </button>

                {/* Download Song for Offline Play */}
                <button
                  id="opt-download-track"
                  onClick={() => {
                    if (onDownloadTrack && currentTrack) {
                      onDownloadTrack(currentTrack);
                      setShowOptionsSheet(false);
                    }
                  }}
                  disabled={isDownloading === currentTrack?.id}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Download size={20} className={isDownloading === currentTrack?.id ? 'animate-bounce' : ''} />
                  </div>
                  <div className="flex-1">
                    <div>{isDownloading === currentTrack?.id ? 'Downloading Song...' : 'Download for Offline'}</div>
                    <div className="text-xs text-gray-400 font-normal">Saves audio stream to Downloads section</div>
                  </div>
                </button>

                {/* View Song Credits & Ownership */}
                <button
                  id="opt-view-credits"
                  onClick={() => {
                    setShowOptionsSheet(false);
                    setShowCreditsModal(true);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <div>Song Credits & Real Ownership</div>
                    <div className="text-xs text-gray-400 font-normal">Real artists, songwriters, producers & rights</div>
                  </div>
                </button>

                {/* Go to Artist Page */}
                {currentTrack.artist && onSelectArtist && (
                  <button
                    id="opt-view-artist"
                    onClick={() => {
                      setShowOptionsSheet(false);
                      onClose();
                      onSelectArtist(currentTrack.artist);
                    }}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                  >
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <UserIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div>View Artist Profile</div>
                      <div className="text-xs text-gray-400 font-normal">Explore full discography of {currentTrack.artist}</div>
                    </div>
                  </button>
                )}

                {/* Toggle Favorite */}
                <button
                  id="opt-toggle-favorite"
                  onClick={() => {
                    const allowed = onToggleFavorite(currentTrack);
                    if (allowed !== false) {
                      triggerToast(isFavorite ? 'Removed from Liked Songs' : 'Saved to Liked Songs');
                    } else {
                      setShowOptionsSheet(false);
                    }
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left font-bold text-sm"
                >
                  <div className={`p-2.5 rounded-xl ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-400'}`}>
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </div>
                  <div className="flex-1">
                    <div>{isFavorite ? 'Liked in Library' : 'Like this Song'}</div>
                    <div className="text-xs text-gray-400 font-normal">Saves to permanent Liked Songs playlist</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 2. PLAYLIST SELECTOR MODAL ("WHICH PLAYLIST TO ADD TO") */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showPlaylistSelector && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ isolation: 'isolate' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowPlaylistSelector(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.95 }}
              dragMomentum={false}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 45 || info.velocity.y > 200) {
                  setShowPlaylistSelector(false);
                }
              }}
              className="relative z-10 w-full max-w-md bg-[#11121d] border-t sm:border border-white/15 rounded-t-[32px] sm:rounded-[32px] px-6 pt-3 pb-10 sm:pb-6 shadow-2xl flex flex-col max-h-[85vh] text-white select-none"
              style={{ isolation: 'isolate', willChange: 'transform' }}
            >
              {/* Interactive Drag-Down Handle Line */}
              <div
                onClick={() => setShowPlaylistSelector(false)}
                className="w-full py-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group touch-none"
                title="Slide down or tap to close"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/35 group-hover:bg-white/60 transition-colors" />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-lg font-black tracking-tight">Add to Playlist</h3>
                  <p className="text-xs text-gray-400 truncate">Select where to save "{currentTrack.title}"</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlaylistSelector(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-gray-200 hover:text-white shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Inline Create New Playlist Section */}
              {isCreatingNewPlaylist ? (
                <form onSubmit={handleCreateNewPlaylistSubmit} className="mb-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--theme-color)]">
                    New Playlist
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Enter playlist name..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewPlaylist(false)}
                      className="px-3 py-1.5 rounded-full text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[var(--theme-color)] text-white text-xs font-bold shadow-md"
                    >
                      Create & Add
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowPlaylistSelector(false);
                      if (onRequireSignIn) onRequireSignIn();
                      return;
                    }
                    setIsCreatingNewPlaylist(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 mb-4 rounded-2xl bg-[var(--theme-color)]/20 hover:bg-[var(--theme-color)]/30 border border-[var(--theme-color)]/40 text-[var(--theme-color)] font-bold text-xs transition-all active:scale-95"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Create New Playlist</span>
                </button>
              )}

              {/* Playlists List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Permanent Liked Songs Item */}
                <div
                  onClick={() => {
                    const allowed = onToggleFavorite(currentTrack);
                    if (allowed !== false) {
                      triggerToast(isFavorite ? 'Removed from Liked Songs' : 'Added to Liked Songs');
                    } else {
                      setShowPlaylistSelector(false);
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Heart size={18} fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">Liked Songs</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">Permanent Playlist • {favorites.length} songs</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isFavorite 
                      ? 'bg-[var(--theme-color)] border-[var(--theme-color)] text-white' 
                      : 'border-white/20'
                  }`}>
                    {isFavorite && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* User Created Custom Playlists */}
                {playlists.map((pl) => {
                  const alreadyInPlaylist = pl.tracks.some(t => t.id === currentTrack.id);

                  return (
                    <div
                      key={pl.id}
                      onClick={() => {
                        onAddToPlaylist(pl.id, currentTrack);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                          {pl.tracks.length > 0 && pl.tracks[0].coverUrl ? (
                            <img
                              src={optimizeImage(pl.tracks[0].coverUrl, { width: 100, quality: 80 })}
                              alt={pl.name}
                              className="w-full h-full object-cover"
                              onError={(e) => applyAppLogoFallback(e, pl.tracks[0])}
                              onLoad={(e) => applyAppLogoFallback(e, pl.tracks[0])}
                            />
                          ) : (
                            <Music size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs truncate">{pl.name}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{pl.tracks.length} songs</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        alreadyInPlaylist 
                          ? 'bg-[var(--theme-color)] border-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)]' 
                          : 'border-white/20'
                      }`}>
                        {alreadyInPlaylist && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 3. DEDICATED FULL-SCREEN AUTHENTIC SONG CREDITS & CREATOR PAGE */}
      {/* ===================================================================== */}
      <FullScreenCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        track={currentTrack}
        onPlayTrack={onPlayPause}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        onDownloadTrack={onDownloadTrack}
        isDownloading={Boolean(isDownloading && currentTrack?.id && isDownloading === currentTrack.id)}
        onSelectArtist={(artistName) => {
          setShowCreditsModal(false);
          onClose();
          if (onSelectArtist) onSelectArtist(artistName);
        }}
        showToast={triggerToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}
    </motion.div>
  );
}
