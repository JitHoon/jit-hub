import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Typography",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const FontFamilies: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="mb-2 font-mono text-xs text-muted">
          Display — Lexend (font-display)
        </p>
        <p className="font-display text-3xl font-bold text-foreground">
          The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-display text-3xl font-bold text-foreground">
          3D GIS 지식 포트폴리오
        </p>
      </div>
      <div>
        <p className="mb-2 font-mono text-xs text-muted">
          Body — Noto Sans KR (font-sans)
        </p>
        <p className="font-sans text-base text-foreground">
          The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-sans text-base text-foreground">
          빠른 갈색 여우가 게으른 개를 뛰어넘습니다
        </p>
      </div>
    </div>
  ),
};

export const FontWeights: StoryObj = {
  render: () => {
    const weights = [
      { label: "Regular (400)", cls: "font-normal" },
      { label: "Medium (500)", cls: "font-medium" },
      { label: "Bold (700)", cls: "font-bold" },
    ];

    return (
      <div className="space-y-6">
        {weights.map((w) => (
          <div key={w.label}>
            <p className="mb-1 font-mono text-xs text-muted">{w.label}</p>
            <p className={`text-xl text-foreground ${w.cls}`}>
              3D GIS 지식 포트폴리오 — Knowledge Graph
            </p>
          </div>
        ))}
      </div>
    );
  },
};

export const HeadingScale: StoryObj = {
  render: () => {
    const headings = [
      { tag: "h1", size: "2rem", lh: "1.2" },
      { tag: "h2", size: "1.25rem", lh: "1.4" },
      { tag: "h3", size: "1.125rem", lh: "1.4" },
      { tag: "h4", size: "1rem", lh: "1.5" },
    ];

    return (
      <div className="space-y-6">
        <h3 className="font-display text-lg font-medium text-foreground">
          Heading Scale (prose-jithub)
        </h3>
        <div className="prose-jithub max-w-prose space-y-4">
          {headings.map((h) => (
            <div key={h.tag} className="flex items-baseline gap-4">
              <span className="w-24 shrink-0 font-mono text-xs text-muted">
                {h.tag} · {h.size}
              </span>
              {h.tag === "h1" && <h1>Heading 1 — 지식 그래프</h1>}
              {h.tag === "h2" && <h2>Heading 2 — 지식 그래프</h2>}
              {h.tag === "h3" && <h3>Heading 3 — 지식 그래프</h3>}
              {h.tag === "h4" && <h4>Heading 4 — 지식 그래프</h4>}
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const ProseStyle: StoryObj = {
  render: () => (
    <div className="prose-jithub max-w-prose">
      <h1>Heading 1 — 2rem</h1>
      <h2>Heading 2 — 1.25rem</h2>
      <h3>Heading 3 — 1.125rem</h3>
      <p>
        본문 텍스트입니다. <code>inline code</code>가 포함된 문단이며,{" "}
        <a href="#">링크 스타일</a>도 확인할 수 있습니다.
      </p>
      <ul>
        <li>리스트 아이템 1</li>
        <li>리스트 아이템 2</li>
        <li>리스트 아이템 3</li>
      </ul>
      <pre>
        <code>{`// 코드 블록 예시
const greeting = "Hello, World!";
console.log(greeting);`}</code>
      </pre>
    </div>
  ),
};
