"use client";

import {
  useCameraHintPhase,
  FADE_DURATION_MS,
} from "../hooks/useCameraHintPhase";

interface CameraHintProps {
  dismissed: boolean;
}

export function CameraHint({
  dismissed,
}: CameraHintProps): React.ReactElement | null {
  const phase = useCameraHintPhase(dismissed);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-sm text-[var(--color-text-muted)] ${
        phase === "visible" ? "opacity-60" : "opacity-0"
      }`}
      style={
        phase === "fading"
          ? {
              transition: `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4,0,1,1)`,
            }
          : undefined
      }
    >
      드래그하여 회전 / 스크롤하여 줌
    </div>
  );
}
