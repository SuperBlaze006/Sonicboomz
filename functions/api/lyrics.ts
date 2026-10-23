import { jsonResponse } from '../_lib/utils';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  const rawTitle = (url.searchParams.get('title') || '').trim();
  const rawArtist = (url.searchParams.get('artist') || '').trim();

  if (!rawTitle) {
    return jsonResponse({ error: 'Title required' }, 400);
  }

  const cleanTitle = rawTitle
    .replace(/\([^)]*official[^)]*\)/gi, '')
    .replace(/\[[^\]]*official[^\]]*\]/gi, '')
    .replace(/\([^)]*audio[^)]*\)/gi, '')
    .replace(/\[[^\]]*audio[^\]]*\]/gi, '')
    .replace(/\([^)]*video[^)]*\)/gi, '')
    .replace(/\[[^\]]*video[^\]]*\]/gi, '')
    .replace(/\(feat\.[^)]*\)/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/["']/g, '')
    .trim();

  const cleanArtist = rawArtist.replace(/ - Topic|VEVO/gi, '').trim();

  let lyricsData: any = null;

  // 1. Try LRCLIB direct get
  try {
    const directUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const directRes = await fetch(directUrl, {
      headers: { 'User-Agent': 'SonicBoomz/1.0' },
      signal: AbortSignal.timeout(3000)
    });
    if (directRes.ok) {
      lyricsData = await directRes.json();
    }
  } catch (_) {}

  // 2. Try LRCLIB search if direct get didn't return synced lyrics
  if (!lyricsData || (!lyricsData.plainLyrics && !lyricsData.syncedLyrics)) {
    try {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SonicBoomz/1.0' },
        signal: AbortSignal.timeout(3000)
      });
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          lyricsData = results.find((r: any) => r.syncedLyrics || r.plainLyrics) || results[0];
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to Lyrics.ovh
  if (!lyricsData || (!lyricsData.plainLyrics && !lyricsData.syncedLyrics)) {
    try {
      const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
      const ovhRes = await fetch(ovhUrl, { signal: AbortSignal.timeout(3000) });
      if (ovhRes.ok) {
        const ovhJson = await ovhRes.json();
        if (ovhJson.lyrics) {
          lyricsData = {
            trackName: cleanTitle,
            artistName: cleanArtist,
            plainLyrics: ovhJson.lyrics,
            syncedLyrics: null
          };
        }
      }
    } catch (_) {}
  }

  if (lyricsData && (lyricsData.plainLyrics || lyricsData.syncedLyrics)) {
    return jsonResponse(lyricsData);
  }

  return jsonResponse({
    trackName: cleanTitle,
    artistName: cleanArtist,
    plainLyrics: `Lyrics for "${cleanTitle}" by ${cleanArtist} are not available at this moment. Enjoy the song!`,
    syncedLyrics: null
  });
}
