import { jsonResponse } from '../_lib/utils';
import CryptoJS from 'crypto-js';

// Decrypt encrypted JioSaavn media URL using DES-ECB with key '38346591'
function decryptSaavnMediaUrl(encryptedUrl: string): string | null {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedStr && decryptedStr.startsWith('http') ? decryptedStr : null;
  } catch {
    return null;
  }
}

// Clean noisy terms from title for catalog matching
function cleanNoise(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\b(official|music|video|audio|lyrics|lyric|hd|4k|remastered|full|song|visualizer|soundtrack|ost|movie|film|from|feat|ft|featuring|version|edit|original|mix|prod)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Check title match
function isTitleMatch(qTitle: string, candidateTitle: string): boolean {
  const c1 = cleanNoise(qTitle);
  const c2 = cleanNoise(candidateTitle);
  if (!c1 || !c2) return false;
  if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) return true;
  const w1 = c1.split(' ').filter(w => w.length > 2);
  const w2 = c2.split(' ').filter(w => w.length > 2);
  if (!w1.length || !w2.length) return false;
  const set2 = new Set(w2);
  const overlap = w1.filter(w => set2.has(w)).length;
  return overlap >= 1;
}

// Resolve JioSaavn stream by ID
async function resolveJioSaavnById(songId: string): Promise<{ url: string; bitrate: string; format: string } | null> {
  try {
    const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${encodeURIComponent(songId)}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(detailsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const song = data.songs?.[0];
    if (!song) return null;

    let targetUrl: string | null = null;
    if (song.encrypted_media_url) {
      targetUrl = decryptSaavnMediaUrl(song.encrypted_media_url);
    } else if (song.media_preview_url) {
      targetUrl = song.media_preview_url.replace('preview.saavncdn.com', 'aac.saavncdn.com');
    }

    if (targetUrl) {
      // Prefer 320kbps or 160kbps AAC
      const q320 = targetUrl.replace(/_96(_p)?\.(mp4|mp3|m4a)/i, '_320.$2');
      const q160 = targetUrl.replace(/_96(_p)?\.(mp4|mp3|m4a)/i, '_160.$2');
      const q96 = targetUrl.replace(/_96_p\.(mp4|mp3|m4a)/i, '_96.$1');
      return {
        url: q320 || q160 || q96 || targetUrl,
        bitrate: '320kbps',
        format: 'audio/mp4'
      };
    }
  } catch (_) {}
  return null;
}

// Search and resolve JioSaavn by Title & Artist
async function matchSaavnBySearch(title: string, artist: string): Promise<{ url: string; bitrate: string; format: string } | null> {
  try {
    const cleanT = cleanNoise(title);
    const cleanA = cleanNoise(artist);
    const query = `${cleanT} ${cleanA}`.trim();
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=6&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: any[] = data.results || [];

    for (const item of items) {
      const songTitle = item.song || item.title || '';
      if (isTitleMatch(title, songTitle)) {
        if (item.id) {
          const stream = await resolveJioSaavnById(item.id);
          if (stream) return stream;
        } else if (item.more_info?.encrypted_media_url) {
          const dec = decryptSaavnMediaUrl(item.more_info.encrypted_media_url);
          if (dec) {
            const q320 = dec.replace(/_96(_p)?\.(mp4|mp3|m4a)/i, '_320.$2');
            return {
              url: q320 || dec,
              bitrate: '320kbps',
              format: 'audio/mp4'
            };
          }
        }
      }
    }
  } catch (_) {}
  return null;
}

// Search iTunes for high quality AAC preview audio stream
async function matchItunes(title: string, artist: string): Promise<{ url: string; bitrate: string; format: string } | null> {
  try {
    const cleanT = cleanNoise(title);
    const cleanA = cleanNoise(artist);
    const query = `${cleanT} ${cleanA}`.trim();
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=4`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results: any[] = data.results || [];
    for (const item of results) {
      if (item.previewUrl) {
        return {
          url: item.previewUrl,
          bitrate: '256kbps',
          format: 'audio/mp4'
        };
      }
    }
  } catch (_) {}
  return null;
}

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  const id = (url.searchParams.get('id') || '').trim();
  const source = (url.searchParams.get('source') || '').trim();
  const title = (url.searchParams.get('title') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();

  // 1. iTunes Track Resolution
  if (id.startsWith('itunes_') || source === 'itunes') {
    const itunesId = id.replace('itunes_', '');
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(itunesId)}`, { signal: AbortSignal.timeout(3000) });
      if (itunesRes.ok) {
        const json = await itunesRes.json();
        const item = json.results?.[0];
        if (item?.previewUrl) {
          return jsonResponse({
            isYouTube: false,
            id,
            url: item.previewUrl,
            audioUrl: item.previewUrl,
            bitrate: '256 kbps AAC',
            format: 'audio/mp4'
          });
        }
      }
    } catch (_) {}
  }

  // 2. Direct JioSaavn ID Resolution
  if (source === 'jiosaavn' || id.startsWith('saavn_') || /^[a-zA-Z0-9_-]{5,20}$/.test(id) && !id.startsWith('dynamic-') && id.length !== 11) {
    const saavnId = id.replace('saavn_', '');
    const saavnStream = await resolveJioSaavnById(saavnId);
    if (saavnStream) {
      return jsonResponse({
        isYouTube: false,
        id,
        url: saavnStream.url,
        audioUrl: saavnStream.url,
        bitrate: saavnStream.bitrate,
        format: saavnStream.format
      });
    }
  }

  // 3. High-Priority Direct Audio Stream Match (Enables Mobile Background Playback)
  // Query JioSaavn and iTunes for real audio stream URLs so HTML5 <audio> can play continuously with screen locked
  if (title) {
    // A. Match via JioSaavn catalog (320kbps / 160kbps MP4/AAC)
    const saavnMatched = await matchSaavnBySearch(title, artist);
    if (saavnMatched) {
      return jsonResponse({
        isYouTube: false,
        id,
        url: saavnMatched.url,
        audioUrl: saavnMatched.url,
        bitrate: saavnMatched.bitrate,
        format: saavnMatched.format
      });
    }

    // B. Match via iTunes catalog (256kbps AAC)
    const itunesMatched = await matchItunes(title, artist);
    if (itunesMatched) {
      return jsonResponse({
        isYouTube: false,
        id,
        url: itunesMatched.url,
        audioUrl: itunesMatched.url,
        bitrate: itunesMatched.bitrate,
        format: itunesMatched.format
      });
    }
  }

  // 4. Safe YouTube fallback if direct audio stream is unavailable
  const fallbackId = (id && id.length === 11 && !id.startsWith('dynamic-')) ? id : 'Tk9TM7-eTmw';
  return jsonResponse({
    isYouTube: true,
    id: fallbackId,
    embedUrl: `https://www.youtube.com/embed/${fallbackId}?autoplay=1&enablejsapi=1`,
    bitrate: 'Original HQ Audio',
    format: 'youtube/iframe'
  });
}
