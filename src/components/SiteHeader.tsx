import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="flex h-full items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          JIT-Hub
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/projects"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Projects
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
