import { jsonResponse } from '../_lib/utils';
import { resolveArtistImageEdge } from '../_lib/artistsCatalog';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const name = (url.searchParams.get('name') || '').trim();

  if (!name) {
    return jsonResponse({ error: 'Artist name required' }, 400);
  }

  const meta = await resolveArtistImageEdge(name);
  return jsonResponse({
    name: meta.name,
    image: meta.avatar,
    avatar: meta.avatar,
    headerImage: meta.header,
    listeners: meta.listeners,
    verified: meta.verified
  });
}
