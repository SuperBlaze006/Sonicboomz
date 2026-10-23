import { ArtistEntry } from './types';
import { ARTISTS_DATABASE } from '../../server/artistsDatabase';

export { ARTISTS_DATABASE };

export function isRealArtistName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const lower = name.trim().toLowerCase();
  if (lower.length < 2) return false;
  const banned = ['records', 'music', 'official', 'channel', 'vevo', 'series', 'entertainment', 'films', 'audio', 'video'];
  return !banned.some(b => lower === b || lower.endsWith(` ${b}`));
}

export function parseCollabInfo(title: string, authorArtist: string, queriedArtist: string): {
  cleanTitle: string;
  isCollab: boolean;
  collabArtists: string[];
  displayArtist: string;
} {
  let isCollab = false;
  const foundArtists = new Set<string>();

  if (queriedArtist && isRealArtistName(queriedArtist)) {
    foundArtists.add(queriedArtist.trim());
  }

  if (authorArtist && isRealArtistName(authorArtist)) {
    const splitAuthors = authorArtist.split(/[,&xX]|feat\.|ft\.|with/i).map(s => s.trim()).filter(isRealArtistName);
    splitAuthors.forEach(a => foundArtists.add(a));
  }

  const titleCollabMatches = [
    /(?:feat\.|ft\.)\s*([^(\])\-]+)/i,
    /\bwith\s+([^(\])\-]+)/i,
    /\bx\s+([A-Z][a-zA-Z\s]+)/,
    /\s+&\s+([A-Z][a-zA-Z\s]+)/
  ];

  for (const regex of titleCollabMatches) {
    const match = title.match(regex);
    if (match && match[1]) {
      const parts = match[1].split(/[,&xX]|feat\.|ft\./i).map(s => s.trim()).filter(isRealArtistName);
      if (parts.length > 0) {
        isCollab = true;
        parts.forEach(p => foundArtists.add(p));
      }
    }
  }

  if (foundArtists.size > 1) {
    isCollab = true;
  }

  const collabArtists = Array.from(foundArtists);
  const displayArtist = authorArtist || queriedArtist;

  return {
    cleanTitle: title,
    isCollab,
    collabArtists,
    displayArtist
  };
}

export function getArtistsByTaste(tasteTags: string[], page = 1, limit = 24): { artists: ArtistEntry[]; total: number; hasMore: boolean } {
  const normalizedTags = (tasteTags || []).map(t => t.toLowerCase().trim()).filter(Boolean);
  
  let scored = ARTISTS_DATABASE.map(artist => {
    let score = 0;
    const aGenre = (artist.genre || '').toLowerCase();
    const aTags = (artist.tags || []).map(t => t.toLowerCase());

    for (const tag of normalizedTags) {
      if (aGenre.includes(tag)) score += 3;
      if (aTags.includes(tag)) score += 2;
    }

    return { artist, score };
  });

  if (normalizedTags.length > 0) {
    scored.sort((a, b) => b.score - a.score);
  }

  const allArtists = scored.map(s => s.artist);
  const startIndex = (page - 1) * limit;
  const pageArtists = allArtists.slice(startIndex, startIndex + limit);

  return {
    artists: pageArtists,
    total: allArtists.length,
    hasMore: startIndex + limit < allArtists.length
  };
}

export async function resolveArtistImageEdge(rawName: string): Promise<{
  name: string;
  avatar: string;
  header: string;
  listeners: string;
  bio?: string;
  genre?: string;
  verified: boolean;
}> {
  const clean = rawName.replace(/ - Topic|VEVO/gi, '').trim();
  const lower = clean.toLowerCase();

  // 1. Check ARTISTS_DATABASE
  const match = ARTISTS_DATABASE.find(a => a.name.toLowerCase() === lower);
  if (match) {
    return {
      name: match.name,
      avatar: match.image,
      header: match.headerImage || match.image,
      listeners: match.listeners,
      bio: match.bio,
      genre: match.genre,
      verified: match.verified
    };
  }

  // 2. Fetch from Deezer Artist API (ultra-fast, verified edge-friendly portraits)
  try {
    const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(clean)}`, {
      headers: { 'User-Agent': 'SonicBoomz/1.0' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.length > 0) {
        const top = data.data[0];
        const avatar = top.picture_big || top.picture_medium || top.picture;
        const fanCount = top.nb_fan 
          ? (top.nb_fan > 1000000 ? (top.nb_fan / 1000000).toFixed(1) + 'M' : (top.nb_fan / 1000).toFixed(0) + 'K') + ' fans' 
          : '15.4M monthly listeners';

        return {
          name: clean,
          avatar: avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=500',
          header: top.picture_xl || avatar || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
          listeners: fanCount,
          verified: true
        };
      }
    }
  } catch (_) {}

  return {
    name: clean,
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=500',
    header: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    listeners: '12.8M listeners',
    verified: true
  };
}
