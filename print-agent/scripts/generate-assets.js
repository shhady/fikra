'use strict';

/**
 * Generates every binary asset the app and the installer need:
 *
 *   assets/icon.ico              multi-resolution app + installer icon
 *   assets/tray-connected.png    tray icon, healthy
 *   assets/tray-disconnected.png tray icon, offline
 *   assets/logo.png              logo for receipts
 *
 * Written from scratch (a PNG encoder over zlib, plus an ICO container) rather
 * than committing binaries, for two reasons:
 *
 *   1. A repo with checked-in binaries eventually has a stale icon nobody can
 *      regenerate because the source .ai file left with a contractor.
 *   2. It keeps the project honest about "no placeholders" — these are real,
 *      correct image files, produced deterministically by `npm run assets`.
 *
 * Run: npm run assets
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// --------------------------------------------------------------------- canvas

/**
 * A tiny RGBA image buffer with just the drawing primitives these icons need.
 */
class Canvas {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4, 0); // transparent
  }

  /**
   * Alpha-blends a pixel over what is already there.
   * @param {number} x
   * @param {number} y
   * @param {[number, number, number, number]} rgba
   */
  blend(x, y, [r, g, b, a]) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height || a <= 0) return;

    const i = (y * this.width + x) * 4;

    const srcAlpha = a / 255;
    const dstAlpha = this.data[i + 3] / 255;
    const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);

    if (outAlpha === 0) return;

    const mix = (src, dst) => Math.round((src * srcAlpha + dst * dstAlpha * (1 - srcAlpha)) / outAlpha);

    this.data[i] = mix(r, this.data[i]);
    this.data[i + 1] = mix(g, this.data[i + 1]);
    this.data[i + 2] = mix(b, this.data[i + 2]);
    this.data[i + 3] = Math.round(outAlpha * 255);
  }

  /**
   * Filled rounded rectangle, antialiased via 3x3 supersampling.
   *
   * @param {object} rect
   * @param {number} rect.x
   * @param {number} rect.y
   * @param {number} rect.w
   * @param {number} rect.h
   * @param {number} rect.radius
   * @param {(fx: number, fy: number) => [number, number, number, number]} colorAt
   *        called with 0..1 coordinates inside the rect, so callers can gradient
   */
  roundedRect({ x, y, w, h, radius }, colorAt) {
    const samples = 3;

    for (let py = Math.floor(y); py < Math.ceil(y + h); py += 1) {
      for (let px = Math.floor(x); px < Math.ceil(x + w); px += 1) {
        let covered = 0;

        for (let sy = 0; sy < samples; sy += 1) {
          for (let sx = 0; sx < samples; sx += 1) {
            const cx = px + (sx + 0.5) / samples;
            const cy = py + (sy + 0.5) / samples;

            if (insideRoundedRect(cx, cy, x, y, w, h, radius)) covered += 1;
          }
        }

        if (covered === 0) continue;

        const coverage = covered / (samples * samples);
        const [r, g, b, a] = colorAt((px - x) / w, (py - y) / h);

        this.blend(px, py, [r, g, b, Math.round(a * coverage)]);
      }
    }
  }

  /**
   * Filled circle, antialiased.
   * @param {number} cx
   * @param {number} cy
   * @param {number} radius
   * @param {[number, number, number, number]} rgba
   */
  circle(cx, cy, radius, rgba) {
    const samples = 3;

    for (let py = Math.floor(cy - radius - 1); py <= Math.ceil(cy + radius + 1); py += 1) {
      for (let px = Math.floor(cx - radius - 1); px <= Math.ceil(cx + radius + 1); px += 1) {
        let covered = 0;

        for (let sy = 0; sy < samples; sy += 1) {
          for (let sx = 0; sx < samples; sx += 1) {
            const x = px + (sx + 0.5) / samples;
            const y = py + (sy + 0.5) / samples;

            if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) covered += 1;
          }
        }

        if (covered === 0) continue;

        const coverage = covered / (samples * samples);
        this.blend(px, py, [rgba[0], rgba[1], rgba[2], Math.round(rgba[3] * coverage)]);
      }
    }
  }
}

/**
 * @returns {boolean}
 */
