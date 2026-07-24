import {
  AI_ENGINEERING_COURSE_HREF,
  AI_ENGINEERING_COURSE_SLUG,
} from "@/lib/courses/ai-engineering/routes";

const INTERNAL_URL_ORIGIN = "https://internal.academia-ia.invalid";

export const DEFAULT_AUTH_RETURN_TO = "/account";

export type AuthCourseContext = {
  courseSlug: typeof AI_ENGINEERING_COURSE_SLUG;
  href: typeof AI_ENGINEERING_COURSE_HREF;
  title: "AI Engineering Aplicado";
};

export function getSafeInternalReturnTo(value: unknown) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (
    !candidate.startsWith("/")
    || candidate.startsWith("//")
    || candidate.includes("\\")
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return null;
  }

  try {
    const parsed = new URL(candidate, INTERNAL_URL_ORIGIN);
    if (parsed.origin !== INTERNAL_URL_ORIGIN) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function getSafeAuthCourseSlug(value: unknown) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : null;
}

export function getAuthCourseContext(returnTo: unknown, courseSlug: unknown): AuthCourseContext | null {
  const safeReturnTo = getSafeInternalReturnTo(returnTo);
  const safeCourseSlug = getSafeAuthCourseSlug(courseSlug);

  if (
    safeReturnTo !== AI_ENGINEERING_COURSE_HREF
    || safeCourseSlug !== AI_ENGINEERING_COURSE_SLUG
  ) {
    return null;
  }

  return {
    courseSlug: AI_ENGINEERING_COURSE_SLUG,
    href: AI_ENGINEERING_COURSE_HREF,
    title: "AI Engineering Aplicado",
  };
}

export function buildAuthHref(
  path: "/auth/login" | "/auth/register",
  {
    returnTo,
    courseSlug,
    error,
    message,
  }: {
    returnTo?: unknown;
    courseSlug?: unknown;
    error?: string;
    message?: string;
  } = {},
) {
  const params = new URLSearchParams();
  const safeReturnTo = getSafeInternalReturnTo(returnTo);
  const safeCourseSlug = getSafeAuthCourseSlug(courseSlug);

  if (safeReturnTo) params.set("returnTo", safeReturnTo);
  if (safeCourseSlug) params.set("courseSlug", safeCourseSlug);
  if (error) params.set("error", error);
  if (message) params.set("message", message);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
