import courseManifestJson from "../../../../course-content/ai-engineering/course-manifest.json";
import moduleManifestJson from "../../../../course-content/ai-engineering/module-manifest.json";
import {
  parseAiEngineeringCourseManifest,
  parseAiEngineeringModuleManifest,
} from "./module-contract";

export const aiEngineeringCourseManifest = parseAiEngineeringCourseManifest(courseManifestJson);
export const aiEngineeringManifest = parseAiEngineeringModuleManifest(moduleManifestJson);
export const AI_ENGINEERING_COURSE_SLUG = aiEngineeringCourseManifest.courseSlug;
