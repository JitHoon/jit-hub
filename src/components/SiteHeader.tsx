import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface SiteHeaderProps {
  children?: React.ReactNode;
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 bg-[var(--background)]/60 backdrop-blur-md"
    >
      <div className="flex h-14 items-center gap-4 px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          JIT-Hub
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {children}
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
