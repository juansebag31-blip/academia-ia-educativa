import { createReadStream, readFileSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const root = resolve(".generated/course-assets-v2");
const contentTypes = {
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};

function loadEnv(path) {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function upload(file, url, key) {
  const objectPath = `v2/${relative(root, file).split(sep).join("/")}`;
  const endpoint = `${url}/storage/v1/object/course-assets/${encodePath(objectPath)}`;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        duplex: "half",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": contentTypes[extname(file).toLowerCase()],
          "Cache-Control": "31536000",
          "x-upsert": "false",
        },
        body: createReadStream(file),
      });
      const body = await response.text();
      if (response.ok) return "uploaded";
      if (response.status === 409 || body.includes("Duplicate")) return "existing";
      if (attempt === 4) throw new Error(`${response.status} ${body}`);
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((resolveRetry) => setTimeout(resolveRetry, attempt * 2000));
    }
  }
}

const env = loadEnv(resolve(".env.local"));
const files = await walk(root);
let uploaded = 0;
let existing = 0;
let bytes = 0;

for (const [index, file] of files.entries()) {
  const result = await upload(
    file,
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (result === "uploaded") uploaded += 1;
  else existing += 1;
  bytes += (await stat(file)).size;
  console.log(`[${index + 1}/${files.length}] ${result} ${relative(root, file)}`);
}

console.log(
  JSON.stringify(
    {
      files: files.length,
      uploaded,
      existing,
      totalMiB: Number((bytes / 1024 / 1024).toFixed(2)),
    },
    null,
    2,
  ),
);
