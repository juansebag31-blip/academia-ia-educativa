import type { AiEngineeringProgressUnitConfig } from "./module-contract";
import {
  readAiEngineeringUnitState,
  writeAiEngineeringUnitState,
  type AiEngineeringUnitCoordinates,
} from "./unit-storage";

export type AiEngineeringProgressUnit = AiEngineeringProgressUnitConfig;
export type AiEngineeringProgressUnitId = string;
export type AiEngineeringProgressStatus = "not-started" | "in-progress" | "completed";

export type AiEngineeringStandardUnitState = {
  status: AiEngineeringProgressStatus;
  completedAt?: string;
  positionSeconds?: number;
  slideIndex?: number;
};

export type AiEngineeringModuleProgressMeta = {
  lastUnitId?: string;
  completedAt?: string;
};

export type AiEngineeringModuleProgressSnapshot = {
  statuses: Record<string, AiEngineeringProgressStatus>;
  completedCount: number;
  percentage: number;
  lastUnitId?: string;
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
  units: readonly AiEngineeringProgressUnit[],
): AiEngineeringModuleProgressSnapshot {
  const statuses = Object.fromEntries(
    units.map((unit) => [unit.id, readAiEngineeringProgressStatus(courseSlug, moduleSlug, unit)]),
  ) as Record<string, AiEngineeringProgressStatus>;
  const completedCount = Object.values(statuses).filter((status) => status === "completed").length;
  const meta = readAiEngineeringModuleMeta(courseSlug, moduleSlug);

  return {
    statuses,
    completedCount,
    percentage: units.length === 0 ? 0 : Math.floor((completedCount / units.length) * 100),
    lastUnitId: meta.lastUnitId,
    completedAt: meta.completedAt,
  };
}

export function readAiEngineeringProgressStatus(
  courseSlug: string,
  moduleSlug: string,
  unit: AiEngineeringProgressUnit,
): AiEngineeringProgressStatus {
  const coordinates = { courseSlug, moduleSlug, unitId: unit.id };

  if (unit.kind === "activity") {
    const value = readAiEngineeringUnitState<ActivityProgressValue>(coordinates, {});
    if (value.completed || value.status === "completed") return "completed";
    if (value.status === "in-progress" || Boolean(value.response?.trim())) return "in-progress";
    return "not-started";
  }

  if (unit.kind === "self-assessment") {
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
  unit: AiEngineeringProgressUnit,
) {
  if (readAiEngineeringProgressStatus(courseSlug, moduleSlug, unit) !== "not-started") return false;
  const coordinates = { courseSlug, moduleSlug, unitId: unit.id };
  if (unit.kind === "activity") {
    const value = readAiEngineeringUnitState<ActivityProgressValue>(coordinates, {});
    return writeAiEngineeringUnitState(coordinates, { ...value, status: "in-progress" });
  }
  if (unit.kind === "self-assessment") {
    const value = readAiEngineeringUnitState<SelfAssessmentProgressValue>(coordinates, {});
    return writeAiEngineeringUnitState(coordinates, { ...value, status: "in-progress" });
  }
  return patchAiEngineeringStandardUnitState(courseSlug, moduleSlug, unit.id, { status: "in-progress" });
}

export function completeAiEngineeringStandardUnit(
  courseSlug: string,
  moduleSlug: string,
  unitId: string,
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
  unitId: string,
) {
  return readAiEngineeringUnitState<AiEngineeringStandardUnitState>(
    { courseSlug, moduleSlug, unitId },
    emptyStandardState,
  );
}

export function patchAiEngineeringStandardUnitState(
  courseSlug: string,
  moduleSlug: string,
  unitId: string,
  patch: Partial<AiEngineeringStandardUnitState>,
) {
  const coordinates = { courseSlug, moduleSlug, unitId };
  const current = readAiEngineeringUnitState<AiEngineeringStandardUnitState>(coordinates, emptyStandardState);
  const status = current.status === "completed" ? "completed" : (patch.status ?? current.status);
  return writeAiEngineeringUnitState(coordinates, { ...current, ...patch, status });
}

export function readAiEngineeringModuleMeta(courseSlug: string, moduleSlug: string) {
  return readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(
    moduleMetaCoordinates(courseSlug, moduleSlug),
    emptyModuleMeta,
  );
}

export function recordAiEngineeringLastUnit(courseSlug: string, moduleSlug: string, unitId: string) {
  const coordinates = moduleMetaCoordinates(courseSlug, moduleSlug);
  const current = readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(coordinates, emptyModuleMeta);
  if (current.lastUnitId === unitId) return true;
  return writeAiEngineeringUnitState(coordinates, { ...current, lastUnitId: unitId });
}

export function ensureAiEngineeringModuleCompletion(
  courseSlug: string,
  moduleSlug: string,
  units: readonly AiEngineeringProgressUnit[],
) {
  const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug, units);
  if (snapshot.completedCount !== units.length || snapshot.completedAt) return snapshot.completedAt;
  const coordinates = moduleMetaCoordinates(courseSlug, moduleSlug);
  const current = readAiEngineeringUnitState<AiEngineeringModuleProgressMeta>(coordinates, emptyModuleMeta);
  const completedAt = new Date().toISOString();
  writeAiEngineeringUnitState(coordinates, { ...current, completedAt });
  return completedAt;
}

export function findAiEngineeringProgressUnit(
  units: readonly AiEngineeringProgressUnit[],
  unitId: string,
) {
  return units.find((unit) => unit.id === unitId);
}

export function findAiEngineeringProgressUnitByKind(
  units: readonly AiEngineeringProgressUnit[],
  kind: AiEngineeringProgressUnit["kind"],
) {
  return units.find((unit) => unit.kind === kind);
}

function moduleMetaCoordinates(courseSlug: string, moduleSlug: string): AiEngineeringUnitCoordinates {
  return { courseSlug, moduleSlug, unitId: AI_ENGINEERING_MODULE_META_UNIT_ID };
}
