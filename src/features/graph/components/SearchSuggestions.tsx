"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { GraphNode } from "../types/graph";
import type { SuggestionGroup, SearchMode } from "../types/search";

interface SearchSuggestionsProps {
  listId: string;
  mode: SearchMode;
  groups: SuggestionGroup[];
  results: GraphNode[];
  activeIndex: number;
  flatItems: GraphNode[];
  onSelect: (node: GraphNode) => void;
}

const containerClass = cn(
  "absolute left-0 right-0 top-full z-50 mt-1",
  "max-h-72 overflow-y-auto rounded-md border border-border",
  "bg-[var(--surface-elevated)] shadow-[var(--shadow-md)]",
);

const itemClass = cn(
  "flex cursor-pointer flex-col gap-0.5 px-3 py-2",
  "text-sm text-foreground",
  "hover:bg-surface-alt",
  "transition-colors duration-[100ms]",
);

function NodeItem({
  node,
  itemId,
  isActive,
  onSelect,
}: {
  node: GraphNode;
  itemId: string;
  isActive: boolean;
  onSelect: (node: GraphNode) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    const container = el?.closest("[role='listbox']");
    if (!isActive || !el || !(container instanceof HTMLElement)) return;

    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const ctTop = container.scrollTop;
    const ctBottom = ctTop + container.clientHeight;

    if (elTop < ctTop) container.scrollTop = elTop;
    else if (elBottom > ctBottom)
      container.scrollTop = elBottom - container.clientHeight;
  }, [isActive]);

  return (
    <li
      ref={ref}
      id={itemId}
      role="option"
      aria-selected={isActive}
      onMouseDown={() => onSelect(node)}
      className={cn(itemClass, isActive && "bg-surface-alt")}
    >
      <span className="font-medium">{node.title}</span>
      <span className="text-xs text-[var(--muted)]">
        {node.cluster} · {node.difficulty}
      </span>
    </li>
  );
}

export function SearchSuggestions({
  listId,
  mode,
  groups,
  results,
  activeIndex,
  flatItems,
  onSelect,
}: SearchSuggestionsProps) {
  if (mode === "empty") {
    return (
      <div
        className={cn(containerClass, "px-3 py-2 text-sm text-[var(--muted)]")}
      >
        검색 결과 없음
      </div>
    );
  }

  if (mode === "results") {
    return (
      <ul id={listId} role="listbox" className={containerClass}>
        {results.map((node) => {
          const idx = flatItems.indexOf(node);
          return (
            <NodeItem
              key={node.id}
              node={node}
              itemId={`${listId}-item-${node.id}`}
              isActive={idx === activeIndex}
              onSelect={onSelect}
            />
          );
        })}
      </ul>
    );
  }

  let runningIndex = 0;
  return (
    <ul id={listId} role="listbox" className={containerClass}>
      {groups.map((group) => {
        const groupItems = group.nodes.map((node) => {
          const idx = runningIndex++;
          return (
            <NodeItem
              key={node.id}
              node={node}
              itemId={`${listId}-item-${node.id}`}
              isActive={idx === activeIndex}
              onSelect={onSelect}
            />
          );
        });
        return (
          <li key={group.clusterId} role="presentation">
            <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-xs font-semibold text-[var(--muted)]">
                {group.label}
              </span>
            </div>
            <ul role="group" aria-label={group.label}>
              {groupItems}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
