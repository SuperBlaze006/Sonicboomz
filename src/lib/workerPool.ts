// Cloudflare Pages / Worker API Client for Sonic Boomz
// Automatically routes calls to the Cloudflare Pages Functions edge backend (/api/...)
// with seamless fallback, timeout protection, and multi-endpoint failover.

function getWorkerEndpoints(): string[] {
  try {
    const saved = localStorage.getItem('sonic_custom_workers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((url: string) => url.replace(/\/+$/, ''));
      }
    }
  } catch (_) {}

  return [""]; // Default to same-origin relative URLs (/api/...), standard for Cloudflare Pages Functions
}

let currentWorkerIdx = 0;

export async function callApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const workers = getWorkerEndpoints();
  let lastError: Error | null = null;
  const timeoutMs = 15000; // 15s timeout for resilient cellular SIM connectivity

  for (let i = 0; i < workers.length; i++) {
    const base = workers[currentWorkerIdx % workers.length];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedSignal = options?.signal 
        ? options.signal 
        : controller.signal;

      const fullUrl = base ? `${base}${endpoint}` : endpoint;
      const res = await fetch(fullUrl, {
        ...options,
        signal: mergedSignal,
      });
      clearTimeout(timeoutId);
      
      // If one worker hits a rate limit (HTTP 429), switch immediately:
      if (res.status === 429) {
        console.warn(`Endpoint ${currentWorkerIdx} returned 429 Too Many Requests. Failing over...`);
        currentWorkerIdx = (currentWorkerIdx + 1) % workers.length;
        continue;
      }
      
      if (!res.ok) {
        let errMsg = `Request failed (status ${res.status})`;
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errJson = await res.json();
            if (errJson.error) errMsg = errJson.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json() as T;
      } else {
        const text = await res.text();
        try {
          return JSON.parse(text) as T;
        } catch (_) {
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 50)}`);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (workers.length > 1) {
        console.warn(`Worker ${currentWorkerIdx} failed:`, err);
        currentWorkerIdx = (currentWorkerIdx + 1) % workers.length;
      } else {
        throw err;
      }
    }
  }
  
  throw lastError || new Error("Service temporarily unavailable");
}
