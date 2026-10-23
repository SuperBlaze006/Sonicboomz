// 3D Animated Character Cutout Processor
// Slices 2x2 3D character sheets and performs strict white-studio-backdrop BFS flood-fill
// + halo decontamination so character hair, clothes, and skin remain 100% opaque
// and never blend with the card background color.

const CACHE_VERSION = 'v4';
const cutoutCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();
const imageElementCache = new Map<string, Promise<HTMLImageElement>>();

function loadImageElement(src: string): Promise<HTMLImageElement> {
  const existing = imageElementCache.get(src);
  if (existing) return existing;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });

  imageElementCache.set(src, promise);
  return promise;
}

/**
 * Extracts a single 3D character quadrant (0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right)
 * and removes ONLY the outer white/light-gray studio backdrop via BFS flood-fill.
 * Character hair, skin, and clothing pixels remain 100% opaque (alpha = 255) so background colors
 * never bleed through hair or clothes.
 */
function extract3DCharacterQuadrantCutout(
  img: HTMLImageElement,
  quadrant: 0 | 1 | 2 | 3
): string {
  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return img.src;

  const halfW = img.naturalWidth / 2;
  const halfH = img.naturalHeight / 2;
  const col = quadrant % 2;
  const row = Math.floor(quadrant / 2);

  // Trim 4% margin from quadrant edges to avoid any grid seam
  const marginX = halfW * 0.04;
  const marginY = halfH * 0.04;
  const sx = col * halfW + marginX;
  const sy = row * halfH + marginY;
  const sw = halfW - marginX * 2;
  const sh = halfH - marginY * 2;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Sample ONLY from the extreme top-left and top-right studio corners,
  // and ONLY accept samples that are genuinely light neutral studio backdrop.
  // Never sample from top-center (where hair touches) or lower sides (where clothes touch).
  const borderSamples: Array<[number, number, number]> = [];
  const cornerPoints: Array<[number, number]> = [
    [3, 3],
    [size - 4, 3],
    [3, 18],
    [size - 4, 18],
  ];

  for (const [px, py] of cornerPoints) {
    const idx = (py * size + px) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC - minC;
    const luma = r * 0.299 + g * 0.587 + b * 0.114;
    if (luma >= 214 && minC >= 205 && sat <= 20) {
      borderSamples.push([r, g, b]);
    }
  }

  // Strictly match ONLY bright, low-saturation white/neutral studio backdrop pixels.
  // Dark hair, colored clothes, and warm skin tones will NEVER return true.
  const isBackgroundPixel = (pIdx: number): boolean => {
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC - minC;
    const luma = r * 0.299 + g * 0.587 + b * 0.114;

    // Hard guard: any pixel with luma < 212 or saturation > 24 is part of the character
    // (hair, beard, turban, skin, glasses, or clothing) and must NEVER be treated as background.
    if (luma < 212 || minC < 200 || saturation > 24) {
      return false;
    }

    // Pure white / near-white studio background check
    if (luma >= 228 && minC >= 218 && saturation <= 20) {
      return true;
    }

    // Distance to verified light-neutral corner studio samples
    for (let i = 0; i < borderSamples.length; i++) {
      const [br, bg, bb] = borderSamples[i];
      const dr = r - br;
      const dg = g - bg;
      const db = b - bb;
      const distSq = dr * dr + dg * dg + db * db;
      if (distSq < 650) {
        return true;
      }
    }

    return false;
  };

  // BFS Flood-Fill from outer perimeter where studio background is present
  const visited = new Uint8Array(size * size);
  const bgMask = new Uint8Array(size * size);
  const queue = new Int32Array(size * size);
  let head = 0;
  let tail = 0;

  const enqueueIfBg = (x: number, y: number) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const pos = y * size + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    if (isBackgroundPixel(pos * 4)) {
      bgMask[pos] = 1;
      queue[tail++] = pos;
    }
  };

  // Seed top, left, and right borders
  for (let x = 0; x < size; x++) {
    enqueueIfBg(x, 0);
    enqueueIfBg(x, 1);
  }
  for (let y = 0; y < size; y++) {
    enqueueIfBg(0, y);
    enqueueIfBg(1, y);
    enqueueIfBg(size - 1, y);
    enqueueIfBg(size - 2, y);
  }

  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % size;
    const cy = (curr - cx) / size;

    enqueueIfBg(cx - 1, cy);
    enqueueIfBg(cx + 1, cy);
    enqueueIfBg(cx, cy - 1);
    enqueueIfBg(cx, cy + 1);
  }

  // Apply transparent alpha to flood-filled white background ONLY,
  // and clean white anti-aliased fringe WITHOUT reducing opacity of hair or clothes.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = y * size + x;
      const pIdx = pos * 4;

      if (bgMask[pos] === 1) {
        data[pIdx + 3] = 0;
        continue;
      }

      // Check immediate 1-ring neighbors for background adjacency
      let bgNeighbors1 = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= size) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= size) continue;
          if (bgMask[ny * size + nx] === 1) {
            bgNeighbors1++;
          }
        }
      }

      if (bgNeighbors1 > 0) {
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC - minC;
        const luma = r * 0.299 + g * 0.587 + b * 0.114;

        // Only remove/soften bright white halo pixels on the outer contour edge.
        // Dark hair, skin, and colored clothes stay 100% opaque (alpha = 255)!
        if (luma > 218 && saturation <= 26) {
          data[pIdx + 3] = 0;
        } else if (luma > 196 && saturation <= 24) {
          // Pull out white matte contamination while keeping solid color
          data[pIdx] = Math.round(r * 0.82);
          data[pIdx + 1] = Math.round(g * 0.82);
          data[pIdx + 2] = Math.round(b * 0.82);
          data[pIdx + 3] = 150;
        } else {
          // Solid character edge (hair, beard, clothes): keep 100% opaque
          data[pIdx + 3] = 255;
        }
      } else {
        data[pIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Auto-crop bounding box of non-transparent character pixels and anchor flush to bottom right
  let minX = size;
  let maxX = 0;
  let minY = size;
  let maxY = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return canvas.toDataURL('image/png');
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = size;
  outCanvas.height = size;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return canvas.toDataURL('image/png');

  const charW = maxX - minX + 1;
  const charH = maxY - minY + 1;
  const targetH = Math.round(size * 0.94);
  const scale = Math.min((size * 0.88) / charW, targetH / charH);
  const drawW = Math.round(charW * scale);
  const drawH = Math.round(charH * scale);
  const dx = Math.max(0, Math.round(size - drawW - size * 0.03));
  const dy = size - drawH; // Flush with bottom edge so half-body emerges cleanly from bottom-right of card

  outCtx.drawImage(canvas, minX, minY, charW, charH, dx, dy, drawW, drawH);
  return outCanvas.toDataURL('image/png');
}

export function getCached3DCutout(sheetUrl: string, quadrant: 0 | 1 | 2 | 3): string | null {
  return cutoutCache.get(`${CACHE_VERSION}:${sheetUrl}#q${quadrant}`) || null;
}

export async function process3DCharacterCutout(
  sheetUrl: string,
  quadrant: 0 | 1 | 2 | 3
): Promise<string> {
  const key = `${CACHE_VERSION}:${sheetUrl}#q${quadrant}`;
  const cached = cutoutCache.get(key);
  if (cached) return cached;

  const pending = pendingPromises.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const img = await loadImageElement(sheetUrl);
      const result = extract3DCharacterQuadrantCutout(img, quadrant);
      cutoutCache.set(key, result);
      return result;
    } catch {
      return sheetUrl;
    } finally {
      pendingPromises.delete(key);
    }
  })();

  pendingPromises.set(key, promise);
  return promise;
}
