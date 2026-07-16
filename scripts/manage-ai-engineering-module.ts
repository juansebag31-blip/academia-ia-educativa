import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareAiEngineeringContent, prepareAiEngineeringModulePackage } from "./prepare-ai-engineering-content";
import { parseAiEngineeringCourseManifest } from "../src/lib/courses/ai-engineering/module-contract";
import {
  canPublishAiEngineeringModule,
  validateAiEngineeringModulePackage,
} from "../src/lib/courses/ai-engineering/module-validator";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courseRoot = path.join(projectRoot, "course-content", "ai-engineering");
const courseManifestPath = path.join(courseRoot, "course-manifest.json");
const modulesRoot = path.join(courseRoot, "modules");

type Command = "validate" | "prepare" | "integrate";

export async function runAiEngineeringModuleCommand(
  command: Command,
  packagePath: string,
  outputPath?: string,
) {
  const packageRoot = path.resolve(packagePath);
  const manifestPath = path.join(packageRoot, "module-manifest.json");
  const manifestValue = JSON.parse(await readFile(manifestPath, "utf8"));
  const validation = await validateAiEngineeringModulePackage(manifestValue, packageRoot);
  const report = {
    command,
    module: validation.manifest.module.editorialSlug,
    publicSlug: validation.manifest.module.publicSlug,
    editorialStatus: validation.manifest.module.editorialStatus,
    publish: validation.manifest.module.publish,
    progressUnits: validation.manifest.module.progressUnits.length,
    cases: validation.caseCount,
    questions: validation.questionCount,
    slides: validation.slideCount,
    sourceFiles: validation.sourceFiles.length,
  };

  if (command === "validate") return report;
  if (command === "prepare") {
    if (!outputPath) throw new Error("The prepare command requires --output <directory>.");
    const prepared = await prepareAiEngineeringModulePackage(manifestValue, packageRoot, path.resolve(outputPath));
    return { ...report, preparedPublicRoot: path.resolve(outputPath), preparedModule: prepared.moduleSlug };
  }

  if (!canPublishAiEngineeringModule(validation.manifest)) {
    throw new Error("Only modules with editorialStatus=approved and publish=true can be integrated into the public catalog.");
  }
  return integratePackage(packageRoot, validation.manifest.module.editorialSlug, report);
}

async function integratePackage(packageRoot: string, editorialSlug: string, report: object) {
  const originalCourseManifest = await readFile(courseManifestPath, "utf8");
  const courseManifest = parseAiEngineeringCourseManifest(JSON.parse(originalCourseManifest));
  const moduleManifest = JSON.parse(await readFile(path.join(packageRoot, "module-manifest.json"), "utf8"));
  const moduleConfig = moduleManifest.module;
  const planIndex = courseManifest.modules.findIndex((entry) => entry.editorialSlug === editorialSlug);
  if (planIndex < 0) throw new Error(`The editorial slug is not part of the approved course itinerary: ${editorialSlug}`);
  const plan = courseManifest.modules[planIndex];
  if (plan.number !== moduleConfig.number || plan.title !== moduleConfig.title) {
    throw new Error("The package number and title must match the approved course itinerary.");
  }

  const destination = path.join(modulesRoot, editorialSlug);
  assertInside(modulesRoot, destination);
  try {
    await mkdir(modulesRoot, { recursive: true });
    await cp(packageRoot, destination, { recursive: true, errorOnExist: true, force: false });
    courseManifest.modules[planIndex] = {
      ...plan,
      publicSlug: moduleConfig.publicSlug,
      editorialStatus: moduleConfig.editorialStatus,
      publish: moduleConfig.publish,
      manifestPath: path.posix.join("modules", editorialSlug, "module-manifest.json"),
    };
    await writeFile(courseManifestPath, `${JSON.stringify(courseManifest, null, 2)}\n`, "utf8");
    await prepareAiEngineeringContent();
    return { ...report, integratedPath: destination, courseManifestPath };
  } catch (error) {
    await writeFile(courseManifestPath, originalCourseManifest, "utf8");
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

function assertInside(parent: string, target: string) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes the expected directory: ${target}`);
  }
}

function readArgument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  const command = process.argv[2] as Command | undefined;
  const packagePath = readArgument("--package");
  const outputPath = readArgument("--output");
  if (!command || !["validate", "prepare", "integrate"].includes(command) || !packagePath) {
    console.error("Usage: tsx scripts/manage-ai-engineering-module.ts <validate|prepare|integrate> --package <path> [--output <path>]");
    process.exitCode = 1;
  } else {
    runAiEngineeringModuleCommand(command, packagePath, outputPath)
      .then((report) => console.log(JSON.stringify(report, null, 2)))
      .catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
      });
  }
}
