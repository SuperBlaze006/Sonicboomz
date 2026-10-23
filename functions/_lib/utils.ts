export function jsonResponse(data: any, status = 200, customHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...customHeaders
    }
  });
}

export function errorResponse(message: string, status = 500, code?: string): Response {
  return jsonResponse({ error: message, ...(code ? { code } : {}) }, status);
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

export function cleanArtistName(rawName: string): string {
  if (!rawName) return 'Top Artist';
  return rawName
    .replace(/\s*-\s*Topic\b/gi, '')
    .replace(/\bVEVO\b/gi, '')
    .replace(/\bOfficial\s*(Channel|Music|Video|Audio)?\b/gi, '')
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .trim();
}

export function cleanSongTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return decodeHtmlEntities(rawTitle)
    .replace(/\[[^\]]*(official|video|audio|lyric|4k|hd|full\s*song|mv)[^\]]*\]/gi, '')
    .replace(/\([^)]*(official|video|audio|lyric|4k|hd|full\s*song|mv)[^)]*\)/gi, '')
    .replace(/\b(official\s*music\s*video|official\s*video|official\s*audio|full\s*video\s*song|lyric\s*video|full\s*audio)\b/gi, '')
    .replace(/["']/g, '')
    .replace(/\s+-\s*$/, '')
    .trim();
}

export async function hashPasswordSha256(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':sonic_secure_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
