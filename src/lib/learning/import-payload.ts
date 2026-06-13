import type { LocalLearningState } from "./local-learning-state";

export type ImportValidation =
  | { ok: true; value: LocalLearningState }
  | { ok: false; message: string };

export function validateImportPayload(input: unknown): ImportValidation {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "El progreso local no tiene un formato válido." };
  }

  const candidate = input as Partial<LocalLearningState>;
  if (candidate.version !== 1) {
    return { ok: false, message: "La versión del progreso local no es compatible." };
  }

  if (
    !isRecord(candidate.completedLessons) ||
    !isRecord(candidate.moduleStates) ||
    !Array.isArray(candidate.examAttempts)
  ) {
    return { ok: false, message: "El progreso local está incompleto." };
  }

  if (JSON.stringify(candidate).length > 250_000) {
    return { ok: false, message: "El progreso local supera el tamaño permitido." };
  }

  return { ok: true, value: candidate as LocalLearningState };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
