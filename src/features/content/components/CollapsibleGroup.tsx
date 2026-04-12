"use client";

import { useState } from "react";
import ChevronIcon from "@/components/icons/ChevronIcon";

interface CollapsibleGroupProps {
  label: string;
  defaultOpen?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

export default function CollapsibleGroup({
  label,
  defaultOpen = false,
  leading,
  trailing,
  children,
}: CollapsibleGroupProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors duration-fast hover:bg-[var(--surface-alt)]"
      >
        {leading}
        <span className="text-xs font-medium text-[var(--text)]">{label}</span>
        {trailing}
        <ChevronIcon
          size={12}
          className={`ml-auto shrink-0 text-[var(--muted)] transition-transform duration-fast ${isOpen ? "" : "-rotate-90"}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0,0,0.2,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
