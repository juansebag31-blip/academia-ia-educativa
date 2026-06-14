import { mkdir, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import ffmpegPath from "../.tools/ffmpeg/node_modules/ffmpeg-static/index.js";

const sourceRoot = resolve("public/course-assets");
const outputRoot = resolve(".generated/course-assets-v2");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.name.toLowerCase().endsWith(".mp4")) files.push(path);
  }
  return files;
}

function transcode(source, output) {
  return new Promise((resolveProcess, rejectProcess) => {
    const process = spawn(
      ffmpegPath,
      [
        "-y",
        "-i",
        source,
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        output,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
    process.on("error", rejectProcess);
    process.on("exit", (code) => {
      if (code === 0) resolveProcess();
      else rejectProcess(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

function probe(file) {
  const result = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" });
  const output = result.stderr;
  const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  const videoMatch = output.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
  if (!durationMatch || !videoMatch || !output.includes("Audio:")) {
    throw new Error(`Unable to validate ${file}`);
  }
  return {
    duration:
      Number(durationMatch[1]) * 3600 +
      Number(durationMatch[2]) * 60 +
      Number(durationMatch[3]),
    width: Number(videoMatch[1]),
    height: Number(videoMatch[2]),
  };
}

const files = await walk(sourceRoot);
let sourceBytes = 0;
let outputBytes = 0;

for (const [index, source] of files.entries()) {
  const relativePath = relative(sourceRoot, source);
  const output = join(outputRoot, relativePath);
  await mkdir(resolve(output, ".."), { recursive: true });
  await transcode(source, output);

  const [sourceStat, outputStat] = await Promise.all([stat(source), stat(output)]);
  const sourceMedia = probe(source);
  const outputMedia = probe(output);
  if (
    Math.abs(sourceMedia.duration - outputMedia.duration) > 0.1 ||
    outputMedia.width > sourceMedia.width ||
    outputMedia.height > sourceMedia.height
  ) {
    throw new Error(`Media validation failed for ${relativePath}`);
  }
  sourceBytes += sourceStat.size;
  outputBytes += outputStat.size;
  console.log(`[${index + 1}/${files.length}] ${relativePath}`);
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
