import { jsonResponse } from '../_lib/utils';
import { resolveArtistImageEdge } from '../_lib/artistsCatalog';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const namesParam = (url.searchParams.get('names') || '').trim();

  if (!namesParam) {
    return jsonResponse({ images: {} });
  }

  const names = namesParam.split(',').map(n => n.trim()).filter(Boolean).slice(0, 30);
  const images: Record<string, string> = {};

  await Promise.all(
    names.map(async (name) => {
      try {
        const meta = await resolveArtistImageEdge(name);
        if (meta && meta.avatar) {
          images[name] = meta.avatar;
        }
      } catch (_) {}
    })
  );

  return jsonResponse({ images });
}
