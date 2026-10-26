import React, { useState, useEffect, useRef } from 'react';
import { callApi } from './lib/workerPool';
import { 
  saveToIndexedDB, 
  getAllFromIndexedDB, 
  enforceOwnerLimitIndexedDB,
  deleteFromIndexedDB, 
  clearOwnerIndexedDB, 
  migrateGuestDownloadsToUser, 
  SavedTrack 
} from './lib/indexedDb';
import { Track, Playlist } from './types';
import { INITIAL_TRENDING_TRACKS } from './data/initialTracks';
import { HomeView } from './components/HomeView';
import { TrendingView } from './components/TrendingView';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { DownloadsView } from './components/DownloadsView';
import { ArtistsView } from './components/ArtistsView';
import { BottomNav, ActiveNavTab } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';
import { AuthPage } from './components/AuthPage';
import { PlayerOverlay } from './components/PlayerOverlay';
import { Sidebar } from './components/Sidebar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopPlayerBar } from './components/DesktopPlayerBar';
import { Play, Pause, LogIn, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage, applyAppLogoFallback } from './lib/imageOptimizer';
import { ytController } from './lib/youtubePlayer';
import { safeLocalStorageGet, safeLocalStorageSet } from './lib/safeStorage';
import { User } from 'firebase/auth';
import { 
  getUserProfile, 
  subscribeToAuthChanges,
  subscribeUserMusicData, 
  saveUserMusicData, 
  UserProfileData 
} from './lib/firebase';

import { applyThemeVariables } from './lib/themeUtils';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallAppModal } from './components/InstallAppModal';
import { AppLaunchLoadingScreen } from './components/AppLaunchLoadingScreen';

