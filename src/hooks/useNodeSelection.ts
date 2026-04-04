"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const NODE_PARAM = "node";

interface UseNodeSelectionReturn {
  selectedNodeId: string | null;
  selectNode: (slug: string) => void;
  clearSelection: () => void;
}

export function useNodeSelection(): UseNodeSelectionReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedNodeId = searchParams.get(NODE_PARAM);

  const selectNode = useCallback(
    (slug: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(NODE_PARAM, slug);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearSelection = useCallback((): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(NODE_PARAM);
    const query = params.toString();
    router.push(query ? `?${query}` : "/", { scroll: false });
  }, [router, searchParams]);

  return { selectedNodeId, selectNode, clearSelection };
}
