"use client";

import { useEffect, useRef, useState } from "react";

const VISIBLE_DURATION_MS = 5000;
const FADE_DURATION_MS = 500;

type Phase = "visible" | "fading" | "hidden";

export function useCameraHintPhase(dismissed: boolean): Phase {
  const [phase, setPhase] = useState<Phase>("visible");
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    autoTimerRef.current = setTimeout(() => {
      setPhase("fading");
      fadeTimerRef.current = setTimeout(() => {
        setPhase("hidden");
      }, FADE_DURATION_MS);
    }, VISIBLE_DURATION_MS);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!dismissed) return;

    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    fadeTimerRef.current = setTimeout(() => {
      setPhase((prev) => (prev === "visible" ? "fading" : prev));
      fadeTimerRef.current = setTimeout(() => {
        setPhase("hidden");
      }, FADE_DURATION_MS);
    }, 0);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [dismissed]);

  return phase;
}

export { FADE_DURATION_MS };
