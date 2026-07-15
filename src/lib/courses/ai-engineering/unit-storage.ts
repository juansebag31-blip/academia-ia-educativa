const AI_ENGINEERING_UNIT_STORAGE_PREFIX = "academia-ia-ai-engineering-unit-v1";

export type AiEngineeringUnitCoordinates = {
  courseSlug: string;
  moduleSlug: string;
  unitId: string;
};

type StoredUnitState<T> = {
  value: T;
  updatedAt: string;
};

export function buildAiEngineeringUnitStorageKey({
  courseSlug,
  moduleSlug,
  unitId,
}: AiEngineeringUnitCoordinates) {
  return [AI_ENGINEERING_UNIT_STORAGE_PREFIX, courseSlug, moduleSlug, unitId]
    .map((part) => encodeURIComponent(part))
    .join(":");
}

export function readAiEngineeringUnitState<T>(
  coordinates: AiEngineeringUnitCoordinates,
  fallback: T,
) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(buildAiEngineeringUnitStorageKey(coordinates));
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredUnitState<T>>;
    return parsed.value === undefined ? fallback : parsed.value;
  } catch {
    return fallback;
  }
}

export function writeAiEngineeringUnitState<T>(
  coordinates: AiEngineeringUnitCoordinates,
  value: T,
) {
  if (typeof window === "undefined") return false;

  try {
    const stored: StoredUnitState<T> = {
      value,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      buildAiEngineeringUnitStorageKey(coordinates),
      JSON.stringify(stored),
    );
    return true;
  } catch {
    return false;
  }
}
