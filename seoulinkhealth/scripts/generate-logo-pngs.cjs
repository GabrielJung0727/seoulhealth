/**
 * Generate PNG variants from SVG logo files using sharp.
 * Run with: node scripts/generate-logo-pngs.cjs
 */
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const PUBLIC = path.join(__dirname, '..', 'public')

const tasks = [
  // [input SVG, output PNG, width, density (DPI), background]
  ['logo-primary.svg',    'logo-primary.png',    1440, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['logo-primary.svg',    'logo-primary-cream.png', 1440, 384, '#F8F5F0'],
  ['logo-light.svg',      'logo-light.png',      1440, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['logo-light.svg',      'logo-light-navy.png', 1440, 384, '#0D1B2A'],
  ['logo-mark.svg',       'logo-mark.png',        720, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['logo-horizontal.svg', 'logo-horizontal.png', 1800, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['favicon.svg',         'favicon-512.png',      512, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['favicon.svg',         'favicon-256.png',      256, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['favicon.svg',         'favicon-180.png',      180, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
  ['favicon.svg',         'favicon-32.png',        32, 384, { r: 0, g: 0, b: 0, alpha: 0 }],
]

;(async () => {
  for (const [src, out, width, density, bg] of tasks) {
    const inPath  = path.join(PUBLIC, src)
    const outPath = path.join(PUBLIC, out)
    if (!fs.existsSync(inPath)) {
      console.log('skip (missing):', src)
      continue
    }
    try {
      let img = sharp(inPath, { density }).resize({ width })
      if (typeof bg === 'string' || (bg && typeof bg === 'object' && bg.alpha !== 0)) {
        img = img.flatten({ background: bg })
      }
      await img.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(outPath)
      const { size } = fs.statSync(outPath)
      console.log(`OK  ${out.padEnd(28)} ${(size / 1024).toFixed(1).padStart(7)} KB`)
    } catch (err) {
      console.error(`ERR ${src} -> ${out}:`, err.message)
    }
  }
  console.log('\nDone.')
})()
