import { jsonResponse } from '../_lib/utils';
import { CURATED_POPULAR_TRACKS } from '../_lib/musicSources';

export async function onRequest(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  return jsonResponse({
    status: 'ok',
    path: url.pathname,
    message: 'Sonic Boomz Edge API Endpoint active',
    results: CURATED_POPULAR_TRACKS.slice(0, 8),
    timestamp: Date.now()
  });
}
