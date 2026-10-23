import { Track } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { searchJioSaavn, searchItunes } from '../_lib/musicSources';
import { parseCollabInfo } from '../_lib/artistsCatalog';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  const rawName = (url.searchParams.get('name') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '30', 10)));

  if (!rawName) {
    return jsonResponse({ error: 'Artist name required' }, 400);
  }

  const cleanName = rawName.replace(/ - Topic|VEVO/gi, '').trim();

  const [saavnTracks, itunesTracks] = await Promise.all([
    searchJioSaavn(cleanName, limit, page),
    searchItunes(cleanName, limit)
  ]);

  const combined: Track[] = [...saavnTracks, ...itunesTracks];
  const seenIds = new Set<string>();
  const songs: Track[] = [];

  for (const track of combined) {
    if (seenIds.has(track.id)) continue;
    seenIds.add(track.id);

    const collab = parseCollabInfo(track.title, track.artist, cleanName);
    songs.push({
      ...track,
      cleanArtist: cleanName,
      artist: collab.displayArtist,
      isCollab: collab.isCollab,
      collabArtists: collab.collabArtists
    });

    if (songs.length >= limit) break;
  }

  return jsonResponse({
    songs,
    artist: cleanName,
    page,
    total: songs.length,
    hasMore: songs.length >= limit
  });
}
