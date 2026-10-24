import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { optimizeImage } from '../lib/imageOptimizer';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Shuffle, 
  Heart, 
  Download, 
  Clock, 
  Disc, 
  Music,
  Share2,
  Calendar,
  Check,
  RefreshCw
} from 'lucide-react';

interface DedicatedSectionViewProps {
  key?: React.Key;
  title: string;
  subtitle: string;
  query: string;
  initialTracks?: Track[];
  coverUrl?: string;
  badge?: string;
  isAlbum?: boolean;
  albumType?: string;
  albumId?: string;
  trackCount?: number;
  artistName?: string;
  albumYear?: number | string;
  onBack: () => void;
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  favorites: Track[];
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  showToast?: (msg: string) => void;
  onSelectArtist?: (artistName: string) => void;
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

function cleanReleaseTitle(t: string): string {
  if (!t) return '';
  return t
    .replace(/\s*-\s*EP\b/gi, '')
    .replace(/\s*-\s*Single\b/gi, '')
    .replace(/\s*-\s*Album\b/gi, '')
    .replace(/\s*\(EP\)/gi, '')
    .replace(/\s*\(Single\)/gi, '')
    .trim();
}

const EMPTY_TRACKS: Track[] = [];
const SECTION_TRACKS_CACHE = new Map<string, Track[]>();

export function DedicatedSectionView({
  title,
  subtitle,
  query,
  initialTracks = EMPTY_TRACKS,
  coverUrl,
  badge = 'Official Collection',
  isAlbum = false,
  albumType,
  albumId,
  trackCount,
  artistName,
  albumYear,
  onBack,
  onPlayTrack,
  currentTrack,
  isPlaying,
  favorites,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  showToast,
  onSelectArtist
}: DedicatedSectionViewProps) {
  const cleanTitle = cleanReleaseTitle(title);
  const cleanBadge = badge
    .replace(/\s*-\s*EP\b/gi, '')
    .replace(/\s*-\s*Single\b/gi, '')
    .replace(/\s*-\s*Album\b/gi, '')
    .replace(/\s*\(EP\)/gi, '')
    .replace(/\s*\(Single\)/gi, '')
    .trim();

  const sectionCacheKey = `v2::${isAlbum ? 'album' : 'section'}::${artistName || ''}::${cleanTitle}::${albumId || ''}::${trackCount || ''}::${query}`.toLowerCase();
  const cachedTracks = SECTION_TRACKS_CACHE.get(sectionCacheKey);
  const startingTracks = initialTracks.length > 0 ? initialTracks : (cachedTracks || EMPTY_TRACKS);

  const [tracks, setTracks] = useState<Track[]>(startingTracks);
  const [isLoading, setIsLoading] = useState<boolean>(startingTracks.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageRef = useRef<number>(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedKeyRef = useRef<string | null>(startingTracks.length > 0 ? sectionCacheKey : null);

  const isFavorite = (id: string) => favorites.some(f => f.id === id);

  useEffect(() => {
    let isCancelled = false;

    if (initialTracks && initialTracks.length > 0) {
      const cappedInitial = isAlbum && trackCount && trackCount > 0
        ? initialTracks.slice(0, trackCount)
        : initialTracks;
      SECTION_TRACKS_CACHE.set(sectionCacheKey, cappedInitial);
      loadedKeyRef.current = sectionCacheKey;
      setTracks(cappedInitial);
      setIsLoading(false);

      // For general feeds (Trending Songs, Hindi Songs, 2026 Popular Songs), also fetch fresh live trending songs in the background so the feed never sticks on old songs
      if (!isAlbum) {
        fetch(`/api/search?q=${encodeURIComponent(`${query} 2026 latest popular`)}&source=youtube`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!isCancelled && data && Array.isArray(data.results)) {
              const fresh = data.results.filter((t: any) => {
                if (!t || !t.id) return false;
                const dur = t.duration || 0;
                if (dur > 0 && (dur < 45 || dur > 540)) return false;
                if (/compilation|1\s*hour|2\s*hour|nonstop|jukebox/i.test(t.title)) return false;
                return true;
              });
              if (fresh.length > 0) {
                setTracks(prev => {
                  const seen = new Set(prev.map(t => t.id));
                  const uniqueFresh = fresh.filter((t: Track) => !seen.has(t.id));
                  const merged = [...uniqueFresh.slice(0, 6), ...prev, ...uniqueFresh.slice(6)];
                  SECTION_TRACKS_CACHE.set(sectionCacheKey, merged);
                  return merged;
                });
              }
            }
          })
          .catch(() => {});
      }
      return () => {
        isCancelled = true;
      };
    }

    const existingCached = SECTION_TRACKS_CACHE.get(sectionCacheKey);
    if (existingCached && existingCached.length > 0) {
      loadedKeyRef.current = sectionCacheKey;
      setTracks(existingCached);
      setIsLoading(false);
      return;
    }

    if (loadedKeyRef.current === sectionCacheKey && tracks.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchTracks = async () => {
      try {
        // If it's an album/single/EP, fetch the exact album tracklist from /api/album-tracks
        if (isAlbum || artistName) {
          const typeParam = encodeURIComponent(albumType || cleanBadge || '');
          const idParam = encodeURIComponent(albumId || '');
          const trackCountParam = trackCount ? `&trackCount=${trackCount}` : '';
          const yearParam = albumYear ? `&year=${encodeURIComponent(String(albumYear))}` : '';
          const coverParam = coverUrl ? `&coverUrl=${encodeURIComponent(coverUrl)}` : '';
          const albumUrl = `/api/album-tracks?artist=${encodeURIComponent(artistName || '')}&album=${encodeURIComponent(cleanTitle)}&type=${typeParam}&id=${idParam}${trackCountParam}${yearParam}${coverParam}&q=${encodeURIComponent(query)}`;
          
          const albumRes = await fetch(albumUrl);
          if (albumRes.ok) {
            const albumData = await albumRes.json();
            if (!isCancelled && Array.isArray(albumData.tracks) && albumData.tracks.length > 0) {
              const exactAlbumTracks = isAlbum && trackCount && trackCount > 0
                ? albumData.tracks.slice(0, trackCount)
                : albumData.tracks;
              SECTION_TRACKS_CACHE.set(sectionCacheKey, exactAlbumTracks);
              loadedKeyRef.current = sectionCacheKey;
              setTracks(exactAlbumTracks);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fallback search query
        const resolvedQuery = albumType?.toLowerCase() === 'single'
          ? `${artistName || ''} ${cleanTitle} song`
          : `${artistName || ''} ${cleanTitle}`.trim() || query;
        const res = await fetch(`/api/search?q=${encodeURIComponent(resolvedQuery)}&source=youtube`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data.results)) {
            let cleanTracks = data.results.filter((t: any) => {
              if (!t.id) return false;
              const dur = t.duration || 0;
              if (dur > 0 && (dur < 45 || dur > 540)) return false;
              if (/compilation|1\s*hour|2\s*hour|nonstop/i.test(t.title)) return false;
              return true;
            });
            if (isAlbum) {
              const cap = albumType?.toLowerCase().includes('single')
                ? 1
                : (trackCount && trackCount > 0 ? trackCount : 6);
              cleanTracks = cleanTracks.slice(0, cap);
            }
            if (cleanTracks.length > 0) {
              SECTION_TRACKS_CACHE.set(sectionCacheKey, cleanTracks);
              loadedKeyRef.current = sectionCacheKey;
              setTracks(cleanTracks);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load section tracks:', err);
      } finally {
        if (!isCancelled) {
          loadedKeyRef.current = sectionCacheKey;
          setIsLoading(false);
        }
      }
    };

    fetchTracks();
    return () => {
      isCancelled = true;
    };
  }, [sectionCacheKey, isAlbum, artistName, cleanTitle, albumType, albumId, trackCount, albumYear, query]);

  const loadMore = async () => {
    if (isAlbum || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    setPage(nextPage);

    try {
      const baseContext = (artistName ? `${artistName} ${cleanTitle}` : query || cleanTitle).trim();
      const artistOrGenre = (artistName || query || cleanTitle).trim();
      const variations = [
        `${baseContext} official video`,
        `${artistOrGenre} top hit songs`,
        `${artistOrGenre} popular songs ${2026 - (nextPage % 6)}`,
        `${baseContext} superhit tracks`,
        `${artistOrGenre} best songs collection`,
        `${artistOrGenre} viral hits audio`,
        `${artistOrGenre} latest releases`,
        `${artistOrGenre} unplugged & live hits`,
        `${artistOrGenre} all time favorites`,
        `${artistOrGenre} romantic & party hits`
      ];
      const searchQ1 = variations[(nextPage - 1) % variations.length];
      const searchQ2 = variations[(nextPage + 2) % variations.length];

      const [res1, res2] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(searchQ1)}&page=${nextPage}&source=youtube`),
        fetch(`/api/search?q=${encodeURIComponent(searchQ2)}&page=${nextPage + 1}&source=youtube`).catch(() => null)
      ]);

      const data1 = res1.ok ? await res1.json() : { results: [] };
      const data2 = res2 && res2.ok ? await res2.json() : { results: [] };
      const combined = [...(data1.results || []), ...(data2.results || [])];

      if (combined.length > 0) {
        setTracks(prev => {
          const seen = new Set(prev.map(t => t.id));
          const seenTitles = new Set(prev.map(t => t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18)));
          const fresh = combined.filter((t: any) => {
            if (!t || !t.id || seen.has(t.id)) return false;
            const dur = t.duration || 0;
            if (dur > 0 && (dur < 45 || dur > 540)) return false;
            if (/compilation|1\s*hour|2\s*hour|nonstop|jukebox/i.test(t.title)) return false;
            const norm = t.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
            if (seenTitles.has(norm)) return false;
            seen.add(t.id);
            seenTitles.add(norm);
            return true;
          });
          const updated = [...prev, ...fresh];
          SECTION_TRACKS_CACHE.set(sectionCacheKey, updated);
          return updated;
        });
      }
    } catch (e) {
      console.warn('Error loading more tracks:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isAlbum) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingMore && !isLoading && tracks.length > 0) {
        loadMore();
      }
    }, { rootMargin: '600px', threshold: 0.01 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isAlbum, isLoadingMore, isLoading, tracks.length, page]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      onPlayTrack(tracks[0], 0, tracks);
      if (showToast) showToast(`Playing ${cleanTitle}`);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      onPlayTrack(shuffled[0], 0, shuffled);
      if (showToast) showToast(`Shuffling ${cleanTitle}`);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    SECTION_TRACKS_CACHE.delete(sectionCacheKey);
    try {
      const freshEndpoint = isAlbum && albumId
        ? `/api/album-tracks?id=${encodeURIComponent(albumId)}&source=${albumId.startsWith('saavn') ? 'jiosaavn' : 'itunes'}&refresh=true`
        : `/api/search?q=${encodeURIComponent(`${query} 2026 latest popular`)}&source=youtube&refresh=true`;
      const res = await fetch(freshEndpoint);
      if (res.ok) {
        const data = await res.json();
        const results = data.tracks || data.results || [];
        if (results.length > 0) {
          const valid = results.filter((t: any) => t && t.id && (!t.duration || (t.duration >= 45 && t.duration <= 540)));
          if (valid.length > 0) {
            SECTION_TRACKS_CACHE.set(sectionCacheKey, valid);
            setTracks(valid);
          }
        }
      }
      if (showToast) showToast(`Refreshed ${cleanTitle}`);
    } catch (_) {}
    setIsLoading(false);
  };

  const headerArtwork = coverUrl || tracks[0]?.coverUrl || '/app-logo.svg';

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10 select-none pb-44 md:pb-24 overscroll-y-contain touch-pan-y">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs text-gray-900 dark:text-white cursor-pointer active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {tracks.length} {tracks.length === 1 ? 'Song' : 'Songs'}
          </span>
        </div>

        {/* Hero Section Banner */}
        <div className="relative p-6 sm:p-8 md:p-10 rounded-[32px] bg-black text-white shadow-2xl overflow-hidden border border-white/10">
          {/* Ambient Backdrop Blur Artwork */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <img
              src={optimizeImage(headerArtwork, { width: 400, quality: 60 })}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-125"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0 bg-neutral-900">
              <img
                src={optimizeImage(headerArtwork, { width: 400, quality: 85 })}
                alt={cleanTitle}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                onLoad={(e) => { if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) { e.currentTarget.src = '/app-logo.svg'; } }}
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-wider border border-white/15">
                <Disc size={13} />
                <span>{cleanBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {cleanTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-gray-300 font-medium">
                {artistName && (
                  <span className="font-bold text-white">
                    {artistName}
                  </span>
                )}
                {albumYear && (
                  <>
                    <span>•</span>
                    <span>{albumYear}</span>
                  </>
                )}
                <span>•</span>
                <span>{tracks.length} tracks</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-2xl">
                {subtitle}
              </p>

              {/* Play All, Shuffle & Refresh Buttons in Line */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={handlePlayAll}
                  disabled={isLoading || tracks.length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-black text-sm shadow-xl active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={handleShuffle}
                  disabled={isLoading || tracks.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all font-bold text-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Shuffle size={16} />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all font-bold text-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Refresh tracks"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Tracklist
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="font-bold text-base">No tracks found</p>
              <p className="text-xs text-gray-400 mt-1">Please try searching or choose another release</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {tracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isThisCurrent = currentTrack?.id === track.id;

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onPlayTrack(track, idx, tracks)}
                    className={`group flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition-colors duration-150 cursor-pointer touch-manipulation ${
                      isThisCurrent
                        ? 'bg-black/10 dark:bg-white/15 border-black dark:border-white'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-transparent hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10'
                    }`}
                  >
                    {/* Track Number / Playing Indicator */}
                    <div className="w-6 text-center text-xs font-mono font-bold text-gray-400 shrink-0">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-0.5 h-3">
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce" />
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce [animation-delay:0.2s]" />
                          <span className="w-0.5 h-full bg-black dark:bg-white animate-bounce [animation-delay:0.4s]" />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Artwork */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/10 shadow-sm pointer-events-none">
                      <img
                        src={optimizeImage(track.coverUrl, { width: 150, quality: 80 })}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/app-logo.svg';
                          track.coverUrl = '/app-logo.svg';
                        }}
                        onLoad={(e) => {
                          if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) {
                            e.currentTarget.src = '/app-logo.svg';
                            track.coverUrl = '/app-logo.svg';
                          }
                        }}
                      />
                    </div>

                    {/* Title & Artist */}
                    <div className="flex-1 min-w-0 pointer-events-none select-none">
                      <h3 className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white">
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        <span className="truncate">
                          {track.artist}
                        </span>
                        {track.viewCount && track.viewCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatViews(track.viewCount)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden sm:block text-xs font-mono text-gray-400 shrink-0">
                      {formatDuration(track.duration)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track);
                        }}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${
                          isFavorite(track.id) ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                        }`}
                        title={isFavorite(track.id) ? 'Remove from Liked' : 'Like Song'}
                      >
                        <Heart size={16} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadTrack(track);
                        }}
                        className="p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Download track"
                      >
                        {isDownloading === track.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Infinite scroll sentinel only for general section feeds, NOT for album/EP/single tracklists */}
              {!isAlbum ? (
                <div ref={sentinelRef} className="py-6 text-center min-h-[56px] flex items-center justify-center">
                  {isLoadingMore && (
                    <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading more tracks...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-4 pb-2 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {cleanTitle} • {tracks.length} {tracks.length === 1 ? 'Song' : 'Songs'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
