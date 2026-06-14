import { mkdir, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import sharp from "sharp";

const sourceRoot = resolve("public/course-assets");
const outputRoot = resolve(".generated/course-assets-v2");
const supported = new Set([".png", ".jpg", ".jpeg"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (supported.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

const files = await walk(sourceRoot);
let sourceBytes = 0;
let outputBytes = 0;

for (const file of files) {
  const sourceMetadata = await sharp(file).metadata();
  const relativePath = `${relative(sourceRoot, file)}.webp`;
  const output = join(outputRoot, relativePath);
  await mkdir(resolve(output, ".."), { recursive: true });

  await sharp(file)
    .rotate()
    .webp({ quality: 84, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(output);

  const [sourceStat, outputStat, outputMetadata] = await Promise.all([
    stat(file),
    stat(output),
    sharp(output).metadata(),
  ]);

  if (
    sourceMetadata.width !== outputMetadata.width ||
    sourceMetadata.height !== outputMetadata.height
  ) {
    throw new Error(`Dimension mismatch for ${relativePath}`);
  }

  sourceBytes += sourceStat.size;
  outputBytes += outputStat.size;
}

console.log(
  JSON.stringify(
    {
      files: files.length,
      sourceMiB: Number((sourceBytes / 1024 / 1024).toFixed(2)),
      outputMiB: Number((outputBytes / 1024 / 1024).toFixed(2)),
      reductionPercent: Number((100 - (outputBytes / sourceBytes) * 100).toFixed(1)),
    },
    null,
    2,
  ),
);
