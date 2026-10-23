import { jsonResponse } from '../_lib/utils';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return jsonResponse({ suggestions: [] });
  }

  try {
    const res = await fetch(`https://api.jiosaavn.com/api.php?__call=autocomplete.get&query=${encodeURIComponent(q)}&_format=json&_marker=0&ctx=web6dot0`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      const suggestions = new Set<string>();

      (data.songs?.data || []).forEach((s: any) => { if (s.title) suggestions.add(s.title); });
      (data.topquery?.data || []).forEach((item: any) => { if (item.title) suggestions.add(item.title); });
      (data.albums?.data || []).forEach((a: any) => { if (a.title) suggestions.add(a.title); });

      return jsonResponse({ suggestions: Array.from(suggestions).slice(0, 10) });
    }
  } catch (_) {}

  // Fallback to basic suggestions
  return jsonResponse({
    suggestions: [
      q,
      `${q} songs`,
      `${q} official audio`,
      `${q} live`,
      `${q} remix`
    ]
  });
}
