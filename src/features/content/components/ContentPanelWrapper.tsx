"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClusterId } from "@/constants/cluster";
import type { Difficulty } from "@/types/node";
import ContentPanel from "./ContentPanel";

interface ContentPanelWrapperProps {
  title: string;
  cluster: ClusterId;
  difficulty: Difficulty;
  source: string;
  onClosingStart?: () => void;
}

export default function ContentPanelWrapper({
  title,
  cluster,
  difficulty,
  source,
  onClosingStart,
}: ContentPanelWrapperProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const prevSourceRef = useRef<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (prevSourceRef.current === source) return;
    prevSourceRef.current = source;

    let innerRaf: number;
    const outerRaf = requestAnimationFrame(() => {
      setBodyVisible(false);
      innerRaf = requestAnimationFrame(() => setBodyVisible(true));
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [source]);

  function handleClose() {
    if (closeTimerRef.current !== null) return;
    setClosing(true);
    onClosingStart?.();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      router.push("/");
    }, 300);
  }

  return (
    <ContentPanel
      title={title}
      cluster={cluster}
      difficulty={difficulty}
      source={source}
      onClose={handleClose}
      mounted={mounted}
      closing={closing}
      bodyVisible={bodyVisible}
    />
  );
}
