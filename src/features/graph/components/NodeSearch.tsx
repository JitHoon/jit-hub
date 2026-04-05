"use client";

import { useState, useRef, useCallback, useId } from "react";
import { cn } from "@/lib/cn";
import type { GraphNode } from "../types/graph";

interface NodeSearchProps {
  nodes: GraphNode[];
  onSelect: (nodeId: string) => void;
}

export function NodeSearch({ nodes, onSelect }: NodeSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results =
    query.trim().length > 0
      ? nodes.filter((n) =>
          n.title.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : [];

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
    setOpen(e.target.value.trim().length > 0);
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150);
  };

  const handleFocus = () => {
    if (query.trim().length > 0) setOpen(true);
  };

  return (
    <div className="pointer-events-auto relative w-full max-w-xs">
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="노드 검색..."
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-3 py-1.5",
          "text-sm text-foreground placeholder:text-[var(--muted)]",
          "outline-none focus:border-[var(--border-strong)] focus:ring-1 focus:ring-[var(--border-strong)]",
          "transition-colors duration-[150ms]",
        )}
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1",
            "max-h-60 overflow-y-auto rounded-md border border-border",
            "bg-[var(--surface-elevated)] shadow-[var(--shadow-md)]",
          )}
        >
          {results.map((node) => (
            <li
              key={node.id}
              role="option"
              aria-selected={false}
              onMouseDown={() => handleSelect(node)}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 px-3 py-2",
                "text-sm text-foreground",
                "hover:bg-surface-alt",
                "transition-colors duration-[100ms]",
              )}
            >
              <span className="font-medium">{node.title}</span>
              <span className="text-xs text-[var(--muted)]">
                {node.cluster} · {node.difficulty}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length > 0 && results.length === 0 && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1",
            "rounded-md border border-border bg-[var(--surface-elevated)]",
            "px-3 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]",
          )}
        >
          검색 결과 없음
        </div>
      )}
    </div>
  );
}
