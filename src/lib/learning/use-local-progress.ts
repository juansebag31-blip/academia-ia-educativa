"use client";

import { useEffect, useState } from "react";
import { getLocalLearningState } from "./local-learning-state";

export function useCompletedLessonSlugs() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => {
      setCompleted(new Set(Object.keys(getLocalLearningState().completedLessons)));
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("academia-ia-learning-state", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("academia-ia-learning-state", refresh);
    };
  }, []);

  return completed;
}
