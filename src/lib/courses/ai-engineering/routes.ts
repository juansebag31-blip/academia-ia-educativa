export const AI_ENGINEERING_COURSE_SLUG = "ai-engineering-aplicado";
export const AI_ENGINEERING_COURSE_HREF = `/courses/${AI_ENGINEERING_COURSE_SLUG}`;

export function isAiEngineeringCoursePath(pathname: string) {
  return pathname === AI_ENGINEERING_COURSE_HREF
    || pathname.startsWith(`${AI_ENGINEERING_COURSE_HREF}/`);
}

export function getAiEngineeringModuleNumber(pathname: string) {
  if (!isAiEngineeringCoursePath(pathname)) return undefined;
  const moduleSlug = pathname.match(/\/modules\/([^/?#]+)/)?.[1];
  const number = moduleSlug?.match(/^modulo-(\d{2})/)?.[1];
  return number ? Number(number) : undefined;
}
