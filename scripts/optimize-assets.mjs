/**
 * scripts/optimize-assets.mjs
 * Mengonversi gambar PNG/JPG di assets/ ke WebP terkompresi di assets/optimized/
 * TANPA mengubah atau menghapus berkas asli.
 *
 * Cara menjalankan:
 *   npm install sharp
 *   node scripts/optimize-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const INPUT_DIR = path.resolve('assets');
const OUTPUT_DIR = path.resolve('assets/optimized');
const MAX_WIDTH = 1920;

async function run() {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error('Modul "sharp" belum terpasang. Jalankan: npm install sharp');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const entries = fs.readdirSync(INPUT_DIR, { withFileTypes: true });
  const imageFiles = entries
    .filter((e) => e.isFile() && /\.(png|jpe?g)$/i.test(e.name))
    .map((e) => e.name);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const filename of imageFiles) {
    const srcPath = path.join(INPUT_DIR, filename);
    const outName = filename.replace(/\.(png|jpe?g)$/i, '.webp');
    const outPath = path.join(OUTPUT_DIR, outName);

    const beforeBytes = fs.statSync(srcPath).size;
    totalBefore += beforeBytes;

    await sharp(srcPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 5 })
      .toFile(outPath);

    const afterBytes = fs.statSync(outPath).size;
    totalAfter += afterBytes;

    const savedPct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    console.log(
      `${filename.padEnd(22)} -> ${outName.padEnd(22)} | ${(beforeBytes / 1048576).toFixed(2)} MB -> ${(afterBytes / 1048576).toFixed(2)} MB (-${savedPct}%)`
    );
  }

  console.log('------------------------------------------------------------------------');
  console.log(
    `Total: ${(totalBefore / 1048576).toFixed(2)} MB -> ${(totalAfter / 1048576).toFixed(2)} MB`
  );
}

run();
