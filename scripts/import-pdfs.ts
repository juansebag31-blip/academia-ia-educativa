import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

const sourceDir = path.join(process.cwd(), "MODULO Y CUADERNILLO");
const outputDir = path.join(process.cwd(), "content", "generated");
const outputFile = path.join(outputDir, "pdf-extracts.json");

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const files = (await fs.readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith(".pdf"));
  const extracts = [];

  for (const file of files) {
    const data = await fs.readFile(path.join(sourceDir, file));
    const parsed = await pdf(data);
    extracts.push({
      file,
      pages: parsed.numpages,
      textPreview: parsed.text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 80),
    });
  }

  await fs.writeFile(outputFile, `${JSON.stringify(extracts, null, 2)}\n`, "utf8");
  console.log(`Generated ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
