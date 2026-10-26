/**
 * Global API Routing Configuration
 * Automatically bridges Cloudflare Pages frontend (or other external hosts)
 * to the live Render backend (https://sonicboomz.onrender.com) while keeping
 * local development, AI Studio preview, and direct Render hosting seamless.
 */

export function getApiBaseUrl(): string {
  // 1. Explicit environment variable override if provided
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '') as string;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Default to same-origin relative URLs ('/api/...').
  // This seamlessly uses Cloudflare Pages Functions (/functions/api/...) on pages.dev,
  // local development server on localhost, AI Studio preview (.run.app), and installed PWA.
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
