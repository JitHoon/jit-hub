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
}

export default function ContentPanelWrapper({
  title,
  cluster,
  difficulty,
  source,
}: ContentPanelWrapperProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const prevSourceRef = useRef<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
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
    router.push("/");
  }

  return (
    <ContentPanel
      title={title}
      cluster={cluster}
      difficulty={difficulty}
      source={source}
      onClose={handleClose}
      mounted={mounted}
      closing={false}
      bodyVisible={bodyVisible}
    />
  );
}
