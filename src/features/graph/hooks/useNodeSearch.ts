"use client";

import {
  useState,
  useRef,
  useCallback,
  useId,
  useMemo,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CLUSTER_IDS, CLUSTERS } from "@/constants/cluster";
import type { GraphNode } from "../types/graph";
import type { SuggestionGroup, SearchMode } from "../types/search";

interface UseNodeSearchParams {
  nodes: GraphNode[];
  onSelect?: (nodeId: string) => void;
}

export function useNodeSearch({ nodes, onSelect }: UseNodeSearchParams) {
  const router = useRouter();
  const selectHandler = useMemo(
    () => onSelect ?? ((id: string) => router.push(`/?node=${id}`)),
    [onSelect, router],
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const groups = useMemo(() => {
    const grouped: SuggestionGroup[] = [];
    for (const clusterId of CLUSTER_IDS) {
      const clusterNodes = nodes.filter((n) => n.cluster === clusterId);
      if (clusterNodes.length === 0) continue;
      grouped.push({
        clusterId,
        label: CLUSTERS[clusterId].label,
        color: CLUSTERS[clusterId].color,
        nodes: clusterNodes,
      });
    }
    return grouped;
  }, [nodes]);

  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  const results = useMemo(() => {
    if (q.length === 0) return [] as GraphNode[];
    return nodes.filter((node) => node.title.toLowerCase().includes(q));
  }, [nodes, q]);

  const mode: SearchMode =
    q.length === 0 ? "suggestions" : results.length > 0 ? "results" : "empty";

  const flatItems = useMemo(() => {
    if (mode === "results") return results;
    if (mode === "suggestions") return groups.flatMap((g) => g.nodes);
    return [] as GraphNode[];
  }, [mode, results, groups]);

  const handleSelect = useCallback(
    (node: GraphNode) => {
      selectHandler(node.id);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [selectHandler],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey && open)) {
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (
        e.key === "ArrowUp" ||
        (e.key === "Tab" && e.shiftKey && open)
      ) {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flatItems[activeIndex];
        if (activeIndex >= 0 && target) {
          handleSelect(target);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
    },
    [open, flatItems, activeIndex, handleSelect],
  );

  const activeNode = flatItems[activeIndex];
  const activeItemId =
    activeIndex >= 0 && activeNode
      ? `${listId}-item-${activeNode.id}`
      : undefined;

  return {
    query,
    open,
    inputRef,
    listId,
    activeIndex,
    activeItemId,
    flatItems,
    mode,
    groups,
    results,
    handleChange,
    handleFocus: () => setOpen(true),
    handleBlur: () =>
      setTimeout(() => {
        setOpen(false);
        setActiveIndex(-1);
      }, 150),
    handleKeyDown,
    handleSelect,
  };
}
