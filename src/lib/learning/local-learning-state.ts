export const LOCAL_LEARNING_STORAGE_KEY = "academia-ia-learning-state-v1";

export type LocalExamAttempt = {
  id: string;
  moduleSlug: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  passed: boolean;
  answers: Record<string, string>;
  createdAt: string;
};

export type LocalLearningState = {
  version: 1;
  completedLessons: Record<string, string>;
  moduleStates: Record<string, unknown>;
  examAttempts: LocalExamAttempt[];
};

const emptyState = (): LocalLearningState => ({
  version: 1,
  completedLessons: {},
  moduleStates: {},
  examAttempts: [],
});

export function getLocalLearningState(): LocalLearningState {
  if (typeof window === "undefined") return emptyState();
  const raw = window.localStorage.getItem(LOCAL_LEARNING_STORAGE_KEY);
  if (!raw) return emptyState();

  try {
    const parsed = JSON.parse(raw) as Partial<LocalLearningState>;
    return {
      version: 1,
      completedLessons: parsed.completedLessons ?? {},
      moduleStates: parsed.moduleStates ?? {},
      examAttempts: Array.isArray(parsed.examAttempts) ? parsed.examAttempts : [],
    };
  } catch {
    return emptyState();
  }
}

export function setLocalLearningState(state: LocalLearningState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_LEARNING_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("academia-ia-learning-state"));
}

export function markLocalLessonCompleted(lessonSlug: string) {
  const state = getLocalLearningState();
  state.completedLessons[lessonSlug] = new Date().toISOString();
  setLocalLearningState(state);
}

export function saveLocalModuleState(moduleSlug: string, value: unknown) {
  const state = getLocalLearningState();
  state.moduleStates[moduleSlug] = value;
  setLocalLearningState(state);
}

export function addLocalExamAttempt(
  attempt: Omit<LocalExamAttempt, "id" | "createdAt">,
) {
  const state = getLocalLearningState();
  state.examAttempts.unshift({
    ...attempt,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  setLocalLearningState(state);
}

export function clearLocalLearningState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_LEARNING_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("academia-ia-learning-state"));
}

export function hasLocalLearningProgress(state = getLocalLearningState()) {
  return (
    Object.keys(state.completedLessons).length > 0 ||
    Object.keys(state.moduleStates).length > 0 ||
    state.examAttempts.length > 0
  );
}
