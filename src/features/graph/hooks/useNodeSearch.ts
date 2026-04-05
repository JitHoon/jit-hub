"use client";

import { useState, useRef, useCallback, useId, useMemo } from "react";
import { CLUSTER_IDS, CLUSTERS } from "@/constants/cluster";
import type { GraphNode } from "../types/graph";
import type { SuggestionGroup, SearchMode } from "../types/search";

interface UseNodeSearchParams {
  nodes: GraphNode[];
  onSelect: (nodeId: string) => void;
}

export function useNodeSearch({ nodes, onSelect }: UseNodeSearchParams) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
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

  const { results, matchedTags } = useMemo(() => {
    if (q.length === 0)
      return {
        results: [] as GraphNode[],
        matchedTags: new Map<string, string>(),
      };

    const matched: GraphNode[] = [];
    const tags = new Map<string, string>();

    for (const node of nodes) {
      if (node.title.toLowerCase().includes(q)) {
        matched.push(node);
        continue;
      }
      const tag = node.tags.find((t) => t.toLowerCase().includes(q));
      if (tag) {
        matched.push(node);
        tags.set(node.id, tag);
      }
    }

    return { results: matched, matchedTags: tags };
  }, [nodes, q]);

  const mode: SearchMode =
    q.length === 0 ? "suggestions" : results.length > 0 ? "results" : "empty";

  const handleSelect = useCallback(
    (node: GraphNode) => {
      onSelect(node.id);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onSelect],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleBlur = () => {
    // onMouseDown 클릭이 blur보다 먼저 처리되도록 딜레이
    setTimeout(() => setOpen(false), 150);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  return {
    query,
    open,
    inputRef,
    listId,
    mode,
    groups,
    results,
    matchedTags,
    handleChange,
    handleFocus,
    handleBlur,
    handleSelect,
  };
}
