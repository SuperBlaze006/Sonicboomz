/**
 * Global API Routing Configuration
 * Automatically bridges Cloudflare Pages frontend (or other external hosts)
 * to the live Render backend (https://sonicboomz.onrender.com) while keeping
 * local development, AI Studio preview, and direct Render hosting seamless.
 */

export const RENDER_BACKEND_URL = 'https://sonicboomz.onrender.com';

export function getApiBaseUrl(): string {
  // 1. Explicit environment variable override
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '') as string;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Check current browser hostname
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // Only use Render backend when explicitly running on Cloudflare Pages static hosting.
    // For local development, AI Studio preview (.run.app), or direct Render hosting, use local relative paths ('').
    if (hostname.includes('pages.dev') || hostname.includes('github.io')) {
      return RENDER_BACKEND_URL;
    }
    return '';
  }

  return '';
}

export async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = input;
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const base = getApiBaseUrl();
    if (base) {
      url = `${base}${url}`;
    }
  } else if (url instanceof URL && url.pathname.startsWith('/api/')) {
    const base = getApiBaseUrl();
    if (base) {
      url = new URL(`${base}${url.pathname}${url.search}${url.hash}`);
    }
  }
  return fetch(url, init);
}

// Global safe fetch interceptor ensuring all `/api/*` calls route correctly
if (typeof window !== 'undefined' && !(window as any).__api_fetch_intercepted__) {
  (window as any).__api_fetch_intercepted__ = true;
  try {
    const originalFetch = window.fetch;
    const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = input;
      if (typeof url === 'string' && url.startsWith('/api/')) {
        const base = getApiBaseUrl();
        if (base) {
          url = `${base}${url}`;
        }
      } else if (url instanceof URL && url.pathname.startsWith('/api/')) {
        const base = getApiBaseUrl();
        if (base) {
          url = new URL(`${base}${url.pathname}${url.search}${url.hash}`);
        }
      }
      return originalFetch(url, init);
    };

    try {
      window.fetch = interceptedFetch;
    } catch {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        writable: true,
        value: interceptedFetch,
      });
    }
  } catch (e) {
    console.warn('Could not intercept window.fetch, using fetchApi helper instead:', e);
  }
}
