import { Track, AlbumItem } from './types';
import { decodeHtmlEntities, cleanArtistName, cleanSongTitle } from './utils';

export const CURATED_POPULAR_TRACKS: Track[] = [
  {
    source: 'youtube',
    id: 'Tk9TM7-eTmw',
    title: 'Falling In Reverse - "Joseph"',
    artist: 'Epitaph Records',
    coverUrl: 'https://i.ytimg.com/vi/Tk9TM7-eTmw/maxresdefault.jpg',
    duration: 258,
    viewCount: 1944817
  },
  {
    source: 'youtube',
    id: 'k3g_WjLCsXM',
    title: 'Sajni (From "Laapataa Ladies")',
    artist: 'Arijit Singh, Ram Sampath',
    coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/maxresdefault.jpg',
    duration: 170,
    viewCount: 145000000
  },
  {
    source: 'youtube',
    id: 'fXae_fPZcKk',
    title: 'MoonRise',
    artist: 'Diljit Dosanjh',
    coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/maxresdefault.jpg',
    duration: 182,
    viewCount: 88000000
  },
  {
    source: 'youtube',
    id: 'LK7-_dgAVQE',
    title: 'Making Memories - Softly',
    artist: 'Karan Aujla, Ikky',
    coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/maxresdefault.jpg',
    duration: 154,
    viewCount: 190000000
  },
  {
    source: 'youtube',
    id: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
    duration: 200,
    viewCount: 820000000
  },
  {
    source: 'youtube',
    id: 'd5gf9dXHevw',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    coverUrl: 'https://i.ytimg.com/vi/d5gf9dXHevw/maxresdefault.jpg',
    duration: 194,
    viewCount: 220000000
  },
  {
    source: 'youtube',
    id: 'kPa7bsKwL-8',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    coverUrl: 'https://i.ytimg.com/vi/kPa7bsKwL-8/maxresdefault.jpg',
    duration: 252,
    viewCount: 430000000
  },
  {
    source: 'youtube',
    id: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    coverUrl: 'https://i.ytimg.com/vi/eVli-tstM5E/maxresdefault.jpg',
    duration: 175,
    viewCount: 310000000
  },
  {
    source: 'youtube',
    id: 'VAdGW7QDJUI',
    title: 'Pehle Bhi Main (From "Animal")',
    artist: 'Vishal Mishra, Raj Shekhar',
    coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/maxresdefault.jpg',
    duration: 250,
    viewCount: 320000000
  },
  {
    source: 'youtube',
    id: '_XbvH79U3bQ',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    coverUrl: 'https://i.ytimg.com/vi/_XbvH79U3bQ/maxresdefault.jpg',
    duration: 173,
    viewCount: 520000000
  },
  {
    source: 'youtube',
    id: '5cx7rvMvAWo',
    title: 'Hukum - Thalaivar Alappara',
    artist: 'Anirudh Ravichander, Super Subu',
    coverUrl: 'https://i.ytimg.com/vi/5cx7rvMvAWo/maxresdefault.jpg',
    duration: 206,
    viewCount: 210000000
  },
  {
    source: 'youtube',
    id: 'FyS5dAywkEo',
    title: 'SaWaDiKa',
    artist: 'LISA',
    coverUrl: 'https://i.ytimg.com/vi/FyS5dAywkEo/maxresdefault.jpg',
    duration: 187,
    viewCount: 164000000
  }
];

export async function searchJioSaavn(query: string, limit = 20, page = 1): Promise<Track[]> {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=${limit}&p=${page}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      source: 'jiosaavn',
      id: item.id || `saavn_${item.id}`,
      title: cleanSongTitle(item.song || item.title || ''),
      artist: cleanArtistName(item.singers || item.primary_artists || item.more_info?.singers || 'Top Artist'),
      coverUrl: (item.image || '').replace('150x150', '500x500').replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      duration: parseInt(item.more_info?.duration || item.duration || '200', 10),
      viewCount: parseInt(item.play_count || '1200000', 10),
      streamUrl: item.more_info?.encrypted_media_url || ''
    }));
  } catch (_) {
    return [];
  }
}

export async function searchItunes(query: string, limit = 20): Promise<Track[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      source: 'itunes',
      id: `itunes_${item.trackId}`,
      title: cleanSongTitle(item.trackName || ''),
      artist: cleanArtistName(item.artistName || 'Top Artist'),
      coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
      duration: Math.round((item.trackTimeMillis || 180000) / 1000),
      viewCount: 1500000,
      previewUrl: item.previewUrl || ''
    }));
  } catch (_) {
    return [];
  }
}

export async function fetchLiveAlbums(query: string, limit = 16, page = 1): Promise<AlbumItem[]> {
  try {
    const [saavnRes, itunesRes] = await Promise.allSettled([
      fetch(`https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&q=${encodeURIComponent(query)}&n=${limit}&p=${page}&_format=json&_marker=0&ctx=web6dot0`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? r.json() : null),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=${limit}`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? r.json() : null)
    ]);

    const albums: AlbumItem[] = [];
    const seen = new Set<string>();

    if (saavnRes.status === 'fulfilled' && saavnRes.value?.results) {
      for (const alb of saavnRes.value.results) {
        const title = decodeHtmlEntities(alb.title || alb.name || '').trim();
        const artist = decodeHtmlEntities(alb.music || alb.subtitle || 'Various Artists').trim();
        const cover = (alb.image || '').replace('150x150', '500x500');
        const key = `${title.toLowerCase()}::${artist.toLowerCase()}`;
        if (title && cover && !seen.has(key)) {
          seen.add(key);
          const tracks = parseInt(alb.more_info?.song_pids?.split(',').length || '8', 10);
          albums.push({
            id: `saavn-alb-${alb.id || alb.albumid}`,
            title,
            artist,
            coverUrl: cover,
            year: parseInt(alb.year || '2026', 10) || 2026,
            type: tracks === 1 ? 'Single' : tracks <= 5 ? 'EP' : 'Album',
            trackCount: tracks
          });
        }
      }
    }

    if (itunesRes.status === 'fulfilled' && itunesRes.value?.results) {
      for (const alb of itunesRes.value.results) {
        const title = alb.collectionName || alb.collectionCensoredName;
        const artist = alb.artistName;
        const cover = (alb.artworkUrl100 || '').replace('100x100bb', '600x600bb');
        const key = `${title?.toLowerCase()}::${artist?.toLowerCase()}`;
        if (title && cover && !seen.has(key)) {
          seen.add(key);
          albums.push({
            id: `itunes-alb-${alb.collectionId}`,
            title,
            artist,
            coverUrl: cover,
            year: alb.releaseDate ? new Date(alb.releaseDate).getFullYear() : 2026,
            type: alb.trackCount === 1 ? 'Single' : (alb.trackCount <= 5 ? 'EP' : 'Album'),
            trackCount: alb.trackCount || 8
          });
        }
      }
    }

    return albums;
  } catch (_) {
    return [];
  }
}
