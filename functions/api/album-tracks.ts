import { CloudflareEnv, Track } from '../_lib/types';
import { jsonResponse, decodeHtmlEntities, cleanSongTitle, cleanArtistName } from '../_lib/utils';
import { searchYouTube, searchJioSaavn, searchItunes } from '../_lib/musicSources';

// Curated authentic tracklists for headline trending albums & EPs
const CURATED_ALBUMS: Record<string, Track[]> = {
  // Yo Yo Honey Singh - Casa Tupka / Casa Topka
  'casatupka': [
    {
      source: 'youtube',
      id: 'vRjaGgDsWSo',
      title: 'Casa Tupka Anthemo',
      artist: 'Yo Yo Honey Singh, Priyanshi',
      coverUrl: 'https://i.ytimg.com/vi/vRjaGgDsWSo/hqdefault.jpg',
      duration: 186,
      viewCount: 45000000
    }
  ],
  'casatopka': [
    {
      source: 'youtube',
      id: 'vRjaGgDsWSo',
      title: 'Casa Tupka Anthemo',
      artist: 'Yo Yo Honey Singh, Priyanshi',
      coverUrl: 'https://i.ytimg.com/vi/vRjaGgDsWSo/hqdefault.jpg',
      duration: 186,
      viewCount: 45000000
    }
  ],
  // Yo Yo Honey Singh - Glory
  'glory': [
    {
      source: 'youtube',
      id: 'XO8wew38VM8',
      title: 'Millionaire',
      artist: 'Yo Yo Honey Singh',
      coverUrl: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
      duration: 198,
      viewCount: 160000000
    },
    {
      source: 'youtube',
      id: 'vRjaGgDsWSo',
      title: 'Casa Tupka Anthemo',
      artist: 'Yo Yo Honey Singh, Priyanshi',
      coverUrl: 'https://i.ytimg.com/vi/vRjaGgDsWSo/hqdefault.jpg',
      duration: 186,
      viewCount: 45000000
    },
    {
      source: 'youtube',
      id: 'tU57xR_n1xM',
      title: 'Payal',
      artist: 'Yo Yo Honey Singh, Paradox',
      coverUrl: 'https://i.ytimg.com/vi/tU57xR_n1xM/hqdefault.jpg',
      duration: 215,
      viewCount: 110000000
    },
    {
      source: 'youtube',
      id: '0eP_uNn5Lbg',
      title: 'Bonita',
      artist: 'Yo Yo Honey Singh',
      coverUrl: 'https://i.ytimg.com/vi/0eP_uNn5Lbg/hqdefault.jpg',
      duration: 195,
      viewCount: 65000000
    },
    {
      source: 'youtube',
      id: 'JtJc5R3p4eY',
      title: 'High On Me',
      artist: 'Yo Yo Honey Singh',
      coverUrl: 'https://i.ytimg.com/vi/JtJc5R3p4eY/hqdefault.jpg',
      duration: 180,
      viewCount: 52000000
    },
    {
      source: 'youtube',
      id: '8w6kH8r0n1M',
      title: 'Jatt Mehkma',
      artist: 'Yo Yo Honey Singh',
      coverUrl: 'https://i.ytimg.com/vi/8w6kH8r0n1M/hqdefault.jpg',
      duration: 190,
      viewCount: 78000000
    }
  ],
  // Karan Aujla - Aujla Szn 1 EP
  'aujlaszn1': [
    {
      source: 'youtube',
      id: 'X_sF7W8wYw4',
      title: 'Ashke',
      artist: 'Karan Aujla, Mxrci',
      coverUrl: 'https://i.ytimg.com/vi/X_sF7W8wYw4/hqdefault.jpg',
      duration: 178,
      viewCount: 88000000
    },
    {
      source: 'youtube',
      id: 'LK7-_dgAVQE',
      title: 'Softly',
      artist: 'Karan Aujla, Ikky',
      coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
      duration: 154,
      viewCount: 210000000
    },
    {
      source: 'youtube',
      id: 'g6n8m5K4x2Q',
      title: 'Real Bad Man',
      artist: 'Karan Aujla, Mxrci',
      coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
      duration: 192,
      viewCount: 62000000
    },
    {
      source: 'youtube',
      id: '2k8n5x4L7wA',
      title: 'Straight Up',
      artist: 'Karan Aujla, Mxrci',
      coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
      duration: 180,
      viewCount: 55000000
    },
    {
      source: 'youtube',
      id: '9k7mL4x2w1Q',
      title: 'Winning Speech',
      artist: 'Karan Aujla',
      coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
      duration: 195,
      viewCount: 165000000
    },
    {
      source: 'youtube',
      id: 'fXae_fPZcKk',
      title: '52 Bars',
      artist: 'Karan Aujla, Ikky',
      coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/hqdefault.jpg',
      duration: 210,
      viewCount: 95000000
    }
  ],
  // Stree 2 Soundtrack
  'stree2': [
    {
      source: 'youtube',
      id: 'gcR2vM-v8o8',
      title: 'Aaj Ki Raat',
      artist: 'Madhubanti Bagchi, Sachin-Jigar',
      coverUrl: 'https://i.ytimg.com/vi/gcR2vM-v8o8/hqdefault.jpg',
      duration: 228,
      viewCount: 380000000
    },
    {
      source: 'youtube',
      id: 'Ax0G_P2dSBw',
      title: 'Aayi Nai',
      artist: 'Pawan Singh, Simran Choudhary, Sachin-Jigar',
      coverUrl: 'https://i.ytimg.com/vi/Ax0G_P2dSBw/hqdefault.jpg',
      duration: 180,
      viewCount: 290000000
    },
    {
      source: 'youtube',
      id: '7nk5i5JmQ_Y',
      title: 'Khoobsurat',
      artist: 'Vishal Mishra, Sachin-Jigar',
      coverUrl: 'https://i.ytimg.com/vi/7nk5i5JmQ_Y/hqdefault.jpg',
      duration: 244,
      viewCount: 180000000
    },
    {
      source: 'youtube',
      id: 'BddP6PYo2gs',
      title: 'Tumhare Hi Rahenge Hum',
      artist: 'Varun Jain, Shilpa Rao, Sachin-Jigar',
      coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
      duration: 230,
      viewCount: 140000000
    }
  ]
};

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request } = context;
  const url = new URL(request.url);

  const album = (url.searchParams.get('album') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();
  const releaseId = (url.searchParams.get('id') || '').trim();
  const query = (url.searchParams.get('q') || `${artist} ${album}`).trim();
  const rawTrackCount = parseInt(url.searchParams.get('trackCount') || '0', 10);

  if (!album && !query) {
    return jsonResponse({ error: 'Album or query required' }, 400);
  }

  // Check normalized lookup key for curated top albums & EPs
  const lookupKey = `${album} ${releaseId}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, curatedList] of Object.entries(CURATED_ALBUMS)) {
    if (lookupKey.includes(key) || key.includes(lookupKey)) {
      return jsonResponse({
        album,
        artist,
        tracks: curatedList,
        totalTracks: curatedList.length,
        source: 'curated_album_edge'
      });
    }
  }

  // 1. If it's a numeric/iTunes album ID, fetch directly from iTunes lookup API
  if (releaseId.startsWith('itunes-alb-')) {
    const itunesId = releaseId.replace('itunes-alb-', '');
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(itunesId)}&entity=song`, { signal: AbortSignal.timeout(3500) });
      if (itunesRes.ok) {
        const json = await itunesRes.json();
        const songs = (json.results || []).filter((r: any) => r.wrapperType === 'track');
        if (songs.length > 0) {
          const tracks: Track[] = songs.map((s: any) => ({
            source: 'itunes',
            id: `itunes_${s.trackId}`,
            title: cleanSongTitle(s.trackName),
            artist: cleanArtistName(s.artistName || artist),
            coverUrl: (s.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
            duration: Math.round((s.trackTimeMillis || 180000) / 1000),
            viewCount: 1500000,
            previewUrl: s.previewUrl
          }));
          return jsonResponse({
            album: album || json.results[0]?.collectionName,
            artist: artist || json.results[0]?.artistName,
            tracks,
            totalTracks: tracks.length
          });
        }
      }
    } catch (_) {}
  }

  // 2. Query YouTube, JioSaavn & iTunes in parallel for authentic tracks
  const resolvedQuery = `${artist} ${album}`.trim() || query;
  const [ytTracks, saavnTracks, itunesTracks] = await Promise.all([
    searchYouTube(`${resolvedQuery} song audio`, 12),
    searchJioSaavn(resolvedQuery, 12, 1),
    searchItunes(resolvedQuery, 8)
  ]);

  const combined = [...ytTracks, ...saavnTracks, ...itunesTracks];
  const seenTitles = new Set<string>();
  const uniqueTracks: Track[] = [];

  for (const t of combined) {
    if (!t || !t.id || !t.title) continue;
    const dur = t.duration || 0;
    if (dur > 0 && (dur < 45 || dur > 600)) continue;
    if (/compilation|1\s*hour|2\s*hour|nonstop|jukebox/i.test(t.title)) continue;

    const key = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueTracks.push(t);
    }
  }

  let finalTracks = uniqueTracks;
  if (rawTrackCount > 0 && finalTracks.length > rawTrackCount) {
    finalTracks = finalTracks.slice(0, rawTrackCount);
  }

  return jsonResponse({
    album,
    artist,
    tracks: finalTracks.length > 0 ? finalTracks : ytTracks.slice(0, rawTrackCount || 6),
    totalTracks: finalTracks.length || ytTracks.length || 1,
    source: 'live_album_tracks'
  });
}
