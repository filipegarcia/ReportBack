// Render assets/ico/favicon.svg to every PNG size we ship and pack
// favicon.ico as a multi-resolution PNG-in-ICO. Headless-Chromium via
// Playwright is the only dependency (already in devDeps for the e2e
// suite), so there's nothing extra to install.
//
// Run from the repo root:
//   node scripts/build-favicons.js

const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const ICO_DIR = path.join(__dirname, '..', 'assets', 'ico');

const TARGETS = [
  // Used both standalone (favicon.png) and packed into favicon.ico.
  { size: 16,  file: null },
  { size: 32,  file: null },
  { size: 48,  file: null },
  // Standalone PNG referenced from <link rel="icon">.
  { size: 192, file: 'favicon.png' },
  // Apple touch icons. Names kept for back-compat with existing <link> tags.
  { size: 57,  file: 'apple-touch-icon-57-precomposed.png' },
  { size: 72,  file: 'apple-touch-icon-72-precomposed.png' },
  { size: 114, file: 'apple-touch-icon-114-precomposed.png' },
  { size: 144, file: 'apple-touch-icon-144-precomposed.png' },
];

async function renderAtSize(page, svgMarkup, size) {
  await page.setViewportSize({ width: size, height: size });
  // Inline the SVG so we don't have to fight file:// loading rules.
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svgMarkup}</body></html>`;
  await page.setContent(html);
  return page.screenshot({ omitBackground: true, type: 'png' });
}

// Pack PNG buffers into a multi-resolution .ico file (PNG-in-ICO).
// Reference: https://en.wikipedia.org/wiki/ICO_(file_format)
function packIco(entries) {
  const HEADER = 6;
  const DIR_ENTRY = 16;
  const count = entries.length;
  const headerAndDir = HEADER + DIR_ENTRY * count;
  const totalSize = headerAndDir + entries.reduce((n, e) => n + e.png.length, 0);

  const out = Buffer.alloc(totalSize);
  // ICONDIR
  out.writeUInt16LE(0, 0);      // reserved
  out.writeUInt16LE(1, 2);      // type = ICO
  out.writeUInt16LE(count, 4);  // image count

  let dataOffset = headerAndDir;
  entries.forEach((entry, i) => {
    const dirOff = HEADER + DIR_ENTRY * i;
    // 0 means 256 in the ICO spec; we never go that big here.
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, dirOff + 0); // width
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, dirOff + 1); // height
    out.writeUInt8(0, dirOff + 2);                                  // palette
    out.writeUInt8(0, dirOff + 3);                                  // reserved
    out.writeUInt16LE(1, dirOff + 4);                               // color planes
    out.writeUInt16LE(32, dirOff + 6);                              // bpp
    out.writeUInt32LE(entry.png.length, dirOff + 8);                // image data size
    out.writeUInt32LE(dataOffset, dirOff + 12);                     // image data offset
    entry.png.copy(out, dataOffset);
    dataOffset += entry.png.length;
  });

  return out;
}

(async () => {
  const svgPath = path.join(ICO_DIR, 'favicon.svg');
  const svgMarkup = await fs.readFile(svgPath, 'utf8');

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  const rendered = {};
  for (const { size } of TARGETS) {
    if (rendered[size]) continue;
    process.stdout.write(`rendering ${size}x${size}... `);
    rendered[size] = await renderAtSize(page, svgMarkup, size);
    console.log('ok');
  }

  await browser.close();

  // Write standalone PNGs.
  for (const { size, file } of TARGETS) {
    if (!file) continue;
    await fs.writeFile(path.join(ICO_DIR, file), rendered[size]);
    console.log(`wrote ${file}`);
  }

  // Pack favicon.ico from 16/32/48 (the classic browser-tab triplet).
  const ico = packIco([
    { size: 16, png: rendered[16] },
    { size: 32, png: rendered[32] },
    { size: 48, png: rendered[48] },
  ]);
  await fs.writeFile(path.join(ICO_DIR, 'favicon.ico'), ico);
  console.log(`wrote favicon.ico (${ico.length} bytes, multi-res 16/32/48)`);
})();