function insideRoundedRect(px, py, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);

  if (px < x || py < y || px > x + w || py > y + h) return false;

  // Corner regions are the only places the radius matters.
  const nearLeft = px < x + r;
  const nearRight = px > x + w - r;
  const nearTop = py < y + r;
  const nearBottom = py > y + h - r;

  if (!((nearLeft || nearRight) && (nearTop || nearBottom))) return true;

  const cx = nearLeft ? x + r : x + w - r;
  const cy = nearTop ? y + r : y + h - r;

  return (px - cx) ** 2 + (py - cy) ** 2 <= r ** 2;
}

// ------------------------------------------------------------------ PNG codec

const CRC_TABLE = (() => {
  const table = new Int32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;

    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c;
  }

  return table;
})();

/**
 * @param {Buffer} buffer
 * @returns {number}
 */
function crc32(buffer) {
  let c = 0xffffffff;

  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xffffffff) >>> 0;
}

/**
 * @param {string} type
 * @param {Buffer} data
 * @returns {Buffer}
 */
function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));

  return Buffer.concat([length, typeAndData, crc]);
}

/**
 * Encodes a Canvas as a PNG (8-bit RGBA, no interlacing).
 * @param {Canvas} canvas
 * @returns {Buffer}
 */
function encodePng(canvas) {
  const { width, height, data } = canvas;

  // Each scanline is prefixed with a filter byte. 0 = None; the images are tiny
  // and flat, so a smarter filter would buy nothing.
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);

    raw[rowStart] = 0;
    data.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ ICO codec

/**
 * Packs PNGs into an .ico.
 *
 * Windows Vista and later accept PNG-compressed entries inside an ICO, which is
 * how a 256x256 icon fits without the file ballooning. electron-builder requires
 * a 256x256 entry to exist, so it is always included.
 *
 * @param {Array<{ size: number, png: Buffer }>} images
 * @returns {Buffer}
 */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);

  let offset = header.length + directory.length;

  images.forEach((image, index) => {
    const entry = index * 16;

    // 256 is encoded as 0 — the field is a single byte.
    directory[entry] = image.size >= 256 ? 0 : image.size;
    directory[entry + 1] = image.size >= 256 ? 0 : image.size;
    directory[entry + 2] = 0; // palette size
    directory[entry + 3] = 0; // reserved

    directory.writeUInt16LE(1, entry + 4); // colour planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(image.png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);

    offset += image.png.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.png)]);
}

// ------------------------------------------------------------------- artwork

/** Brand gradient: indigo -> violet. */
function brandGradient(fx, fy) {
  const t = (fx + fy) / 2;

  return [
    Math.round(91 + (155 - 91) * t), // 5b -> 9b
    Math.round(108 + (91 - 108) * t), // 6c -> 5b
    255,
    255,
  ];
}

/**
 * The app icon: a rounded brand tile with a white receipt mark on it.
 * @param {number} size
 * @returns {Canvas}
 */
function drawAppIcon(size) {
  const canvas = new Canvas(size, size);
  const pad = size * 0.06;

  canvas.roundedRect(
    { x: pad, y: pad, w: size - pad * 2, h: size - pad * 2, radius: size * 0.22 },
    brandGradient
  );

  // A receipt: a white rectangle with a torn (zigzag) bottom edge.
  const rw = size * 0.42;
  const rh = size * 0.5;
  const rx = (size - rw) / 2;
  const ry = size * 0.22;

  const white = () => [255, 255, 255, 255];

  canvas.roundedRect({ x: rx, y: ry, w: rw, h: rh * 0.82, radius: size * 0.03 }, white);

  // Tear: triangles hanging off the bottom of the receipt.
  const teeth = 4;
  const toothWidth = rw / teeth;
  const toothHeight = rh * 0.16;
  const tearTop = ry + rh * 0.82;

  for (let t = 0; t < teeth; t += 1) {
    const startX = rx + t * toothWidth;

    for (let y = 0; y < toothHeight; y += 1) {
      // Each row of the triangle narrows toward its point.
      const inset = (y / toothHeight) * (toothWidth / 2);

      for (let x = Math.ceil(startX + inset); x < Math.floor(startX + toothWidth - inset); x += 1) {
        canvas.blend(x, Math.floor(tearTop + y), [255, 255, 255, 255]);
      }
    }
  }

  // Text lines on the receipt.
  const lineColor = [91, 108, 255, 200];
  const lineHeight = Math.max(1, Math.round(size * 0.025));

  for (let i = 0; i < 3; i += 1) {
    const ly = ry + rh * (0.18 + i * 0.18);
    const inset = rw * 0.15;
    const lineWidth = i === 2 ? rw * 0.4 : rw - inset * 2;

    canvas.roundedRect(
      { x: rx + inset, y: ly, w: lineWidth, h: lineHeight, radius: lineHeight / 2 },
      () => lineColor
    );
  }

  return canvas;
}

