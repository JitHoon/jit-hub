import type { Difficulty } from "@/types/node";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "고급",
  expert: "전문가",
};

interface DifficultyLabelProps {
  difficulty: Difficulty;
}

export default function DifficultyLabel({ difficulty }: DifficultyLabelProps) {
  return (
    <span className="text-xs text-[var(--muted)]">
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
