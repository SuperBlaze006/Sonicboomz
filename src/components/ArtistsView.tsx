import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../types';
import { 
  Play, 
  Pause, 
  Heart, 
  Download, 
  Search, 
  Check, 
  Plus, 
  Shuffle, 
  ArrowLeft, 
  Menu, 
  Settings as SettingsIcon,
  BadgeCheck, 
  Disc3, 
  Clock, 
  Calendar,
  Layers,
  Sparkles,
  Infinity as InfinityIcon,
  Users,
  Music2,
  Music,
  RefreshCw,
  Filter,
  ChevronRight
} from 'lucide-react';
import { optimizeImage, applyAppLogoFallback } from '../lib/imageOptimizer';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/safeStorage';
import { DedicatedSectionView } from './DedicatedSectionView';

interface ArtistListItem {
  id: string;
  name: string;
  role: string;
  listeners: string;
  image: string;
  genre: string;
  verified?: boolean;
}

interface DiscographyItem {
  id: string;
  title: string;
  artist: string;
  year: number;
  type: 'Album' | 'Single' | 'EP';
  trackCount: number;
  coverUrl: string;
  genre: string;
}

interface ArtistPlaylist {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  trackCount: number;
  coverUrl: string;
}

interface ArtistDossier {
  name: string;
  verified: boolean;
  bio: string;
  monthlyListeners: string;
  headerImage: string;
  avatar: string;
  popularSongs: Track[];
  discography: DiscographyItem[];
  playlists: ArtistPlaylist[];
}

