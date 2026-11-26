/*
 * Renders the Browine app icons from the capybara drawn in code (js/art.js).
 * Usage: node tools/make-icons.js   (requires Playwright with Chromium)
 *
 * iPhone needs a square PNG without transparency (it rounds the corners itself),
 * Android uses the 192/512 PNGs and the "maskable" one (cropped to a circle).
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'js/art.js'), 'utf8')); // defines window.Art
const A = window.Art;
const BG = '#14B4E0';

// `big` frames the head like the in-app icon; `safe` keeps it inside the maskable circle.
const FRAMES = {
  big: 'translate(-38 -14) scale(.5)',
  safe: 'translate(-22 -2) scale(.41)',
};

function iconSvg({ rounded, frame }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100"${rounded ? ' rx="22"' : ''} fill="${BG}"/>` +
    `<path d="M0 84 C18 78 32 90 50 84 C68 78 82 90 100 84 L100 100 L0 100 Z" fill="#fff" opacity=".18"/>` +
    `<g transform="${FRAMES[frame]}">${A.capybara({})}</g></svg>`;
}

const OUTPUTS = [
  { file: 'apple-touch-icon.png', size: 180, frame: 'big' },
  { file: 'icon-192.png', size: 192, frame: 'big' },
  { file: 'icon-512.png', size: 512, frame: 'big' },
  { file: 'icon-maskable-512.png', size: 512, frame: 'safe' },
];

(async () => {
  fs.writeFileSync(path.join(root, 'icon.svg'), iconSvg({ rounded: true, frame: 'big' }).replace(/\s+/g, ' '));
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const o of OUTPUTS) {
    await page.setViewportSize({ width: o.size, height: o.size });
    const svg = iconSvg({ rounded: false, frame: o.frame }).replace('<svg ', `<svg width="${o.size}" height="${o.size}" `);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(root, o.file), clip: { x: 0, y: 0, width: o.size, height: o.size } });
    console.log('wrote', o.file);
  }
  await browser.close();
})();
