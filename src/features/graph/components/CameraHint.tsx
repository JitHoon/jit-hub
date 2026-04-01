"use client";

import { useEffect, useRef, useState } from "react";

interface CameraHintProps {
  dismissed: boolean;
}

const VISIBLE_DURATION_MS = 5000;
const FADE_DURATION_MS = 500;

export function CameraHint({
  dismissed,
}: CameraHintProps): React.ReactElement | null {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );
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

  if (phase === "hidden") return null;

  const opacity = phase === "visible" ? 0.6 : 0;
  const transition =
    phase === "fading"
      ? `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4,0,1,1)`
      : undefined;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        opacity,
        transition,
        pointerEvents: "none",
        color: "var(--color-text-muted)",
        fontSize: "0.875rem",
        whiteSpace: "nowrap",
      }}
    >
      드래그하여 회전 / 스크롤하여 줌
    </div>
  );
}
