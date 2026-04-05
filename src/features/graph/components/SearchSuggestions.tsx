"use client";

import { cn } from "@/lib/cn";
import type { GraphNode } from "../types/graph";
import type { SuggestionGroup, SearchMode } from "../types/search";

interface SearchSuggestionsProps {
  listId: string;
  mode: SearchMode;
  groups: SuggestionGroup[];
  results: GraphNode[];
  matchedTags: Map<string, string>;
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
  matchedTag,
  onSelect,
}: {
  node: GraphNode;
  matchedTag?: string;
  onSelect: (node: GraphNode) => void;
}) {
  return (
    <li
      role="option"
      aria-selected={false}
      onMouseDown={() => onSelect(node)}
      className={itemClass}
    >
      <span className="font-medium">{node.title}</span>
      <span className="text-xs text-[var(--muted)]">
        {node.cluster} · {node.difficulty}
        {matchedTag && ` · ${matchedTag}`}
      </span>
    </li>
  );
}

export function SearchSuggestions({
  listId,
  mode,
  groups,
  results,
  matchedTags,
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
        {results.map((node) => (
          <NodeItem
            key={node.id}
            node={node}
            matchedTag={matchedTags.get(node.id)}
            onSelect={onSelect}
          />
        ))}
      </ul>
    );
  }

  return (
    <ul id={listId} role="listbox" className={containerClass}>
      {groups.map((group) => (
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
            {group.nodes.map((node) => (
              <NodeItem key={node.id} node={node} onSelect={onSelect} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
