import Link from "next/link";
import GitHubIcon from "@/components/icons/GitHubIcon";

const GITHUB_URL = "https://github.com/JitHoon/jit-hub";
const AUTHOR = "JitHoon";
const START_YEAR = 2024;

function getCopyrightYear() {
  const currentYear = new Date().getFullYear();
  return currentYear > START_YEAR
    ? `${START_YEAR}–${currentYear}`
    : String(START_YEAR);
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="flex h-12 items-center justify-between px-6">
        <p className="text-xs text-[var(--muted)]">
          © {getCopyrightYear()} {AUTHOR}
        </p>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 레포지토리"
          className="text-[var(--muted)] transition-colors duration-fast hover:text-[var(--foreground)]"
        >
          <GitHubIcon size={18} />
        </Link>
      </div>
    </footer>
  );
}
