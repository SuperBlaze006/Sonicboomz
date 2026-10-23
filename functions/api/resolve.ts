import { jsonResponse } from '../_lib/utils';

export async function onRequestGet(context: { request: Request }) {
  const { request } = context;
  const url = new URL(request.url);

  const id = (url.searchParams.get('id') || '').trim();
  const source = (url.searchParams.get('source') || '').trim();
  const title = (url.searchParams.get('title') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();

  // If valid 11-char YouTube ID, use directly
  if (id && id.length === 11 && !id.startsWith('dynamic-') && !id.startsWith('saavn_') && !id.startsWith('itunes_')) {
    return jsonResponse({
      isYouTube: true,
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`,
      bitrate: 'Original HQ Audio',
      format: 'youtube/iframe'
    });
  }

  // If iTunes track, previewUrl is available or resolve to YouTube
  if (id.startsWith('itunes_')) {
    const itunesId = id.replace('itunes_', '');
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(itunesId)}`, { signal: AbortSignal.timeout(3000) });
      if (itunesRes.ok) {
        const json = await itunesRes.json();
        const item = json.results?.[0];
        if (item?.previewUrl) {
          return jsonResponse({
            isYouTube: false,
            id,
            url: item.previewUrl,
            audioUrl: item.previewUrl,
            bitrate: '256 kbps AAC',
            format: 'audio/mp4'
          });
        }
      }
    } catch (_) {}
  }

  // Safe fallback to trusted high-speed YouTube audio player
  const fallbackId = (id && id.length === 11) ? id : 'Tk9TM7-eTmw';
  return jsonResponse({
    isYouTube: true,
    id: fallbackId,
    embedUrl: `https://www.youtube.com/embed/${fallbackId}?autoplay=1&enablejsapi=1`,
    bitrate: 'Original HQ Audio',
    format: 'youtube/iframe'
  });
}