interface ArtistsViewProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  onPlayTrack: (track: Track, index: number, list: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
  favorites: Track[];
  isDownloading: string | null;
  initialArtistName?: string | null;
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

function formatViews(views?: number): string {
  if (!views || views <= 0) return '';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B plays`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M plays`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K plays`;
  return `${views} plays`;
}

// Helper to extract collab artists from song title / artist string
function extractCollabArtists(title: string, mainArtist: string): string[] {
  const collabs: string[] = [];
  const text = `${title} ${mainArtist}`;
  
  // Look for "feat. X", "ft. X", "with X", "x X", "& X"
  const patterns = [
    /(?:feat\.?|ft\.?|featuring)\s+([^,()]+)/gi,
    /(?:with)\s+([^,()]+)/gi,
    /\s+x\s+([^,()]+)/gi,
    /\s+&\s+([^,()]+)/gi,
  ];

  for (const regex of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        const raw = match[1]
          .replace(/[()[\]{}]/g, '')
          .replace(/official video|music video|lyric video|audio|remix|slowed|reverb/gi, '')
          .trim();
        if (raw.length > 1 && !raw.toLowerCase().includes(mainArtist.toLowerCase())) {
          // split multiple artists inside feat
          const parts = raw.split(/,|&|\band\b/i).map(s => s.trim()).filter(s => s.length > 1);
          collabs.push(...parts);
        }
      }
    }
  }

  return Array.from(new Set(collabs)).filter(c => c.toLowerCase() !== mainArtist.toLowerCase());
}

export function ArtistsView({
  onOpenSidebar,
  onOpenSettings,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
  favorites,
  isDownloading,
  initialArtistName,
  currentTrack,
  isPlaying,
  showToast,
}: ArtistsViewProps) {
  // Directory state
  const [artistsList, setArtistsList] = useState<ArtistListItem[]>(() => {
    return safeLocalStorageGet<ArtistListItem[]>('blaze_cached_artists_list', []);
  });
  const [artistPage, setArtistPage] = useState<number>(1);
  const [hasMoreArtists, setHasMoreArtists] = useState<boolean>(true);
  const [isLoadingArtists, setIsLoadingArtists] = useState<boolean>(() => {
    const cached = localStorage.getItem('blaze_cached_artists_list');
    return !cached;
  });
  const [isLoadingMoreArtists, setIsLoadingMoreArtists] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Selected artist state
  const [selectedArtist, setSelectedArtist] = useState<string | null>(initialArtistName || null);
  const [artistData, setArtistData] = useState<ArtistDossier | null>(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [discoTab, setDiscoTab] = useState<'all' | 'albums' | 'singles'>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<{
    id?: string;
    title: string;
    artist: string;
    year: number;
    type: string;
    coverUrl: string;
    trackCount: number;
  } | null>(null);
  const [extendedSongs, setExtendedSongs] = useState<Track[]>([]);

  // "Show All Songs" (Infinity Discography) state
  const [showAllView, setShowAllView] = useState<boolean>(false);
  const [allSongs, setAllSongs] = useState<Track[]>([]);
  const [allSongsPage, setAllSongsPage] = useState<number>(1);
  const [hasMoreAllSongs, setHasMoreAllSongs] = useState<boolean>(true);
  const [isLoadingAllSongs, setIsLoadingAllSongs] = useState<boolean>(false);
  const [isLoadingMoreAllSongs, setIsLoadingMoreAllSongs] = useState<boolean>(false);
  const [allSongsFilter, setAllSongsFilter] = useState<'all' | 'solo' | 'collabs'>('all');
  const [allSongsSearch, setAllSongsSearch] = useState<string>('');

  // Followed artists
  const [followedArtists, setFollowedArtists] = useState<string[]>(() => {
    const saved = safeLocalStorageGet<string[]>('blaze_followed_artists', []);
    if (Array.isArray(saved)) {
      return saved.filter(item => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  });

  // Dynamic avatars cache for followed artists with strict uniqueness and verification
  const [followedAvatars, setFollowedAvatars] = useState<Record<string, string>>(() => {
    const raw = safeLocalStorageGet<Record<string, string>>('blaze_artist_avatars', {});
    const cleaned: Record<string, string> = {};
    const seenUrls = new Set<string>();

    // Purge any stale generic placeholders, repeated avatars, or unsplash stock photos
    Object.entries(raw).forEach(([k, v]) => {
      if (
        v && 
        typeof v === 'string' && 
        !v.includes('unsplash.com') && 
        !v.includes('ac5350cff290edd5b69fa584b8b1bd4f') && // Purge mismatched placeholder
        !seenUrls.has(v) // Strict uniqueness: No two different artists may ever share the same avatar URL
      ) {
        seenUrls.add(v);
        cleaned[k] = v;
      }
    });
    return cleaned;
  });

  const artistSentinelRef = useRef<HTMLDivElement>(null);
  const allSongsSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAuthResetOrSync = () => {
      const saved = safeLocalStorageGet<string[]>('blaze_followed_artists', []);
      setFollowedArtists(Array.isArray(saved) ? saved.filter(item => typeof item === 'string' && item.trim().length > 0) : []);
    };
    window.addEventListener('sonic-auth-reset', handleAuthResetOrSync);
    window.addEventListener('sonic-cloud-data-synced', handleAuthResetOrSync);
    return () => {
      window.removeEventListener('sonic-auth-reset', handleAuthResetOrSync);
      window.removeEventListener('sonic-cloud-data-synced', handleAuthResetOrSync);
    };
  }, []);

  // Compute user taste string for recommendations based on followed artists, listening history, and favorites
  const userTaste = useMemo(() => {
    const list: string[] = [];
    if (followedArtists.length > 0) {
      list.push(...followedArtists.slice(0, 3));
    }
    // Extract artists from favorites
    const favArtists = favorites.map(f => (f.artist || '').trim()).filter(Boolean);
    if (favArtists.length > 0) {
      list.push(...favArtists.slice(0, 3));
    }
    // Extract from listening history
    const history = safeLocalStorageGet<string[]>('blaze_listening_history', []);
    if (history.length > 0) {
      list.push(...history.slice(0, 3));
    }

    const unique = Array.from(new Set(list.map(s => s.trim()))).filter(Boolean);
    if (unique.length > 0) {
      return unique.slice(0, 4).join(',');
    }
    return 'punjabi,hiphop,pop,arijit';
  }, [followedArtists, favorites]);

  const loadingMoreArtistsRef = useRef<boolean>(false);
  const artistPageRef = useRef<number>(1);

  // Load initial artists directory
  useEffect(() => {
    setIsLoadingArtists(artistsList.length === 0);
    artistPageRef.current = 1;
    setArtistPage(1);
    fetch(`/api/top-artists?page=1&limit=24&taste=${encodeURIComponent(userTaste)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.artists && Array.isArray(data.artists) && data.artists.length > 0) {
          setArtistsList(data.artists);
          safeLocalStorageSet('blaze_cached_artists_list', data.artists);
          setHasMoreArtists(data.hasMore ?? true);
        }
        setIsLoadingArtists(false);
      })
      .catch(err => {
        console.log('Info: Failed to load artists (relying on cache):', err);
        const cached = safeLocalStorageGet<ArtistListItem[]>('blaze_cached_artists_list', []);
        if (cached && cached.length > 0) {
          setArtistsList(cached);
        }
        setIsLoadingArtists(false);
      });
  }, [userTaste]);

  // Infinite Scroll for Artists Directory (Downwards unlimited loading)
  const loadMoreArtists = () => {
    if (loadingMoreArtistsRef.current || isLoadingMoreArtists || isLoadingArtists) return;
    loadingMoreArtistsRef.current = true;
    setIsLoadingMoreArtists(true);
    const nextPage = artistPageRef.current + 1;
    artistPageRef.current = nextPage;
    setArtistPage(nextPage);

    fetch(`/api/top-artists?page=${nextPage}&limit=24&taste=${encodeURIComponent(userTaste)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.artists && Array.isArray(data.artists) && data.artists.length > 0) {
          setArtistsList(prev => {
            const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
            const uniqueNew = data.artists.filter((a: ArtistListItem) => !existingNames.has(a.name.toLowerCase()));
            // If most artists were already present on very high pages, assign unique page-scoped IDs to keep loading endlessly
            if (uniqueNew.length > 0) {
              return [...prev, ...uniqueNew];
            }
            const fallbackAdditions = data.artists.slice(0, 12).map((a: ArtistListItem, idx: number) => ({
              ...a,
              id: `${a.id}-p${nextPage}-${idx}`
            }));
            return [...prev, ...fallbackAdditions];
          });
          setHasMoreArtists(data.hasMore ?? true);
        } else {
          setHasMoreArtists(true);
        }
      })
      .catch(err => {
        console.log('Info: Failed to load more artists:', err);
      })
      .finally(() => {
        loadingMoreArtistsRef.current = false;
        setIsLoadingMoreArtists(false);
      });
  };

  // IntersectionObserver for infinite artist downward scroll
  useEffect(() => {
    if (!hasMoreArtists || isLoadingMoreArtists || isLoadingArtists || selectedArtist) return;
    const sentinel = artistSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMoreArtistsRef.current) {
          loadMoreArtists();
        }
      },
      { root: null, rootMargin: '800px', threshold: 0.01 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreArtists, isLoadingMoreArtists, isLoadingArtists, selectedArtist, artistPage]);

  // Fetch verified authentic portrait pictures for all followed artists using batch endpoint
  useEffect(() => {
    if (followedArtists.length === 0) return;

    const namesParam = encodeURIComponent(followedArtists.join(','));
    fetch(`/api/batch-artist-images?names=${namesParam}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.images && typeof data.images === 'object') {
          setFollowedAvatars(prev => {
            const next = { ...prev, ...data.images };
            safeLocalStorageSet('blaze_artist_avatars', next);
            return next;
          });
        }
      })
      .catch(err => {
        console.log('Info: Error fetching followed artist avatars (relying on cache):', err);
        const cached = safeLocalStorageGet<Record<string, string>>('blaze_artist_avatars', {});
        if (Object.keys(cached).length > 0) {
          setFollowedAvatars(prev => ({ ...cached, ...prev }));
        }
      });
  }, [followedArtists]);

  // Update selected artist if prop changes
  useEffect(() => {
    if (initialArtistName) {
      setSelectedArtist(initialArtistName);
      setShowAllView(false);
    } else {
      setSelectedArtist(null);
      setArtistData(null);
      setShowAllView(false);
    }
  }, [initialArtistName]);

  // Load artist dossier when selected
  useEffect(() => {
    if (!selectedArtist) return;

    // Instant Cache-First Display: Load cached dossier immediately for 0ms transition
    const cachedDossier = safeLocalStorageGet<ArtistDossier | null>(`blaze_cached_artist_details_${selectedArtist.toLowerCase()}`, null);
    if (cachedDossier) {
      setArtistData(cachedDossier);
      setIsLoadingArtist(false);
    } else {
      setIsLoadingArtist(true);
    }

    setHasError(false);
    setShowAllView(false);
    setAllSongs([]);
    setAllSongsPage(1);

    fetch(`/api/artist-details?name=${encodeURIComponent(selectedArtist)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: ArtistDossier) => {
        setArtistData(data);
        safeLocalStorageSet(`blaze_cached_artist_details_${selectedArtist.toLowerCase()}`, data);
        setIsLoadingArtist(false);
        // Cache avatar
        if (data.avatar) {
          setFollowedAvatars(prev => {
            const next = { ...prev, [data.name]: data.avatar };
            safeLocalStorageSet('blaze_artist_avatars', next);
            return next;
          });
        }
      })
      .catch(err => {
        console.log('Info: Failed to fetch artist details (relying on cache):', err);
        const cached = safeLocalStorageGet<ArtistDossier | null>(`blaze_cached_artist_details_${selectedArtist.toLowerCase()}`, null);
        if (cached) {
          setArtistData(cached);
          setHasError(false);
        } else {
          setHasError(true);
        }
        setIsLoadingArtist(false);
      });

    // Also fetch extended songs to ensure unlimited playback after track 18
    Promise.all([
      fetch(`/api/artist-all-songs?name=${encodeURIComponent(selectedArtist)}&page=1&limit=50`).then(r => r.json()).catch(() => ({ songs: [] })),
      fetch(`/api/artist-all-songs?name=${encodeURIComponent(selectedArtist)}&page=2&limit=50`).then(r => r.json()).catch(() => ({ songs: [] }))
    ]).then(([p1, p2]) => {
      const s1 = Array.isArray(p1.songs) ? p1.songs : [];
      const s2 = Array.isArray(p2.songs) ? p2.songs : [];
      const combined = [...s1, ...s2];
      if (combined.length > 0) {
        setExtendedSongs(combined);
      }
    }).catch(() => {});
  }, [selectedArtist]);

  // Fetch "Show All Songs" Discography
  const loadAllSongs = (artistName: string, page = 1) => {
    if (page === 1) {
      const cachedSongs = safeLocalStorageGet<Track[]>(`blaze_cached_artist_songs_${artistName.toLowerCase()}`, []);
      if (cachedSongs.length > 0) {
        setAllSongs(cachedSongs);
        setIsLoadingAllSongs(false);
      } else {
        setIsLoadingAllSongs(true);
      }
    } else {
      setIsLoadingMoreAllSongs(true);
    }

    fetch(`/api/artist-all-songs?name=${encodeURIComponent(artistName)}&page=${page}&limit=30`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data.songs && Array.isArray(data.songs)) {
          if (page === 1) {
            setAllSongs(data.songs);
            safeLocalStorageSet(`blaze_cached_artist_songs_${artistName.toLowerCase()}`, data.songs);
          } else {
            setAllSongs(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const uniqueNew = data.songs.filter((s: Track) => !existingIds.has(s.id));
              return [...prev, ...uniqueNew];
            });
          }
          setAllSongsPage(page);
          setHasMoreAllSongs(data.hasMore ?? false);
        } else {
          setHasMoreAllSongs(false);
        }
        setIsLoadingAllSongs(false);
        setIsLoadingMoreAllSongs(false);
      })
      .catch(err => {
        console.log('Info: Failed to load all songs for artist (relying on cache):', err);
        if (page === 1) {
          const cached = safeLocalStorageGet<Track[]>(`blaze_cached_artist_songs_${artistName.toLowerCase()}`, []);
          if (cached && cached.length > 0) {
            setAllSongs(cached);
          }
        }
        setIsLoadingAllSongs(false);
        setIsLoadingMoreAllSongs(false);
      });
  };

  const handleOpenShowAll = () => {
    if (!selectedArtist) return;
    setShowAllView(true);
    if (allSongs.length === 0) {
      loadAllSongs(selectedArtist, 1);
    }
  };

  // IntersectionObserver for Infinite "Show All Songs" Discography
  useEffect(() => {
    if (!showAllView || !hasMoreAllSongs || isLoadingMoreAllSongs || isLoadingAllSongs || !selectedArtist) return;
    const sentinel = allSongsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAllSongs(selectedArtist, allSongsPage + 1);
        }
      },
      { root: null, rootMargin: '400px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showAllView, hasMoreAllSongs, isLoadingMoreAllSongs, isLoadingAllSongs, selectedArtist, allSongsPage]);

  const toggleFollow = (name: unknown) => {
    if (typeof name !== 'string') return;
    const cleanName = name.trim();
    if (!cleanName) return;
    setFollowedArtists(prev => {
      const validPrev = Array.isArray(prev) ? prev.filter(n => typeof n === 'string') : [];
      const next = validPrev.includes(cleanName) ? validPrev.filter(n => n !== cleanName) : [...validPrev, cleanName];
      safeLocalStorageSet('blaze_followed_artists', next);
      return next;
    });
  };

  const isFavorite = (trackId: string) => favorites.some(f => f.id === trackId);
  const isFollowing = (name: string) => followedArtists.includes(name);

  // Group discography year-by-year
  const filteredDiscography = (artistData?.discography || []).filter(item => {
    if (discoTab === 'albums') return item.type === 'Album';
    if (discoTab === 'singles') return item.type === 'Single' || item.type === 'EP';
    return true;
  });

  const discographyByYear = filteredDiscography.reduce((acc, item) => {
    const year = item.year || 2024;
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<number, DiscographyItem[]>);

  const sortedYears = Object.keys(discographyByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Filtered All Songs list for Show All view
  const displayAllSongs = useMemo(() => {
    if (!selectedArtist) return [];
    let list = allSongs;

    if (allSongsFilter === 'collabs') {
      list = list.filter(t => extractCollabArtists(t.title, selectedArtist).length > 0 || (t.artist && t.artist.toLowerCase().includes(',')));
    } else if (allSongsFilter === 'solo') {
      list = list.filter(t => extractCollabArtists(t.title, selectedArtist).length === 0);
    }

    if (allSongsSearch.trim().length > 0) {
      const q = allSongsSearch.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q)));
    }

    return list;
  }, [allSongs, allSongsFilter, allSongsSearch, selectedArtist]);

  // Filter and auto-recommend artist directory based on user listening experience & favorites
  const filteredArtists = useMemo(() => {
    const list = artistsList.filter(a => 
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      (a.genre && a.genre.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    // If active search filter is typed, respect direct query
    if (searchFilter.trim().length > 0) return list;

    const followedList = followedArtists.map(f => f.toLowerCase().trim());
    const favArtists = favorites.map(f => (f.artist || '').toLowerCase().trim()).filter(Boolean);
    const history = safeLocalStorageGet<string[]>('blaze_listening_history', []).map(h => h.toLowerCase().trim());

    const scoreArtist = (name: string) => {
      const lower = name.toLowerCase().trim();
      let score = 0;
      if (followedList.some(f => f === lower || lower.includes(f) || f.includes(lower))) score += 50;
      if (favArtists.some(fa => fa.includes(lower) || lower.includes(fa))) score += 30;
      if (history.some(h => h.includes(lower) || lower.includes(h))) score += 25;
      return score;
    };

    // Sort initial batch (first 24) to prioritize user's favorite & followed artists,
    // while keeping subsequent infinite-scrolled artists appended smoothly without scroll-jumping
    const initialBatch = list.slice(0, 24).sort((a, b) => scoreArtist(b.name) - scoreArtist(a.name));
    const remainingBatch = list.slice(24);
    return [...initialBatch, ...remainingBatch];
  }, [artistsList, searchFilter, followedArtists, favorites]);

  // Fallback scroll handler on the main scrollable container for instant infinite downward loading
  const handleMainArtistsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (selectedArtist || !hasMoreArtists || loadingMoreArtistsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 900) {
      loadMoreArtists();
    }
  };

  // Render full dedicated album view if an album/single is selected
  if (selectedAlbum) {
    return (
      <DedicatedSectionView
        key={`artist-album-${selectedAlbum.id}`}
        title={selectedAlbum.title}
        subtitle={`${selectedAlbum.artist} • ${selectedAlbum.year} • ${selectedAlbum.type}`}
        query={
          selectedAlbum.type.toLowerCase() === 'single'
            ? `${selectedAlbum.artist} ${selectedAlbum.title} song`
            : `${selectedAlbum.artist} ${selectedAlbum.title} songs`
        }
        coverUrl={selectedAlbum.coverUrl || '/app-logo.svg'}
        badge={`${selectedAlbum.type} • ${selectedAlbum.year}`}
        isAlbum={true}
        albumType={selectedAlbum.type}
        albumId={selectedAlbum.id}
        trackCount={selectedAlbum.trackCount}
        artistName={selectedAlbum.artist}
        albumYear={selectedAlbum.year}
        onBack={() => setSelectedAlbum(null)}
        onPlayTrack={onPlayTrack}
        currentTrack={currentTrack || null}
        isPlaying={isPlaying || false}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onDownloadTrack={onDownloadTrack}
        isDownloading={isDownloading}
        showToast={showToast}
        onSelectArtist={(name) => {
          setSelectedAlbum(null);
          setSelectedArtist(name);
        }}
      />
    );
  }

  // Play popular hits with infinite extended playlist support
  const handlePlayPopularSong = (track: Track, idx: number) => {
    if (!artistData) return;
    const seen = new Set<string>();
    const fullQueue: Track[] = [];

    // First add all popular hits
    for (const t of artistData.popularSongs) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        fullQueue.push(t);
      }
    }
    // Then append extended career catalog
    for (const t of extendedSongs) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        fullQueue.push(t);
      }
    }

    const targetIdx = fullQueue.findIndex(t => t.id === track.id);
    onPlayTrack(track, targetIdx >= 0 ? targetIdx : idx, fullQueue);
  };

  return (
    <div 
      key="artists-main-scroll" 
      onScroll={handleMainArtistsScroll}
      className="flex-1 h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#0e0f1c] desktop-scrollbar relative z-10 overscroll-y-contain touch-pan-y select-none"
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-44 md:pb-12">
        {/* Top Header */}
      <header className="flex items-center justify-between pt-4 sm:pt-6 md:pt-6 pb-4">
        <div className="flex items-center gap-3">
          {showAllView ? (
            <button
              onClick={() => setShowAllView(false)}
              className="p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 flex items-center gap-1.5 font-bold text-sm cursor-pointer"
              aria-label="Back to Artist Profile"
            >
              <ArrowLeft size={22} />
              <span className="hidden sm:inline">Profile</span>
            </button>
          ) : selectedArtist ? (
            <button
              onClick={() => {
                setSelectedArtist(null);
                setArtistData(null);
                setShowAllView(false);
              }}
              className="p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 flex items-center gap-1.5 font-bold text-sm cursor-pointer"
              aria-label="Back to Artists Directory"
            >
              <ArrowLeft size={22} />
              <span className="hidden sm:inline">Artists</span>
            </button>
          ) : (
            <button
              id="btn-sidebar-open"
              onClick={onOpenSidebar}
              className="md:hidden p-2.5 -ml-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          )}

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-color)]">
              {showAllView ? 'Full Discography' : 'Artist Hub'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate max-w-[240px] sm:max-w-md">
              {showAllView 
                ? `All Songs • ${selectedArtist}` 
                : (selectedArtist ? artistData?.name || selectedArtist : 'Artists')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200"
            aria-label="Settings Studio"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* VIEW 1: COMPLETE "SHOW ALL SONGS" INFINITY VIEW */}
      {/* ========================================================= */}
      {selectedArtist && showAllView ? (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner info */}
          <div className="p-4 sm:p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[var(--theme-color)] shadow-md shrink-0 bg-black/20">
                <img
                  src={optimizeImage(artistData?.avatar || followedAvatars[selectedArtist] || '', { width: 300, quality: 85 })}
                  alt={selectedArtist}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--theme-color)]">
                  <Music size={15} />
                  <span>Complete Discography from Beginning to Present</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {selectedArtist} Complete Releases
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {allSongs.length} releases loaded • Includes solo tracks, collaborations & singles
                </p>
              </div>
            </div>

            {/* Quick Play All button */}
            {allSongs.length > 0 && (
              <button
                onClick={() => onPlayTrack(allSongs[0], 0, allSongs)}
                className="px-5 py-3 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Play size={16} fill="currentColor" />
                <span>Play All ({allSongs.length})</span>
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Search inside ${selectedArtist}'s songs...`}
                value={allSongsSearch}
                onChange={(e) => setAllSongsSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:ring-2 focus:ring-[var(--theme-color)] focus:outline-none transition-all placeholder:text-gray-400"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/10 shrink-0">
              <button
                onClick={() => setAllSongsFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  allSongsFilter === 'all'
                    ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                All Releases
              </button>
              <button
                onClick={() => setAllSongsFilter('solo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  allSongsFilter === 'solo'
                    ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Solo
              </button>
              <button
                onClick={() => setAllSongsFilter('collabs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  allSongsFilter === 'collabs'
                    ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Users size={13} />
                <span>Collabs & Feats</span>
              </button>
            </div>
          </div>

          {/* All Songs List */}
          {isLoadingAllSongs ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <div className="w-9 h-9 border-3 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold animate-pulse">Loading {selectedArtist}'s full discography...</p>
            </div>
          ) : displayAllSongs.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Music2 size={32} className="mx-auto mb-2 opacity-40 text-[var(--theme-color)]" />
              <p className="font-bold text-sm">No songs match your filter</p>
              <button 
                onClick={() => { setAllSongsFilter('all'); setAllSongsSearch(''); }}
                className="mt-2 text-xs font-bold text-[var(--theme-color)] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {displayAllSongs.map((track, idx) => {
                const collabs = extractCollabArtists(track.title, selectedArtist);
                return (
                  <div
                    key={`all-song-${track.id}-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onPlayTrack(track, idx, displayAllSongs)}
                    className="flex items-center gap-3 sm:gap-4 p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 cursor-pointer transition-colors group touch-manipulation"
                  >
                    {/* Index */}
                    <div className="w-7 text-center font-mono text-xs font-bold text-gray-400 shrink-0">
                      {idx + 1}
                    </div>

                    {/* Cover Art */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 bg-black/5 dark:bg-white/5 pointer-events-none">
                      <img
                        src={optimizeImage(track.coverUrl, { width: 160, quality: 80 })}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => applyAppLogoFallback(e, track)}
                        onLoad={(e) => applyAppLogoFallback(e, track)}
                      />
                    </div>

                    {/* Track info & Collab Chips */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                        {track.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="truncate">{track.artist}</span>

                        {collabs.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[var(--theme-color)]/15 text-[var(--theme-color)]">
                              Collab
                            </span>
                            {collabs.map(collab => (
                              <button
                                key={collab}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedArtist(collab);
                                }}
                                className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-[var(--theme-color)] dark:hover:text-[var(--theme-color)] hover:underline"
                              >
                                {collab}
                              </button>
                            ))}
                          </div>
                        )}

                        {track.publishedAt && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5 ml-auto">
                            <Calendar size={11} />
                            <span>{track.publishedAt}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {track.duration && track.duration > 0 && (
                        <span className="text-xs font-mono text-gray-400 mr-1 hidden sm:inline">
                          {formatDuration(track.duration)}
                        </span>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                        className={`p-2 transition-colors ${isFavorite(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        title={isFavorite(track.id) ? 'Remove Favorite' : 'Add Favorite'}
                      >
                        <Heart size={16} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onDownloadTrack(track); }}
                        className="p-2 text-[var(--theme-color)] hover:opacity-80 transition-opacity"
                        title="Download track"
                      >
                        {isDownloading === track.id ? (
                          <div className="w-4 h-4 border-2 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
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

          {/* Infinite loading sentinel for Show All */}
          <div ref={allSongsSentinelRef} className="py-6 flex items-center justify-center">
            {isLoadingMoreAllSongs && (
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-color)]">
                <RefreshCw size={16} className="animate-spin" />
                <span>Loading more songs from archive...</span>
              </div>
            )}
            {!hasMoreAllSongs && allSongs.length > 0 && (
              <span className="text-xs font-semibold text-gray-400">
                • End of {selectedArtist}'s discography archive •
              </span>
            )}
          </div>
        </div>
      ) : selectedArtist ? (
        /* ========================================================= */
        /* VIEW 2: SPOTIFY ARTIST PROFILE (25 Popular Hits + Show All) */
        /* ========================================================= */
        hasError ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-red-500">
            <p className="text-sm font-semibold">Failed to find artist. Please try another search.</p>
            <button 
              onClick={() => setSelectedArtist(null)}
              className="mt-4 px-4 py-2 bg-black/10 dark:bg-white/10 rounded-full text-xs font-bold hover:bg-black/20 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : isLoadingArtist || !artistData ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
            <div className="w-10 h-10 border-3 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold animate-pulse">Loading artist dossier...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Header Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#181926] border border-black/10 dark:border-white/10">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[400px] w-full overflow-hidden">
                {/* Desktop blurred ambient backdrop for seamless edge-to-edge merge */}
                <img
                  src={optimizeImage(artistData.headerImage, { width: 300, quality: 40 })}
                  alt=""
                  className="hidden md:block absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                />
                <img
                  src={optimizeImage(artistData.headerImage, { width: 1400, quality: 90 })}
                  alt={artistData.name}
                  className="relative w-full h-full object-cover object-[center_25%] md:object-[center_35%] filter brightness-[0.8] transition-all"
                  loading="eager"
                  decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/app-logo.svg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 md:via-black/30 to-transparent" />
              </div>

              {/* Artist Details Overlay on Banner */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Circular Avatar Logo Pick */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-2xl shrink-0 bg-black/40">
                    <img
                      src={optimizeImage(artistData.avatar, { width: 400, quality: 85 })}
                      alt={`${artistData.name} avatar`}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => applyAppLogoFallback(e)}
                      onLoad={(e) => applyAppLogoFallback(e)}
                    />
                  </div>

                  <div className="text-white drop-shadow-md">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                      <BadgeCheck size={16} fill="#3b82f6" className="text-white" />
                      <span>Verified Artist</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                      {artistData.name}
                    </h2>
                  </div>
                </div>

                {/* Play, Shuffle, Follow & Show All Actions */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={() => {
                      if (artistData.popularSongs.length > 0) {
                        onPlayTrack(artistData.popularSongs[0], 0, artistData.popularSongs);
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-[var(--theme-color)] hover:scale-105 active:scale-95 text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] flex items-center justify-center shadow-xl transition-all"
                    title={`Play all songs by ${artistData.name}`}
                  >
                    <Play size={22} fill="currentColor" className="ml-0.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (artistData.popularSongs.length > 0) {
                        const shuffled = [...artistData.popularSongs].sort(() => Math.random() - 0.5);
                        onPlayTrack(shuffled[0], 0, shuffled);
                      }
                    }}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95"
                    title="Shuffle Artist Tracks"
                  >
                    <Shuffle size={18} />
                  </button>

                  <button
                    onClick={() => toggleFollow(artistData.name)}
                    className={`px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 ${
                      isFollowing(artistData.name)
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {isFollowing(artistData.name) ? (
                      <>
                        <Check size={14} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenShowAll}
                    className="px-4 py-2.5 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <InfinityIcon size={16} />
                    <span>Show All Songs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: 25 POPULAR HITS WITH COLLAB MENTIONS & SHOW ALL SIDE BUTTON */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span>Popular Hits</span>
                    <Sparkles size={18} className="text-[var(--theme-color)]" />
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)]">
                    {artistData.popularSongs.length} Top Songs
                  </span>
                </div>

                {/* Side Show All Button */}
                <button
                  onClick={handleOpenShowAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--theme-color)] hover:underline p-1"
                >
                  <Music size={14} />
                  <span>Show All Songs</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-1">
                {artistData.popularSongs.map((track, idx) => {
                  const collabs = extractCollabArtists(track.title, artistData.name);
                  return (
                    <div
                      key={`art-pop-${track.id}-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePlayPopularSong(track, idx)}
                      className="flex items-center gap-3 sm:gap-4 p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 cursor-pointer transition-colors group touch-manipulation"
                    >
                      {/* Track Number / Play Indicator */}
                      <div className="w-6 text-center font-bold text-sm text-gray-400 shrink-0">
                        {idx + 1}
                      </div>

                      {/* WebP Album Art */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 bg-black/5 dark:bg-white/5 pointer-events-none">
                        <img
                          src={optimizeImage(track.coverUrl, { width: 200, quality: 80 })}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => applyAppLogoFallback(e, track)}
                          onLoad={(e) => applyAppLogoFallback(e, track)}
                        />
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate group-hover:underline transition-colors text-gray-900 dark:text-white">
                          {track.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          <span className="truncate">{track.artist}</span>

                          {collabs.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500">
                                Collab
                              </span>
                              {collabs.map(collab => (
                                <button
                                  key={collab}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedArtist(collab);
                                  }}
                                  className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:underline"
                                >
                                  {collab}
                                </button>
                              ))}
                            </div>
                          )}

                          {track.viewCount && track.viewCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatViews(track.viewCount)}</span>
                            </>
                          )}
                          {track.publishedAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Calendar size={11} />
                                <span>{track.publishedAt}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Duration & Actions */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {track.duration && track.duration > 0 && (
                          <span className="text-xs font-mono text-gray-400 mr-1 hidden sm:inline">
                            {formatDuration(track.duration)}
                          </span>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite(track); }}
                          className={`p-2 transition-colors ${isFavorite(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          title={isFavorite(track.id) ? 'Remove Favorite' : 'Add Favorite'}
                        >
                          <Heart size={16} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onDownloadTrack(track); }}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-opacity"
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
            </div>

            {/* SECTION 2: DISCOGRAPHY YEAR BY YEAR */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span>Discography</span>
                    <Disc3 size={18} className="text-black dark:text-white" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chronological albums and singles organized year by year
                  </p>
                </div>

                {/* Filter Tabs - High Contrast Fix for All, Album, Singles */}
                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 p-1 rounded-2xl border border-black/10 dark:border-white/15 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDiscoTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      discoTab === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-md border border-black/20 dark:border-white/30'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscoTab('albums')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      discoTab === 'albums'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-md border border-black/20 dark:border-white/30'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Albums
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscoTab('singles')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      discoTab === 'singles'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-md border border-black/20 dark:border-white/30'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Singles & EPs
                  </button>
                </div>
              </div>

              {/* Year-by-Year Chronological Grid */}
              <div className="space-y-6">
                {sortedYears.map((year) => {
                  const items = discographyByYear[year] || [];
                  return (
                    <div key={`year-${year}`} className="space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-1">
                        <span className="text-base font-black tracking-tight text-gray-900 dark:text-white">
                          {year}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          • {items.length} {items.length === 1 ? 'Release' : 'Releases'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedAlbum({
                                id: item.id,
                                title: item.title,
                                artist: item.artist,
                                year: item.year,
                                type: item.type,
                                coverUrl: item.coverUrl,
                                trackCount: item.trackCount
                              });
                            }}
                            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group flex flex-col"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md mb-2 bg-black/10">
                              <img
                                src={optimizeImage(item.coverUrl, { width: 300, quality: 80 })}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => applyAppLogoFallback(e, item)}
                                onLoad={(e) => applyAppLogoFallback(e, item)}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                                  <Play size={18} fill="currentColor" className="ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white uppercase tracking-wider">
                                {item.type}
                              </span>
                            </div>

                            <h5 className="font-bold text-xs sm:text-sm truncate group-hover:underline text-gray-900 dark:text-white transition-colors">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {item.year} • {item.trackCount} {item.trackCount === 1 ? 'song' : 'songs'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: ARTIST PLAYLISTS */}
            <div>
              <div className="mb-3">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <span>Featuring {artistData.name}</span>
                  <Layers size={18} className="text-[var(--theme-color)]" />
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Official playlists, essential mixes, and discography compilations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artistData.playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      if (artistData.popularSongs.length > 0) {
                        onPlayTrack(artistData.popularSongs[0], 0, artistData.popularSongs);
                      }
                    }}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md shrink-0 bg-black/10">
                      <img
                        src={optimizeImage(pl.coverUrl, { width: 250, quality: 80 })}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => applyAppLogoFallback(e, pl)}
                        onLoad={(e) => applyAppLogoFallback(e, pl)}
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                        {pl.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {pl.subtitle}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                        Updated {pl.year} • {pl.trackCount} Tracks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: ABOUT THE ARTIST */}
            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
              <h3 className="text-lg font-black tracking-tight">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {artistData.bio}
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-bold text-gray-500">
                <span className="text-[var(--theme-color)] flex items-center gap-1">
                  <BadgeCheck size={14} />
                  <span>Verified Artist</span>
                </span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* ========================================================= */
        /* VIEW 3: INFINITY ARTISTS BROWSER & DIRECTORY */
        /* ========================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* Search Input for Artists */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists by name or genre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchFilter.trim().length > 0) {
                  setSelectedArtist(searchFilter.trim());
                }
              }}
              className="w-full bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--theme-color)] focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
          </div>
          
          {/* SECTION 1: FOLLOWED ARTISTS WITH CIRCULAR PORTRAIT PICS */}
          {followedArtists.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--theme-color)]"></span>
                  Followed Artists
                </h3>
                <span className="text-xs font-semibold text-gray-400">
                  {followedArtists.length} {followedArtists.length === 1 ? 'Artist' : 'Artists'}
                </span>
              </div>

              <div className="flex overflow-x-auto gap-3.5 pb-2 hide-scrollbar">
                {followedArtists.map(name => {
                  const avatarUrl = followedAvatars[name] || artistsList.find(a => a.name.toLowerCase() === name.toLowerCase())?.image || '';
                  return (
                    <div 
                      key={name}
                      onClick={() => setSelectedArtist(name)}
                      className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--theme-color)] shadow-md transition-all bg-black/10">
                        {avatarUrl ? (
                          <img 
                            src={optimizeImage(avatarUrl, { width: 180, quality: 85 })} 
                            alt={name} 
                            className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => applyAppLogoFallback(e)}
                            onLoad={(e) => applyAppLogoFallback(e)}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[var(--theme-color)] to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[76px] text-center">
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: INFINITY TOP & TRENDING ARTISTS */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  <span>Top & Trending Artists</span>
                  <Sparkles size={18} className="text-[var(--theme-color)]" />
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Featured artists & creators directory • Tailored to your favorite music genres
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--theme-color)] bg-[var(--theme-color)]/10 px-2.5 py-1 rounded-full">
                {artistsList.length} Artists
              </span>
            </div>

            {isLoadingArtists ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
                <div className="w-9 h-9 border-3 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold animate-pulse">Loading artist catalog...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredArtists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist.name)}
                      className="flex flex-col items-center text-center p-4 rounded-3xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-lg p-0.5 border-2 border-transparent group-hover:border-[var(--theme-color)] transition-all mb-3 bg-black/10">
                        <img
                          src={optimizeImage(artist.image, { width: 350, quality: 85 })}
                          alt={artist.name}
                          className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => applyAppLogoFallback(e)}
                          onLoad={(e) => applyAppLogoFallback(e)}
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] flex items-center justify-center shadow-lg">
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 max-w-full">
                        <h4 className="font-black text-sm truncate group-hover:text-[var(--theme-color)] transition-colors">
                          {artist.name}
                        </h4>
                        <BadgeCheck size={14} className="text-blue-500 shrink-0" />
                      </div>

                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">
                        {artist.role}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Sentinel for Artist Directory */}
                <div ref={artistSentinelRef} className="py-8 flex items-center justify-center">
                  {isLoadingMoreArtists && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-color)]">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading more artists...</span>
                    </div>
                  )}
                  {!hasMoreArtists && artistsList.length > 0 && (
                    <span className="text-xs font-semibold text-gray-400">
                      • All {artistsList.length} top artists loaded •
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
