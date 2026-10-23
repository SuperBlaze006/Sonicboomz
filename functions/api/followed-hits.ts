import { Track } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { searchJioSaavn, searchItunes } from '../_lib/musicSources';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const artistsParam = (url.searchParams.get('artists') || '').trim();

  if (!artistsParam) {
    return jsonResponse({ songs: [] });
  }

  const artists = artistsParam.split(',').map(a => a.trim()).filter(Boolean).slice(0, 8);
  const allHits: Track[] = [];

  const results = await Promise.allSettled(
    artists.map(artist => searchJioSaavn(`${artist} top song`, 3, 1))
  );

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allHits.push(...res.value);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const uniqueHits = allHits.filter(t => {
    if (!t.id || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  return jsonResponse({ songs: uniqueHits.slice(0, 24) });
}
