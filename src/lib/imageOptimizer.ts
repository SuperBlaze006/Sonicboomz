/**
 * Image Optimizer Utility
 * Converts image URLs into high-efficiency WebP format to save memory & bandwidth
 * without compromising visual fidelity.
 */
import type React from 'react';

export const DEFAULT_FALLBACK_COVER = '/app-logo.svg';

export function applyAppLogoFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  track?: { coverUrl?: string } | null
): void {
  const img = e.currentTarget;
  const isError = e.type === 'error';
  const isYouTubeGrayPlaceholder = img.naturalWidth === 120 && img.naturalHeight === 90;

  if (isError || isYouTubeGrayPlaceholder) {
    const currentSrc = img.src || '';

    // If maxresdefault failed, try hqdefault WebP/JPG
    if (currentSrc.includes('maxresdefault')) {
      img.src = currentSrc.replace('maxresdefault', 'hqdefault');
      return;
    }
    // If vi_webp failed, try regular vi JPG
    if (currentSrc.includes('/vi_webp/')) {
      img.src = currentSrc.replace('/vi_webp/', '/vi/').replace('.webp', '.jpg');
      return;
    }
    // If hqdefault failed, try mqdefault
    if (currentSrc.includes('hqdefault')) {
      img.src = currentSrc.replace('hqdefault', 'mqdefault');
      return;
    }

    if (!img.src.endsWith(DEFAULT_FALLBACK_COVER)) {
      img.src = DEFAULT_FALLBACK_COVER;
    }
  }
}

export function optimizeImage(url?: string, options: { width?: number; quality?: number } = {}): string {
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'undefined' || url === 'null') {
    return DEFAULT_FALLBACK_COVER;
  }

  if (url === DEFAULT_FALLBACK_COVER || url.endsWith('/app-logo.svg')) {
    return DEFAULT_FALLBACK_COVER;
  }

  const { width = 400, quality = 82 } = options;

  // 1. YouTube thumbnail optimization -> Keep reliable hqdefault.jpg which is guaranteed to exist for all videos
  if (url.includes('i.ytimg.com/') || url.includes('img.youtube.com/')) {
    return url.replace('img.youtube.com/vi/', 'i.ytimg.com/vi/');
  }

  // 2. JioSaavn CDN images -> Replace extension and dimension for high-quality WebP
  if (url.includes('jiosaavn.com') || url.includes('saavncdn.com')) {
    return url
      .replace(/150x150/g, '500x500')
      .replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // 3. Unsplash images -> Append auto-format webp with high quality
  if (url.includes('images.unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fm', 'webp');
    urlObj.searchParams.set('q', String(quality));
    if (width) urlObj.searchParams.set('w', String(width));
    return urlObj.toString();
  }

  // 4. Fallback for other external images -> wsrv.nl free WebP image proxy compressor
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's already webp, keep it
    if (url.endsWith('.webp')) return url;
    
    // For general images, use wsrv.nl WebP cache & compression
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&w=${width}&q=${quality}`;
  }

  return url;
}
