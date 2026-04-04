"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import ChevronIcon from "@/components/icons/ChevronIcon";

const NAV_ITEMS = [
  { href: "/", label: "지식 그래프" },
  { href: "/projects", label: "프로젝트" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 bg-[var(--background)]/60 backdrop-blur-md"
    >
      <div className="flex h-14 items-center justify-between px-6">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="true"
            className="flex cursor-pointer items-center gap-1 font-display text-lg font-bold tracking-tight text-[var(--foreground)]"
          >
            JIT-Hub
            <ChevronIcon
              size={14}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className="absolute left-0 top-full overflow-hidden rounded-b-lg bg-[var(--background)]/60 backdrop-blur-md transition-[max-height] duration-200 ease-out"
            style={{ maxHeight: open ? `${NAV_ITEMS.length * 40}px` : "0px" }}
          >
            <nav className="py-1">
              {NAV_ITEMS.map(({ href, label }, i) => (
                <div key={href}>
                  {i > 0 && (
                    <div className="mx-3 border-t border-[var(--border)]" />
                  )}
                  <Link
                    href={href}
                    onClick={close}
                    className="block whitespace-nowrap px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