export default function App() {
  // Global State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('blaze_theme_mode') as 'dark' | 'light') || 'dark';
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('blaze_theme_color') || '#FFFFFF';
  });
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayerOverlay, setShowPlayerOverlay] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  
  // Firebase Auth & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [limitPromptModal, setLimitPromptModal] = useState<{
    title: string;
    message: string;
    type: 'signin' | 'limit';
  } | null>(null);

  const getAccountOwnerKey = (u: User | null): string => {
    if (!u) return 'guest';
    if (u.email && u.email.trim()) return `user_${u.email.trim().toLowerCase()}`;
    return `user_${u.uid}`;
  };

  const triggerSignInPrompt = (title: string, message: string) => {
    setLimitPromptModal({
      title,
      message,
      type: 'signin',
    });
  };
  
  const [playerMode, setPlayerMode] = useState<'html5' | 'youtube'>('html5');
  const playerModeRef = useRef<'html5' | 'youtube'>('html5');
  
  // Headphone / Earbud Multi-Tap Gesture State
  const headphoneTapCountRef = useRef<number>(0);
  const lastHeadphoneTapTimeRef = useRef<number>(0);
  const headphoneTapTimerRef = useRef<any>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => { 
    setToastMessage(msg); 
    setTimeout(() => setToastMessage(null), 3200); 
  };
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<0 | 1 | 2>(0);
  const [favorites, setFavorites] = useState<Track[]>([]);
  
  // Desktop Volume Control State
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('blaze_player_volume');
      return saved !== null ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    ytController.setVolume((isMuted ? 0 : volume) * 100);
  }, [volume, isMuted]);

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    safeLocalStorageSet('blaze_player_volume', clamped);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('blaze_playlists');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [selectedArtistName, setSelectedArtistName] = useState<string | null>(null);

  const TABS_ORDER: ActiveNavTab[] = ['home', 'trending', 'artists', 'playlists', 'downloads'];
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const handleTabChange = (nextTab: ActiveNavTab) => {
    const currIdx = TABS_ORDER.indexOf(activeTab);
    const nextIdx = TABS_ORDER.indexOf(nextTab);
    setSlideDirection(nextIdx >= currIdx ? 'left' : 'right');
    setActiveTab(nextTab);
  };

  const mainTouchStartX = useRef<number | null>(null);
  const mainTouchStartY = useRef<number | null>(null);

  const handleMainTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('.overflow-x-auto, .snap-x, input, textarea, button, select, [role="slider"]')) {
      mainTouchStartX.current = null;
      mainTouchStartY.current = null;
      return;
    }
    mainTouchStartX.current = e.touches[0].clientX;
    mainTouchStartY.current = e.touches[0].clientY;
  };

  const handleMainTouchEnd = (e: React.TouchEvent) => {
    if (mainTouchStartX.current === null || mainTouchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - mainTouchStartX.current;
    const deltaY = e.changedTouches[0].clientY - mainTouchStartY.current;
    mainTouchStartX.current = null;
    mainTouchStartY.current = null;

    // Strict horizontal swipe criteria: clear horizontal movement (>70px) and at least 2.2x vertical movement
    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 2.2) {
      const currentIdx = TABS_ORDER.indexOf(activeTab);
      if (deltaX < -70 && currentIdx < TABS_ORDER.length - 1) {
        // Swiped Left -> Move to Next Tab
        handleTabChange(TABS_ORDER[currentIdx + 1]);
      } else if (deltaX > 70 && currentIdx > 0) {
        // Swiped Right -> Move to Previous Tab
        handleTabChange(TABS_ORDER[currentIdx - 1]);
      }
    }
  };

  const navigateToArtist = (artistName?: string) => {
    setSlideDirection('left');
    if (!artistName || !artistName.trim()) {
      setSelectedArtistName(null);
      setActiveTab('artists');
      setShowPlayerOverlay(false);
      return;
    }
    setSelectedArtistName(artistName.trim());
    setActiveTab('artists');
    setShowPlayerOverlay(false);
  };

  // Browse State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Track[]>([]);
  const [offlineTracks, setOfflineTracks] = useState<SavedTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const userRef = useRef<User | null>(null);
  const offlineTracksRef = useRef<SavedTrack[]>([]);
  const activeDownloadsRef = useRef<Set<string>>(new Set());
  const downloadAbortControllersRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    offlineTracksRef.current = offlineTracks;
  }, [offlineTracks]);

  // YouTube Homepage Feed & Infinite Scroll State
  const [feedTracks, setFeedTracks] = useState<Track[]>(() => {
    const cached = safeLocalStorageGet<Track[]>('sonic_cached_feed_tracks', []);
    return Array.isArray(cached) && cached.length > 0 ? cached : INITIAL_TRENDING_TRACKS;
  });
  const [feedNextPageToken, setFeedNextPageToken] = useState<string | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(() => {
    const cached = safeLocalStorageGet<Track[]>('sonic_cached_feed_tracks', []);
    return !cached || cached.length === 0;
  });
  const [isLoadingMoreFeed, setIsLoadingMoreFeed] = useState<boolean>(false);
  const [activeFeedTab, setActiveFeedTab] = useState<string>('Trending Now');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const wakeLockRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioKeepAliveGainRef = useRef<GainNode | null>(null);

  // Background Audio Keep-Alive for Mobile/Android PWA
  // Creates an ultra-low sub-audible carrier stream so Android OS recognizes an active
  // foreground audio session and does not suspend the process when the device screen locks.
  const ensureAudioKeepAlive = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001; // Inaudible, holds active Android AudioTrack session
        osc.frequency.value = 20; // 20Hz sub-audible
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioKeepAliveGainRef.current = gain;
      }

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (_) {}
  };

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (_) {}
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch (_) {}
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isPlaying) {
        requestWakeLock();
      }
      if (document.hidden && isPlaying) {
        // Device screen turned off or app backgrounded: maintain audio session & active media session state
        ensureAudioKeepAlive();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isPlaying]);

  const toggleThemeMode = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const nextColor = next === 'dark' ? '#FFFFFF' : '#000000';
      setThemeColor(nextColor);
      return next;
    });
  };

  // Apply theme color and contrast CSS variables dynamically
  useEffect(() => {
    applyThemeVariables(themeColor, theme === 'dark');
    localStorage.setItem('blaze_theme_color', themeColor);
    localStorage.setItem('blaze_theme_mode', theme);
  }, [themeColor, theme]);

  // Playback concurrency, promise tracking & silent background playability watchdog refs
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const currentBlobUrlRef = useRef<string | null>(null);
  const resolvedUrlsCacheRef = useRef<Record<string, string>>({});
  const currentTrackRef = useRef<Track | null>(null);
  const feedTracksRef = useRef<Track[]>([]);
  const trackPlayableVerifiedRef = useRef<boolean>(false);
  const userPausedManuallyRef = useRef<boolean>(false);
  const watchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRecoveryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPlaybackWatchdog = () => {
    if (watchdogTimeoutRef.current) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
    if (watchdogRecoveryRef.current) {
      clearTimeout(watchdogRecoveryRef.current);
      watchdogRecoveryRef.current = null;
    }
  };

  const markTrackPlayableVerified = () => {
    if (!trackPlayableVerifiedRef.current) {
      trackPlayableVerifiedRef.current = true;
      clearPlaybackWatchdog();
    }
  };

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    feedTracksRef.current = feedTracks;
  }, [feedTracks]);

  useEffect(() => {
    if (progress >= 1) {
      markTrackPlayableVerified();
    }
  }, [progress]);

  const preResolveNextTrack = async () => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    const nextIdx = idx + 1;
    if (nextIdx < q.length) {
      const nextTrack = q[nextIdx];
      if (nextTrack && !nextTrack.audioBlob && !resolvedUrlsCacheRef.current[nextTrack.id]) {
        try {
          const endpoint = `/api/resolve?source=${encodeURIComponent(nextTrack.source || 'youtube')}&id=${encodeURIComponent(nextTrack.id)}&title=${encodeURIComponent(nextTrack.title || '')}&artist=${encodeURIComponent(nextTrack.artist || '')}`;
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              resolvedUrlsCacheRef.current[nextTrack.id] = data.url;
              console.log('Background pre-resolved next track URL:', nextTrack.title);
            }
          }
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    if (currentTrack) {
      const timer = setTimeout(preResolveNextTrack, 200);
      return () => clearTimeout(timer);
    }
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
    isShuffleRef.current = isShuffle;
    repeatModeRef.current = repeatMode;
    playerModeRef.current = playerMode;
  }, [queue, currentIndex, isShuffle, repeatMode, playerMode]);

  // Initialize YouTube IFrame Audio Engine
  useEffect(() => {
    ytController.init('youtube-audio-engine', {
      onStateChange: (state: number, dur: number) => {
        if (playerModeRef.current !== 'youtube') return;
        if (state === 1) { // PLAYING
          setIsPlaying(true);
          if (dur > 0) setDuration(dur);
        } else if (state === 2) { // PAUSED
          setIsPlaying(false);
        }
      },
      onEnded: () => {
        if (playerModeRef.current !== 'youtube') return;
        setIsPlaying(false);
        handleNext();
      },
      onError: (err: any) => {
        console.warn('YouTube audio engine error:', err);
        const curr = currentTrackRef.current;
        if (curr?.id) {
          delete resolvedUrlsCacheRef.current[curr.id];
        }
        autoSkipUnplayableTrack();
      }
    });

    return () => {
      clearPlaybackWatchdog();
      ytController.destroy();
    };
  }, []);

  // Poll YouTube playback progress when in youtube mode
  useEffect(() => {
    if (playerMode !== 'youtube' || !isPlaying) return;
    const interval = setInterval(() => {
      const curr = ytController.getCurrentTime();
      const dur = ytController.getDuration();
      if (curr >= 0) {
        setProgress(curr);
        if (curr >= 1) {
          markTrackPlayableVerified();
        }
      }
      if (dur > 0) setDuration(dur);
    }, 250);

    return () => clearInterval(interval);
  }, [playerMode, isPlaying]);

  useEffect(() => {
    const favs = safeLocalStorageGet<Track[]>('blaze_favs_tracks', []);
    if (Array.isArray(favs)) {
      const sanitizedFavs = favs.filter(t => t && typeof t === 'object' && typeof t.id === 'string');
      setFavorites(sanitizedFavs);
    }
  }, []);

  const loadOfflineTracks = async (targetUser: User | null = userRef.current) => {
    try {
      const ownerKey = getAccountOwnerKey(targetUser);
      const maxLimit = targetUser ? 10 : 3;
      const tracks = await enforceOwnerLimitIndexedDB(ownerKey, maxLimit);
      offlineTracksRef.current = tracks;
      setOfflineTracks(tracks);
    } catch (err) {
      console.warn('Failed to load offline tracks', err);
    }
  };

  // Firebase Auth State Listener & Sign-Out Session Reset
  useEffect(() => {
    const cancelAllInFlightDownloads = () => {
      downloadAbortControllersRef.current.forEach((ctrl) => {
        try {
          ctrl.abort();
        } catch (_) {}
      });
      downloadAbortControllersRef.current.clear();
      activeDownloadsRef.current.clear();
      setIsDownloading(null);
    };

    const handleAuthReset = () => {
      cancelAllInFlightDownloads();
      setFavorites([]);
      setPlaylists([]);
      offlineTracksRef.current = [];
      setOfflineTracks([]);
      clearOwnerIndexedDB('guest').catch(() => {});
      setQuery('');
      setResults([]);
      fetchFeed('Trending Now', null, null, false, true);
    };
    window.addEventListener('sonic-auth-reset', handleAuthReset);

    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      userRef.current = currentUser;
      setUser(currentUser);
      if (currentUser) {
        setLimitPromptModal(null);
        try {
          const ownerKey = getAccountOwnerKey(currentUser);
          await migrateGuestDownloadsToUser(ownerKey, 10);
          await loadOfflineTracks(currentUser);
        } catch (_) {}
        try {
          const profile = await getUserProfile(currentUser.uid, currentUser.email);
          setUserProfile(profile);
        } catch (e) {
          console.warn('Error loading user profile:', e);
        }
      } else {
        setUserProfile(null);
        setPlaylists([]);
        safeLocalStorageSet('blaze_playlists', []);
        setFavorites(prev => {
          const capped = prev.slice(0, 3);
          safeLocalStorageSet('blaze_favs_tracks', capped);
          return capped;
        });
        await loadOfflineTracks(null);
      }
    });
    return () => {
      window.removeEventListener('sonic-auth-reset', handleAuthReset);
      unsubscribe();
    };
  }, []);

  // Real-time Firestore user preferences sync
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserMusicData(user.uid, (cloudData) => {
      if (cloudData) {
        if (cloudData.favorites && Array.isArray(cloudData.favorites)) {
          setFavorites(prev => {
            const cloudFavs = cloudData.favorites || [];
            const existingIds = new Set(cloudFavs.map(t => t.id));
            const merged = [...cloudFavs, ...prev.filter(t => !existingIds.has(t.id))];
            safeLocalStorageSet('blaze_favs_tracks', merged);
            return merged;
          });
        }
        if (cloudData.playlists && Array.isArray(cloudData.playlists)) {
          setPlaylists(cloudData.playlists);
          safeLocalStorageSet('blaze_playlists', cloudData.playlists);
        }
        if (cloudData.followedArtists && Array.isArray(cloudData.followedArtists)) {
          safeLocalStorageSet('blaze_followed_artists', cloudData.followedArtists);
          window.dispatchEvent(new CustomEvent('sonic-followed-updated'));
        }
        if (cloudData.recentSearches && Array.isArray(cloudData.recentSearches)) {
          safeLocalStorageSet('sonic_recent_searches_list', cloudData.recentSearches);
        }
        if (cloudData.themeColor) {
          setThemeColor(cloudData.themeColor);
          localStorage.setItem('blaze_theme_color', cloudData.themeColor);
        }
        if (typeof cloudData.darkMode === 'boolean') {
          setTheme(cloudData.darkMode ? 'dark' : 'light');
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Manual Firebase Sync Trigger
  const handleManualSync = async () => {
    if (!user) {
      showToast('Please sign in to sync with Firebase Cloud');
      return;
    }
    setIsCloudSyncing(true);
    try {
      await saveUserMusicData(user.uid, {
        favorites,
        playlists,
        followedArtists: safeLocalStorageGet<string[]>('blaze_followed_artists', []),
        recentSearches: safeLocalStorageGet<string[]>('sonic_recent_searches_list', []),
        themeColor,
        darkMode: theme === 'dark',
        updatedAt: new Date().toISOString()
      });
      showToast('Synchronized with Firebase Cloud!');
    } catch (err: any) {
      console.warn('Firebase sync error:', err);
      showToast('Sync error: ' + (err.message || 'Check connection'));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Automated background sync every 30 seconds when signed in
  useEffect(() => {
    if (!user) return;

    const autoSyncInterval = setInterval(async () => {
      try {
        await saveUserMusicData(user.uid, {
          favorites,
          playlists,
          followedArtists: safeLocalStorageGet<string[]>('blaze_followed_artists', []),
          recentSearches: safeLocalStorageGet<string[]>('sonic_recent_searches_list', []),
          themeColor,
          darkMode: theme === 'dark',
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Silent 30s auto-sync note:', err);
      }
    }, 30 * 1000);

    return () => clearInterval(autoSyncInterval);
  }, [user, favorites, playlists, themeColor, theme]);

  // 1-Hour Automated Check: Checks for newly released songs, trending hits, and fresh releases every 1 hour
  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const interval = setInterval(() => {
      console.log('Hourly auto-check: checking for newly released songs and updating feeds...');
      fetchFeed(activeFeedTab, selectedCategory, null, false, true);
      window.dispatchEvent(new CustomEvent('sonic:hourly-refresh'));
    }, ONE_HOUR_MS);

    return () => clearInterval(interval);
  }, [activeFeedTab, selectedCategory]);

  // Fetch YouTube Feed with Infinite Scroll support (150 limit for All Trending, Unlimited Infinite Scroll for all other sections)
  const fetchFeed = async (
    tab: string,
    cat: string | null,
    pageToken: string | null = null,
    isAppend: boolean = false,
    forceRefresh: boolean = false
  ) => {
    if (isAppend) {
      if (!pageToken || isLoadingMoreFeed) return;
      setIsLoadingMoreFeed(true);
    } else {
      setIsLoadingFeed(true);
    }

    try {
      const targetLimit = 40;
      let endpoint = `/api/feed?limit=${targetLimit}`;
      if (forceRefresh) {
        endpoint += `&refresh=true&_t=${Date.now()}`;
      }
      if (cat) {
        endpoint += `&category=${encodeURIComponent(cat)}`;
      } else {
        endpoint += `&tab=${tab === 'Popular' ? 'popular' : 'trending'}`;
      }
      if (pageToken) {
        endpoint += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      const data = await callApi(endpoint);
      const newTracks: Track[] = data.results || [];
      const currPageNum = parseInt(pageToken || '1', 10) || 1;
      let nextToken: string = data.nextPageToken || String(currPageNum + 1);

      if (isAppend) {
        let addedCount = 0;
        setFeedTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const existingKeys = new Set(prev.map(t => {
            const cleanTitle = (t.title || '').toLowerCase().replace(/\(official.*?\)/gi, '').replace(/[^a-z0-9]/g, '');
            const cleanArtist = (t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
            return `${cleanTitle}_${cleanArtist}`;
          }));

          const uniqueNew = newTracks.filter(t => {
            if (!t || !t.id || !t.title) return false;
            const cleanTitle = (t.title || '').toLowerCase().replace(/\(official.*?\)/gi, '').replace(/[^a-z0-9]/g, '');
            const cleanArtist = (t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
            const key = `${cleanTitle}_${cleanArtist}`;
            if (existingIds.has(t.id) || existingKeys.has(key)) return false;
            return true;
          });

          addedCount = uniqueNew.length;
          if (uniqueNew.length > 0) {
            return [...prev, ...uniqueNew];
          }
          return prev;
        });

        nextToken = String(currPageNum + 1);
        setFeedNextPageToken(nextToken);

        if (addedCount === 0 && currPageNum < 15) {
          setIsLoadingMoreFeed(false);
          fetchFeed(tab, cat, nextToken, true);
          return;
        }
      } else {
        if (newTracks.length > 0) {
          setFeedTracks(newTracks);
          if (!cat) {
            safeLocalStorageSet('sonic_cached_feed_tracks', newTracks.slice(0, 40));
          }
        }
        setFeedNextPageToken(nextToken);
      }
    } catch (err) {
      console.warn('Failed to fetch YouTube feed', err);
    } finally {
      if (isAppend) {
        setIsLoadingMoreFeed(false);
      } else {
        setIsLoadingFeed(false);
      }
    }
  };

  // Trigger feed load on category change or when viewing trending
  useEffect(() => {
    if (activeTab === 'trending' || selectedCategory) {
      fetchFeed('Trending Now', selectedCategory, null, false, true);
    }
  }, [activeTab, selectedCategory]);

  const handleRefreshTrending = (specificCategory?: string | null) => {
    const targetCategory = specificCategory !== undefined ? specificCategory : selectedCategory;
    fetchFeed('Trending Now', targetCategory, null, false, true);
    const chartLabel = targetCategory ? (targetCategory === 'All Trending' ? 'All Trending Chart' : `${targetCategory} Chart`) : 'Trending Charts';
    showToast(`Refreshed ${chartLabel} with live tracks`);
  };

  const handleLoadMoreFeed = () => {
    if (!isLoadingMoreFeed && !isLoadingFeed) {
      const pageToFetch = feedNextPageToken || String(Math.floor(feedTracks.length / 30) + 1);
      fetchFeed('Trending Now', selectedCategory, pageToFetch, true);
    }
  };

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
  };

  const toggleFavorite = (track: Track): boolean => {
    if (!track || !track.id || typeof track !== 'object') return false;
    const cleanTrack: Track = {
      id: String(track.id),
      title: String(track.title || 'Untitled Track'),
      artist: String(track.artist || 'Unknown Artist'),
      coverUrl: String(track.coverUrl || ''),
      duration: typeof track.duration === 'number' ? track.duration : 0,
      source: track.source ? String(track.source) : 'youtube',
      viewCount: typeof track.viewCount === 'number' ? track.viewCount : undefined,
      publishedAt: track.publishedAt ? String(track.publishedAt) : undefined,
      embedUrl: track.embedUrl ? String(track.embedUrl) : undefined,
    };
    const isFav = favorites.some(f => f.id === cleanTrack.id);

    // Enforce 3 liked songs limit when user is not signed in
    if (!isFav && !user && favorites.length >= 3) {
      triggerSignInPrompt(
        'Sign In Required',
        'You need to sign in to add more than 3 songs to Liked Songs.'
      );
      return false;
    }

    const newFavs = isFav ? favorites.filter(f => f.id !== cleanTrack.id) : [...favorites, cleanTrack];
    setFavorites(newFavs);
    safeLocalStorageSet('blaze_favs_tracks', newFavs);

    if (user) {
      saveUserMusicData(user.uid, {
        favorites: newFavs,
        playlists,
        themeColor,
        darkMode: theme === 'dark',
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('Auto cloud sync favs error:', err));
    }
    return true;
  };

  // Playlist Management Handlers
  const handleCreatePlaylist = (name: string, description?: string): string => {
    if (!user) {
      triggerSignInPrompt(
        'Sign In Required',
        'Please sign in to create a new playlist.'
      );
      return '';
    }
    const newId = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPl: Playlist = {
      id: newId,
      name: name.trim(),
      description: description?.trim() || '',
      tracks: [],
      createdAt: Date.now(),
    };
    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast(`Created playlist "${name}"`);
    return newId;
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast('Playlist deleted');
  };

  const handleRenamePlaylist = (playlistId: string, newName: string, description?: string) => {
    const updated = playlists.map(p => 
      p.id === playlistId 
        ? { ...p, name: newName.trim(), description: description !== undefined ? description.trim() : p.description, updatedAt: Date.now() } 
        : p
    );
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast('Playlist updated');
  };

  const handleAddToPlaylist = (playlistId: string, track: Track) => {
    if (!track) return;
    const cleanTrack: Track = {
      id: String(track.id),
      title: String(track.title || 'Untitled Track'),
      artist: String(track.artist || 'Unknown Artist'),
      coverUrl: String(track.coverUrl || ''),
      duration: typeof track.duration === 'number' ? track.duration : 0,
      source: track.source ? String(track.source) : 'youtube',
    };
    const targetPl = playlists.find(p => p.id === playlistId);
    const exists = targetPl?.tracks.some(t => t.id === cleanTrack.id);
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        const newTracks = exists 
          ? p.tracks.filter(t => t.id !== cleanTrack.id) 
          : [...p.tracks, cleanTrack];
        return { ...p, tracks: newTracks, updatedAt: Date.now() };
      }
      return p;
    });
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast(exists ? `Removed from "${targetPl?.name}"` : `Added to "${targetPl?.name}"`);
  };

  const handleCreatePlaylistAndAdd = (name: string, track: Track) => {
    if (!track) return;
    if (!user) {
      triggerSignInPrompt(
        'Sign In Required',
        'Please sign in to create a new playlist.'
      );
      return;
    }
    const cleanTrack: Track = {
      id: String(track.id),
      title: String(track.title || 'Untitled Track'),
      artist: String(track.artist || 'Unknown Artist'),
      coverUrl: String(track.coverUrl || ''),
      duration: typeof track.duration === 'number' ? track.duration : 0,
      source: track.source ? String(track.source) : 'youtube',
    };
    const newId = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPl: Playlist = {
      id: newId,
      name: name.trim(),
      tracks: [cleanTrack],
      createdAt: Date.now(),
    };
    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast(`Created "${name}" & added song`);
  };

  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: Date.now() };
      }
      return p;
    });
    setPlaylists(updated);
    safeLocalStorageSet('blaze_playlists', updated);
    if (user) {
      saveUserMusicData(user.uid, { favorites, playlists: updated });
    }
    showToast('Removed song from playlist');
  };

  const handlePlayNext = (track: Track) => {
    if (!track) return;
    const nextQueue = [...queue];
    nextQueue.splice(currentIndex + 1, 0, track);
    setQueue(nextQueue);
    showToast(`"${track.title}" will play next`);
  };

  const handleAddToQueue = (track: Track) => {
    if (!track) return;
    setQueue(prev => [...prev, track]);
    showToast(`Added "${track.title}" to queue`);
  };

  // Global Keyboard Shortcuts & Headphone / Media Key Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (isInput) return;

      if (e.code === 'MediaTrackNext' || e.key === 'MediaTrackNext') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'MediaTrackPrevious' || e.key === 'MediaTrackPrevious') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'MediaPlayPause' || e.key === 'MediaPlayPause' || e.code === 'MediaSelect') {
        e.preventDefault();
        const now = Date.now();
        if (now - lastHeadphoneTapTimeRef.current < 450) {
          headphoneTapCountRef.current += 1;
        } else {
          headphoneTapCountRef.current = 1;
        }
        lastHeadphoneTapTimeRef.current = now;

        if (headphoneTapTimerRef.current) {
          clearTimeout(headphoneTapTimerRef.current);
        }

        headphoneTapTimerRef.current = setTimeout(() => {
          if (headphoneTapCountRef.current === 2) {
            handleNext();
          } else if (headphoneTapCountRef.current >= 3) {
            handlePrev();
          } else {
            togglePlayPause();
          }
          headphoneTapCountRef.current = 0;
        }, 280);
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, progress + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, progress - 5));
      } else if (e.key === 'f' || e.key === 'F') {
        if (currentTrack) {
          e.preventDefault();
          const wasFav = favorites.some(f => f.id === currentTrack.id);
          const allowed = toggleFavorite(currentTrack);
          if (allowed) {
            showToast(wasFav ? 'Removed from favorites' : 'Added to favorites');
          }
        }
      } else if (e.key === 'Escape') {
        if (showPlayerOverlay) setShowPlayerOverlay(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isSidebarOpen) setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, duration, progress, isPlaying, showPlayerOverlay, isSettingsOpen, isSidebarOpen, favorites]);

  const handleDeleteOfflineTrack = async (id: string) => {
    try {
      const ownerKey = getAccountOwnerKey(userRef.current);
      await deleteFromIndexedDB(id, ownerKey);
      await loadOfflineTracks(userRef.current);
      showToast('Track removed from offline downloads');
    } catch (err) {
      console.warn('Failed to delete offline track', err);
    }
  };

  const handleClearCache = async () => {
    try {
      const ownerKey = getAccountOwnerKey(userRef.current);
      await clearOwnerIndexedDB(ownerKey);
      await loadOfflineTracks(userRef.current);
      showToast('Offline downloads cache cleared');
    } catch (err) {
      console.warn('Failed to clear cache', err);
    }
  };

  useEffect(() => {
    applyThemeVariables(themeColor, theme === 'dark');
    localStorage.setItem('blaze_theme_color', themeColor);
    localStorage.setItem('blaze_theme_mode', theme);
  }, [themeColor, theme]);

  // Debounced Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await callApi(`/api/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.warn('Failed to fetch suggestions', err);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery !== undefined ? overrideQuery : query;
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSuggestions([]);
    
    try {
      const data = await callApi(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(data.results || []);
    } catch (err) {
      console.warn('Search failed', err);
      showToast('Search encountered a problem. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Safe playback helper: await play promise and handle interruptions cleanly
  const safePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioKeepAlive();
    try {
      const promise = audio.play();
      playPromiseRef.current = promise;
      await promise;
    } catch (err: any) {
      // DOMException: The play() request was interrupted by a new load request or pause
      if (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause')) {
        return;
      }
      console.warn('Playback request handled:', err);
    } finally {
      playPromiseRef.current = null;
    }
  };

  // Safe pause helper: pauses html5 audio synchronously without blocking
  const safePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.pause();
    } catch (_) {}
    playPromiseRef.current = null;
  };

  // Inaudible audio carrier keeps Android/iOS audio session active in background when YouTube is playing
  const SILENT_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  const startSilentAudioCarrier = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      ensureAudioKeepAlive();
      if (audio.src !== SILENT_AUDIO_DATA_URI) {
        audio.src = SILENT_AUDIO_DATA_URI;
      }
      audio.loop = true;
      audio.volume = 0.0001; // Ultra-low sub-audible carrier holds active Android AudioTrack session
      audio.play().catch(() => {});
    } catch (_) {}
  };

  const switchToYouTubePlayer = async (videoId: string, track: Track) => {
    playerModeRef.current = 'youtube';
    setPlayerMode('youtube');
    startSilentAudioCarrier();

    let targetId = videoId;
    if (!targetId || targetId.length !== 11 || targetId.includes('_') || targetId.startsWith('dynamic-')) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(`${track.artist || ''} ${track.title || ''} song`)}&source=youtube`);
        if (res.ok) {
          const data = await res.json();
          const first = data.results?.[0];
          if (first?.id && first.id.length === 11) {
            targetId = first.id;
          }
        }
      } catch (_) {}
    }

    ytController.loadAndPlay(targetId);
    setIsPlaying(true);
    setupMediaSession(track);
  };

  // Safe audio loader: gracefully handles transitioning from previous media to new URL
  const loadAndPlaySource = async (src: string, track: Track, requestId: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check if another song was selected during resolution
    if (requestId !== activeRequestIdRef.current) return;

    ensureAudioKeepAlive();
    audio.src = src;
    setupMediaSession(track);

    try {
      await safePlay();
    } catch (err) {
      console.warn('Audio playback error, trying proxy stream:', err);
      if (!src.includes('/api/proxy-audio') && src.startsWith('http')) {
        audio.src = `/api/proxy-audio?url=${encodeURIComponent(src)}`;
        try {
          await safePlay();
        } catch (_) {
          if (track.id) {
            playerModeRef.current = 'youtube';
            setPlayerMode('youtube');
            ytController.loadAndPlay(track.id);
            setIsPlaying(true);
          }
        }
      } else if (track.id) {
        playerModeRef.current = 'youtube';
        setPlayerMode('youtube');
        ytController.loadAndPlay(track.id);
        setIsPlaying(true);
      }
    }
  };

  // Silent background watchdog bot: verifies song moves from 0:00 to 0:01 within 10s, else auto-skips to next song
  const startPlaybackWatchdog = (track: Track, requestId: number) => {
    clearPlaybackWatchdog();
    trackPlayableVerifiedRef.current = false;
    userPausedManuallyRef.current = false;

    // Mid-window silent stream recovery attempt at 4.5s if still stuck at 0:00
    watchdogRecoveryRef.current = setTimeout(() => {
      if (requestId !== activeRequestIdRef.current) return;
      if (trackPlayableVerifiedRef.current || userPausedManuallyRef.current) return;

      const audio = audioRef.current;
      const currentAudioTime = playerModeRef.current === 'youtube'
        ? ytController.getCurrentTime()
        : (audio ? audio.currentTime : 0);

      if (currentAudioTime >= 1) {
        markTrackPlayableVerified();
        return;
      }

      // If HTML5 stream is stuck at 0:00 and we have a valid YouTube ID, silently switch engine
      if (playerModeRef.current === 'html5' && track?.id && track.id.length === 11 && !track.id.startsWith('dynamic-')) {
        delete resolvedUrlsCacheRef.current[track.id];
        safePause();
        playerModeRef.current = 'youtube';
        setPlayerMode('youtube');
        ytController.loadAndPlay(track.id);
        setIsPlaying(true);
      }
    }, 4500);

    // 10-second strict playability check: if track never reached 0:01 (1 second), auto-switch to next song silently
    watchdogTimeoutRef.current = setTimeout(() => {
      if (requestId !== activeRequestIdRef.current) return;
      if (trackPlayableVerifiedRef.current || userPausedManuallyRef.current) return;

      const audio = audioRef.current;
      const currentAudioTime = playerModeRef.current === 'youtube'
        ? ytController.getCurrentTime()
        : (audio ? audio.currentTime : 0);

      if (currentAudioTime >= 1) {
        markTrackPlayableVerified();
        return;
      }

      // If phone screen is closed / app in background and audio is actively playing or buffering, do not falsely skip
      if (document.hidden && audio && (!audio.paused || audio.readyState >= 2 || audio.currentTime > 0)) {
        markTrackPlayableVerified();
        return;
      }

      if (track?.id) {
        delete resolvedUrlsCacheRef.current[track.id];
      }

      autoSkipUnplayableTrack();
    }, 10000);
  };

  const autoSkipUnplayableTrack = async () => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;

    if (isShuffleRef.current && q.length > 1) {
      let nextIdx = Math.floor(Math.random() * q.length);
      if (nextIdx === idx) {
        nextIdx = (idx + 1) % q.length;
      }
      playFromQueue(nextIdx);
      return;
    }

    if (idx < q.length - 1) {
      playFromQueue(idx + 1);
      return;
    }

    // If at end of queue or single-song queue, try extending from artist or fallback to feedTracks
    const curr = currentTrackRef.current;
    if (curr && curr.artist) {
      try {
        const res = await fetch(`/api/artist-all-songs?name=${encodeURIComponent(curr.artist)}&page=2&limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (data.songs && Array.isArray(data.songs) && data.songs.length > 0) {
            const existingIds = new Set(q.map(t => t.id));
            const freshSongs = data.songs.filter((t: Track) => t && t.id && !existingIds.has(t.id));
            if (freshSongs.length > 0) {
              const nextQueue = [...q, ...freshSongs];
              queueRef.current = nextQueue;
              setQueue(nextQueue);
              playTrack(freshSongs[0], idx + 1, nextQueue);
              return;
            }
          }
        }
      } catch (_) {}
    }

    if (q.length > 1) {
      playFromQueue(0);
      return;
    }

    const fallbackPool = feedTracksRef.current.filter(t => t && t.id && t.id !== curr?.id);
    if (fallbackPool.length > 0) {
      const nextQueue = [...q, ...fallbackPool];
      queueRef.current = nextQueue;
      setQueue(nextQueue);
      playTrack(fallbackPool[0], q.length, nextQueue);
    }
  };

  const playTrack = async (track: Track, index: number, sourceList: Track[]) => {
    const requestId = ++activeRequestIdRef.current;

    // Clean up previous blob URL if any
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    // Safely pause currently playing media immediately across engines (synchronous for 0ms transition)
    safePause();
    ytController.pause();

    setCurrentTrack(track);
    setQueue(sourceList);
    setCurrentIndex(index);
    setIsPlaying(false);
    setProgress(0);
    if (track.duration && track.duration > 0) {
      setDuration(track.duration);
    }
    setShowPlayerOverlay(true);

    // Arm the 10-second silent background playability watchdog bot
    startPlaybackWatchdog(track, requestId);

    // If stream URL is already pre-resolved in background, play instantly and synchronously to prevent mobile autoplay blocks
    if (resolvedUrlsCacheRef.current[track.id]) {
      const cachedUrl = resolvedUrlsCacheRef.current[track.id];
      playerModeRef.current = 'html5';
      setPlayerMode('html5');
      ytController.pause();
      await loadAndPlaySource(cachedUrl, track, requestId);
      setTimeout(preResolveNextTrack, 1500);
      return;
    }

    try {
      const endpoint = `/api/resolve?source=${encodeURIComponent(track.source || 'youtube')}&id=${encodeURIComponent(track.id)}&title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}`;
      let data: any = null;
      try {
        data = await callApi(endpoint);
      } catch (callErr) {
        console.warn('API resolve fetch failed, using YouTube fallback:', callErr);
      }

      // Discard stale response if another track was requested while fetching
      if (requestId !== activeRequestIdRef.current) return;

      if (data && data.url) {
        resolvedUrlsCacheRef.current[track.id] = data.url;
        playerModeRef.current = 'html5';
        setPlayerMode('html5');
        ytController.pause();
        await loadAndPlaySource(data.url, track, requestId);
        setTimeout(preResolveNextTrack, 1500);
      } else if (data && (data.isYouTube || data.embedUrl)) {
        switchToYouTubePlayer(data.id || track.id, track);
      } else {
        // Fallback to YouTube engine directly
        switchToYouTubePlayer(track.id, track);
      }
    } catch (err: any) {
      if (requestId !== activeRequestIdRef.current) return;
      console.warn('Handling play error gracefully with YouTube fallback:', err);
      if (track.id) {
        switchToYouTubePlayer(track.id, track);
      }
    }
  };

  const playOfflineTrack = async (savedTrack: SavedTrack, index: number, sourceList: SavedTrack[]) => {
    const requestId = ++activeRequestIdRef.current;

    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    playerModeRef.current = 'html5';
    setPlayerMode('html5');
    ytController.pause();
    safePause();

    setCurrentTrack(savedTrack);
    setQueue(sourceList);
    setCurrentIndex(index);
    setIsPlaying(false);
    setProgress(0);
    setShowPlayerOverlay(true);

    startPlaybackWatchdog(savedTrack as unknown as Track, requestId);

    const objectUrl = URL.createObjectURL(savedTrack.audioBlob);
    currentBlobUrlRef.current = objectUrl;

    if (requestId !== activeRequestIdRef.current) {
      URL.revokeObjectURL(objectUrl);
      return;
    }

    await loadAndPlaySource(objectUrl, savedTrack as unknown as Track, requestId);
  };

  const playFromQueue = (index: number) => {
    const q = queueRef.current;
    const track = q[index];
    if (!track) return;
    if (track.audioBlob) {
      playOfflineTrack(track, index, q);
    } else {
      playTrack(track, index, q);
    }
  };

  const setupMediaSession = (track: Track) => {
    if ('mediaSession' in navigator) {
      try {
        const artworkUrl =
          track.coverUrl && track.coverUrl.startsWith('http')
            ? track.coverUrl
            : `${window.location.origin}/pwa-512x512.png`;
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Unknown Artist',
          album: 'Sonic Boomz',
          artwork: [
            { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
            { src: `${window.location.origin}/pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${window.location.origin}/pwa-512x512.png`, sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch (_) {}

      try {
        const handleHeadphoneActionTap = (action: 'play' | 'pause') => {
          const now = Date.now();
          if (now - lastHeadphoneTapTimeRef.current < 450) {
            headphoneTapCountRef.current += 1;
          } else {
            headphoneTapCountRef.current = 1;
          }
          lastHeadphoneTapTimeRef.current = now;

          if (headphoneTapTimerRef.current) {
            clearTimeout(headphoneTapTimerRef.current);
          }

          headphoneTapTimerRef.current = setTimeout(() => {
            const count = headphoneTapCountRef.current;
            headphoneTapCountRef.current = 0;
            if (count === 2) {
              // 2 taps: Skip to next track
              handleNext();
            } else if (count >= 3) {
              // 3 taps: Skip to previous track
              handlePrev();
            } else {
              // 1 tap: Play / Pause toggle
              if (action === 'play') {
                if (playerModeRef.current === 'youtube') {
                  ytController.play();
                  setIsPlaying(true);
                } else {
                  safePlay();
                }
              } else {
                if (playerModeRef.current === 'youtube') {
                  ytController.pause();
                  setIsPlaying(false);
                } else {
                  safePause();
                }
              }
            }
          }, 280);
        };

        navigator.mediaSession.setActionHandler('play', () => handleHeadphoneActionTap('play'));
        navigator.mediaSession.setActionHandler('pause', () => handleHeadphoneActionTap('pause'));
        navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
        navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime != null) {
            handleSeek(details.seekTime);
          }
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skip = details.seekOffset || 10;
          const cur = playerModeRef.current === 'youtube' ? ytController.getCurrentTime() : (audioRef.current?.currentTime || 0);
          handleSeek(cur + skip);
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skip = details.seekOffset || 10;
          const cur = playerModeRef.current === 'youtube' ? ytController.getCurrentTime() : (audioRef.current?.currentTime || 0);
          handleSeek(Math.max(0, cur - skip));
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          safePause();
          ytController.pause();
          setIsPlaying(false);
        });
      } catch (_) {}
    }
  };

  const downloadTrack = async (track: Track) => {
    if (!track || !track.id) return;

    if (activeDownloadsRef.current.has(track.id)) {
      showToast(`Already downloading "${track.title}"...`);
      return;
    }

    const currentUser = userRef.current;
    const maxLimit = currentUser ? 10 : 3;
    const alreadyDownloaded = offlineTracksRef.current.some(t => t.id === track.id);

    if (alreadyDownloaded) {
      showToast(`"${track.title}" is already in your Downloads.`);
      return;
    }

    // Synchronously count both already-saved tracks AND any currently in-flight downloads
    const committedAndPendingCount = new Set([
      ...offlineTracksRef.current.map(t => t.id),
      ...Array.from(activeDownloadsRef.current),
    ]).size;

    if (committedAndPendingCount >= maxLimit) {
      if (!currentUser) {
        triggerSignInPrompt(
          'Sign In Required',
          'You need to sign in to download more than 3 songs.'
        );
      } else {
        setLimitPromptModal({
          title: 'Download Limit Reached',
          message: 'You can only download up to 10 songs per account. Remove a song from Downloads to add a new one.',
          type: 'limit',
        });
      }
      return;
    }

    // Reserve slot synchronously BEFORE awaiting any network request so rapid taps on songs 1, 2, 3, 4 cannot bypass the limit
    activeDownloadsRef.current.add(track.id);
    const abortController = new AbortController();
    downloadAbortControllersRef.current.set(track.id, abortController);
    setIsDownloading(track.id);

    try {
      const ownerKeyAtStart = getAccountOwnerKey(currentUser);
      const dbTracks = await getAllFromIndexedDB(ownerKeyAtStart);
      const dbAndPendingCount = new Set([
        ...dbTracks.map(t => t.id),
        ...Array.from(activeDownloadsRef.current),
      ]).size;

      // Note: track.id is already in activeDownloadsRef, so dbAndPendingCount > maxLimit means limit was exceeded
      if (dbTracks.length >= maxLimit || dbAndPendingCount > maxLimit) {
        if (!userRef.current) {
          triggerSignInPrompt(
            'Sign In Required',
            'You need to sign in to download more than 3 songs.'
          );
        } else {
          setLimitPromptModal({
            title: 'Download Limit Reached',
            message: 'You can only download up to 10 songs per account. Remove a song from Downloads to add a new one.',
            type: 'limit',
          });
        }
        return;
      }

      showToast(`Downloading "${track.title}" for offline play...`);

      // 1. First try the dedicated /api/download endpoint that proxies binary stream with CORS headers
      const downloadEndpoint = `/api/download?id=${encodeURIComponent(track.id)}&source=${encodeURIComponent(track.source || 'jiosaavn')}&title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}`;
      const response = await fetch(downloadEndpoint, { signal: abortController.signal });

      let audioBlob: Blob | null = null;
      if (response.ok) {
        audioBlob = await response.blob();
      }

      // 2. Fallback to /api/resolve + /api/proxy-audio if direct download failed
      if (!audioBlob || audioBlob.size < 1000) {
        const resolveEndpoint = `/api/resolve?source=${encodeURIComponent(track.source || 'jiosaavn')}&id=${encodeURIComponent(track.id)}&title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}`;
        const data = await callApi(resolveEndpoint, { signal: abortController.signal });
        if (data?.url) {
          const proxyEndpoint = `/api/proxy-audio?url=${encodeURIComponent(data.url)}`;
          const proxyRes = await fetch(proxyEndpoint, { signal: abortController.signal });
          if (proxyRes.ok) {
            audioBlob = await proxyRes.blob();
          } else {
            const streamEndpoint = `/api/proxy-stream?url=${encodeURIComponent(data.url)}`;
            const streamRes = await fetch(streamEndpoint, { signal: abortController.signal });
            if (streamRes.ok) {
              audioBlob = await streamRes.blob();
            }
          }
        }
      }

      if (!audioBlob || audioBlob.size < 1000) {
        showToast('Could not download audio stream for this song.');
        return;
      }

      if (abortController.signal.aborted) return;

      const targetUserNow = userRef.current;
      const ownerKeyNow = getAccountOwnerKey(targetUserNow);
      const limitNow = targetUserNow ? 10 : 3;

      const saved = await saveToIndexedDB(
        {
          id: track.id,
          title: track.title,
          artist: track.artist,
          coverUrl: track.coverUrl,
          audioBlob,
          downloadedAt: Date.now(),
        },
        ownerKeyNow,
        limitNow
      );
      await loadOfflineTracks(targetUserNow);

      if (!saved) {
        if (!targetUserNow) {
          triggerSignInPrompt(
            'Sign In Required',
            'You need to sign in to download more than 3 songs.'
          );
        } else {
          setLimitPromptModal({
            title: 'Download Limit Reached',
            message: 'You can only download up to 10 songs per account. Remove a song from Downloads to add a new one.',
            type: 'limit',
          });
        }
        return;
      }

      showToast(`Downloaded "${track.title}" for offline play!`);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.warn('Download note:', err);
      showToast('Could not download audio stream for offline use.');
    } finally {
      activeDownloadsRef.current.delete(track.id);
      downloadAbortControllersRef.current.delete(track.id);
      const nextActive = Array.from(activeDownloadsRef.current)[0] || null;
      setIsDownloading(nextActive);
    }
  };

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (playerModeRef.current === 'html5') {
        const current = audio.currentTime;
        setProgress(current);
        if (current >= 1) {
          markTrackPlayableVerified();
        }
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && isFinite(current)) {
              navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: 1,
                position: Math.min(Math.max(0, current), audio.duration)
              });
            }
          } catch (_) {}
        }
      }
    };
    const updateDuration = () => {
      if (playerModeRef.current === 'html5' && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onPlay = () => {
      if (playerModeRef.current === 'html5') {
        setIsPlaying(true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        requestWakeLock();
      }
    };
    const onPause = () => {
      if (playerModeRef.current === 'html5') {
        setIsPlaying(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        releaseWakeLock();
      }
    };

    const onEnded = () => {
      if (playerModeRef.current !== 'html5') return;
      setIsPlaying(false);
      handleNext();
    };

    const onError = () => {
      if (playerModeRef.current !== 'html5') return;
      const a = audioRef.current;
      if (!a) return;
      const rawSrc = a.getAttribute('src');
      if (!rawSrc || rawSrc === '' || rawSrc === window.location.href) return;
      console.warn('Audio playback error on HTML5 element:', rawSrc);
      // Auto fallback to /api/proxy-audio if direct CDN failed (e.g. mobile CORS or network restriction)
      if (!rawSrc.includes('/api/proxy-audio') && rawSrc.startsWith('http')) {
        console.log('Switching to proxy audio stream...');
        a.src = `/api/proxy-audio?url=${encodeURIComponent(rawSrc)}`;
        a.load();
        safePlay().catch(() => {});
      } else {
        const activeTrack = currentTrackRef.current;
        if (activeTrack?.id && activeTrack.id.length === 11 && !activeTrack.id.startsWith('dynamic-')) {
          delete resolvedUrlsCacheRef.current[activeTrack.id];
          safePause();
          playerModeRef.current = 'youtube';
          setPlayerMode('youtube');
          ytController.loadAndPlay(activeTrack.id);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlayPause = async () => {
    if (!currentTrack) return;
    if (playerMode === 'youtube') {
      if (isPlaying) {
        userPausedManuallyRef.current = true;
        safePause();
        ytController.pause();
        setIsPlaying(false);
      } else {
        userPausedManuallyRef.current = false;
        startSilentAudioCarrier();
        ytController.play();
        setIsPlaying(true);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      userPausedManuallyRef.current = true;
      safePause();
    } else {
      userPausedManuallyRef.current = false;
      await safePlay();
    }
  };

  const handleSeek = (time: number) => {
    setProgress(time);
    if (playerMode === 'youtube') {
      ytController.seekTo(time);
      ytController.play();
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
      safePlay().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNext = async () => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (repeatMode === 2) {
       if (playerModeRef.current === 'youtube') {
         ytController.seekTo(0);
         ytController.play();
       } else if (audioRef.current) {
         audioRef.current.currentTime = 0;
       }
       if (!isPlaying) togglePlayPause();
       return;
    }
    if (isShuffle && q.length > 0) {
       playFromQueue(Math.floor(Math.random() * q.length));
       return;
    }
    if (idx < q.length - 1) {
       playFromQueue(idx + 1);
    } else {
      // Reached the end of queue: if currentTrack has an artist, dynamically fetch more songs and append to queue
      if (currentTrack && currentTrack.artist) {
        try {
          const artistName = currentTrack.artist;
          const res = await fetch(`/api/artist-all-songs?name=${encodeURIComponent(artistName)}&page=2&limit=30`);
          if (res.ok) {
            const data = await res.json();
            if (data.songs && Array.isArray(data.songs) && data.songs.length > 0) {
              const existingIds = new Set(q.map(t => t.id));
              const freshSongs = data.songs.filter((t: Track) => !existingIds.has(t.id));
              if (freshSongs.length > 0) {
                const nextQueue = [...q, ...freshSongs];
                setQueue(nextQueue);
                playFromQueue(idx + 1);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('Failed to auto-extend queue:', err);
        }
      }
      if (repeatMode === 1 && q.length > 0) {
        playFromQueue(0);
      }
    }
  };

  const handlePrev = () => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (progress > 3) {
       if (playerModeRef.current === 'youtube') {
         ytController.seekTo(0);
       } else if (audioRef.current) {
         audioRef.current.currentTime = 0;
       }
       setProgress(0);
       return;
    }
    if (idx > 0) {
       playFromQueue(idx - 1);
    } else if (repeatMode === 1 && q.length > 0) {
       playFromQueue(q.length - 1);
    }
  };

  return (
    <div className={`h-screen h-[100dvh] w-screen overflow-hidden flex flex-col font-sans transition-colors duration-300 relative z-0 ${theme === 'dark' ? 'bg-[#0e0f1c] text-white' : 'bg-gray-50 text-gray-900'}`} style={{ '--theme-color': themeColor } as any}>
      
      {/* Animated Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
           animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }} 
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-20' : 'opacity-10'}`}
           style={{ background: 'var(--theme-color)' }}
        />
        <motion.div 
           animate={{ x: [0, -150, 0], y: [0, 150, 0], scale: [1, 1.5, 1] }} 
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-[0.15]' : 'opacity-5'}`}
           style={{ background: 'var(--theme-color)' }}
        />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleThemeMode}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        cachedTracksCount={offlineTracks.length}
        favoritesCount={favorites.length}
        playlistsCount={playlists.length + 1}
        onClearCache={handleClearCache}
        user={user}
        userProfile={userProfile}
        onManualSync={handleManualSync}
        isSyncing={isCloudSyncing}
        showToast={showToast}
        onOpenFullAuth={() => setIsAuthPageOpen(true)}
      />

      <AuthPage 
        isOpen={isAuthPageOpen}
        onClose={() => setIsAuthPageOpen(false)}
        user={user}
        userProfile={userProfile}
        theme={theme}
        toggleTheme={toggleThemeMode}
        themeColor={themeColor}
        onManualSync={handleManualSync}
        isSyncing={isCloudSyncing}
        showToast={showToast}
        onClearCache={handleClearCache}
        cachedTracksCount={offlineTracks.length}
        favoritesCount={favorites.length}
        playlistsCount={playlists.length + 1}
      />

      {/* Sign-In Required / Download Limit Prompt Modal */}
      {limitPromptModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl text-center space-y-4 ${
            theme === 'dark' ? 'bg-[#141522] border-white/10 text-white' : 'bg-white border-black/10 text-gray-900'
          }`}>
            <div className="flex justify-end -mt-2 -mr-2">
              <button
                onClick={() => setLimitPromptModal(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto -mt-4 ${
              limitPromptModal.type === 'signin'
                ? 'bg-[var(--theme-color)]/15 text-[var(--theme-color)]'
                : 'bg-red-500/15 text-red-500'
            }`}>
              {limitPromptModal.type === 'signin' ? <LogIn size={22} /> : <AlertCircle size={22} />}
            </div>
            <h3 className="text-lg font-black tracking-tight">{limitPromptModal.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {limitPromptModal.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLimitPromptModal(null)}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/15 text-gray-300' : 'bg-black/5 hover:bg-black/10 text-gray-700'
                }`}
              >
                {limitPromptModal.type === 'signin' ? 'Not Now' : 'Close'}
              </button>
              {limitPromptModal.type === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setLimitPromptModal(null);
                    setShowPlayerOverlay(false);
                    setIsAuthPageOpen(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Left Sidebar + Right Scrollable Views */}
      <div className="flex-1 flex flex-row min-h-0 w-full overflow-hidden relative">
        {/* Permanent Desktop Navigation Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          themeColor={themeColor}
          user={user}
          userProfile={userProfile}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthPageOpen(true)}
          playlistsCount={playlists.length}
          favoritesCount={favorites.length}
          downloadsCount={offlineTracks.length}
          theme={theme}
          toggleTheme={toggleThemeMode}
        />

        {/* Mobile Drawer Sidebar */}
        <div className="md:hidden">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            activeTab={activeTab}
            onSelectTab={handleTabChange}
            themeColor={themeColor}
            user={user}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <main 
            onTouchStart={handleMainTouchStart}
            onTouchEnd={handleMainTouchEnd}
            className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden relative"
          >
          <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
            <motion.div
              key={activeTab}
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection === 'left' ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="flex-1 flex flex-col w-full h-full min-h-0 overflow-hidden"
            >
            {activeTab === 'home' && (
              <HomeView 
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onPlayTrack={playTrack}
                onToggleFavorite={toggleFavorite}
                onDownloadTrack={downloadTrack}
                favorites={favorites}
                offlineTracks={offlineTracks}
                isDownloading={isDownloading}
                onNavigateToTrending={() => handleTabChange('trending')}
                onNavigateToArtists={() => {
                  setSelectedArtistName(null);
                  handleTabChange('artists');
                }}
                onSelectArtist={navigateToArtist}
                query={query}
                setQuery={setQuery}
                onSearch={handleSearch}
                isSearching={isSearching}
                suggestions={suggestions}
                results={results}
                user={user}
                theme={theme}
                toggleTheme={toggleThemeMode}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                showToast={showToast}
              />
            )}

            {activeTab === 'trending' && (
              <TrendingView 
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                feedTracks={feedTracks}
                isLoadingFeed={isLoadingFeed}
                isLoadingMoreFeed={isLoadingMoreFeed}
                hasMoreFeed={true}
                onLoadMoreFeed={handleLoadMoreFeed}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onRefreshFeed={handleRefreshTrending}
                onPlayTrack={playTrack}
                onToggleFavorite={toggleFavorite}
                onDownloadTrack={downloadTrack}
                favorites={favorites}
                isDownloading={isDownloading}
                onSelectArtist={navigateToArtist}
              />
            )}

            {activeTab === 'artists' && (
              <ArtistsView 
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onPlayTrack={playTrack}
                onToggleFavorite={toggleFavorite}
                onDownloadTrack={downloadTrack}
                favorites={favorites}
                isDownloading={isDownloading}
                initialArtistName={selectedArtistName}
                currentTrack={queue[currentIndex] || null}
                isPlaying={isPlaying}
                showToast={showToast}
              />
            )}

            {activeTab === 'playlists' && (
              <PlaylistsView 
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                favorites={favorites}
                playlists={playlists}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onRenamePlaylist={handleRenamePlaylist}
                onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
                onPlayTrack={playTrack}
                onToggleFavorite={toggleFavorite}
                onDownloadTrack={downloadTrack}
                onNavigateHome={() => handleTabChange('home')}
                isDownloading={isDownloading}
                onSelectArtist={navigateToArtist}
                isAuthenticated={!!user}
                onRequireSignIn={() =>
                  triggerSignInPrompt(
                    'Sign In Required',
                    'Please sign in to create a new playlist.'
                  )
                }
              />
            )}

            {activeTab === 'downloads' && (
              <DownloadsView 
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                offlineTracks={offlineTracks}
                onPlayOfflineTrack={playOfflineTrack}
                onDeleteOfflineTrack={handleDeleteOfflineTrack}
                onNavigateHome={() => handleTabChange('home')}
                onSelectArtist={navigateToArtist}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
      </div>

      {/* Mobile Mini Player Bar (Positioned immediately above Bottom Navigation on phones) */}
      {currentTrack && (
        <div 
          className="md:hidden fixed bottom-[calc(56px+max(env(safe-area-inset-bottom,0px),10px))] left-2.5 right-2.5 max-w-xl mx-auto z-40 cursor-pointer"
          onClick={() => setShowPlayerOverlay(true)}
        >
          <div className={`flex items-center gap-3 p-2.5 pr-4 rounded-2xl backdrop-blur-2xl shadow-2xl border transition-all ${
            theme === 'dark' 
              ? 'bg-[#151624]/95 border-white/10 text-white' 
              : 'bg-white/95 border-black/10 text-gray-900 shadow-slate-300'
          }`}>
            <div className="relative shrink-0">
              <img 
                src={optimizeImage(currentTrack.coverUrl, { width: 100, quality: 80 })} 
                alt={currentTrack.title} 
                className={`w-11 h-11 rounded-xl object-cover shadow-sm ${isPlaying ? 'scale-105' : ''} transition-transform`} 
                onError={(e) => applyAppLogoFallback(e, currentTrack)}
                onLoad={(e) => applyAppLogoFallback(e, currentTrack)}
              />
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--theme-color)] border-2 border-white dark:border-[#151624] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden min-w-0 pointer-events-none select-none">
              <div className="font-bold text-xs sm:text-sm truncate">{currentTrack.title}</div>
              <div className="text-[11px] truncate text-gray-400 font-medium block max-w-full">
                {currentTrack.artist}
              </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
              className="p-2.5 hover:opacity-95 active:scale-95 rounded-full transition-all shadow-md shrink-0 border border-black/10 dark:border-white/20"
              style={{
                backgroundColor: themeColor,
                color: themeColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Bottom Player Bar */}
      <DesktopPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        volume={volume}
        isMuted={isMuted}
        isFavorite={currentTrack ? favorites.some(f => f.id === currentTrack.id) : false}
        isDownloading={isDownloading === currentTrack?.id}
        themeColor={themeColor}
        onPlayPause={togglePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setRepeatMode(r => (r + 1) % 3 as 0 | 1 | 2)}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
        onDownload={() => currentTrack && downloadTrack(currentTrack)}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onOpenOverlay={() => setShowPlayerOverlay(true)}
        onSelectArtist={navigateToArtist}
      />

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav 
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        playlistsCount={playlists.length + (favorites.length > 0 ? 1 : 0)}
        favoritesCount={favorites.length}
        downloadsCount={offlineTracks.length}
      />

      {/* Full Screen Player with Smooth Spring Animations */}
      <AnimatePresence>
        {showPlayerOverlay && (
          <PlayerOverlay 
            queue={queue}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            favorites={favorites}
            playlists={playlists}
            onPlayPause={togglePlayPause}
            onClose={() => setShowPlayerOverlay(false)}
            onSeek={handleSeek}
            onNext={handleNext}
            onPrev={handlePrev}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            onToggleRepeat={() => setRepeatMode(r => (r + 1) % 3 as 0 | 1 | 2)}
            onToggleFavorite={toggleFavorite}
            onPlayIndex={playFromQueue}
            onSelectArtist={navigateToArtist}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddToQueue}
            onDownloadTrack={downloadTrack}
            isDownloading={isDownloading}
            isAuthenticated={!!user}
            onRequireSignIn={() =>
              triggerSignInPrompt(
                'Sign In Required',
                'Please sign in to create a new playlist.'
              )
            }
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 dark:border-black/10 animate-fade-in pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* App Launch Splash & Loading Screen */}
      <AppLaunchLoadingScreen 
        onFinish={() => setIsLoadingFeed(false)}
        onOpenInstall={() => setIsInstallModalOpen(true)} 
      />

      {/* Dedicated Animated Install App Modal / Loading Page */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        themeColor={themeColor}
      />

      {/* Hidden Audio Element (HTML5) */}
      <audio ref={audioRef} preload="auto" playsInline crossOrigin="anonymous" />
    </div>
  );
}
