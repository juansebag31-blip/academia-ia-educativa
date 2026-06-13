"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  getLocalLearningState,
  markLocalLessonCompleted,
} from "@/lib/learning/local-learning-state";

export function LessonCompletionButton({ lessonSlug }: { lessonSlug: string }) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(Boolean(getLocalLearningState().completedLessons[lessonSlug]));
  }, [lessonSlug]);

  return (
    <button
      type="button"
      onClick={() => {
        markLocalLessonCompleted(lessonSlug);
        setCompleted(true);
      }}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white sm:w-auto ${
        completed ? "bg-emerald-600" : "bg-ember hover:bg-ember-dark"
      }`}
    >
      <CheckCircle2 size={18} />
      {completed ? "Completado" : "Marcar como completado"}
    </button>
  );
}
