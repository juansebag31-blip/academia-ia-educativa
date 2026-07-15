"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildAiEngineeringUnitStorageKey,
  readAiEngineeringUnitState,
  writeAiEngineeringUnitState,
  type AiEngineeringUnitCoordinates,
} from "@/lib/courses/ai-engineering/unit-storage";

export type UnitSaveStatus = "pending" | "saved";

export function useAiEngineeringUnitState<T>(
  coordinates: AiEngineeringUnitCoordinates,
  initialValue: T,
) {
  const initialValueRef = useRef(initialValue);
  const { courseSlug, moduleSlug, unitId } = coordinates;
  const stableCoordinates = useMemo(
    () => ({ courseSlug, moduleSlug, unitId }),
    [courseSlug, moduleSlug, unitId],
  );
  const storageKey = buildAiEngineeringUnitStorageKey(stableCoordinates);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<UnitSaveStatus>("saved");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readAiEngineeringUnitState(stableCoordinates, initialValueRef.current));
    setStatus("saved");
    setHydrated(true);
  }, [stableCoordinates, storageKey]);

  useEffect(() => {
    if (!hydrated || status !== "pending") return;

    const timeout = window.setTimeout(() => {
      if (writeAiEngineeringUnitState(stableCoordinates, value)) {
        setStatus("saved");
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [hydrated, stableCoordinates, status, storageKey, value]);

  const updateValue = useCallback((nextValue: T) => {
    setValue(nextValue);
    setStatus("pending");
  }, []);

  const saveNow = useCallback(() => {
    if (writeAiEngineeringUnitState(stableCoordinates, value)) {
      setStatus("saved");
    }
  }, [stableCoordinates, value]);

  const saveValue = useCallback(
    (nextValue: T) => {
      setValue(nextValue);
      if (writeAiEngineeringUnitState(stableCoordinates, nextValue)) {
        setStatus("saved");
      }
    },
    [stableCoordinates],
  );

  return { value, status, updateValue, saveNow, saveValue };
}
