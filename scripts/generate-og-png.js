const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// 1. Generate 1200x630 SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <radialGradient id="og-bg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#241B35" />
      <stop offset="60%" stop-color="#0E0C16" />
      <stop offset="100%" stop-color="#07060A" />
    </radialGradient>
    <linearGradient id="og-flame" x1="200" y1="450" x2="400" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF1361" />
      <stop offset="50%" stop-color="#FF5722" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>
    <linearGradient id="og-inner" x1="270" y1="380" x2="330" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF8F00" />
      <stop offset="60%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <linearGradient id="og-text-grad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#FFF0F5" />
      <stop offset="100%" stop-color="#FFA07A" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#og-bg)" />

  <!-- Ambient Glow Behind Flame -->
  <circle cx="280" cy="315" r="160" fill="#FF5722" opacity="0.18" filter="blur(60px)" />

  <!-- Left: SoulFlame Icon (scaled from 64x64 to 240x240 at x=160, y=195) -->
  <g transform="translate(160, 195) scale(3.75)">
    <!-- Primary Outer Flame -->
    <path d="M32 7C33.8 15 39 20.5 43.5 25.5C48 30.5 49.5 36.5 47.5 42.5C44.5 50.5 36.5 55 32 55C27.5 55 19.5 50.5 16.5 42.5C14.5 36.5 16 30.5 20.5 25.5C25 20.5 30.2 15 32 7Z" fill="url(#og-flame)"/>
    <!-- Inner Dancing Soul Spark -->
    <path d="M32 22C33.8 26.5 37 31 37 35.5C37 40.5 34.2 44.5 32 44.5C29.8 44.5 27 40.5 27 35.5C27 31 30.2 26.5 32 22Z" fill="url(#og-inner)"/>
  </g>

  <!-- Right: Typography & Badges -->
  <g transform="translate(450, 160)">
    <!-- Brand Title -->
    <text x="0" y="70" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="800" fill="url(#og-text-grad)" letter-spacing="-1.5">SoulFlame</text>
    
    <!-- Tagline -->
    <text x="0" y="125" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500" fill="#E2D9F3" letter-spacing="-0.3">The Viral Tests: Love, Kink, BDSM &amp; Compatibility</text>

    <!-- Viral Test Badges -->
    <g transform="translate(0, 170)">
      <!-- Row 1 -->
      <g>
        <rect x="0" y="0" width="160" height="38" rx="19" fill="#201A2E" stroke="#FF5722" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="80" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">The BDSM Test</text>
      </g>
      <g transform="translate(175, 0)">
        <rect x="0" y="0" width="150" height="38" rx="19" fill="#201A2E" stroke="#FF1361" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="75" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">The Kink Test</text>
      </g>
      <g transform="translate(340, 0)">
        <rect x="0" y="0" width="220" height="38" rx="19" fill="#201A2E" stroke="#FFA000" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="110" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">Love Compatibility</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 52)">
        <rect x="0" y="0" width="130" height="38" rx="19" fill="#201A2E" stroke="#A855F7" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="65" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">The IQ Test</text>
      </g>
      <g transform="translate(145, 52)">
        <rect x="0" y="0" width="180" height="38" rx="19" fill="#201A2E" stroke="#EC4899" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="90" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">The Friendship Test</text>
      </g>
      <g transform="translate(340, 52)">
        <rect x="0" y="0" width="200" height="38" rx="19" fill="#201A2E" stroke="#06B6D4" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="100" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="600" fill="#FFF">Love Language Test</text>
      </g>
    </g>

    <!-- Footer Trust Tag -->
    <text x="0" y="320" font-family="sans-serif" font-size="16" font-weight="500" fill="#9D94B8">40 Candid Reflections · Private By Default · 100% Free · truth-desire.web.app</text>
  </g>
</svg>`;

const svgPath = path.join(PUBLIC_DIR, 'og-image.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('Written:', svgPath);

// 2. Generate a valid 1200x630 PNG using pure Node.js
function createPng(width, height) {
  function crc32(buf) {
    let table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Header: 8 bytes
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(2, 9); // Truecolor (RGB)
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = chunk('IHDR', ihdrData);

  // Raw image scanlines: (1 + width * 3) bytes per line
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Gradient background with warm flame glow in bottom-left
      const dx = (x - 280) / width;
      const dy = (y - 315) / height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - dist * 2.2);

      let r = Math.min(255, Math.floor(14 + glow * 180));
      let g = Math.min(255, Math.floor(12 + glow * 65));
      let b = Math.min(255, Math.floor(22 + (1 - glow) * 15));

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPng(1200, 630);
const pngPath = path.join(PUBLIC_DIR, 'og-image.png');
fs.writeFileSync(pngPath, pngBuffer);
console.log('Written:', pngPath, `(${pngBuffer.length} bytes)`);
