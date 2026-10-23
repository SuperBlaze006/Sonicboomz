interface EventContext {
  request: Request;
  next: () => Promise<Response>;
  env: any;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const { request, next } = context;

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    const response = await next();

    // Create a mutable headers instance
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const url = new URL(request.url);
    const path = url.pathname;

    // Apply Tiered Cloudflare Edge Cache headers if not already specified
    if (!newHeaders.has('Cache-Control')) {
      if (path.startsWith('/api/lyrics') || path.startsWith('/api/credits') || path.startsWith('/api/song-credits') || path.startsWith('/api/album-tracks')) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
      } else if (path.startsWith('/api/artist-details') || path.startsWith('/api/artist-all-songs') || path.startsWith('/api/artist-image') || path.startsWith('/api/batch-artist-images') || path.startsWith('/api/top-artists')) {
        newHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      } else if (path.startsWith('/api/search') || path.startsWith('/api/suggestions') || path.startsWith('/api/resolve')) {
        newHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200');
      } else if (path.startsWith('/api/home-widgets') || path.startsWith('/api/feed') || path.startsWith('/api/popular-albums') || path.startsWith('/api/followed-hits')) {
        newHeaders.set('Cache-Control', 'public, max-age=180, s-maxage=1800, stale-while-revalidate=3600');
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Edge Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
