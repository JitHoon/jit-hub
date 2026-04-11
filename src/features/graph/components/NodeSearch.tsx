"use client";

import { cn } from "@/lib/cn";
import SearchIcon from "@/components/icons/SearchIcon";
import type { GraphNode } from "../types/graph";
import { useNodeSearch } from "../hooks/useNodeSearch";
import { SearchSuggestions } from "./SearchSuggestions";

interface NodeSearchProps {
  nodes: GraphNode[];
  onSelect: (nodeId: string) => void;
}

export function NodeSearch({ nodes, onSelect }: NodeSearchProps) {
  const {
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
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleSelect,
  } = useNodeSearch({ nodes, onSelect });

  return (
    <div className="pointer-events-auto relative flex w-full max-w-40 items-center sm:max-w-xs">
      <SearchIcon size={14} className="shrink-0 text-[var(--muted)]" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeItemId}
        placeholder="노드 검색..."
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full border-none bg-transparent px-3 py-1.5",
          "text-sm text-foreground placeholder:text-[var(--muted)]",
          "outline-none",
          "transition-colors duration-[150ms]",
        )}
      />
      {open && (
        <SearchSuggestions
          listId={listId}
          mode={mode}
          groups={groups}
          results={results}
          activeIndex={activeIndex}
          flatItems={flatItems}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
