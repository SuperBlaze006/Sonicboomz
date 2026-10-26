import { jsonResponse } from '../_lib/utils';
import { getArtistsByTaste, ARTISTS_DATABASE } from '../_lib/artistsCatalog';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  const rawTaste = (url.searchParams.get('taste') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(40, Math.max(10, parseInt(url.searchParams.get('limit') || '24', 10)));

  const tasteTags = rawTaste 
    ? rawTaste.split(',').map(t => t.trim()).filter(Boolean) 
    : ['punjabi', 'rap', 'hip-hop', 'bollywood', 'pop'];

  const result = getArtistsByTaste(tasteTags, page, limit);

  // Infinite continuation: cycle through artists database indefinitely
  if (result.artists.length === 0 && ARTISTS_DATABASE.length > 0) {
    const startIndex = ((page - 1) * limit) % ARTISTS_DATABASE.length;
    const cycled = [...ARTISTS_DATABASE.slice(startIndex), ...ARTISTS_DATABASE.slice(0, startIndex)].slice(0, limit);
    const uniqueCycled = cycled.map((a, idx) => ({
      ...a,
      id: `${a.id}-p${page}-${idx}`
    }));
    return jsonResponse({
      artists: uniqueCycled,
      total: 999999,
      page,
      hasMore: true
    });
  }

  return jsonResponse({
    ...result,
    total: 999999,
    page,
    hasMore: true
  });
}
