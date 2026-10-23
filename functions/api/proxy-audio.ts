import { jsonResponse } from '../_lib/utils';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return jsonResponse({ error: 'URL parameter is required' }, 400);
  }

  try {
    const audioRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Range': request.headers.get('Range') || 'bytes=0-'
      }
    });

    const newHeaders = new Headers(audioRes.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Accept-Ranges', 'bytes');
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(audioRes.body, {
      status: audioRes.status,
      statusText: audioRes.statusText,
      headers: newHeaders
    });
  } catch (err: any) {
    return jsonResponse({ error: 'Failed to proxy audio' }, 502);
  }
}
