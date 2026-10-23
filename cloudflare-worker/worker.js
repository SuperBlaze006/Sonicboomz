/**
 * Blaze Music - Standalone Cloudflare Worker API
 * 
 * Free-tier ready: Runs on Cloudflare Workers edge network.
 * Zero npm dependencies: Native Web Standards (fetch, URL, Request, Response, caches).
 * 
 * To Deploy:
 * Option 1 (No CLI): Go to dash.cloudflare.com -> Workers & Pages -> Create Application -> Quick Edit -> Paste this code -> Save & Deploy.
 * Option 2 (Wrangler CLI): Run `npx wrangler deploy` inside this folder.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200, cacheSeconds = 300) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
      ...CORS_HEADERS,
    },
  });
}

// YouTube search parser for Edge Workers (scrapes YouTube search HTML without node modules)
async function searchYouTube(query, limit = 20) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!dataMatch) return [];

    const data = JSON.parse(dataMatch[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const videos = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (!v || !v.videoId) continue;

      const title = v.title?.runs?.[0]?.text || '';
      // Filter out reels / shorts
      if (/reels|instagram|tik\s*tok|shorts/i.test(title)) continue;

      const artist = v.ownerText?.runs?.[0]?.text || 'Top Artist';
      const durationStr = v.lengthText?.simpleText || '3:30';
      const parts = durationStr.split(':').map(Number);
      const duration = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : (parts[0] || 3) * 60 + (parts[1] || 30);

      // Skip very long podcasts/mixes (> 10 mins) or sound effects (< 45s)
      if (duration < 45 || duration > 600) continue;

      const thumb = v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

      videos.push({
        source: 'youtube',
        id: v.videoId,
        title,
        artist,
        coverUrl: thumb,
        duration,
        viewCount: 100000,
        publishedAt: v.publishedTimeText?.simpleText || 'Recent',
      });

      if (videos.length >= limit) break;
    }

    return videos;
  } catch (err) {
    console.error('Cloudflare worker YouTube search error:', err);
    return [];
  }
}

// JioSaavn Search helper
async function searchJioSaavn(query, limit = 20) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const text = await res.text();
    const cleanJson = JSON.parse(text.replace(/\\/g, ''));
    const songs = cleanJson?.songs?.data || [];

    return songs.slice(0, limit).map((s) => ({
      source: 'jiosaavn',
      id: s.id,
      title: s.title || s.song,
      artist: s.music || s.more_info?.artistMap?.primary_artists?.[0]?.name || s.description || 'Top Artist',
      coverUrl: (s.image || '').replace('150x150', '500x500'),
      duration: parseInt(s.more_info?.duration || '210', 10),
    }));
  } catch (err) {
    return [];
  }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Health check
    if (path === '/' || path === '/api/health') {
      return jsonResponse({ status: 'ok', worker: 'Blaze Music Edge API', version: '2026.1' });
    }

    // 2. Home Widgets
    if (path === '/api/home-widgets') {
      const [pop, hindi, hits2026] = await Promise.all([
        searchYouTube('popular english songs official video', 15),
        searchYouTube('latest bollywood songs 2026 official video', 15),
        searchYouTube('latest official music video 2026 trending youtube hindi punjabi english', 15),
      ]);

      return jsonResponse({
        popularSongs: pop,
        hindiSongs: hindi,
        hits2026Songs: hits2026,
        featuredArtists: [
          { id: 'arijit-singh', name: 'Arijit Singh', role: 'Playback Legend' },
          { id: 'diljit-dosanjh', name: 'Diljit Dosanjh', role: 'Punjabi Icon' },
          { id: 'shreya-ghoshal', name: 'Shreya Ghoshal', role: 'Melody Queen' },
          { id: 'the-weeknd', name: 'The Weeknd', role: 'Global Pop' },
          { id: 'taylor-swift', name: 'Taylor Swift', role: 'Pop Sensation' }
        ],
        moodMixes: [
          { id: 'mood-gym', title: 'Gym Energy Beats', color: 'from-amber-600 to-red-600', query: 'workout energetic motivational songs' },
          { id: 'mood-chill', title: 'Late Night Chill', color: 'from-indigo-600 to-purple-800', query: 'late night acoustic chill songs' },
          { id: 'mood-focus', title: 'Deep Focus & Study', color: 'from-cyan-600 to-blue-700', query: 'lofi study chill beats' },
          { id: 'mood-party', title: 'Party Banger Hits', color: 'from-fuchsia-600 to-pink-700', query: 'party dance club hits' }
        ]
      }, 200, 300);
    }

    // 3. Home Widgets More (Infinite Scroll)
    if (path === '/api/home-widgets/more') {
      const category = url.searchParams.get('category') || 'popular';
      const page = parseInt(url.searchParams.get('page') || '2', 10);

      const queries = {
        popular: ['billboard top hits official audio', 'global viral pop hits official video'],
        hindi: ['bollywood party chartbusters official video', 'arijit singh romantic hits official video'],
        hits2026: ['latest official music video 2026 trending youtube', 'new punjabi songs 2026 official music video', 'new release songs 2026 hindi english official video']
      };

      const list = queries[category] || queries.popular;
      const q = list[(page - 2) % list.length];
      const results = await searchYouTube(q, 20);
      return jsonResponse(results, 200, 300);
    }

    // 4. Search
    if (path === '/api/search') {
      const q = url.searchParams.get('q') || '';
      if (!q.trim()) return jsonResponse({ results: [] });

      const [ytResults, saavnResults] = await Promise.all([
        searchYouTube(q, 15),
        searchJioSaavn(q, 10),
      ]);

      const seen = new Set();
      const combined = [...ytResults, ...saavnResults].filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      return jsonResponse({ results: combined }, 200, 300);
    }

    // 5. Suggestions (Auto-complete)
    if (path === '/api/suggestions') {
      const q = url.searchParams.get('q') || '';
      if (!q.trim()) return jsonResponse({ suggestions: [] });

      try {
        const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`);
        const json = await res.json();
        const suggestions = (json[1] || []).slice(0, 8);
        return jsonResponse({ suggestions }, 200, 600);
      } catch {
        return jsonResponse({ suggestions: [] });
      }
    }

    // 6. Audio Resolver
    if (path === '/api/resolve') {
      const id = url.searchParams.get('id') || '';
      const source = url.searchParams.get('source') || 'youtube';

      // Always resolve YouTube directly to official IFrame player (zero server bandwidth)
      return jsonResponse({
        isYouTube: true,
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`,
        bitrate: 'Original HQ',
        format: 'youtube/iframe'
      }, 200, 600);
    }

    // 7. Lyrics
    if (path === '/api/lyrics') {
      const title = url.searchParams.get('title') || '';
      const artist = url.searchParams.get('artist') || '';

      try {
        const lres = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
        if (lres.ok) {
          const ldata = await lres.json();
          if (ldata.lyrics) {
            return jsonResponse({ lyrics: ldata.lyrics });
          }
        }
      } catch {}

      return jsonResponse({ lyrics: null });
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  }
};
