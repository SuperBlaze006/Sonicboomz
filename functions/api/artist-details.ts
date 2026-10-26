import { Track } from '../_lib/types';
import { jsonResponse, decodeHtmlEntities, cleanSongTitle } from '../_lib/utils';
import { resolveArtistImageEdge, parseCollabInfo, ARTISTS_DATABASE } from '../_lib/artistsCatalog';
import { searchYouTube, searchJioSaavn, searchItunes, fetchLiveAlbums } from '../_lib/musicSources';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const rawName = (url.searchParams.get('name') || '').trim();

  if (!rawName) {
    return jsonResponse({ error: 'Artist name required' }, 400);
  }

  const cleanName = rawName.replace(/ - Topic|VEVO/gi, '').trim();

  const [artistMeta, ytSongs1, ytSongs2, saavnSongs, itunesSongs, albums] = await Promise.all([
    resolveArtistImageEdge(cleanName),
    searchYouTube(`${cleanName} official music video`, 20),
    searchYouTube(`${cleanName} top songs audio`, 20),
    searchJioSaavn(`${cleanName} top hits`, 20, 1),
    searchItunes(`${cleanName} best songs`, 20),
    fetchLiveAlbums(cleanName, 12, 1)
  ]);

  const rawTracks: Track[] = [...ytSongs1, ...ytSongs2, ...saavnSongs, ...itunesSongs];
  const seenIds = new Set<string>();
  const popularSongs: Track[] = [];

  for (const track of rawTracks) {
    if (seenIds.has(track.id)) continue;
    seenIds.add(track.id);

    const collab = parseCollabInfo(track.title, track.artist, cleanName);
    popularSongs.push({
      ...track,
      cleanArtist: cleanName,
      artist: collab.displayArtist,
      isCollab: collab.isCollab,
      collabArtists: collab.collabArtists
    });

    if (popularSongs.length >= 25) break;
  }

  // Similar artists based on genre
  const similar = ARTISTS_DATABASE.filter(a => 
    a.name.toLowerCase() !== cleanName.toLowerCase() && 
    (artistMeta.genre ? a.genre.toLowerCase().includes(artistMeta.genre.toLowerCase()) : true)
  ).slice(0, 8).map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    listeners: a.listeners,
    image: a.image
  }));

  // Discography items
  const discography = (albums || []).map((alb, idx) => ({
    id: alb.id || `alb-${idx}`,
    title: alb.title,
    artist: alb.artist || cleanName,
    year: alb.year || 2025,
    type: alb.type || 'Album',
    trackCount: alb.trackCount || 8,
    coverUrl: alb.coverUrl,
    genre: artistMeta.genre || 'Music'
  }));

  // Curated artist official playlists
  const playlists = [
    {
      id: `pl-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}-1`,
      title: `This Is ${cleanName}`,
      subtitle: `Essential hits, chart-toppers and breakthrough anthems from ${cleanName}`,
      year: 2026,
      trackCount: Math.max(12, popularSongs.length),
      coverUrl: artistMeta.header || artistMeta.avatar || (popularSongs[0]?.coverUrl) || '/app-logo.svg'
    },
    {
      id: `pl-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}-2`,
      title: `${cleanName} Radio`,
      subtitle: `Non-stop flow of ${cleanName} plus similar top genre artists`,
      year: 2026,
      trackCount: 25,
      coverUrl: artistMeta.avatar || artistMeta.header || (popularSongs[1]?.coverUrl) || '/app-logo.svg'
    }
  ];

  return jsonResponse({
    name: cleanName,
    artist: cleanName,
    avatar: artistMeta.avatar,
    headerImage: artistMeta.header,
    listeners: artistMeta.listeners,
    bio: artistMeta.bio || `${cleanName} is a celebrated musical artist with millions of worldwide listeners and chart-topping streams.`,
    genre: artistMeta.genre || 'Top Artist',
    verified: artistMeta.verified,
    popularSongs,
    albums,
    discography,
    playlists,
    similarArtists: similar,
    source: 'cloudflare_pages_edge'
  });
}
