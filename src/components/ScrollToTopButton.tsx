"use client";

interface ScrollToTopButtonProps {
  isVisible: boolean;
}

export default function ScrollToTopButton({
  isVisible,
}: ScrollToTopButtonProps): React.ReactElement {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibilityClass = isVisible
    ? "pointer-events-auto scale-100 opacity-100"
    : "pointer-events-none scale-75 opacity-0";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="맨 위로 스크롤"
      className={`fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] shadow-[var(--shadow-md)] transition-all duration-200 ease-out hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)] ${visibilityClass}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
