import { CloudflareEnv, Track } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { ensureD1Tables } from '../_lib/db';
import { searchYouTube, searchJioSaavn, searchItunes, CURATED_POPULAR_TRACKS } from '../_lib/musicSources';

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const query = (url.searchParams.get('q') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));

  if (!query) {
    return jsonResponse({ results: CURATED_POPULAR_TRACKS, source: 'default_catalog' });
  }

  // 1. Check D1 database
  let d1Results: Track[] = [];
  if (env && env.DB) {
    try {
      await ensureD1Tables(env);
      const stmt = env.DB.prepare(`
        SELECT id, title, artist, coverUrl, duration, source, viewCount 
        FROM songs_cache 
        WHERE title LIKE ? OR artist LIKE ? 
        ORDER BY viewCount DESC LIMIT 30
      `);
      const { results } = await stmt.bind(`%${query}%`, `%${query}%`).all();
      if (Array.isArray(results) && results.length > 0) {
        d1Results = results as Track[];
      }
    } catch (_) {}
  }

  // 2. Fetch live parallel results from YouTube, JioSaavn, and iTunes
  const [ytRes, saavnRes, itunesRes] = await Promise.allSettled([
    searchYouTube(query, 25),
    searchJioSaavn(query, 20, page),
    searchItunes(query, 15)
  ]);

  const ytTracks = ytRes.status === 'fulfilled' ? ytRes.value : [];
  const saavnTracks = saavnRes.status === 'fulfilled' ? saavnRes.value : [];
  const itunesTracks = itunesRes.status === 'fulfilled' ? itunesRes.value : [];

  const combined: Track[] = [...d1Results, ...ytTracks];
  const seenKeys = new Set<string>(combined.map(t => `${t.title.toLowerCase()}::${t.artist.toLowerCase()}`));

  for (const track of [...saavnTracks, ...itunesTracks]) {
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(track);
    }
  }

  // Fallback to query matching in curated list if external searches yield nothing
  if (combined.length === 0) {
    const qLower = query.toLowerCase();
    const curatedMatches = CURATED_POPULAR_TRACKS.filter(t => 
      t.title.toLowerCase().includes(qLower) || t.artist.toLowerCase().includes(qLower)
    );
    return jsonResponse({ results: curatedMatches.length > 0 ? curatedMatches : CURATED_POPULAR_TRACKS.slice(0, 8), source: 'fallback' });
  }

  return jsonResponse({
    results: combined,
    page,
    source: 'multi_source_edge_search'
  });
}
