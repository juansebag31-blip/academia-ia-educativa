"use client";

import { Headphones } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  patchAiEngineeringStandardUnitState,
  readAiEngineeringStandardUnitState,
} from "@/lib/courses/ai-engineering/progress";

export function AiEngineeringAudioPlayer({
  courseSlug,
  moduleSlug,
  src,
  type,
  title,
}: {
  courseSlug: string;
  moduleSlug: string;
  src: string;
  type: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedSecondRef = useRef(0);

  useEffect(() => {
    const state = readAiEngineeringStandardUnitState(
      courseSlug,
      moduleSlug,
      "audio_explicativo",
    );
    const position = Math.max(0, state.positionSeconds ?? 0);
    setSavedPosition(position);
    lastSavedSecondRef.current = Math.floor(position);
  }, [courseSlug, moduleSlug]);

  function savePosition(positionSeconds: number) {
    const roundedPosition = Math.max(0, Math.floor(positionSeconds));
    lastSavedSecondRef.current = roundedPosition;
    patchAiEngineeringStandardUnitState(courseSlug, moduleSlug, "audio_explicativo", {
      status: "in-progress",
      positionSeconds: roundedPosition,
    });
  }

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        aria-label={`${savedPosition > 0 ? "Continuar" : "Reproducir"} ${title}`}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 motion-reduce:transition-none"
      >
        <Headphones size={20} aria-hidden="true" />
        {savedPosition > 0 ? "Continuar audio" : "Cargar y reproducir audio"}
      </button>
    );
  }

  return (
    <audio
      ref={audioRef}
      className="w-full"
      controls
      autoPlay
      preload="metadata"
      aria-label={title}
      onLoadedMetadata={(event) => {
        if (savedPosition > 0 && savedPosition < event.currentTarget.duration) {
          event.currentTarget.currentTime = savedPosition;
        }
      }}
      onTimeUpdate={(event) => {
        const currentSecond = Math.floor(event.currentTarget.currentTime);
        if (currentSecond - lastSavedSecondRef.current >= 5) savePosition(currentSecond);
      }}
      onPause={(event) => savePosition(event.currentTarget.currentTime)}
      onEnded={() => savePosition(0)}
    >
      <source src={src} type={type} />
      Tu navegador no puede reproducir este audio.
    </audio>
  );
}
