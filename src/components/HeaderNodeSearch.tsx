"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { NodeSearch } from "@/features/graph/components/NodeSearch";
import type { GraphNode } from "@/types/graph";

interface HeaderNodeSearchProps {
  nodes: GraphNode[];
}

export default function HeaderNodeSearch({ nodes }: HeaderNodeSearchProps) {
  const router = useRouter();

  const handleSelect = useCallback(
    (nodeId: string) => {
      router.push(`/nodes/${nodeId}`);
    },
    [router],
  );

  return <NodeSearch nodes={nodes} onSelect={handleSelect} />;
}
