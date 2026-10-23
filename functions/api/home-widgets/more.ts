import { CloudflareEnv, Track } from '../../_lib/types';
import { jsonResponse } from '../../_lib/utils';
import { searchJioSaavn, searchItunes, CURATED_POPULAR_TRACKS } from '../../_lib/musicSources';

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request } = context;
  const url = new URL(request.url);

  const category = (url.searchParams.get('category') || 'popular').toLowerCase();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));

  let query = 'top trending hit songs official audio';
  if (category === 'hindi') {
    query = 'latest bollywood songs arijit singh shreya ghoshal vishal mishra';
  } else if (category === 'hits2026') {
    query = 'viral global chartbusters 2026 english punjabi';
  } else if (category === 'punjabi') {
    query = 'punjabi top tracks karan aujla diljit dosanjh ap dhillon';
  }

  const [saavnTracks, itunesTracks] = await Promise.all([
    searchJioSaavn(query, 16, page),
    searchItunes(query, 14)
  ]);

  const combined: Track[] = [...saavnTracks, ...itunesTracks];
  if (combined.length === 0) {
    // Offset curated tracks to create non-repeating scroll
    const offset = (page * 4) % CURATED_POPULAR_TRACKS.length;
    const fallback = [...CURATED_POPULAR_TRACKS.slice(offset), ...CURATED_POPULAR_TRACKS.slice(0, offset)];
    return jsonResponse({
      tracks: fallback.slice(0, 10),
      category,
      page,
      source: 'curated_fallback'
    });
  }

  return jsonResponse({
    tracks: combined.slice(0, 16),
    category,
    page,
    source: 'live_edge_more'
  });
}
