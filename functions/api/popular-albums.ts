import { CloudflareEnv, AlbumItem } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { fetchLiveAlbums } from '../_lib/musicSources';

export const POPULAR_ALBUMS_FALLBACK: AlbumItem[] = [
  { id: 'alb-1', title: 'Sajni', artist: 'Arijit Singh', coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/maxresdefault.jpg', year: 2026, type: 'Single', trackCount: 1 },
  { id: 'alb-2', title: 'MoonRise', artist: 'Diljit Dosanjh', coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/maxresdefault.jpg', year: 2025, type: 'Album', trackCount: 9 },
  { id: 'alb-3', title: 'Making Memories', artist: 'Karan Aujla', coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 9 },
  { id: 'alb-4', title: 'Animal OST', artist: 'Vishal Mishra', coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 12 },
  { id: 'alb-5', title: 'After Hours', artist: 'The Weeknd', coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/maxresdefault.jpg', year: 2023, type: 'Album', trackCount: 14 },
  { id: 'alb-6', title: 'HIT ME HARD AND SOFT', artist: 'Billie Eilish', coverUrl: 'https://i.ytimg.com/vi/V9PVRfjEBTI/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 10 },
  { id: 'alb-7', title: 'Short n Sweet', artist: 'Sabrina Carpenter', coverUrl: 'https://i.ytimg.com/vi/eVli-tstM5E/maxresdefault.jpg', year: 2024, type: 'Album', trackCount: 12 },
  { id: 'alb-8', title: 'Moosetape', artist: 'Sidhu Moose Wala', coverUrl: 'https://i.ytimg.com/vi/7j5h6yLwK4o/maxresdefault.jpg', year: 2023, type: 'Album', trackCount: 32 }
];

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request } = context;
  const url = new URL(request.url);

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(24, Math.max(6, parseInt(url.searchParams.get('limit') || '14', 10)));

  const searchTerms = [
    '2026 bollywood new album',
    'karan aujla diljit dosanjh',
    'the weeknd bruno mars',
    'arijit singh album',
    'punjabi hit album 2026',
    'billie eilish album'
  ];

  const term = searchTerms[(page - 1) % searchTerms.length];
  const live = await fetchLiveAlbums(term, limit, page);

  if (live.length > 0) {
    return jsonResponse({
      albums: live,
      page,
      source: 'live_edge_albums'
    });
  }

  const offset = (page * 3) % POPULAR_ALBUMS_FALLBACK.length;
  const shuffled = [...POPULAR_ALBUMS_FALLBACK.slice(offset), ...POPULAR_ALBUMS_FALLBACK.slice(0, offset)];

  return jsonResponse({
    albums: shuffled.slice(0, limit),
    page,
    source: 'popular_albums_edge_fallback'
  });
}