/**
 * A tray icon: a printer silhouette plus a status dot.
 *
 * Tray icons are 16x16 at 100% scaling, so detail is not the goal — instant,
 * unambiguous state is. The dot is what a manager actually reads.
 *
 * @param {number} size
 * @param {boolean} connected
 * @returns {Canvas}
 */
function drawTrayIcon(size, connected) {
  const canvas = new Canvas(size, size);

  // Windows tray backgrounds are dark by default; a light glyph reads on both.
  const glyph = () => [236, 238, 245, 255];

  // Printer body.
  canvas.roundedRect(
    { x: size * 0.12, y: size * 0.38, w: size * 0.76, h: size * 0.36, radius: size * 0.08 },
    glyph
  );

  // Paper going in at the top.
  canvas.roundedRect(
    { x: size * 0.28, y: size * 0.16, w: size * 0.44, h: size * 0.22, radius: size * 0.03 },
    glyph
  );

  // Paper coming out at the bottom.
  canvas.roundedRect(
    { x: size * 0.28, y: size * 0.7, w: size * 0.44, h: size * 0.16, radius: size * 0.03 },
    () => [200, 205, 220, 255]
  );

  // Status dot, bottom-right. Green = talking to the cloud, red = not.
  const dotRadius = Math.max(2, size * 0.17);

  canvas.circle(
    size - dotRadius - size * 0.04,
    size - dotRadius - size * 0.04,
    dotRadius,
    connected ? [47, 191, 113, 255] : [239, 77, 77, 255]
  );

  return canvas;
}

/**
 * Receipt logo — pure black on white, because it is thresholded to 1 bit before
 * it reaches the printer. Anything mid-grey would be a coin toss.
 * @returns {Canvas}
 */
function drawReceiptLogo() {
  const width = 320;
  const height = 90;

  const canvas = new Canvas(width, height);
  const black = () => [0, 0, 0, 255];

  // A bold "F" mark, drawn as three bars.
  canvas.roundedRect({ x: 10, y: 12, w: 16, h: 66, radius: 3 }, black); // stem
  canvas.roundedRect({ x: 10, y: 12, w: 52, h: 15, radius: 3 }, black); // top arm
  canvas.roundedRect({ x: 10, y: 38, w: 40, h: 14, radius: 3 }, black); // middle arm

  // Underline, suggesting the wordmark without needing a font.
  canvas.roundedRect({ x: 80, y: 62, w: 228, h: 6, radius: 3 }, black);

  // Blocks standing in for the wordmark.
  const blocks = [
    [80, 26, 42],
    [128, 26, 30],
    [164, 26, 52],
    [222, 26, 34],
    [262, 26, 46],
  ];

  for (const [x, y, w] of blocks) {
    canvas.roundedRect({ x, y, w, h: 26, radius: 4 }, black);
  }

  return canvas;
}

// ---------------------------------------------------------------------- build

function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // App / installer icon. Windows picks the closest size, so provide the full set.
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];

  const icoImages = icoSizes.map((size) => ({
    size,
    png: encodePng(drawAppIcon(size)),
  }));

  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.ico'), encodeIco(icoImages));
  console.log(`  icon.ico                (${icoSizes.join(', ')} px)`);

  // Electron's Tray wants a PNG. 32px covers 200% DPI scaling.
  fs.writeFileSync(path.join(ASSETS_DIR, 'tray-connected.png'), encodePng(drawTrayIcon(32, true)));
  console.log('  tray-connected.png      (32 px)');

  fs.writeFileSync(
    path.join(ASSETS_DIR, 'tray-disconnected.png'),
    encodePng(drawTrayIcon(32, false))
  );
  console.log('  tray-disconnected.png   (32 px)');

  fs.writeFileSync(path.join(ASSETS_DIR, 'logo.png'), encodePng(drawReceiptLogo()));
  console.log('  logo.png                (320x90)');

  // A 256x256 PNG is handy for docs, the About box and the update host.
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), encodePng(drawAppIcon(256)));
  console.log('  icon.png                (256 px)');

  console.log(`\nAssets written to ${ASSETS_DIR}`);
}

main();
