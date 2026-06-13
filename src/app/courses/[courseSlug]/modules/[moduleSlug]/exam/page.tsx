import { notFound } from "next/navigation";
import { ModuleExam } from "@/components/module-exam";
import { courseSeed } from "@/lib/course-seed";
import { findModuleBySlug } from "@/lib/course";

export default async function ExamPage({ params }: { params: Promise<{ courseSlug: string; moduleSlug: string }> }) {
  const { courseSlug, moduleSlug } = await params;

  if (courseSlug !== courseSeed.slug) {
    notFound();
  }

  const courseModule = findModuleBySlug(courseSeed, moduleSlug);
  if (!courseModule) {
    notFound();
  }

  return <ModuleExam courseModule={courseModule} />;
}
