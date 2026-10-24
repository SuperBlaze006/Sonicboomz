import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types';
import { 
  Menu, 
  Search, 
  MoreHorizontal, 
  X, 
  Download, 
  Heart, 
  Play, 
  Music, 
  Sparkles, 
  ArrowLeft, 
  Flame, 
  TrendingUp, 
  Radio, 
  Clock, 
  Eye, 
  Disc3 
} from 'lucide-react';
import { SavedTrack } from '../lib/indexedDb';

interface BrowseHomeProps {
  theme: 'dark' | 'light';
  activePage: 'home' | 'browse';
  onOpenSidebar: () => void;
  toggleTheme: () => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q?: string) => void;
  isSearching: boolean;
  suggestions: string[];
  results: Track[];
  feedTracks: Track[];
  isLoadingFeed: boolean;
  isLoadingMoreFeed: boolean;
  hasMoreFeed: boolean;
  onLoadMoreFeed: () => void;
  activeFeedTab: string;
  onSelectFeedTab: (tab: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  offlineTracks: SavedTrack[];
  favorites: Track[];
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onPlayOfflineTrack: (track: SavedTrack, index: number, list: SavedTrack[]) => void;
  onDownloadTrack: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  isDownloading: string | null;
}

const CATEGORIES = [
  { title: "All Trending", subtitle: "Top Chart Hits", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300" },
  { title: "Pop Hits", subtitle: "Viral Chartbusters", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300" },
  { title: "Hip Hop", subtitle: "Rap & Trap Beats", img: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&q=80&w=300" },
  { title: "Lofi Chill", subtitle: "Study & Relax", img: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300" },
  { title: "Rock & Metal", subtitle: "Guitars & Power", img: "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=300" },
  { title: "Electronic", subtitle: "EDM & Dance", img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=300" },
];

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatViews(views?: number): string {
  if (!views || views <= 0) return '';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B views`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K views`;
  return `${views} views`;
}

export function BrowseHome({
  onOpenSidebar,
  query,
  setQuery,
  onSearch,
  isSearching,
  suggestions,
  results,
  feedTracks = [],
  isLoadingFeed,
  isLoadingMoreFeed,
  hasMoreFeed,
  onLoadMoreFeed,
  activeFeedTab,
  onSelectFeedTab,
  selectedCategory,
  onSelectCategory,
  offlineTracks,
  favorites,
  onPlayTrack,
  onPlayOfflineTrack,
  onDownloadTrack,
  onToggleFavorite,
  isDownloading
}: BrowseHomeProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>(() => {
    try {
      return localStorage.getItem('blaze_last_search') || '';
    } catch {
      return '';
    }
  });

  const TABS = ['Trending Now', 'Popular', 'Favorites', 'Downloads'];
  const POPULAR_SEARCH_CHIPS = ['Die With A Smile', 'Espresso', 'Blinding Lights', 'Taylor Swift', 'Kendrick Lamar', 'Post Malone', 'Arijit Singh', 'Lofi Hip Hop'];
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Setup infinite scroll with IntersectionObserver
  useEffect(() => {
    const isInfiniteTab = activeFeedTab === 'Trending Now' || activeFeedTab === 'Popular' || !!selectedCategory;
    if (!isInfiniteTab || !hasMoreFeed || isLoadingFeed) return;

    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMoreFeed && !isLoadingFeed && hasMoreFeed) {
          onLoadMoreFeed();
        }
      },
      {
        root: null,
        rootMargin: '350px',
        threshold: 0.05,
      }
    );

    observer.observe(currentSentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMoreFeed, isLoadingMoreFeed, isLoadingFeed, onLoadMoreFeed, activeFeedTab, selectedCategory]);

  const isFavorite = (trackId: string) => favorites.some(f => f.id === trackId);

  // Execute search and remember last search in local state & storage
  const handleExecuteSearch = (qToSearch?: string) => {
    const targetQ = qToSearch !== undefined ? qToSearch : query;
    if (!targetQ.trim()) return;
    
    // Save as last searched
    setLastSearchQuery(targetQ);
    try {
      localStorage.setItem('blaze_last_search', targetQ);
    } catch {}

    onSearch(targetQ);
  };

  // Back to Trending Home: clears search and returns user safely to the Trending page
  const handleBackToHome = () => {
    // If there's an active query in the input, save it to last search before closing
    if (query.trim()) {
      setLastSearchQuery(query.trim());
      try {
        localStorage.setItem('blaze_last_search', query.trim());
      } catch {}
    }
    setQuery('');
    onSearch('');
    setShowSearch(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Featured #1 Trending Track
  const topTrendingTrack = feedTracks.length > 0 ? feedTracks[0] : null;
  const remainingTrendingTracks = feedTracks.length > 0 ? feedTracks.slice(1) : [];

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] pb-32 relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-12">
        {showSearch ? (
          <button 
            id="btn-back-to-home"
            onClick={handleBackToHome}
            className="flex items-center gap-2 px-3 py-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 transition-colors font-semibold text-sm"
            aria-label="Back to Trending Home"
          >
            <ArrowLeft size={22} className="text-[var(--theme-color)]" />
            <span>Trending</span>
          </button>
        ) : (
          <button 
            id="btn-sidebar-open"
            onClick={onOpenSidebar} 
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Open Navigation"
          >
            <Menu size={28} />
          </button>
        )}

        <div className="flex items-center gap-3">
          {!showSearch && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] text-xs font-bold border border-[var(--theme-color)]/20">
              <Flame size={14} />
              <span>YouTube Trending</span>
            </div>
          )}

          <button 
            id="btn-search-toggle"
            onClick={() => {
              if (showSearch) {
                handleBackToHome();
              } else {
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }} 
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              showSearch 
                ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-lg shadow-[var(--theme-color)]/30 scale-105' 
                : 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-black/10'
            }`}
            aria-label="Toggle Search"
          >
            {showSearch ? <X size={22} /> : <Search size={22} />}
          </button>
        </div>
      </header>

      {/* Main Title Banner */}
      <div className="px-6 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
            {showSearch ? (
              <span>Search Music</span>
            ) : (
              <>
                <span>Trending</span>
                <Flame size={28} className="text-[var(--theme-color)] animate-bounce" />
              </>
            )}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--theme-color)]" />
            {showSearch 
              ? 'Search any YouTube song, artist, video or lyrics'
              : 'Live Popular Songs on YouTube & Top Music Charts'
            }
          </p>
        </div>
      </div>

      {/* Unified Search Section */}
      {showSearch && (
        <div className="px-6 mb-6">
          <div className="relative">
            <input 
              ref={searchInputRef}
              id="input-global-search"
              type="text" 
              placeholder="Search YouTube songs, artists, or lyrics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-base focus:ring-2 focus:ring-[var(--theme-color)] focus:border-transparent transition-all placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {query.length > 0 && (
              <button 
                onClick={() => {
                  setQuery('');
                  onSearch('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear Search Input"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Glowing "Last Searched" Indicator (As requested) */}
          {lastSearchQuery && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400">Last Searched:</span>
              <button
                id="btn-last-searched"
                onClick={() => {
                  setQuery(lastSearchQuery);
                  handleExecuteSearch(lastSearchQuery);
                }}
                className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[var(--theme-color)] to-indigo-600 shadow-[0_0_18px_rgba(59,130,246,0.6)] ring-2 ring-[var(--theme-color)]/70 hover:scale-105 active:scale-95 transition-all"
                title={`Re-run search for "${lastSearchQuery}"`}
              >
                <Sparkles size={13} className="text-yellow-300 animate-spin" />
                <span className="max-w-[200px] truncate">{lastSearchQuery}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Tap to search</span>
              </button>
            </div>
          )}
          
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && results.length === 0 && (
            <div className="mt-2 bg-white dark:bg-[#1a1b26] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden text-gray-900 dark:text-gray-100 z-50 relative">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setQuery(sug);
                    handleExecuteSearch(sug);
                  }}
                  className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-b border-black/5 dark:border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="font-medium text-sm">{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results Display */}
      {showSearch && results.length > 0 ? (
        <div className="px-6 flex flex-col gap-1 mt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span>Search Results</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--theme-color)]/15 text-[var(--theme-color)] font-mono text-[11px]">
                {results.length}
              </span>
            </h2>
            <button 
              onClick={handleBackToHome}
              className="text-xs font-semibold text-[var(--theme-color)] hover:underline flex items-center gap-1"
            >
              Back to Trending
            </button>
          </div>

          {results.map((track, idx) => (
            <div 
              key={`${track.source || 'src'}-${track.id}-${idx}`}
              onClick={() => onPlayTrack(track, idx, results)}
              className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="relative shrink-0">
                <img 
                  src={track.coverUrl} 
                  alt={track.title} 
                  className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                </div>
                {track.duration && track.duration > 0 && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-white/90">
                    {formatDuration(track.duration)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">{track.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  <span className="truncate">{track.artist}</span>
                  {track.viewCount && track.viewCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatViews(track.viewCount)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                  className={`p-2 transition-colors ${isFavorite(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title={isFavorite(track.id) ? 'Remove Favorite' : 'Add Favorite'}
                >
                  <Heart size={18} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDownloadTrack(track); }}
                  className="p-2 text-[var(--theme-color)] hover:text-black dark:hover:text-white transition-colors"
                  title="Download track"
                >
                  {isDownloading === track.id ? (
                    <div className="w-4 h-4 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : showSearch ? (
        isSearching ? (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Searching YouTube & streaming engine...</span>
          </div>
        ) : query.trim().length > 0 ? (
          <div className="py-16 px-6 text-center text-gray-500 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400">
              <Search size={22} />
            </div>
            <p className="font-bold text-base text-gray-800 dark:text-gray-200">No songs found for "{query}"</p>
            <p className="text-xs text-gray-400 max-w-xs">Try searching for an artist name, official video, or lyrics.</p>
            <button 
              onClick={() => { setQuery(''); onSearch(''); }}
              className="mt-2 px-4 py-2 rounded-full bg-[var(--theme-color)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="px-6 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(chip);
                    handleExecuteSearch(chip);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-[var(--theme-color)] hover:text-white text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Trending Suggestions
            </h3>
            <div className="flex flex-col gap-1 -mx-3">
              {feedTracks.slice(0, 8).map((track, idx) => (
                <div 
                  key={`sug-${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track, idx, feedTracks)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <img 
                    src={track.coverUrl} 
                    alt={track.title} 
                    className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" 
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">{track.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <Play size={16} className="text-[var(--theme-color)] opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <>
          {/* Featured #1 Trending YouTube Track Banner */}
          {topTrendingTrack && !selectedCategory && activeFeedTab === 'Trending Now' && (
            <div className="px-6 mb-6">
              <div 
                onClick={() => onPlayTrack(topTrendingTrack, 0, feedTracks)}
                className="relative w-full rounded-3xl overflow-hidden shadow-2xl p-6 cursor-pointer group border border-white/10 transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Background image & gradient */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${topTrendingTrack.coverUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between min-h-[190px]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                      <Flame size={13} />
                      <span>#1 on YouTube Trending</span>
                    </span>

                    {topTrendingTrack.viewCount && (
                      <span className="text-xs font-semibold text-white/80 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                        <Eye size={13} />
                        <span>{formatViews(topTrendingTrack.viewCount)}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-1 group-hover:text-[var(--theme-color)] transition-colors">
                      {topTrendingTrack.title}
                    </h2>
                    <p className="text-sm font-medium text-gray-300 mt-0.5 line-clamp-1">
                      {topTrendingTrack.artist}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                          <Play size={20} fill="currentColor" className="ml-0.5" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Play Now</span>
                      </div>

                      {topTrendingTrack.duration && (
                        <span className="text-xs font-mono text-gray-300 bg-white/10 px-2.5 py-1 rounded-full">
                          {formatDuration(topTrendingTrack.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Genre / Mood Chips */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-6 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Radio size={14} className="text-[var(--theme-color)]" />
                <span>Trending Categories</span>
              </h3>
              {selectedCategory && (
                <button 
                  onClick={() => onSelectCategory(null)}
                  className="text-xs font-semibold text-[var(--theme-color)] hover:underline flex items-center gap-1"
                >
                  <X size={13} /> Reset Filter
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto px-6 pb-2 gap-3 snap-x hide-scrollbar">
              {CATEGORIES.map((cat, i) => {
                const isSelected = selectedCategory === (cat.title === "All Trending" ? null : cat.title);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectCategory(cat.title === "All Trending" ? null : cat.title)}
                    className={`snap-start shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-lg shadow-[var(--theme-color)]/30 scale-105'
                        : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Category Filter Tag */}
          {selectedCategory && (
            <div className="px-6 my-3">
              <div className="flex items-center justify-between bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/25 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--theme-color)] animate-pulse" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Showing YouTube:</span>
                  <span className="text-xs font-bold text-[var(--theme-color)]">{selectedCategory}</span>
                </div>
                <button 
                  onClick={() => onSelectCategory(null)}
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto px-6 mb-4 mt-2 gap-6 hide-scrollbar border-b border-black/5 dark:border-white/5">
            {TABS.map((tab) => (
              <button 
                key={tab}
                id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectFeedTab(tab)}
                className={`pb-3.5 whitespace-nowrap text-sm font-bold transition-colors relative ${
                  activeFeedTab === tab && !selectedCategory
                    ? 'text-[var(--theme-color)]' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab}
                {activeFeedTab === tab && !selectedCategory && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--theme-color)] rounded-t-full shadow-[0_0_8px_var(--theme-color)]" />
                )}
              </button>
            ))}
          </div>

          {/* Track List Section */}
          <div className="px-6 flex flex-col gap-1">
            {activeFeedTab === 'Trending Now' || activeFeedTab === 'Popular' || selectedCategory ? (
              isLoadingFeed && feedTracks.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-400 font-medium">Loading YouTube Trending Charts...</span>
                </div>
              ) : feedTracks.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[var(--theme-color)]" />
                      <span>{selectedCategory ? `${selectedCategory} Hits` : 'Top Trending Charts'}</span>
                    </h3>
                    <span className="text-xs text-gray-400">{feedTracks.length} tracks</span>
                  </div>

                  {feedTracks.map((track, idx) => {
                    const rank = idx + 1;
                    return (
                      <div 
                        key={`feed-${track.id}-${idx}`}
                        onClick={() => onPlayTrack(track, idx, feedTracks)}
                        className="flex items-center gap-3 sm:gap-4 p-3 -mx-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        {/* Rank Badge */}
                        <div className="w-6 text-center shrink-0">
                          <span className={`text-sm font-black ${
                            rank === 1 
                              ? 'text-yellow-500 font-extrabold' 
                              : rank === 2 
                                ? 'text-gray-400' 
                                : rank === 3 
                                  ? 'text-amber-600' 
                                  : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {rank}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative shrink-0">
                          <img 
                            src={track.coverUrl} 
                            alt={track.title} 
                            className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_15px_var(--theme-color)] transition-all" 
                            loading="lazy"
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

                        {/* Title & Artist & Views */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                            {track.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            <span className="truncate">{track.artist}</span>
                            {track.viewCount && track.viewCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {formatViews(track.viewCount)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                            className={`p-2 transition-colors ${
                              isFavorite(track.id) 
                                ? 'text-red-500' 
                                : 'text-gray-400 hover:text-red-500 opacity-80 group-hover:opacity-100'
                            }`}
                            title={isFavorite(track.id) ? 'Remove Favorite' : 'Save to Favorites'}
                          >
                            <Heart size={18} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                          </button>
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
                        </div>
                      </div>
                    );
                  })}

                  {/* Infinite Scroll Sentinel & Indicator */}
                  <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-2 min-h-[70px]">
                    {isLoadingMoreFeed && (
                      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <div className="w-4 h-4 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Loading more trending songs from YouTube...
                        </span>
                      </div>
                    )}
                    {!hasMoreFeed && feedTracks.length > 0 && !isLoadingMoreFeed && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                        <Music size={14} />
                        <span>You've reached the end of YouTube trending charts</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
                  <Music size={24} className="text-gray-400" />
                  <p className="text-sm">No songs found in this category.</p>
                </div>
              )
            ) : activeFeedTab === 'Favorites' ? (
              favorites.length > 0 ? (
                favorites.map((track, idx) => (
                  <div 
                    key={`fav-${track.id}-${idx}`}
                    onClick={() => onPlayTrack(track, idx, favorites)}
                    className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-14 h-14 rounded-xl object-cover shadow-sm shrink-0" 
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{track.artist}</p>
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
                        title="Remove from Favorites"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
                  <Heart size={28} className="text-gray-400" />
                  <p className="text-sm font-medium">No favorites saved yet.</p>
                  <p className="text-xs text-gray-400">Tap the heart icon on any song to save it here.</p>
                  <button 
                    onClick={() => onSelectFeedTab('Trending Now')}
                    className="mt-3 px-4 py-2 rounded-full bg-[var(--theme-color)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                  >
                    Browse Trending Songs
                  </button>
                </div>
              )
            ) : activeFeedTab === 'Downloads' ? (
              offlineTracks.length > 0 ? (
                offlineTracks.map((track, idx) => (
                  <div 
                    key={`offline-${track.id}-${idx}`}
                    onClick={() => onPlayOfflineTrack(track, idx, offlineTracks)}
                    className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-14 h-14 rounded-xl object-cover shadow-sm shrink-0" 
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white shrink-0">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
                  <Download size={28} className="text-gray-400" />
                  <p className="text-sm font-medium">No offline tracks yet.</p>
                  <p className="text-xs text-gray-400">Download your favorite music to listen without internet.</p>
                  <button 
                    onClick={() => onSelectFeedTab('Trending Now')}
                    className="mt-3 px-4 py-2 rounded-full bg-[var(--theme-color)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                  >
                    Browse Trending Songs
                  </button>
                </div>
              )
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
