import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../types';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { FEATURED_CHARTS_DATA } from '../data/featuredChartsData';
import { 
  ArrowLeft, 
  Play, 
  Shuffle, 
  Heart, 
  Download, 
  Sparkles, 
  Radio,
  Search,
  X,
  Flame,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface MoodMixItem {
  id?: string;
  title: string;
  subtitle: string;
  color: string;
  query: string;
  defaultTracks?: Track[];
}

interface DedicatedMixViewProps {
  key?: React.Key;
  mix: MoodMixItem;
  onBack: () => void;
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  favorites: Track[];
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  showToast?: (msg: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '3:30';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatViews(views?: number): string {
  if (!views || views <= 0) return '';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B plays`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M plays`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K plays`;
  return `${views} plays`;
}

function cleanChartTrackTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let t = rawTitle
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\([^)]*(?:official|lyric|video|audio|full\s*song|4k|hd|8k|remaster|visualizer)[^)]*\)/gi, '')
    .replace(/\[[^\]]*(?:official|lyric|video|audio|full\s*song|4k|hd|8k|remaster|visualizer)[^\]]*\]/gi, '')
    .replace(/#[a-zA-Z0-9_]+/g, '')
    .trim();

  if (t.includes('|')) {
    const parts = t.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0 && parts[0].length >= 3) {
      t = parts[0];
    }
  }
  return t.replace(/\s{2,}/g, ' ').replace(/^[-–—:\s]+|[-–—:\s]+$/g, '').trim() || rawTitle;
}

export function DedicatedMixView({
  mix,
  onBack,
  onPlayTrack,
  currentTrack,
  isPlaying,
  favorites,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  showToast
}: DedicatedMixViewProps) {
  // Match with our 8 optimized Featured Charts config
  const matchedChart = useMemo(() => {
    return FEATURED_CHARTS_DATA.find(
      c =>
        (mix.id && c.id === mix.id) ||
        c.title.toLowerCase() === mix.title.toLowerCase() ||
        c.circleLabel.toLowerCase() === (mix.id || '').toLowerCase()
    );
  }, [mix.id, mix.title]);

  const initialPreset = useMemo(() => {
    return matchedChart?.defaultTracks || mix.defaultTracks || [];
  }, [matchedChart, mix.defaultTracks]);

  const [tracks, setTracks] = useState<Track[]>(() => [...initialPreset]);
  const [activeVibeId, setActiveVibeId] = useState<string>('all');
  const [chartSearch, setChartSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(() => initialPreset.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageRef = useRef<number>(1);
  const loadingMoreRef = useRef<boolean>(false);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isFavorite = (id: string) => favorites.some(f => f.id === id);

  // Strict theme validator so every track in a chart matches its exact name and theme
  const isTrackValidForChart = (t: any): boolean => {
    if (!t || !t.id || !t.title) return false;
    const dur = Number(t.duration || 0);
    if (dur > 0 && (dur < 55 || dur > 540)) return false;

    const fullText = `${t.title || ''} ${t.artist || ''}`.toLowerCase();
    if (
      /compilation|1\s*hour|2\s*hour|nonstop|non-stop|jukebox|full\s*album|mashup\s*collection|podcast|interview|reaction|making\s*of|behind\s*the\s*scenes|teaser|trailer|status|ringtone/i.test(
        fullText
      )
    ) {
      return false;
    }

    if (matchedChart?.excludeKeywords && matchedChart.excludeKeywords.length > 0) {
      for (const badWord of matchedChart.excludeKeywords) {
        if (fullText.includes(badWord.toLowerCase())) {
          return false;
        }
      }
    }

    // Additional strict check for Global English Hits: reject Devanagari/Punjabi/Tamil/Telugu script
    if (matchedChart?.id === 'global-english') {
      if (/[\u0900-\u097F\u0A00-\u0A7F\u0B80-\u0BFF\u0C00-\u0C7F]/.test(fullText)) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    let isCancelled = false;
    pageRef.current = 1;
    setPage(1);

    // Always restore the chart's verified defaultTracks immediately for 0ms response
    if (initialPreset.length > 0 && refreshSeed === 0) {
      setTracks([...initialPreset]);
      setIsLoading(false);
    } else if (initialPreset.length > 0 && refreshSeed > 0) {
      // On manual refresh, lightly rotate the top curated tracks while keeping them 100% theme-pure
      const rotated = [...initialPreset];
      for (let i = rotated.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rotated[i], rotated[j]] = [rotated[j], rotated[i]];
      }
      setTracks(rotated);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const fetchMixTracks = async () => {
      try {
        const activeVibeObj = matchedChart?.vibeFilters?.find(v => v.id === activeVibeId);
        const pool =
          activeVibeObj && activeVibeObj.id !== 'all'
            ? [activeVibeObj.query, `${activeVibeObj.query} official audio`]
            : matchedChart?.queryPool && matchedChart.queryPool.length > 0
            ? [...matchedChart.queryPool]
            : [
                `${mix.query} official audio`,
                `${mix.title} top hits`
              ];

        const q1 = pool[refreshSeed % pool.length] || mix.query;
        const q2 = pool[(refreshSeed + 1) % pool.length] || mix.query;

        const [res1, res2] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(q1)}&page=1&source=youtube`),
          fetch(`/api/search?q=${encodeURIComponent(q2)}&page=1&source=jiosaavn`).catch(() => null)
        ]);

        const data1 = res1.ok ? await res1.json() : { results: [] };
        const data2 = res2 && res2.ok ? await res2.json() : { results: [] };

        if (!isCancelled) {
          const raw = [...(data2.results || []), ...(data1.results || [])];
          const validLive: Track[] = [];

          for (const item of raw) {
            if (!isTrackValidForChart(item)) continue;
            const cleanedTitle = cleanChartTrackTitle(item.title);
            if (!cleanedTitle || cleanedTitle.length < 2) continue;
            validLive.push({
              ...item,
              title: cleanedTitle,
              publishedAt: item.publishedAt || matchedChart?.circleLabel || 'Chart Hit'
            });
          }

          // Keep verified curated chart tracks FIRST so the playlist is 100% faithful to the chart's name,
          // then append strictly filtered live tracks for deep exploration!
          const basePreset =
            refreshSeed > 0
              ? [...initialPreset].sort(() => Math.random() - 0.5)
              : [...initialPreset];

          const seenIds = new Set<string>();
          const seenTitles = new Set<string>();
          const merged: Track[] = [];

          for (const t of basePreset) {
            const normTitle = t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
            if (!seenIds.has(t.id) && !seenTitles.has(normTitle)) {
              seenIds.add(t.id);
              seenTitles.add(normTitle);
              merged.push(t);
            }
          }

          for (const t of validLive) {
            const normTitle = t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
            if (!seenIds.has(t.id) && !seenTitles.has(normTitle)) {
              seenIds.add(t.id);
              seenTitles.add(normTitle);
              merged.push(t);
            }
          }

          if (merged.length > 0) {
            setTracks(merged);
          }
        }
      } catch (err) {
        console.warn('Failed to load mix tracks:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchMixTracks();
    return () => {
      isCancelled = true;
    };
  }, [mix.query, mix.title, matchedChart, activeVibeId, refreshSeed]);

  const loadMore = async () => {
    if (loadingMoreRef.current || isLoadingMore || isLoading) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    setPage(nextPage);

    try {
      const activeVibeObj = matchedChart?.vibeFilters?.find(v => v.id === activeVibeId);
      const pool =
        activeVibeObj && activeVibeObj.id !== 'all'
          ? [activeVibeObj.query]
          : matchedChart?.queryPool && matchedChart.queryPool.length > 0
          ? matchedChart.queryPool
          : [mix.query];

      const baseQuery1 = pool[(nextPage - 1) % pool.length];
      const baseQuery2 = pool[nextPage % pool.length];
      const saavnPage = ((nextPage - 1) % 6) + 1;

      const [res1, res2] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(baseQuery1)}&page=${saavnPage}&source=jiosaavn`).catch(() => null),
        fetch(`/api/search?q=${encodeURIComponent(`${baseQuery2} official audio`)}&page=${nextPage}&source=youtube`).catch(() => null)
      ]);

      const data1 = res1 && res1.ok ? await res1.json() : { results: [] };
      const data2 = res2 && res2.ok ? await res2.json() : { results: [] };
      const combinedResults = [...(data1.results || []), ...(data2.results || [])];

      if (combinedResults.length > 0) {
        setTracks(prev => {
          const seen = new Set(prev.map(t => t.id));
          const seenTitles = new Set(prev.map(t => t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)));
          const fresh: Track[] = [];

          for (const item of combinedResults) {
            if (!isTrackValidForChart(item)) continue;
            if (seen.has(item.id)) continue;
            const cleanedTitle = cleanChartTrackTitle(item.title);
            const norm = cleanedTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
            if (!norm || seenTitles.has(norm)) continue;

            seen.add(item.id);
            seenTitles.add(norm);
            fresh.push({
              ...item,
              title: cleanedTitle,
              publishedAt: item.publishedAt || matchedChart?.circleLabel || 'Chart Hit'
            });
          }

          return [...prev, ...fresh];
        });
      }
    } catch (e) {
      console.warn('Error loading more mix tracks:', e);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMoreRef.current && !isLoading && tracks.length > 0) {
          loadMore();
        }
      },
      { rootMargin: '700px', threshold: 0.01 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoadingMore, isLoading, tracks.length, page, activeVibeId]);

  // Filter displayed tracks by activeVibeId and chartSearch while preserving rich fallback
  const displayedTracks = useMemo(() => {
    let list = tracks;

    if (activeVibeId !== 'all' && matchedChart?.vibeFilters) {
      const vibe = matchedChart.vibeFilters.find(v => v.id === activeVibeId);
      if (vibe && vibe.keywords.length > 0) {
        const matching = list.filter(t => {
          const text = `${t.title} ${t.artist} ${t.publishedAt || ''}`.toLowerCase();
          return vibe.keywords.some(kw => text.includes(kw.toLowerCase()));
        });
        if (matching.length >= 4) {
          list = matching;
        }
      }
    }

    if (chartSearch.trim().length > 0) {
      const q = chartSearch.toLowerCase().trim();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
    }

    return list;
  }, [tracks, activeVibeId, chartSearch, matchedChart]);

  const handlePlayAll = () => {
    if (displayedTracks.length > 0) {
      onPlayTrack(displayedTracks[0], 0, displayedTracks);
      if (showToast) showToast(`Playing ${mix.title}`);
    }
  };

  const handleShuffle = () => {
    if (displayedTracks.length > 0) {
      const shuffled = [...displayedTracks].sort(() => Math.random() - 0.5);
      onPlayTrack(shuffled[0], 0, shuffled);
      if (showToast) showToast(`Shuffling ${mix.title}`);
    }
  };

  const gradientClass = matchedChart?.gradient || mix.color || 'from-neutral-900 to-black';

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10 select-none pb-44 md:pb-24 overscroll-y-contain [webkit-overflow-scrolling:touch]">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 space-y-6">
        {/* Back Navigation & Clean One-Line Details Above */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs text-gray-800 dark:text-gray-200 cursor-pointer active:scale-95"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
              <Radio size={13} className="text-black dark:text-white" />
              <span>Theme Station</span>
            </div>
          </div>

          {/* Simple One-Line Details Above Chart */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 px-1 py-1 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                {matchedChart?.circleLabel || 'CHART'}
              </span>
              <span className="truncate text-gray-600 dark:text-gray-300">
                {matchedChart?.subtitle || mix.subtitle}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-gray-500 dark:text-gray-400 pl-2">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>{displayedTracks.length} tracks</span>
            </div>
          </div>
        </div>

        {/* Compact Hero Banner Card with Smaller Text in Specific Chart Color */}
        <div className={`relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-xl overflow-hidden border border-white/15`}>
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-xl space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                <Sparkles size={11} />
                <span>{matchedChart?.circleLabel || 'OFFICIAL'}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                {matchedChart?.title || mix.title}
              </h1>

              <p className="text-xs sm:text-[13px] text-white/90 font-medium leading-snug drop-shadow-xs line-clamp-1">
                {matchedChart?.curatorNote || mix.subtitle}
              </p>
            </div>

            {/* Play All, Shuffle & Refresh Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handlePlayAll}
                disabled={isLoading || displayedTracks.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-black text-xs shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play size={15} fill="currentColor" />
                <span>Play All</span>
              </button>

              <button
                onClick={handleShuffle}
                disabled={isLoading || displayedTracks.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all font-bold text-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Shuffle size={14} />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => {
                  setRefreshSeed(prev => prev + 1);
                  if (showToast) showToast(`Refreshed ${matchedChart?.title || mix.title}`);
                }}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all active:scale-95 cursor-pointer"
                title="Refresh chart order"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart Vibe Sub-Filters & In-Chart Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {matchedChart?.vibeFilters && matchedChart.vibeFilters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {matchedChart.vibeFilters.map((vibe) => {
                const active = activeVibeId === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setActiveVibeId(vibe.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      active
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                        : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
                    }`}
                  >
                    {vibe.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              value={chartSearch}
              onChange={(e) => setChartSearch(e.target.value)}
              placeholder={`Search in ${matchedChart?.circleLabel || 'chart'}...`}
              className="w-full bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 rounded-2xl py-2 pl-9 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {chartSearch && (
              <button
                onClick={() => setChartSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                Official Chart Playlist
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                {matchedChart?.circleLabel || 'TOP'}
              </span>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {displayedTracks.length} tracks
            </span>
          </div>

          {isLoading && displayedTracks.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : displayedTracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="font-bold text-base">No matching tracks in this filter</p>
              <button
                onClick={() => {
                  setActiveVibeId('all');
                  setChartSearch('');
                }}
                className="mt-3 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
              >
                Show All Chart Tracks
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayedTracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isThisCurrent = currentTrack?.id === track.id;
                const isTop3 = idx < 3 && !chartSearch && activeVibeId === 'all';

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => onPlayTrack(track, idx, displayedTracks)}
                    className={`group flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition-colors duration-150 cursor-pointer ${
                      isThisCurrent
                        ? 'bg-black/10 dark:bg-white/15 border-black dark:border-white'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Track Rank Number / Playing Indicator */}
                    <div className="w-7 text-center text-xs font-mono font-black shrink-0 flex items-center justify-center">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-0.5 h-3">
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce" />
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce [animation-delay:0.2s]" />
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce [animation-delay:0.4s]" />
                        </div>
                      ) : isTop3 ? (
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm ${
                            idx === 0
                              ? 'bg-amber-400 text-black'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : 'bg-amber-700 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-gray-400">{idx + 1}</span>
                      )}
                    </div>

                    {/* Artwork */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/10 shadow-sm">
                      <img
                        src={optimizeImage(track.coverUrl, { width: 150, quality: 80 })}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => applyAppLogoFallback(e, track)}
                        onLoad={(e) => applyAppLogoFallback(e, track)}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={16} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${isThisCurrent ? 'text-black dark:text-white font-black' : 'text-gray-900 dark:text-gray-100'}`}>
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        <span className="truncate font-medium">{track.artist}</span>
                        {track.viewCount && track.viewCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[11px]">{formatViews(track.viewCount)}</span>
                          </>
                        )}
                        {track.publishedAt && (
                          <>
                            <span>•</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                              {track.publishedAt}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {track.duration && (
                        <span className="text-xs font-mono text-gray-400 hidden sm:inline mr-1">
                          {formatDuration(track.duration)}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track);
                        }}
                        className={`p-2 transition-colors cursor-pointer ${
                          isFavorite(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={isFavorite(track.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart size={16} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadTrack(track);
                        }}
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Download track"
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
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="py-6 flex items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading more {matchedChart?.title || 'chart'} tracks...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
