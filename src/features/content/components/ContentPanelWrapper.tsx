"use client";

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
    />
  );
}
