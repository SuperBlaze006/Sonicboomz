import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Track } from '../types';
import { 
  Play, 
  Heart, 
  Download, 
  Music, 
  Shuffle, 
  ArrowLeft,
  Flame,
  Radio,
  Sparkles,
  TrendingUp,
  Disc3,
  RefreshCw
} from 'lucide-react';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';

interface TrendingViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  feedTracks: Track[];
  isLoadingFeed: boolean;
  isLoadingMoreFeed: boolean;
  hasMoreFeed: boolean;
  onLoadMoreFeed: () => void;
  onRefreshFeed: (categoryKey?: string | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  favorites: Track[];
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  onSelectArtist?: (artistName: string) => void;
}

interface TrendingGenreCardConfig {
  id: string;
  label: string;
  titleLine1: string;
  titleLine2?: string;
  titleColor1: string;
  titleColor2: string;
  categoryKey: string | null;
  featured?: boolean;
  bgGradient: string;
  glowColor: string;
}

// Modern Satin Theme Cards with Dual-Tone Editorial Typography (11 Clean Sections, No 3D Characters)
const GENRE_CARDS: TrendingGenreCardConfig[] = [
  {
    id: 'all-trending',
    label: 'All Trending',
    titleLine1: 'All',
    titleLine2: 'Trending',
    titleColor1: '#FFE4E6',
    titleColor2: '#FFFFFF',
    categoryKey: 'All Trending',
    featured: true,
    bgGradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 55%, #fb7185 100%)',
    glowColor: 'rgba(255, 228, 230, 0.45)',
  },
  {
    id: 'bollywood',
    label: 'Bollywood',
    titleLine1: 'Bollywood',
    titleLine2: 'Hits',
    titleColor1: '#FFFFFF',
    titleColor2: '#FDE68A',
    categoryKey: 'Hindi & Bollywood',
    bgGradient: 'linear-gradient(135deg, #92400e 0%, #d97706 55%, #f59e0b 100%)',
    glowColor: 'rgba(254, 243, 199, 0.45)',
  },
  {
    id: 'hollywood',
    label: 'Hollywood',
    titleLine1: 'Hollywood',
    titleLine2: 'Hits',
    titleColor1: '#FFFFFF',
    titleColor2: '#BFDBFE',
    categoryKey: 'Hollywood Hits',
    bgGradient: 'linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)',
    glowColor: 'rgba(219, 234, 254, 0.42)',
  },
  {
    id: 'coke-studio',
    label: 'Coke Studio',
    titleLine1: 'Coke',
    titleLine2: 'Studio',
    titleColor1: '#FFFFFF',
    titleColor2: '#A7F3D0',
    categoryKey: 'Pakistani & Coke Studio',
    bgGradient: 'linear-gradient(135deg, #065f46 0%, #059669 55%, #10b981 100%)',
    glowColor: 'rgba(209, 250, 229, 0.42)',
  },
  {
    id: 'hustle-reality',
    label: 'Hustle Reality',
    titleLine1: 'Hustle',
    titleLine2: 'Reality',
    titleColor1: '#FFFFFF',
    titleColor2: '#E9D5FF',
    categoryKey: 'Hustle & Reality Shows',
    bgGradient: 'linear-gradient(135deg, #5b21b6 0%, #7e22ce 55%, #a855f7 100%)',
    glowColor: 'rgba(243, 232, 255, 0.42)',
  },
  {
    id: 'south-india',
    label: 'South Hits',
    titleLine1: 'South',
    titleLine2: 'Hits',
    titleColor1: '#FFFFFF',
    titleColor2: '#FECACA',
    categoryKey: 'South Hits',
    bgGradient: 'linear-gradient(135deg, #991b1b 0%, #dc2626 55%, #ef4444 100%)',
    glowColor: 'rgba(254, 226, 226, 0.42)',
  },
  {
    id: 'hip-hop',
    label: 'Hip-Hop',
    titleLine1: 'Hip-Hop',
    titleLine2: 'Rap',
    titleColor1: '#FFFFFF',
    titleColor2: '#D9F99D',
    categoryKey: 'Desi Hip Hop',
    bgGradient: 'linear-gradient(135deg, #365314 0%, #4d7c0f 55%, #65a30d 100%)',
    glowColor: 'rgba(236, 252, 203, 0.42)',
  },
  {
    id: 'pop-hits',
    label: 'Indian Pop',
    titleLine1: 'Indian',
    titleLine2: 'Pop',
    titleColor1: '#FFFFFF',
    titleColor2: '#FBCFE8',
    categoryKey: 'Indian Pop',
    bgGradient: 'linear-gradient(135deg, #831843 0%, #be185d 55%, #ec4899 100%)',
    glowColor: 'rgba(252, 231, 243, 0.42)',
  },
  {
    id: 'lofi-chill',
    label: 'Lo-Fi Chill',
    titleLine1: 'Lo-Fi',
    titleLine2: 'Chill',
    titleColor1: '#FFFFFF',
    titleColor2: '#C7D2FE',
    categoryKey: 'Lo-Fi Chill',
    bgGradient: 'linear-gradient(135deg, #312e81 0%, #4338ca 55%, #6366f1 100%)',
    glowColor: 'rgba(224, 231, 255, 0.42)',
  },
  {
    id: 'slowed-reverb',
    label: 'Slowed Reverb',
    titleLine1: 'Slowed',
    titleLine2: 'Reverb',
    titleColor1: '#FFFFFF',
    titleColor2: '#99F6E4',
    categoryKey: 'Slowed + Reverb',
    bgGradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 55%, #14b8a6 100%)',
    glowColor: 'rgba(204, 251, 241, 0.42)',
  },
  {
    id: 'classical-rock',
    label: 'Classical & Rock',
    titleLine1: 'Classical',
    titleLine2: '& Rock',
    titleColor1: '#FFFFFF',
    titleColor2: '#FED7AA',
    categoryKey: 'Classical & Rock',
    bgGradient: 'linear-gradient(135deg, #9a3412 0%, #c2410c 55%, #f97316 100%)',
    glowColor: 'rgba(255, 237, 213, 0.42)',
  },
];

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatListens(views?: number): string {
  if (!views || views <= 0) return '';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B plays`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M plays`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K plays`;
  return `${views} plays`;
}

interface GenreCardProps {
  key?: React.Key;
  card: TrendingGenreCardConfig;
  onOpenSection: (card: TrendingGenreCardConfig) => void;
}

function TrendingGenreCard({ card, onOpenSection }: GenreCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenSection(card)}
      className={`${
        card.featured ? 'col-span-2' : 'col-span-1'
      } relative overflow-hidden rounded-2xl text-left cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] transition-[transform,box-shadow] duration-200 border border-white/15 ${
        card.featured ? 'h-[118px] sm:h-[132px]' : 'h-[110px] sm:h-[124px]'
      }`}
      style={{
        background: card.bgGradient,
      }}
    >
      {/* Soft Radial Ambient Spotlight */}
      <div
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
        style={{
          background: `radial-gradient(circle, ${card.glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Decorative Music Icon on Right */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-25 text-white">
        {card.featured ? (
          <Flame size={44} />
        ) : card.id === 'coke-studio' ? (
          <Radio size={36} />
        ) : card.id === 'hip-hop' ? (
          <Disc3 size={36} />
        ) : card.id === 'lofi-chill' || card.id === 'slowed-reverb' ? (
          <Sparkles size={36} />
        ) : (
          <TrendingUp size={36} />
        )}
      </div>

      {/* Subtle Legibility Scrim */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(55deg, rgba(0, 0, 0, 0.38) 0%, rgba(0, 0, 0, 0.12) 50%, transparent 80%)',
        }}
      />

      {/* Bottom-Left Down-Written Dual-Tone Typography */}
      <div className="relative z-20 h-full w-[80%] px-4 pb-3.5 sm:px-5 sm:pb-4 flex flex-col justify-end pointer-events-none">
        {card.featured ? (
          <div className="flex flex-col leading-[1.04]">
            <span
              className="text-[13px] sm:text-[15px] font-extrabold uppercase tracking-wider"
              style={{
                color: card.titleColor1,
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.35)',
              }}
            >
              {card.titleLine1}
            </span>
            <span
              className="text-[24px] sm:text-[28px] font-black tracking-tight"
              style={{
                color: card.titleColor2,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.42)',
              }}
            >
              {card.titleLine2}
            </span>
          </div>
        ) : (
          <div className="flex flex-col leading-[1.06]">
            <span
              className="text-[17px] sm:text-[20px] font-black tracking-tight break-words"
              style={{
                color: card.titleColor1,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
              }}
            >
              {card.titleLine1}
            </span>
            {card.titleLine2 && (
              <span
                className="text-[15px] sm:text-[18px] font-extrabold tracking-tight break-words mt-0.5"
                style={{
                  color: card.titleColor2,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                }}
              >
                {card.titleLine2}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export function TrendingView({
  feedTracks = [],
  isLoadingFeed,
  isLoadingMoreFeed,
  hasMoreFeed,
  onLoadMoreFeed,
  onRefreshFeed,
  selectedCategory,
  onSelectCategory,
  favorites,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  onSelectArtist,
}: TrendingViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);
  const savedHubScrollTopRef = useRef<number>(0);

  // Track whether the user is viewing a dedicated genre/section page or the main Trending Hub
  const [openedSection, setOpenedSection] = useState<TrendingGenreCardConfig | null>(() => {
    if (selectedCategory !== null) {
      return GENRE_CARDS.find((c) => c.categoryKey === selectedCategory) || null;
    }
    return null;
  });

  // Sync internal state with external selectedCategory prop changes
  useEffect(() => {
    if (selectedCategory !== null) {
      const match = GENRE_CARDS.find((c) => c.categoryKey === selectedCategory);
      if (match) setOpenedSection(match);
    } else {
      setOpenedSection(null);
    }
  }, [selectedCategory]);

  const handleOpenSection = (card: TrendingGenreCardConfig) => {
    if (mainScrollContainerRef.current) {
      savedHubScrollTopRef.current = mainScrollContainerRef.current.scrollTop;
      mainScrollContainerRef.current.scrollTop = 0;
    }
    setOpenedSection(card);
    onSelectCategory(card.categoryKey);
  };

  const handleBackToHub = () => {
    setOpenedSection(null);
    onSelectCategory(null);
  };

  // Restore scroll position when returning from a chart to the main Trending Hub
  useLayoutEffect(() => {
    if (!openedSection) {
      const targetPos = savedHubScrollTopRef.current;
      if (targetPos > 0 && mainScrollContainerRef.current) {
        mainScrollContainerRef.current.scrollTop = targetPos;
        requestAnimationFrame(() => {
          if (mainScrollContainerRef.current) {
            mainScrollContainerRef.current.scrollTop = targetPos;
          }
        });
      }
    }
  }, [openedSection]);

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const isCallingMoreRef = useRef<boolean>(false);

  const triggerLoadMore = () => {
    if (isCallingMoreRef.current || isLoadingMoreFeed || isLoadingFeed || !hasMoreFeed) return;
    isCallingMoreRef.current = true;
    onLoadMoreFeed();
    setTimeout(() => {
      isCallingMoreRef.current = false;
    }, 1000);
  };

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!openedSection || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerLoadMore();
        }
      },
      {
        root: mainScrollContainerRef.current,
        rootMargin: '600px'
      }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [openedSection, hasMoreFeed, isLoadingMoreFeed, isLoadingFeed, feedTracks.length]);

  const handlePlayAll = () => {
    if (feedTracks.length > 0) {
      onPlayTrack(feedTracks[0], 0, feedTracks);
    }
  };

  const handleShufflePlay = () => {
    if (feedTracks.length > 0) {
      const randomIdx = Math.floor(Math.random() * feedTracks.length);
      onPlayTrack(feedTracks[randomIdx], randomIdx, feedTracks);
    }
  };

  return (
    <div
      ref={mainScrollContainerRef}
      onScroll={(e) => {
        if (!openedSection) {
          savedHubScrollTopRef.current = e.currentTarget.scrollTop;
        } else {
          const target = e.currentTarget;
          const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;
          if (remaining < 600) {
            triggerLoadMore();
          }
        }
      }}
      className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-white dark:bg-[#080808] desktop-scrollbar text-gray-900 dark:text-white transition-colors duration-200 overscroll-y-contain [webkit-overflow-scrolling:touch]"
    >
      {/* VIEW A: DEDICATED SECTION PAGE (When a card is tapped) */}
      {openedSection ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-14">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between pt-3 sm:pt-5 pb-3">
            <button
              type="button"
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/[0.12] text-gray-900 dark:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRefreshFeed(openedSection.categoryKey)}
                disabled={isLoadingFeed}
                className="px-3 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Refresh chart with fresh songs"
              >
                <RefreshCw size={13} className={isLoadingFeed ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              {feedTracks.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleShufflePlay}
                    className="px-3.5 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Shuffle size={14} />
                    <span>Shuffle</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePlayAll}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Play All</span>
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Clean Satin Banner (Completely Free of 3D Characters) */}
          <div
            className="relative overflow-hidden rounded-2xl mb-5 p-5 sm:p-6 border border-white/15 shadow-md flex items-end justify-between min-h-[120px] sm:min-h-[140px]"
            style={{
              background: openedSection.bgGradient,
            }}
          >
            {/* Soft Ambient Glow */}
            <div
              className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full"
              style={{
                background: `radial-gradient(circle, ${openedSection.glowColor} 0%, transparent 70%)`,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(55deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.15) 50%, transparent 85%)',
              }}
            />

            <div className="relative z-20 flex flex-col justify-end leading-[1.06]">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/80 mb-1 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-300" />
                <span>Trending Chart</span>
              </span>
              <h1 className="flex flex-wrap items-baseline gap-x-2 text-2xl sm:text-4xl font-black tracking-tight">
                <span
                  style={{
                    color: openedSection.titleColor1,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {openedSection.titleLine1}
                </span>
                {openedSection.titleLine2 && (
                  <span
                    style={{
                      color: openedSection.titleColor2,
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                    }}
                  >
                    {openedSection.titleLine2}
                  </span>
                )}
              </h1>
            </div>

            <div className="relative z-20 shrink-0 text-right">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                {feedTracks.length > 0 ? `${feedTracks.length} Songs` : 'Live Chart'}
              </span>
            </div>
          </div>

          {/* Dedicated Section Songs List */}
          <div className="flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {isLoadingFeed ? (
              <div className="py-2 space-y-2">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-2 rounded-2xl animate-pulse"
                  >
                    <div className="w-6 h-4 rounded bg-black/10 dark:bg-white/10 shrink-0" />
                    <div className="w-12 h-12 rounded-xl bg-black/10 dark:bg-white/10 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3.5 w-2/3 rounded bg-black/10 dark:bg-white/10" />
                      <div className="h-2.5 w-1/3 rounded bg-black/5 dark:bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : feedTracks.length > 0 ? (
              <>
                {feedTracks.map((track, idx) => {
                  const rank = idx + 1;
                  const fav = isFavorite(track.id);
                  return (
                    <div
                      key={`section-track-${track.id}-${idx}`}
                      onClick={() => onPlayTrack(track, idx, feedTracks)}
                      className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-2">
                        {/* Rank */}
                        <span
                          className={`w-6 sm:w-7 text-center font-black text-sm sm:text-base shrink-0 ${
                            rank <= 3
                              ? 'text-black dark:text-white'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {rank}
                        </span>

                        {/* Song Cover */}
                        <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden shrink-0 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm">
                          <img
                            src={optimizeImage(track.coverUrl, { width: 140, quality: 80 })}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => applyAppLogoFallback(e, track)}
                            onLoad={(e) => applyAppLogoFallback(e, track)}
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={16} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>

                        {/* Title & Artist */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white group-hover:underline">
                            {track.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="truncate">
                              {track.artist}
                            </span>
                            {track.viewCount && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="shrink-0">{formatListens(track.viewCount)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {track.duration && (
                          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 hidden sm:inline mr-1">
                            {formatDuration(track.duration)}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                          className={`p-2 rounded-full transition-colors cursor-pointer ${
                            fav
                              ? 'text-red-500'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                          }`}
                          title={fav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadTrack(track);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                          title="Download for offline"
                        >
                          {isDownloading === track.id ? (
                            <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite scroll loader */}
                {isLoadingMoreFeed && (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading more tracks...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 space-y-2">
                <Music size={32} className="mx-auto opacity-30" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  No tracks available in this section
                </p>
                <p className="text-xs text-gray-400">Please check back soon for fresh chart updates.</p>
              </div>
            )}

            <div ref={sentinelRef} className="h-6" />
          </div>
        </div>
      ) : (
        /* VIEW B: MAIN TRENDING HUB (11 Modern Cards Grid) */
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-14">
          {/* Header */}
          <div className="pt-4 pb-3 sm:pt-6 sm:pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                <span>Trending Charts</span>
                <Flame size={22} className="text-amber-500 fill-amber-500" />
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Curated streaming charts, viral sound tracks & regional powerhouses
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRefreshFeed(null)}
              disabled={isLoadingFeed}
              className="px-3.5 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh trending charts"
            >
              <RefreshCw size={13} className={isLoadingFeed ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* 11 Genre Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {GENRE_CARDS.map((card) => (
              <TrendingGenreCard
                key={card.id}
                card={card}
                onOpenSection={handleOpenSection}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
