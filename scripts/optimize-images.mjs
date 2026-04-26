import sharp from "sharp";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "public/images";

const tasks = [
  { path: "hero.jpg", width: 2400, format: "jpeg", quality: 80 },
  { path: "logo.png", width: 384, format: "png" },
];

const galleryDir = join(ROOT, "gallery");
for (const f of await readdir(galleryDir)) {
  if (/\.(jpe?g|png)$/i.test(f)) {
    tasks.push({ path: `gallery/${f}`, width: 1920, format: "jpeg", quality: 82 });
  }
}

const results = [];
for (const t of tasks) {
  const full = join(ROOT, t.path);
  const before = (await stat(full)).size;
  const input = await readFile(full);

  let pipeline = sharp(input)
    .rotate()
    .resize({ width: t.width, withoutEnlargement: true });

  if (t.format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: t.quality, mozjpeg: true, progressive: true });
  } else if (t.format === "png") {
    pipeline = pipeline.png({ compressionLevel: 9, quality: 80 });
  }

  const out = await pipeline.toBuffer();
  await writeFile(full, out);
  const after = (await stat(full)).size;
  results.push({ path: t.path, before, after });
}

const fmt = (n) => `${(n / 1024).toFixed(0)} KB`;
const totalBefore = results.reduce((s, r) => s + r.before, 0);
const totalAfter = results.reduce((s, r) => s + r.after, 0);

console.table(
  results.map((r) => ({
    file: r.path,
    before: fmt(r.before),
    after: fmt(r.after),
    saved: `${(100 - (r.after / r.before) * 100).toFixed(0)}%`,
  })),
);
console.log(
  `\nTotal: ${fmt(totalBefore)} → ${fmt(totalAfter)} (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% saved)`,
);
