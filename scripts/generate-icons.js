import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngBuffer(width, height, drawFn) {
  // RGBA buffer: 4 bytes per pixel
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1)); // +1 filter byte per row

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr[16] = 8; // Bit depth: 8
  ihdr[17] = 6; // Color type: 6 (RGBA)
  ihdr[18] = 0; // Compression
  ihdr[19] = 0; // Filter
  ihdr[20] = 0; // Interlace
  const ihdrCrc = crc32(ihdr.subarray(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);

  // IDAT Chunk
  const idat = Buffer.alloc(deflated.length + 12);
  idat.writeUInt32BE(deflated.length, 0);
  idat.write('IDAT', 4);
  deflated.copy(idat, 8);
  const idatCrc = crc32(idat.subarray(4, 8 + deflated.length));
  idat.writeUInt32BE(idatCrc, 8 + deflated.length);

  // IEND Chunk
  const iend = Buffer.alloc(12);
  iend.writeUInt32BE(0, 0);
  iend.write('IEND', 4);
  const iendCrc = crc32(iend.subarray(4, 8));
  iend.writeUInt32BE(iendCrc, 8);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Standard CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

// Icon Drawer: Sonic Boomz crimson music disc with audio waves
function drawSonicIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = isMaskable ? w * 0.40 : w * 0.46; // Safe zone for maskable

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background
  let r = 8, g = 8, b = 10, a = 255;

  if (dist <= maxR) {
    // Disc gradient: Deep crimson (#8c0e18) center to rich burgundy edge (#46040a)
    const factor = dist / maxR;
    r = Math.round(140 - factor * 70);
    g = Math.round(14 - factor * 8);
    b = Math.round(24 - factor * 14);

    // Subtle vinyl grooves
    const groove = Math.sin(dist / (w * 0.025)) * 8;
    r = Math.min(255, Math.max(0, r + Math.round(groove)));

    // Three horizontal sound wave arches
    // Wave 1: y around cy - h * 0.12
    const w1y = cy - h * 0.10;
    const w2y = cy;
    const w3y = cy + h * 0.10;

    const inWave1 = Math.abs((y - w1y) - Math.sin((x - cx) / (w * 0.2)) * (h * 0.04)) < (h * 0.025) && Math.abs(dx) < w * 0.30;
    const inWave2 = Math.abs((y - w2y) - Math.sin((x - cx) / (w * 0.2)) * (h * 0.04)) < (h * 0.023) && Math.abs(dx) < w * 0.26;
    const inWave3 = Math.abs((y - w3y) - Math.sin((x - cx) / (w * 0.2)) * (h * 0.04)) < (h * 0.021) && Math.abs(dx) < w * 0.22;

    if (inWave1 || inWave2 || inWave3) {
      r = 12; g = 12; b = 15; // Dark vinyl audio wave tracks
    }

    // Center disc hole / spindle ring
    const centerDist = Math.sqrt(dx * dx + dy * dy);
    if (centerDist < w * 0.07) {
      if (centerDist < w * 0.035) {
        r = 245; g = 245; b = 250; // White center
      } else {
        r = 239; g = 68; b = 68; // Red accent ring
      }
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Copy app-logo.svg to icon.svg if icon.svg doesn't exist
if (fs.existsSync(path.join(publicDir, 'app-logo.svg'))) {
  fs.copyFileSync(path.join(publicDir, 'app-logo.svg'), path.join(publicDir, 'icon.svg'));
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, (x, y, w, h) => drawSonicIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, (x, y, w, h) => drawSonicIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, (x, y, w, h) => drawSonicIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, (x, y, w, h) => drawSonicIcon(x, y, w, h, false)));
console.log('All PWA icons generated successfully in public/');
