import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 bg-[var(--background)]/60 backdrop-blur-md"
    >
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          JIT-Hub
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
