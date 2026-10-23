import { CloudflareEnv } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { CURATED_POPULAR_TRACKS, searchJioSaavn, searchItunes, fetchLiveAlbums } from '../_lib/musicSources';
import { ARTISTS_DATABASE } from '../_lib/artistsCatalog';

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request } = context;
  const url = new URL(request.url);
  const isRefresh = url.searchParams.get('refresh') === 'true';

  // High-yield parallel queries across key genres
  const [popHindi, popPunjabi, popGlobal, popAlbums] = await Promise.allSettled([
    searchJioSaavn('top bollywood hits 2026 arijit singh vishal mishra', 18, 1),
    searchJioSaavn('top punjabi hits 2026 karan aujla diljit dosanjh', 18, 1),
    searchItunes('top hits 2026 the weeknd billie eilish sabrina carpenter', 18),
    fetchLiveAlbums('2026 new hit album', 14, 1)
  ]);

  const hindiTracks = popHindi.status === 'fulfilled' && popHindi.value.length > 0 
    ? popHindi.value 
    : CURATED_POPULAR_TRACKS.filter(t => t.id === 'k3g_WjLCsXM' || t.id === 'VAdGW7QDJUI' || t.id === '_XbvH79U3bQ');

  const punjabiTracks = popPunjabi.status === 'fulfilled' && popPunjabi.value.length > 0 
    ? popPunjabi.value 
    : CURATED_POPULAR_TRACKS.filter(t => t.id === 'fXae_fPZcKk' || t.id === 'LK7-_dgAVQE');

  const globalTracks = popGlobal.status === 'fulfilled' && popGlobal.value.length > 0 
    ? popGlobal.value 
    : CURATED_POPULAR_TRACKS.filter(t => t.id === '4NRXx6U8ABQ' || t.id === 'd5gf9dXHevw' || t.id === 'kPa7bsKwL-8');

  // Interleave for Popular tracks
  const popularTracks = [
    ...CURATED_POPULAR_TRACKS,
    ...hindiTracks.slice(0, 8),
    ...punjabiTracks.slice(0, 8),
    ...globalTracks.slice(0, 8)
  ];

  // Deduplicate
  const seenIds = new Set<string>();
  const uniquePopular = popularTracks.filter(t => {
    if (!t.id || seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  const featuredArtists = ARTISTS_DATABASE.slice(0, 10).map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    listeners: a.listeners,
    image: a.image,
    searchQuery: a.name
  }));

  const albums = popAlbums.status === 'fulfilled' && popAlbums.value.length > 0
    ? popAlbums.value
    : [
        { id: 'alb-1', title: 'Sajni', artist: 'Arijit Singh', coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/maxresdefault.jpg', year: 2026, type: 'Single', trackCount: 1 },
        { id: 'alb-2', title: 'MoonRise', artist: 'Diljit Dosanjh', coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/maxresdefault.jpg', year: 2025, type: 'Album', trackCount: 9 },
        { id: 'alb-3', title: 'Making Memories', artist: 'Karan Aujla', coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 9 },
        { id: 'alb-4', title: 'Animal OST', artist: 'Vishal Mishra', coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 12 },
        { id: 'alb-5', title: 'After Hours', artist: 'The Weeknd', coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/maxresdefault.jpg', year: 2023, type: 'Album', trackCount: 14 }
      ];

  const trendingSearches = [
    'Arijit Singh',
    'Diljit Dosanjh',
    'Karan Aujla',
    'Coke Studio Pakistan',
    'The Weeknd',
    'Billie Eilish',
    'Kaifi Khalil',
    'Anirudh Ravichander',
    'Sidhu Moose Wala',
    'Die With A Smile'
  ];

  return jsonResponse({
    popularSongs: uniquePopular.slice(0, 30),
    hindiSongs: hindiTracks.slice(0, 24),
    hits2026Songs: [...globalTracks, ...punjabiTracks].slice(0, 24),
    popularAlbums: albums,
    featuredArtists,
    trendingSearches,
    source: 'cloudflare_pages_edge'
  });
}
