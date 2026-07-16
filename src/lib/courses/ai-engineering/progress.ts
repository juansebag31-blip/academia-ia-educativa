import {
  readAiEngineeringUnitState,
  writeAiEngineeringUnitState,
  type AiEngineeringUnitCoordinates,
} from "./unit-storage";

export const aiEngineeringProgressUnits = [
  { id: "orientacion", sectionId: "orientacion", label: "Orientación" },
  { id: "contenido_fundacional", sectionId: "contenido", label: "Contenido fundacional" },
  { id: "infografia", sectionId: "infografia", label: "Infografía" },
  { id: "audio_explicativo", sectionId: "audio", label: "Audio explicativo" },
  { id: "casos_reales", sectionId: "casos", label: "Casos reales" },
  { id: "presentacion", sectionId: "presentacion", label: "Presentación" },
  { id: "actividad", sectionId: "actividad", label: "Actividad" },
  { id: "autoevaluacion", sectionId: "autoevaluacion", label: "Autoevaluación" },
] as const;

export type AiEngineeringProgressUnit = (typeof aiEngineeringProgressUnits)[number];
export type AiEngineeringProgressUnitId = AiEngineeringProgressUnit["id"];
export type AiEngineeringProgressStatus = "not-started" | "in-progress" | "completed";

export type AiEngineeringStandardUnitState = {
  status: AiEngineeringProgressStatus;
  completedAt?: string;
  positionSeconds?: number;
  slideIndex?: number;
};

export type AiEngineeringModuleProgressMeta = {
  lastUnitId?: AiEngineeringProgressUnitId;
  completedAt?: string;
};

export type AiEngineeringModuleProgressSnapshot = {
  statuses: Record<AiEngineeringProgressUnitId, AiEngineeringProgressStatus>;
  completedCount: number;
  percentage: number;
  lastUnitId?: AiEngineeringProgressUnitId;
  completedAt?: string;
};

export const AI_ENGINEERING_MODULE_META_UNIT_ID = "__module_progress__";

const emptyStandardState: AiEngineeringStandardUnitState = { status: "not-started" };
const emptyModuleMeta: AiEngineeringModuleProgressMeta = {};

type ActivityProgressValue = {
  response?: string;
  completed?: boolean;
  status?: AiEngineeringProgressStatus;
  completedAt?: string;
};

type SelfAssessmentProgressValue = {
  responses?: Record<string, string>;
  reviewed?: boolean;
  status?: AiEngineeringProgressStatus;
  completedAt?: string;
};

export function readAiEngineeringModuleProgress(
  courseSlug: string,
  moduleSlug: string,
): AiEngineeringModuleProgressSnapshot {
  const statuses = Object.fromEntries(
    aiEngineeringProgressUnits.map((unit) => [
      unit.id,
      readAiEngineeringProgressStatus(courseSlug, moduleSlug, unit.id),
    ]),
  ) as Record<AiEngineeringProgressUnitId, AiEngineeringProgressStatus>;
  const completedCount = Object.values(statuses).filter((status) => status === "completed").length;
  const meta = readAiEngineeringModuleMeta(courseSlug, moduleSlug);

  return {
    statuses,
    completedCount,
    percentage: Math.floor((completedCount / aiEngineeringProgressUnits.length) * 100),
    lastUnitId: meta.lastUnitId,
    completedAt: meta.completedAt,
  };
}

export function readAiEngineeringProgressStatus(
  courseSlug: string,
  moduleSlug: string,
  unitId: AiEngineeringProgressUnitId,
): AiEngineeringProgressStatus {
  const coordinates = { courseSlug, moduleSlug, unitId };

  if (unitId === "actividad") {
    const value = readAiEngineeringUnitState<ActivityProgressValue>(coordinates, {});
    if (value.completed || value.status === "completed") return "completed";
    if (value.status === "in-progress" || Boolean(value.response?.trim())) return "in-progress";
    return "not-started";
  }

  if (unitId === "autoevaluacion") {
    const value = readAiEngineeringUnitState<SelfAssessmentProgressValue>(coordinates, {});
    if (value.reviewed || value.status === "completed") return "completed";
    const hasResponse = Object.values(value.responses ?? {}).some((response) => response.trim());
    if (value.status === "in-progress" || hasResponse) return "in-progress";
    return "not-started";
  }

  return readAiEngineeringUnitState<AiEngineeringStandardUnitState>(
    coordinates,
    emptyStandardState,
  ).status;
}

