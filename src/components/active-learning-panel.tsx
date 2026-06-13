"use client";

import type { CourseModule } from "@/lib/course";
import { ModuleLearningBoxes } from "@/components/module-learning-boxes";

export function ActiveLearningPanel({ courseModule }: { courseModule: CourseModule }) {
  return <ModuleLearningBoxes courseModule={courseModule} />;
}
