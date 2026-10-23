import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { Track } from '../types';
import { 
  Search, 
  X, 
  Play, 
  Sparkles, 
  Heart, 
  Download, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Flame, 
  Clock, 
  BadgeCheck, 
  Headphones, 
  User as UserIcon, 
  Users, 
  Sun, 
  Moon, 
  Disc,
  ArrowRight,
  Radio,
  Music2,
  Zap,
  Activity
} from 'lucide-react';
import { SavedTrack } from '../lib/indexedDb';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { UserCheck } from 'lucide-react';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/safeStorage';
import { User } from 'firebase/auth';
import { DedicatedMixView } from './DedicatedMixView';
import { DedicatedSectionView } from './DedicatedSectionView';
import { POPULAR_ALBUMS_AND_SINGLES, PopularAlbumItem, getShuffledPopularAlbums } from '../data/popularAlbums';
import { FEATURED_CHARTS_DATA } from '../data/featuredChartsData';
import { INITIAL_TRENDING_TRACKS } from '../data/initialTracks';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeWidgetsData {
  popularSongs: Track[];
  hindiSongs: Track[];
  hits2026Songs: Track[];
  popularAlbums?: PopularAlbumItem[];
  trendingSearches?: string[];
  featuredArtists: Array<{
    id: string;
    name: string;
    role: string;
    listeners: string;
    image: string;
    searchQuery: string;
  }>;
}

interface HomeViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  onNavigateToTrending: () => void;
  onNavigateToArtists?: () => void;
  onSelectArtist?: (artistName: string) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q?: string) => void;
  isSearching: boolean;
  suggestions: string[];
  results: Track[];
  favorites: Track[];
  offlineTracks: SavedTrack[];
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  isDownloading: string | null;
  user?: User | null;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  showToast?: (msg: string) => void;
}

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

// 8 Curated Featured Charts synced with FEATURED_CHARTS_DATA
const FEATURED_CHARTS_CONFIG = FEATURED_CHARTS_DATA;

const BASE_QUICK_SEARCHES = [
  'Arijit Singh',
  'Coke Studio Pakistan',
  'Die With A Smile',
  'Diljit Dosanjh',
  'Pasoori',
  'Karan Aujla',
  'Sabrina Carpenter',
  'The Weeknd',
  'Kaifi Khalil',
  'Shreya Ghoshal',
  'Anuv Jain',
  'Anirudh Ravichander',
  'AP Dhillon',
  'Billie Eilish',
  'A.R. Rahman',
  'Atif Aslam',
  'Bruno Mars',
  'Sidhu Moose Wala',
  'Shubh',
  'Vishal Mishra',
  'Badshah',
  'Dua Lipa',
  'Pritam',
  'Taylor Swift'
];

function getShuffledDefaultQuickSearches(limit = 12): string[] {
  const copy = [...BASE_QUICK_SEARCHES];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, limit);
}

const HOME_WIDGETS_CACHE_KEY = 'sonic_cached_home_widgets_v1';

