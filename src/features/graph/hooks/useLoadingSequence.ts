"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const REVEALING_DURATION_MS = 500;

type LoadingPhase = "loading" | "revealing" | "ready";

interface UseLoadingSequenceReturn {
  phase: LoadingPhase;
  onEngineReady: () => void;
}

export function useLoadingSequence(): UseLoadingSequenceReturn {
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onEngineReady = useCallback((): void => {
    setPhase((prev) => {
      if (prev !== "loading") return prev;
      timerRef.current = setTimeout(() => {
        setPhase("ready");
      }, REVEALING_DURATION_MS);
      return "revealing";
    });
  }, []);

  return { phase, onEngineReady };
}

export { REVEALING_DURATION_MS };
export type { LoadingPhase };