export function markAiEngineeringUnitInProgress(
  courseSlug: string,
  moduleSlug: string,
  unitId: AiEngineeringProgressUnitId,
) {
  if (readAiEngineeringProgressStatus(courseSlug, moduleSlug, unitId) !== "not-started") {
    return false;
  }

  const coordinates = { courseSlug, moduleSlug, unitId };
  if (unitId === "actividad") {
    const value = readAiEngineeringUnitState<ActivityProgressValue>(coordinates, {});
    return writeAiEngineeringUnitState(coordinates, { ...value, status: "in-progress" });
  }
  if (unitId === "autoevaluacion") {
    const value = readAiEngineeringUnitState<SelfAssessmentProgressValue>(coordinates, {});
    return writeAiEngineeringUnitState(coordinates, { ...value, status: "in-progress" });
  }

  return patchAiEngineeringStandardUnitState(courseSlug, moduleSlug, unitId, {
    status: "in-progress",
  });
}

export function completeAiEngineeringStandardUnit(
  courseSlug: string,
  moduleSlug: string,
  unitId: Exclude<AiEngineeringProgressUnitId, "actividad" | "autoevaluacion">,
) {
  const current = readAiEngineeringStandardUnitState(courseSlug, moduleSlug, unitId);
  return patchAiEngineeringStandardUnitState(courseSlug, moduleSlug, unitId, {
    status: "completed",
    completedAt: current.completedAt ?? new Date().toISOString(),
  });
}

export function readAiEngineeringStandardUnitState(
  courseSlug: string,
  moduleSlug: string,
  unitId: Exclude<AiEngineeringProgressUnitId, "actividad" | "autoevaluacion">,
) {
  return readAiEngineeringUnitState<AiEngineeringStandardUnitState>(
    { courseSlug, moduleSlug, unitId },
    emptyStandardState,
  );
}

export function patchAiEngineeringStandardUnitState(
  courseSlug: string,
  moduleSlug: string,
  unitId: Exclude<AiEngineeringProgressUnitId, "actividad" | "autoevaluacion">,
  patch: Partial<AiEngineeringStandardUnitState>,
) {
  const coordinates = { courseSlug, moduleSlug, unitId };
  const current = readAiEngineeringUnitState<AiEngineeringStandardUnitState>(
    coordinates,
    emptyStandardState,
  );
  const status = current.status === "completed" ? "completed" : (patch.status ?? current.status);
  return writeAiEngineeringUnitState(coordinates, { ...current, ...patch, status });
}

export function readAiEngineeringModuleMeta(courseSlug: string, moduleSlug: string) {
  return readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(
    moduleMetaCoordinates(courseSlug, moduleSlug),
    emptyModuleMeta,
  );
}

export function recordAiEngineeringLastUnit(
  courseSlug: string,
  moduleSlug: string,
  unitId: AiEngineeringProgressUnitId,
) {
  const coordinates = moduleMetaCoordinates(courseSlug, moduleSlug);
  const current = readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(
    coordinates,
    emptyModuleMeta,
  );
  if (current.lastUnitId === unitId) return true;
  return writeAiEngineeringUnitState(coordinates, { ...current, lastUnitId: unitId });
}

export function ensureAiEngineeringModuleCompletion(courseSlug: string, moduleSlug: string) {
  const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug);
  if (snapshot.completedCount !== aiEngineeringProgressUnits.length || snapshot.completedAt) {
    return snapshot.completedAt;
  }

  const coordinates = moduleMetaCoordinates(courseSlug, moduleSlug);
  const current = readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(
    coordinates,
    emptyModuleMeta,
  );
  const completedAt = new Date().toISOString();
  writeAiEngineeringUnitState(coordinates, { ...current, completedAt });
  return completedAt;
}

export function findAiEngineeringProgressUnit(unitId: AiEngineeringProgressUnitId) {
  return aiEngineeringProgressUnits.find((unit) => unit.id === unitId);
}

function moduleMetaCoordinates(courseSlug: string, moduleSlug: string): AiEngineeringUnitCoordinates {
  return { courseSlug, moduleSlug, unitId: AI_ENGINEERING_MODULE_META_UNIT_ID };
}