export function HomeView({
  onOpenSidebar,
  onOpenSettings,
  onNavigateToTrending,
  onNavigateToArtists,
  onSelectArtist,
  query,
  setQuery,
  onSearch,
  isSearching,
  suggestions,
  results,
  favorites,
  offlineTracks = [],
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
  isDownloading,
  user,
  theme = 'dark',
  toggleTheme,
  currentTrack = null,
  isPlaying = false,
  showToast,
}: HomeViewProps) {
  // Navigation State for Dedicated Sub-pages
  const [selectedMoodMix, setSelectedMoodMix] = useState<{
    id?: string;
    title: string;
    subtitle: string;
    color: string;
    query: string;
    defaultTracks?: Track[];
  } | null>(null);

  const [dedicatedSection, setDedicatedSection] = useState<{
    title: string;
    subtitle: string;
    query: string;
    badge: string;
    coverUrl?: string;
    initialTracks?: Track[];
    isAlbum?: boolean;
    albumType?: string;
    albumId?: string;
    trackCount?: number;
    artistName?: string;
    albumYear?: number | string;
  } | null>(null);

  const [widgets, setWidgets] = useState<HomeWidgetsData | null>(() => {
    return safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
  });
  const [followedHits, setFollowedHits] = useState<Track[]>(() => {
    return safeLocalStorageGet<Track[]>('sonic_cached_followed_hits', []);
  });
  const [followedArtistsNames, setFollowedArtistsNames] = useState<string[]>([]);
  const [followedAvatars, setFollowedAvatars] = useState<Record<string, string>>(() => {
    return safeLocalStorageGet<Record<string, string>>('sonic_cached_followed_avatars', {});
  });

  const [isLoadingWidgets, setIsLoadingWidgets] = useState(() => {
    const cached = localStorage.getItem(HOME_WIDGETS_CACHE_KEY);
    return !cached;
  });

  const [isSearchActive, setIsSearchActive] = useState(false);

  // Recent searches list
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = safeLocalStorageGet<string[]>('sonic_recent_searches_list', []);
    if (Array.isArray(saved)) {
      return saved.filter(item => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  });

  // Dynamic quick searches center updated in real time with songs/artists user is listening to or fresh multilingual trending searches
  const [quickSearches, setQuickSearches] = useState<string[]>(() => {
    const listeningHistory = safeLocalStorageGet<string[]>('sonic_listening_history', []);
    const shuffledBase = getShuffledDefaultQuickSearches(12);
    if (Array.isArray(listeningHistory) && listeningHistory.length > 0) {
      const validStrings = listeningHistory.filter(item => typeof item === 'string' && item.trim().length > 0);
      const unique = Array.from(new Set([...validStrings, ...shuffledBase]));
      return unique.slice(0, 12);
    }
    return shuffledBase;
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const homeScrollContainerRef = useRef<HTMLDivElement>(null);
  const savedHomeScrollTopRef = useRef<number>(0);
  const featuredArtistsScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const hindiScrollRef = useRef<HTMLDivElement>(null);
  const hits2026ScrollRef = useRef<HTMLDivElement>(null);
  const albumsScrollRef = useRef<HTMLDivElement>(null);

  // Infinite Column-wise Featured Artists State
  const [columnArtists, setColumnArtists] = useState<any[]>([]);
  const [isViewingAllAlbums, setIsViewingAllAlbums] = useState<boolean>(false);
  const allAlbumsSentinelRef = useRef<HTMLDivElement>(null);
  const columnArtistsSentinelRef = useRef<HTMLDivElement>(null);
  const trendingSentinelRef = useRef<HTMLDivElement>(null);
  const hindiSentinelRef = useRef<HTMLDivElement>(null);
  const hits2026SentinelRef = useRef<HTMLDivElement>(null);
  const albumsSentinelRef = useRef<HTMLDivElement>(null);

  // Synchronous locks & page counters to prevent duplicate fetches or scroll-edge shaking
  const loadingLocksRef = useRef<Record<string, boolean>>({});
  const lastInstantAppendRef = useRef<Record<string, number>>({});
  const pagesRef = useRef<Record<string, number>>({
    popular: 1,
    hindi: 1,
    hits2026: 1,
    albums: 1,
    artists: 1
  });

  // Dynamic track lists and Popular Albums & Singles supporting horizontal infinite scrolling
  const [popularTracks, setPopularTracks] = useState<Track[]>(() => {
    const cached = safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
    return cached?.popularSongs && cached.popularSongs.length > 0 ? cached.popularSongs : INITIAL_TRENDING_TRACKS.slice(0, 15);
  });
  const [hindiTracks, setHindiTracks] = useState<Track[]>(() => {
    const cached = safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
    return cached?.hindiSongs && cached.hindiSongs.length > 0 ? cached.hindiSongs : INITIAL_TRENDING_TRACKS.slice(5, 20);
  });
  const [hits2026Tracks, setHits2026Tracks] = useState<Track[]>(() => {
    const cached = safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
    return cached?.hits2026Songs && cached.hits2026Songs.length > 0 ? cached.hits2026Songs : INITIAL_TRENDING_TRACKS.slice(10, 25);
  });
  const [popularAlbums, setPopularAlbums] = useState<PopularAlbumItem[]>(() => {
    const cached = safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
    if (cached?.popularAlbums && Array.isArray(cached.popularAlbums) && cached.popularAlbums.length > 0) {
      return cached.popularAlbums;
    }
    return getShuffledPopularAlbums(18);
  });

  // Helper to build a non-repeating shuffled batch of albums/singles for instant infinite continuation
  const buildNonRepeatingAlbumBatch = useCallback((existing: PopularAlbumItem[], incoming: PopularAlbumItem[] = [], count = 10): PopularAlbumItem[] => {
    const recentWindow = existing.slice(-14);
    const recentKeys = new Set(
      recentWindow.map(a => `${a.title.toLowerCase().trim()}::${a.artist.toLowerCase().trim()}`)
    );
    const allSeenKeys = new Set(
      existing.map(a => `${a.title.toLowerCase().trim()}::${a.artist.toLowerCase().trim()}`)
    );

    const result: PopularAlbumItem[] = [];
    // 1. Prefer genuinely unseen items from incoming server batch or full pool
    const candidates = [...incoming, ...getShuffledPopularAlbums(36)];
    for (const item of candidates) {
      if (!item || !item.title) continue;
      const k = `${item.title.toLowerCase().trim()}::${item.artist.toLowerCase().trim()}`;
      if (!allSeenKeys.has(k) && !recentKeys.has(k)) {
        allSeenKeys.add(k);
        recentKeys.add(k);
        result.push(item);
        if (result.length >= count) return result;
      }
    }

    // 2. Top up from shuffled pool avoiding the recent window so horizontal scroll never ends or shakes
    const fallbackPool = [...getShuffledPopularAlbums(36), ...incoming];
    for (const item of fallbackPool) {
      if (!item || !item.title) continue;
      const k = `${item.title.toLowerCase().trim()}::${item.artist.toLowerCase().trim()}`;
      if (!recentKeys.has(k)) {
        recentKeys.add(k);
        result.push(item);
        if (result.length >= count) break;
      }
    }

    return result.length > 0 ? result : getShuffledPopularAlbums(count);
  }, []);

  // Helper to build a non-repeating shuffled batch of tracks for instant infinite continuation
  const buildNonRepeatingTrackBatch = useCallback((existing: Track[], incoming: Track[] = [], count = 10): Track[] => {
    const recentWindow = existing.slice(-12);
    const recentIds = new Set(recentWindow.map(t => t.id));
    const allSeenIds = new Set(existing.map(t => t.id));

    const result: Track[] = [];
    for (const t of incoming) {
      if (!t || !t.id) continue;
      if (!allSeenIds.has(t.id) && !recentIds.has(t.id)) {
        allSeenIds.add(t.id);
        recentIds.add(t.id);
        result.push(t);
      }
    }
    if (result.length >= count) return result;

    // Top up from shuffled incoming + existing pool (excluding recent window) so scroll is truly infinite
    const pool = [...incoming, ...existing];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const t of pool) {
      if (!t || !t.id) continue;
      if (!recentIds.has(t.id)) {
        recentIds.add(t.id);
        result.push(t);
        if (result.length >= count) break;
      }
    }
    return result;
  }, []);

  // Load more Popular Albums & Singles horizontally (unlimited, zero-shake infinite scroll)
  const loadMoreAlbums = useCallback(async () => {
    if (loadingLocksRef.current['albums']) return;
    loadingLocksRef.current['albums'] = true;
    const nextPage = (pagesRef.current['albums'] || 1) + 1;
    pagesRef.current['albums'] = nextPage;

    try {
      const res = await fetch(`/api/popular-albums?page=${nextPage}&limit=14`);
      if (res.ok) {
        const data = await res.json();
        const serverAlbums = Array.isArray(data?.albums)
          ? data.albums
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setPopularAlbums(prev => {
          const nextBatch = buildNonRepeatingAlbumBatch(prev, serverAlbums, 12);
          return [...prev, ...nextBatch];
        });
      } else {
        setPopularAlbums(prev => [...prev, ...buildNonRepeatingAlbumBatch(prev, [], 10)]);
      }
    } catch {
      setPopularAlbums(prev => [...prev, ...buildNonRepeatingAlbumBatch(prev, [], 10)]);
    } finally {
      loadingLocksRef.current['albums'] = false;
    }
  }, [buildNonRepeatingAlbumBatch]);

  // Load more tracks horizontally (unlimited, zero-shake infinite scroll)
  const loadMoreTracks = useCallback(async (category: 'popular' | 'hindi' | 'hits2026') => {
    if (loadingLocksRef.current[category]) return;
    loadingLocksRef.current[category] = true;
    const nextPage = (pagesRef.current[category] || 1) + 1;
    pagesRef.current[category] = nextPage;

    const applyTracksUpdate = (incoming: Track[]) => {
      const updater = (prev: Track[]) => {
        const nextBatch = buildNonRepeatingTrackBatch(prev, incoming, 10);
        return nextBatch.length > 0 ? [...prev, ...nextBatch] : prev;
      };
      if (category === 'popular') {
        setPopularTracks(updater);
      } else if (category === 'hindi') {
        setHindiTracks(updater);
      } else if (category === 'hits2026') {
        setHits2026Tracks(updater);
      }
    };

    try {
      const res = await fetch(`/api/home-widgets/more?category=${category}&page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const serverTracks = Array.isArray(data?.tracks) ? data.tracks : [];
        applyTracksUpdate(serverTracks);
      } else {
        applyTracksUpdate([]);
      }
    } catch {
      applyTracksUpdate([]);
    } finally {
      loadingLocksRef.current[category] = false;
    }
  }, [buildNonRepeatingTrackBatch]);

  // Dynamic Featured Artists scoring based on user listening history
  const dynamicFeaturedArtists = useMemo(() => {
    const artists = widgets?.featuredArtists ? [...widgets.featuredArtists] : [
      { id: '1', name: 'Arijit Singh', role: 'Singer / Composer', listeners: '38M listeners', image: 'https://i.ytimg.com/vi/k3g_WjLCsXM/hqdefault.jpg', searchQuery: 'Arijit Singh' },
      { id: '2', name: 'Diljit Dosanjh', role: 'Global Icon', listeners: '26M listeners', image: 'https://i.ytimg.com/vi/fXae_fPZcKk/hqdefault.jpg', searchQuery: 'Diljit Dosanjh' },
      { id: '3', name: 'Karan Aujla', role: 'Singer / Lyricist', listeners: '22M listeners', image: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg', searchQuery: 'Karan Aujla' },
      { id: '4', name: 'Shreya Ghoshal', role: 'Playback Legend', listeners: '30M listeners', image: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg', searchQuery: 'Shreya Ghoshal' },
      { id: '5', name: 'The Weeknd', role: 'Global Megastar', listeners: '105M listeners', image: 'https://i.ytimg.com/vi/16jA-6hiSUo/hqdefault.jpg', searchQuery: 'The Weeknd' },
      { id: '6', name: 'Billie Eilish', role: 'Pop Icon', listeners: '95M listeners', image: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg', searchQuery: 'Billie Eilish' },
      { id: '7', name: 'Kaifi Khalil', role: 'Singer-Songwriter', listeners: '12M listeners', image: 'https://i.ytimg.com/vi/_XbvH79U3bQ/hqdefault.jpg', searchQuery: 'Kaifi Khalil' },
      { id: '8', name: 'Anirudh Ravichander', role: 'Rockstar Composer', listeners: '28M listeners', image: 'https://i.ytimg.com/vi/5cx7rvMvAWo/hqdefault.jpg', searchQuery: 'Anirudh Ravichander' }
    ];

    const favArtists = favorites.map(f => (f.artist || '').toLowerCase().trim()).filter(Boolean);
    const historyList = safeLocalStorageGet<string[]>('sonic_listening_history', []).map(h => h.toLowerCase().trim());
    
    const scoreArtist = (name: string) => {
      const lower = name.toLowerCase().trim();
      let score = 0;
      if (favArtists.some(fa => fa.includes(lower) || lower.includes(fa))) score += 30;
      if (historyList.some(h => h.includes(lower) || lower.includes(h))) score += 25;
      return score;
    };

    return artists.sort((a, b) => scoreArtist(b.name) - scoreArtist(a.name));
  }, [widgets?.featuredArtists, favorites]);

  // Load more column-wise artists infinitely
  const loadMoreColumnArtists = useCallback(async () => {
    if (loadingLocksRef.current['artists']) return;
    loadingLocksRef.current['artists'] = true;
    const nextPage = (pagesRef.current['artists'] || 1) + 1;
    pagesRef.current['artists'] = nextPage;

    try {
      const res = await fetch(`/api/top-artists?page=${nextPage}&limit=12`);
      const data = res.ok ? await res.json() : null;
      const incoming = Array.isArray(data?.artists) ? data.artists : [];
      setColumnArtists(prev => {
        const baseList = prev.length > 0 ? prev : dynamicFeaturedArtists;
        const recentNames = new Set(baseList.slice(-10).map((a: any) => String(a.name || '').toLowerCase()));
        const allSeen = new Set(baseList.map((a: any) => String(a.name || '').toLowerCase()));
        const fresh = incoming.filter((a: any) => {
          const n = String(a?.name || '').toLowerCase();
          if (!n || allSeen.has(n)) return false;
          allSeen.add(n);
          return true;
        });
        if (fresh.length >= 4) {
          return [...baseList, ...fresh];
        }
        const pool = [...incoming, ...baseList];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const extra: any[] = [...fresh];
        for (const item of pool) {
          const n = String(item?.name || '').toLowerCase();
          if (n && !recentNames.has(n)) {
            recentNames.add(n);
            extra.push(item);
            if (extra.length >= 8) break;
          }
        }
        return [...baseList, ...extra];
      });
    } catch {
      setColumnArtists(prev => {
        const baseList = prev.length > 0 ? prev : dynamicFeaturedArtists;
        const copy = [...baseList];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return [...baseList, ...copy.slice(0, 8)];
      });
    } finally {
      loadingLocksRef.current['artists'] = false;
    }
  }, [dynamicFeaturedArtists]);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, offset: number) => {
    if (ref.current) {
      const el = ref.current;
      el.scrollBy({ left: offset, behavior: 'smooth' });
      if (offset > 0) {
        const remaining = el.scrollWidth - (el.scrollLeft + offset) - el.clientWidth;
        if (remaining < 900) {
          if (ref === albumsScrollRef) {
            loadMoreAlbums();
          } else if (ref === trendingScrollRef) {
            loadMoreTracks('popular');
          } else if (ref === hindiScrollRef) {
            loadMoreTracks('hindi');
          } else if (ref === hits2026ScrollRef) {
            loadMoreTracks('hits2026');
          } else if (ref === featuredArtistsScrollRef) {
            loadMoreColumnArtists();
          }
        }
      }
    }
  };

  const handleHorizontalScroll = (
    category: 'popular' | 'hindi' | 'hits2026' | 'artists' | 'albums',
    e: React.UIEvent<HTMLDivElement>
  ) => {
    const target = e.currentTarget;
    const remaining = target.scrollWidth - target.scrollLeft - target.clientWidth;

    // Instant client-side buffer extension if user flicks very fast near the right edge (< 350px)
    const now = Date.now();
    if (remaining < 350 && now - (lastInstantAppendRef.current[category] || 0) > 250) {
      lastInstantAppendRef.current[category] = now;
      if (category === 'albums') {
        setPopularAlbums(prev => [...prev, ...buildNonRepeatingAlbumBatch(prev, [], 8)]);
      } else if (category === 'popular') {
        setPopularTracks(prev => [...prev, ...buildNonRepeatingTrackBatch(prev, [], 8)]);
      } else if (category === 'hindi') {
        setHindiTracks(prev => [...prev, ...buildNonRepeatingTrackBatch(prev, [], 8)]);
      } else if (category === 'hits2026') {
        setHits2026Tracks(prev => [...prev, ...buildNonRepeatingTrackBatch(prev, [], 8)]);
      } else if (category === 'artists') {
        setColumnArtists(prev => {
          const base = prev.length > 0 ? prev : dynamicFeaturedArtists;
          const shuffled = [...base].sort(() => Math.random() - 0.5).slice(0, 6);
          return [...base, ...shuffled];
        });
      }
    }

    // Background prefetch well before the right edge (< 950px)
    if (remaining < 950) {
      if (category === 'artists') {
        loadMoreColumnArtists();
      } else if (category === 'albums') {
        loadMoreAlbums();
      } else {
        loadMoreTracks(category);
      }
    }
  };

  // Fetch verified avatars for followed artists
  const fetchFollowedAvatars = (artistNames: string[]) => {
    if (!artistNames || artistNames.length === 0) return;
    const namesParam = encodeURIComponent(artistNames.join(','));
    fetch(`/api/batch-artist-images?names=${namesParam}`)
      .then(res => res.ok ? res.json() : { images: {} })
      .then(data => {
        if (data && data.images && typeof data.images === 'object') {
          setFollowedAvatars(prev => {
            const next = { ...prev, ...data.images };
            localStorage.setItem('sonic_cached_followed_avatars', JSON.stringify(next));
            return next;
          });
        }
      })
      .catch(() => {});
  };

  // Fetch or refresh home widgets
  const fetchHomeWidgets = (forceRefresh = false) => {
    try {
      const savedFollows = safeLocalStorageGet<string[]>('blaze_followed_artists', []);
      if (Array.isArray(savedFollows) && savedFollows.length > 0) {
        const cleanFollows = savedFollows.filter(a => typeof a === 'string' && a.trim().length > 0);
        setFollowedArtistsNames(cleanFollows);
        if (cleanFollows.length > 0) {
          fetchFollowedAvatars(cleanFollows);
          fetch('/api/followed-hits?artists=' + encodeURIComponent(cleanFollows.join(',')))
            .then(res => res.ok ? res.json() : null)
            .then(data => {
               if (data && Array.isArray(data.songs)) {
                 setFollowedHits(data.songs);
                 localStorage.setItem('sonic_cached_followed_hits', JSON.stringify(data.songs));
               }
            })
            .catch(() => {});
        } else {
          setFollowedHits([]);
        }
      } else {
        setFollowedArtistsNames([]);
        setFollowedHits([]);
      }
    } catch (e) {}

    const url = forceRefresh ? '/api/home-widgets?refresh=true' : '/api/home-widgets';

    // Also fetch dynamically updated Popular Albums & Singles
    fetch(`/api/popular-albums?page=1&limit=18${forceRefresh ? '&refresh=true' : ''}`)
      .then(res => res.ok ? res.json() : null)
      .then(albumData => {
        const incomingAlbums = Array.isArray(albumData?.albums)
          ? albumData.albums
          : Array.isArray(albumData?.items)
          ? albumData.items
          : [];
        if (incomingAlbums.length > 0) {
          setPopularAlbums(incomingAlbums);
        }
      })
      .catch(() => {});

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && (data.popularSongs || data.hindiSongs || data.hits2026Songs)) {
          setWidgets(data);
          if (Array.isArray(data.popularSongs) && data.popularSongs.length > 0) {
            setPopularTracks(data.popularSongs);
          }
          if (Array.isArray(data.hindiSongs) && data.hindiSongs.length > 0) {
            setHindiTracks(data.hindiSongs);
          }
          if (Array.isArray(data.hits2026Songs) && data.hits2026Songs.length > 0) {
            setHits2026Tracks(data.hits2026Songs);
          }
          if (Array.isArray(data.popularAlbums) && data.popularAlbums.length > 0) {
            setPopularAlbums(data.popularAlbums);
          }
          if (Array.isArray(data.trendingSearches) && data.trendingSearches.length > 0) {
            const listeningHistory = safeLocalStorageGet<string[]>('sonic_listening_history', []);
            const validHistory = Array.isArray(listeningHistory)
              ? listeningHistory.filter(item => typeof item === 'string' && item.trim().length > 0)
              : [];
            const merged = Array.from(new Set([...validHistory.slice(0, 4), ...data.trendingSearches]));
            setQuickSearches(merged.slice(0, 12));
          }
          localStorage.setItem(HOME_WIDGETS_CACHE_KEY, JSON.stringify(data));
        }
        setIsLoadingWidgets(false);
      })
      .catch(err => {
        console.log('Home widgets loaded from fallback cache:', err);
        const cachedWidgets = safeLocalStorageGet<HomeWidgetsData | null>(HOME_WIDGETS_CACHE_KEY, null);
        if (cachedWidgets) {
          setWidgets(cachedWidgets);
          if (cachedWidgets.popularSongs?.length) setPopularTracks(cachedWidgets.popularSongs);
          if (cachedWidgets.hindiSongs?.length) setHindiTracks(cachedWidgets.hindiSongs);
          if (cachedWidgets.hits2026Songs?.length) setHits2026Tracks(cachedWidgets.hits2026Songs);
        }
        setIsLoadingWidgets(false);
      });
  };

  useEffect(() => {
    // Always fetch fresh randomized multilingual trending tracks on app load / reload
    fetchHomeWidgets(true);

    // Refresh every 3 minutes so home feeds update dynamically
    const interval = setInterval(() => {
      fetchHomeWidgets(true);
    }, 3 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHomeWidgets(true);
      }
    };

    const handleAuthReset = () => {
      setFollowedArtistsNames([]);
      setFollowedHits([]);
      setFollowedAvatars({});
      setRecentSearches([]);
      setQuickSearches(getShuffledDefaultQuickSearches(12));
      setQuery('');
      setIsSearchActive(false);
      fetchHomeWidgets(true);
    };

    const handleFollowedUpdated = () => {
      fetchHomeWidgets(false);
    };

    const handleHourlyRefresh = () => {
      console.log('Hourly refresh triggered on HomeView: refreshing widgets & albums...');
      fetchHomeWidgets(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('sonic-auth-reset', handleAuthReset);
    window.addEventListener('sonic-followed-updated', handleFollowedUpdated);
    window.addEventListener('sonic:hourly-refresh', handleHourlyRefresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('sonic-auth-reset', handleAuthReset);
      window.removeEventListener('sonic-followed-updated', handleFollowedUpdated);
      window.removeEventListener('sonic:hourly-refresh', handleHourlyRefresh);
    };
  }, []);

  // Record user listening to analyze and customize quick searches & featured charts
  const recordUserListening = (track: Track) => {
    if (!track || typeof track !== 'object') return;
    try {
      const candidates = [
        typeof track.title === 'string' ? track.title.trim() : '',
        typeof track.artist === 'string' ? track.artist.trim() : ''
      ].filter(Boolean);
      if (candidates.length === 0) return;
      const prev = safeLocalStorageGet<string[]>('sonic_listening_history', []);
      const validPrev = Array.isArray(prev) ? prev.filter(item => typeof item === 'string') : [];
      const updated = Array.from(new Set([...candidates, ...validPrev]))
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 8);
      safeLocalStorageSet('sonic_listening_history', updated);
      setQuickSearches(Array.from(new Set([...updated, ...BASE_QUICK_SEARCHES])).slice(0, 10));
    } catch (err) {
      console.error('Failed to update listening history:', err);
    }
  };

  const isFavorite = (trackId: string) => favorites.some(f => f.id === trackId);

  const handleExecuteSearch = (qToSearch?: unknown) => {
    const rawVal = typeof qToSearch === 'string' ? qToSearch : (searchInputRef.current?.value || query);
    const targetQ = (rawVal || '').trim();
    if (!targetQ) return;
    
    // Save to recent searches
    const updatedRecents = [targetQ, ...recentSearches.filter(r => r.toLowerCase() !== targetQ.toLowerCase())].slice(0, 12);
    setRecentSearches(updatedRecents);
    safeLocalStorageSet('sonic_recent_searches_list', updatedRecents);

    setIsSearchActive(true);
    setQuery(targetQ);
    onSearch(targetQ);
  };

  const handleClearSearch = () => {
    setQuery('');
    setIsSearchActive(false);
  };

  const removeRecentSearch = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== itemToRemove);
    setRecentSearches(updated);
    safeLocalStorageSet('sonic_recent_searches_list', updated);
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('sonic_recent_searches_list');
  };

  // Initial fetch for infinite column artists directory
  useEffect(() => {
    const fetchInitialArtists = () => {
      fetch('/api/top-artists?page=1&limit=18')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data.artists) && data.artists.length > 0) {
            const copy = [...data.artists];
            for (let i = copy.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            setColumnArtists(prev => (prev.length > copy.length ? prev : copy));
          }
        })
        .catch(() => {});
    };
    fetchInitialArtists();
    window.addEventListener('sonic-auth-reset', fetchInitialArtists);
    return () => window.removeEventListener('sonic-auth-reset', fetchInitialArtists);
  }, []);

  // Horizontal infinite scroll sentinels for all 5 Home carousels
  useEffect(() => {
    const configs: Array<{
      sentinel: HTMLDivElement | null;
      container: HTMLDivElement | null;
      onReach: () => void;
    }> = [
      { sentinel: columnArtistsSentinelRef.current, container: featuredArtistsScrollRef.current, onReach: () => loadMoreColumnArtists() },
      { sentinel: trendingSentinelRef.current, container: trendingScrollRef.current, onReach: () => loadMoreTracks('popular') },
      { sentinel: hindiSentinelRef.current, container: hindiScrollRef.current, onReach: () => loadMoreTracks('hindi') },
      { sentinel: hits2026SentinelRef.current, container: hits2026ScrollRef.current, onReach: () => loadMoreTracks('hits2026') },
      { sentinel: albumsSentinelRef.current, container: albumsScrollRef.current, onReach: () => loadMoreAlbums() }
    ];

    const observers: IntersectionObserver[] = [];
    for (const cfg of configs) {
      if (!cfg.sentinel) continue;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            cfg.onReach();
          }
        },
        { root: cfg.container || null, rootMargin: '700px' }
      );
      obs.observe(cfg.sentinel);
      observers.push(obs);
    }

    return () => {
      observers.forEach(o => o.disconnect());
    };
  }, [loadMoreAlbums, loadMoreTracks, loadMoreColumnArtists]);

  // Vertical infinite scroll for dedicated Popular Albums & Singles view
  useEffect(() => {
    if (!isViewingAllAlbums || !allAlbumsSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreAlbums();
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(allAlbumsSentinelRef.current);
    return () => observer.disconnect();
  }, [isViewingAllAlbums, loadMoreAlbums]);

  // Keyboard shortcut: Cmd+K / Ctrl+K immediately focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Restore Home scroll position when closing any subview
  useLayoutEffect(() => {
    if (!dedicatedSection && !selectedMoodMix && !isViewingAllAlbums) {
      const targetPos = savedHomeScrollTopRef.current;
      if (targetPos > 0 && homeScrollContainerRef.current) {
        homeScrollContainerRef.current.scrollTop = targetPos;
        requestAnimationFrame(() => {
          if (homeScrollContainerRef.current) {
            homeScrollContainerRef.current.scrollTop = targetPos;
          }
        });
      }
    }
  }, [dedicatedSection, selectedMoodMix, isViewingAllAlbums]);

  // Check if dedicated soundscape mix page is open
  if (selectedMoodMix) {
    return (
      <DedicatedMixView
        key={`moodmix-${selectedMoodMix.title}`}
        mix={selectedMoodMix}
        onBack={() => setSelectedMoodMix(null)}
        onPlayTrack={onPlayTrack}
        currentTrack={currentTrack || null}
        isPlaying={isPlaying || false}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onDownloadTrack={onDownloadTrack}
        isDownloading={isDownloading}
        showToast={showToast}
      />
    );
  }

  // Check if dedicated section (Trending Songs, Hindi Songs, 2026 Popular Songs, Album/Single) is open
  if (dedicatedSection) {
    return (
      <DedicatedSectionView
        key={`section-${dedicatedSection.title}`}
        title={dedicatedSection.title}
        subtitle={dedicatedSection.subtitle}
        query={dedicatedSection.query}
        initialTracks={dedicatedSection.initialTracks}
        coverUrl={dedicatedSection.coverUrl}
        badge={dedicatedSection.badge}
        isAlbum={dedicatedSection.isAlbum}
        albumType={dedicatedSection.albumType}
        albumId={dedicatedSection.albumId}
        trackCount={dedicatedSection.trackCount}
        artistName={dedicatedSection.artistName}
        albumYear={dedicatedSection.albumYear}
        onBack={() => setDedicatedSection(null)}
        onPlayTrack={onPlayTrack}
        currentTrack={currentTrack || null}
        isPlaying={isPlaying || false}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onDownloadTrack={onDownloadTrack}
        isDownloading={isDownloading}
        showToast={showToast}
        onSelectArtist={onSelectArtist}
      />
    );
  }

  // Dedicated Popular Albums & Singles View (Column-Wise Infinite Scroll Feed)
  if (isViewingAllAlbums && !dedicatedSection) {
    return (
      <div className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-white dark:bg-[#080808] desktop-scrollbar text-gray-900 dark:text-white pb-44 md:pb-24 overscroll-y-contain [webkit-overflow-scrolling:touch]">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsViewingAllAlbums(false)}
              className="p-2 -ml-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-gray-800 dark:text-gray-200 active:scale-95 cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Popular Albums & Singles</span>
                <Disc size={20} className="text-gray-400" />
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Studio albums, breakout EPs & trending singles feed
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
            {popularAlbums.length} Releases
          </span>
        </div>

        {/* Column-Wise Album List with Infinite Scroll */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-5">
          <div className="flex flex-col space-y-3">
            {popularAlbums.map((album, idx) => (
              <div
                key={`all-alb-row-${album.id}-${idx}`}
                onClick={() => {
                  setDedicatedSection({
                    title: album.title,
                    subtitle: `${album.artist} • ${album.year} • ${album.type}`,
                    query: album.query || `${album.artist} ${album.title} songs`,
                    badge: `${album.type} • ${album.year}`,
                    coverUrl: album.coverUrl,
                    isAlbum: true,
                    albumType: album.type,
                    albumId: album.id,
                    trackCount: album.trackCount,
                    artistName: album.artist,
                    albumYear: album.year
                  });
                }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black/10 shadow-md">
                    <img
                      src={optimizeImage(album.coverUrl, { width: 300, quality: 85 })}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-black text-white uppercase tracking-wider">
                      {album.type}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate group-hover:underline">
                      {album.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                      {album.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      {album.year && <span>{album.year}</span>}
                      {album.year && <span>•</span>}
                      <span>{album.trackCount ? `${album.trackCount} ${album.trackCount === 1 ? 'song' : 'songs'}` : 'Full Release'}</span>
                      <span>•</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                        Open Album
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black flex items-center justify-center transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={allAlbumsSentinelRef} className="h-20 flex items-center justify-center my-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading more popular albums...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key="home-main-scroll"
      ref={homeScrollContainerRef}
      onScroll={(e) => {
        savedHomeScrollTopRef.current = e.currentTarget.scrollTop;
      }}
      className="flex-1 h-full min-h-0 w-full overflow-y-auto bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10 select-none overscroll-y-contain [webkit-overflow-scrolling:touch]"
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-16">
        
        {/* Top Header */}
        <header className="flex items-center justify-between pt-4 sm:pt-6 md:pt-6 pb-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-sidebar-open"
              onClick={onOpenSidebar}
              className="md:hidden p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black dark:text-white">Sonic Boomz</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-gray-900 dark:text-white">Home</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
            {toggleTheme && (
              <button
                id="btn-home-toggle-theme"
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-gray-900 dark:text-white cursor-pointer"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-black" />}
              </button>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              ref={searchInputRef}
              id="input-home-search"
              type="text"
              placeholder="Search songs, artists, albums, or lyrics..."
              value={query}
              onFocus={() => setIsSearchActive(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim().length > 0) {
                  setIsSearchActive(true);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
              className="w-full bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white border border-black/15 dark:border-white/20 rounded-2xl py-3.5 pl-12 pr-12 text-sm sm:text-base focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
            {query.length > 0 ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                aria-label="Clear Search Input"
              >
                <X size={18} />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[10px] font-mono font-bold text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span>⌘</span><span>K</span>
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  <span>Recent searches</span>
                </span>
                <button
                  onClick={clearAllRecentSearches}
                  className="text-[11px] font-semibold text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {recentSearches.map((item, idx) => (
                  <div
                    key={`recent-${idx}`}
                    onClick={() => {
                      setQuery(item);
                      handleExecuteSearch(item);
                    }}
                    className="shrink-0 group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-100 cursor-pointer transition-colors"
                  >
                    <Clock size={12} className="text-gray-400 shrink-0" />
                    <span className="max-w-[150px] truncate">{item}</span>
                    <button
                      onClick={(e) => removeRecentSearch(item, e)}
                      className="p-0.5 -mr-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && results.length === 0 && (
            <div className="mt-2 bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/20 rounded-2xl shadow-xl overflow-hidden z-30 relative">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(sug);
                    handleExecuteSearch(sug);
                  }}
                  className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-b border-black/5 dark:border-white/5 last:border-0 flex items-center gap-3 transition-colors text-sm font-medium"
                >
                  <Search size={15} className="text-gray-400" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conditional: Search Results vs Sonic Boomz Feed */}
        {isSearchActive && (results.length > 0 || isSearching || query.trim().length > 0) ? (
          /* SEARCH RESULTS VIEW */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-black/10 dark:border-white/10">
              <h2 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span>Search Results</span>
                {results.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15 text-black dark:text-white font-mono text-[11px] font-bold">
                    {results.length}
                  </span>
                )}
              </h2>
              <button
                onClick={handleClearSearch}
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                Back to Home
              </button>
            </div>

            {isSearching ? (
              <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Searching music catalog...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((track, idx) => (
                <div
                  key={`res-${track.id}-${idx}`}
                  onClick={() => {
                    recordUserListening(track);
                    onPlayTrack(track, idx, results);
                  }}
                  className="flex items-center gap-3 sm:gap-4 p-3 -mx-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="relative shrink-0">
                      <img
                        src={optimizeImage(track.coverUrl, { width: 150, quality: 80 })}
                        alt={track.title}
                        className="w-13 h-13 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => applyAppLogoFallback(e, track)}
                        onLoad={(e) => applyAppLogoFallback(e, track)}
                      />
                    <div className="absolute inset-0 bg-black/25 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play size={18} fill="white" className="text-white ml-0.5" />
                    </div>
                    {track.duration && track.duration > 0 && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-white/90">
                        {formatDuration(track.duration)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-gray-900 dark:text-white group-hover:underline">{track.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      <span className="truncate">{track.artist}</span>
                      {track.viewCount && track.viewCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatListens(track.viewCount)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                      className={`p-2 transition-colors cursor-pointer ${isFavorite(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      title={isFavorite(track.id) ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Heart size={18} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownloadTrack(track); }}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-opacity cursor-pointer"
                      title="Download track"
                    >
                      {isDownloading === track.id ? (
                        <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400">
                  <Search size={22} />
                </div>
                <p className="font-bold text-base text-gray-800 dark:text-gray-200">No songs found for "{query}"</p>
                <p className="text-xs text-gray-400 max-w-xs">Try searching for an artist name, album, or title.</p>
                <button
                  onClick={handleClearSearch}
                  className="mt-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SONIC BOOMZ HOME FEED */
          <div className="space-y-10">
            {/* Real-time Quick Searches (Auto-updated based on user listening) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Headphones size={15} className="text-black dark:text-white" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Quick Searches
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Live Listening Center
                </span>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                {quickSearches.map((chip, idx) => (
                  <button
                    key={`quick-${idx}`}
                    onClick={() => {
                      setQuery(chip);
                      handleExecuteSearch(chip);
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border border-black/10 dark:border-white/15 text-xs font-bold text-gray-800 dark:text-gray-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: FEATURED ARTISTS (Horizontal Infinite Scroll Row Carousel) */}
            <div className="relative group/artists-carousel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                    <span>Featured Artists</span>
                    <BadgeCheck size={20} className="text-blue-500" />
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Explore top artists & trending global icons in continuous horizontal feed
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onNavigateToArtists) {
                        onNavigateToArtists();
                      } else if (onSelectArtist) {
                        onSelectArtist('');
                      }
                    }}
                    className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                    title="View All Artists Directory"
                  >
                    <span>Full Directory</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Desktop Scroll Triggers */}
              <button
                onClick={() => scrollCarousel(featuredArtistsScrollRef, -450)}
                className="hidden md:flex absolute -left-4 top-[50%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/artists-carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel(featuredArtistsScrollRef, 450)}
                className="hidden md:flex absolute -right-4 top-[50%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/artists-carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>

              <div
                ref={featuredArtistsScrollRef}
                onScroll={(e) => handleHorizontalScroll('artists', e)}
                className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar desktop-scrollbar"
              >
                {(columnArtists.length > 0 ? columnArtists : dynamicFeaturedArtists).map((art, idx) => (
                  <div
                    key={`featured-art-${art.id || art.name}-${idx}`}
                    onClick={() => {
                      if (onSelectArtist) {
                        onSelectArtist(art.name);
                      } else {
                        setQuery(art.name);
                        handleExecuteSearch(art.name);
                      }
                    }}
                    className="shrink-0 w-36 sm:w-40 md:w-44 flex flex-col items-center text-center p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 border border-black/5 dark:border-white/5"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden shadow-md p-0.5 border-2 border-transparent group-hover:border-black dark:group-hover:border-white transition-all mb-2 bg-black/10 dark:bg-white/10 shrink-0">
                      <img
                        src={optimizeImage(art.image, { width: 300, quality: 85 })}
                        alt={art.name}
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                        onLoad={(e) => { if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) { e.currentTarget.src = '/app-logo.svg'; } }}
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-lg">
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm truncate w-full text-gray-900 dark:text-white group-hover:underline">
                      {art.name}
                    </h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">
                      {art.role || art.genre || 'Verified Artist'}
                    </span>
                  </div>
                ))}

                <div ref={columnArtistsSentinelRef} className="w-4 shrink-0" />
              </div>
            </div>

            {/* SECTION 2: TRENDING SONGS (Renamed from Popular Hits, Cleaned Up, Dedicated Page on See All) */}
            <div className="relative group/carousel">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Trending Songs
                </h2>

                <button
                  onClick={() => {
                    setDedicatedSection({
                      title: 'Trending Songs',
                      subtitle: 'Top chartbusters & trending songs updated in real-time',
                      query: 'top trending songs hindi english pakistani viral hits official video',
                      badge: 'Trending Feed',
                      initialTracks: popularTracks
                    });
                  }}
                  className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Desktop Scroll Triggers */}
              <button
                onClick={() => scrollCarousel(trendingScrollRef, -450)}
                className="hidden md:flex absolute -left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel(trendingScrollRef, 450)}
                className="hidden md:flex absolute -right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>

              {isLoadingWidgets && popularTracks.length === 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="shrink-0 w-36 sm:w-44 md:w-52 h-56 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div
                  ref={trendingScrollRef}
                  onScroll={(e) => handleHorizontalScroll('popular', e)}
                  className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar desktop-scrollbar"
                >
                  {popularTracks.map((track, idx) => (
                    <div
                      key={`trending-${track.id}-${idx}`}
                      onClick={() => {
                        recordUserListening(track);
                        onPlayTrack(track, idx, popularTracks);
                      }}
                      className="shrink-0 w-36 sm:w-44 md:w-52 group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md mb-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                        <img
                          src={optimizeImage(track.coverUrl, { width: 300, quality: 80 })}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => applyAppLogoFallback(e, track)}
                          onLoad={(e) => applyAppLogoFallback(e, track)}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-black text-black dark:text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                        {track.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-white">
                            {formatDuration(track.duration)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white group-hover:underline">
                        {track.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 block max-w-full">
                        {track.artist}
                      </span>
                    </div>
                  ))}
                  <div ref={trendingSentinelRef} className="w-4 shrink-0" />
                </div>
              )}
            </div>

            {/* SECTION 3: HINDI SONGS (Renamed from Hindi Hits, Cleaned Up, Dedicated Page on See All) */}
            <div className="relative group/carousel">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Hindi Songs
                </h2>

                <button
                  onClick={() => {
                    setDedicatedSection({
                      title: 'Hindi Songs',
                      subtitle: 'Soulful Bollywood melodies & latest Hindi chartbusters',
                      query: 'latest bollywood songs 2026 official video arijit shreya pritam',
                      badge: 'Hindi Feed',
                      initialTracks: hindiTracks
                    });
                  }}
                  className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Desktop Scroll Triggers */}
              <button
                onClick={() => scrollCarousel(hindiScrollRef, -450)}
                className="hidden md:flex absolute -left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel(hindiScrollRef, 450)}
                className="hidden md:flex absolute -right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>

              {isLoadingWidgets && hindiTracks.length === 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="shrink-0 w-36 sm:w-44 md:w-48 h-56 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div
                  ref={hindiScrollRef}
                  onScroll={(e) => handleHorizontalScroll('hindi', e)}
                  className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar desktop-scrollbar"
                >
                  {hindiTracks.map((track, idx) => (
                    <div
                      key={`hindi-${track.id}-${idx}`}
                      onClick={() => {
                        recordUserListening(track);
                        onPlayTrack(track, idx, hindiTracks);
                      }}
                      className="shrink-0 w-36 sm:w-44 md:w-48 lg:w-52 group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md mb-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                        <img
                          src={optimizeImage(track.coverUrl, { width: 300, quality: 80 })}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => applyAppLogoFallback(e, track)}
                          onLoad={(e) => applyAppLogoFallback(e, track)}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-black text-black dark:text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                        {track.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-white">
                            {formatDuration(track.duration)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white group-hover:underline">
                        {track.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 block max-w-full">
                        {track.artist}
                      </span>
                    </div>
                  ))}
                  <div ref={hindiSentinelRef} className="w-4 shrink-0" />
                </div>
              )}
            </div>

            {/* SECTION 4: POPULAR SONGS */}
            <div className="relative group/carousel">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Popular Songs
                </h2>

                <button
                  onClick={() => {
                    setDedicatedSection({
                      title: 'Popular Songs',
                      subtitle: 'Top international releases, viral sound tracks & trending bangers',
                      query: 'latest official music video 2026 trending youtube india',
                      badge: 'Popular Feed',
                      initialTracks: hits2026Tracks
                    });
                  }}
                  className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Desktop Scroll Triggers */}
              <button
                onClick={() => scrollCarousel(hits2026ScrollRef, -450)}
                className="hidden md:flex absolute -left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel(hits2026ScrollRef, 450)}
                className="hidden md:flex absolute -right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>

              {isLoadingWidgets && hits2026Tracks.length === 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="shrink-0 w-36 sm:w-44 md:w-48 h-56 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div
                  ref={hits2026ScrollRef}
                  onScroll={(e) => handleHorizontalScroll('hits2026', e)}
                  className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar desktop-scrollbar"
                >
                  {hits2026Tracks.map((track, idx) => (
                    <div
                      key={`hits2026-${track.id}-${idx}`}
                      onClick={() => {
                        recordUserListening(track);
                        onPlayTrack(track, idx, hits2026Tracks);
                      }}
                      className="shrink-0 w-36 sm:w-44 md:w-48 lg:w-52 group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md mb-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                        <img
                          src={optimizeImage(track.coverUrl, { width: 300, quality: 80 })}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => applyAppLogoFallback(e, track)}
                          onLoad={(e) => applyAppLogoFallback(e, track)}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-black text-black dark:text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                        {track.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-white">
                            {formatDuration(track.duration)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white group-hover:underline">
                        {track.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 block max-w-full">
                        {track.artist}
                      </span>
                    </div>
                  ))}
                  <div ref={hits2026SentinelRef} className="w-4 shrink-0" />
                </div>
              )}
            </div>

            {/* SECTION 5: POPULAR ALBUMS & SINGLES (Dynamically Updated & Unlimited Horizontal Infinite Scroll) */}
            <div className="relative group/carousel">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                    <span>Popular Albums & Singles</span>
                    <Disc size={20} className="text-gray-400" />
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trending studio albums, breakout EPs & viral singles updated live</p>
                </div>

                <button
                  onClick={() => {
                    setIsViewingAllAlbums(true);
                  }}
                  className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Desktop Scroll Triggers */}
              <button
                onClick={() => scrollCarousel(albumsScrollRef, -450)}
                className="hidden md:flex absolute -left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel(albumsScrollRef, 450)}
                className="hidden md:flex absolute -right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-black shadow-xl border border-black/15 dark:border-white/20 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer text-gray-900 dark:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>

              <div
                ref={albumsScrollRef}
                onScroll={(e) => handleHorizontalScroll('albums', e)}
                className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 hide-scrollbar desktop-scrollbar"
              >
                {popularAlbums.map((album, idx) => (
                  <div
                    key={`${album.id}-${idx}`}
                    onClick={() => {
                      setDedicatedSection({
                        title: album.title,
                        subtitle: `${album.artist} • ${album.year} • ${album.type}`,
                        query: album.query,
                        badge: `${album.type} • ${album.year}`,
                        coverUrl: album.coverUrl,
                        isAlbum: true,
                        albumType: album.type,
                        albumId: album.id,
                        trackCount: album.trackCount,
                        artistName: album.artist,
                        albumYear: album.year
                      });
                    }}
                    className="shrink-0 w-40 sm:w-48 md:w-52 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-md mb-2.5 bg-black/10">
                      <img
                        src={optimizeImage(album.coverUrl, { width: 350, quality: 85 })}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                        onLoad={(e) => { if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) { e.currentTarget.src = '/app-logo.svg'; } }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-xl">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white uppercase tracking-wider">
                        {album.type}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm truncate text-gray-900 dark:text-white group-hover:underline">
                      {album.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      <span className="truncate">{album.artist}</span>
                      <span>•</span>
                      <span>{album.trackCount ? `${album.trackCount} ${album.trackCount === 1 ? 'song' : 'songs'}` : album.year}</span>
                    </div>
                  </div>
                ))}

                <div ref={albumsSentinelRef} className="w-4 shrink-0" />
              </div>
            </div>

            {/* SECTION 6: FEATURED CHARTS (Renamed from Curated Moods & Soundscapes, Square Box with Circle) */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Featured Charts</span>
                  <Zap size={22} className="text-black dark:text-white" />
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">8 High-fidelity curated chart stations with vibrant aesthetic mixes</p>
              </div>

              {/* 8 Square Box Charts with Inner Circle & Vibrant Color Theme */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
                {FEATURED_CHARTS_CONFIG.map((chart) => (
                  <div
                    key={chart.id}
                    onClick={() => {
                      setSelectedMoodMix({
                        id: chart.id,
                        title: chart.title,
                        subtitle: chart.subtitle,
                        color: chart.gradient,
                        query: chart.query,
                        defaultTracks: chart.defaultTracks
                      });
                    }}
                    className={`relative aspect-square p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${chart.gradient} text-white shadow-2xl backdrop-blur-md cursor-pointer overflow-hidden group hover:scale-[1.03] active:scale-[0.98] transition-all border border-white/20 flex flex-col justify-between`}
                  >
                    {/* Background Radial Glow */}
                    <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />

                    {/* Top: Inner Aesthetic Circle */}
                    <div className="flex items-center justify-between z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:border-white group-hover:scale-105 transition-all">
                        <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-white uppercase text-center px-1">
                          {chart.circleLabel}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors shadow-md">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom: Typography Title & Subtitle */}
                    <div className="z-10 space-y-1">
                      <h4 className="font-black text-sm sm:text-base leading-snug tracking-tight text-white line-clamp-2">
                        {chart.title}
                      </h4>
                      <p className="text-[11px] text-white/80 line-clamp-1">
                        {chart.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
