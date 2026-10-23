import { CloudflareEnv, Track } from '../_lib/types';
import { jsonResponse, decodeHtmlEntities, cleanSongTitle, cleanArtistName } from '../_lib/utils';
import { searchJioSaavn, searchItunes } from '../_lib/musicSources';

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request } = context;
  const url = new URL(request.url);

  const album = (url.searchParams.get('album') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();
  const releaseId = (url.searchParams.get('id') || '').trim();
  const query = (url.searchParams.get('q') || `${artist} ${album}`).trim();

  if (!album && !query) {
    return jsonResponse({ error: 'Album or query required' }, 400);
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

  // 2. Query JioSaavn & iTunes for the album
  const [saavnTracks, itunesTracks] = await Promise.all([
    searchJioSaavn(`${artist} ${album}`, 16, 1),
    searchItunes(`${artist} ${album}`, 16)
  ]);

  const combined = [...saavnTracks, ...itunesTracks];
  const seenTitles = new Set<string>();
  const uniqueTracks: Track[] = [];

  for (const t of combined) {
    const key = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueTracks.push(t);
    }
  }

  return jsonResponse({
    album,
    artist,
    tracks: uniqueTracks.length > 0 ? uniqueTracks : [
      {
        source: 'youtube',
        id: 'Tk9TM7-eTmw',
        title: album || 'Track 1',
        artist: artist || 'Artist',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=500',
        duration: 210,
        viewCount: 1200000
      }
    ],
    totalTracks: uniqueTracks.length || 1
  });
}
