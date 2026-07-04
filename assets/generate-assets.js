/**
 * Generates app icon / adaptive icon / splash PNGs from the Lubist logo SVG.
 * One-off tooling — run with `node assets/generate-assets.js`.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_SVG = 'G:/vescavia/Projects/salon-management-app/public/logo/lubist_logo_1.svg';
const OUT = __dirname;
const CREAM = '#f3efe7';
const DENSITY = 1200; // rasterize the 120u SVG at high DPI for crisp downscaling

const fullSvg = fs.readFileSync(SRC_SVG, 'utf8');

// Symbol-only variant: re-crop the viewBox to the flame mark, hiding the wordmark.
const symbolSvg = fullSvg.replace(
  /viewBox="[^"]*"/,
  'viewBox="4 41 36 36"'
);

async function render(svg, size) {
  return sharp(Buffer.from(svg), { density: DENSITY })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function canvas(size, background, inputBuf) {
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: inputBuf, gravity: 'center' }])
    .png();
}

(async () => {
  // App icon: flame mark on cream, filling ~64% of the tile.
  const symIcon = await render(symbolSvg, 660);
  await (await canvas(1024, CREAM, symIcon)).toFile(path.join(OUT, 'icon.png'));

  // Android adaptive foreground: flame mark, transparent bg, kept inside the
  // ~66% safe zone so the launcher mask never clips it.
  const symAdaptive = await render(symbolSvg, 560);
  await (await canvas(1024, { r: 0, g: 0, b: 0, alpha: 0 }, symAdaptive)).toFile(
    path.join(OUT, 'adaptive-icon.png')
  );

  // Splash: full logo (mark + wordmark), transparent so backgroundColor shows.
  const full = await render(fullSvg, 820);
  await (await canvas(1242, { r: 0, g: 0, b: 0, alpha: 0 }, full)).toFile(
    path.join(OUT, 'splash-icon.png')
  );

  console.log('Generated icon.png, adaptive-icon.png, splash-icon.png');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
