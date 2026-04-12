import type { Meta, StoryObj } from "@storybook/react";
import {
  KICK,
  LIGHT,
  DARK,
  GRAPH_GRAY,
  type Palette,
  type GraphGray,
} from "@/constants/tokens";

const meta = {
  title: "Design System/Colors",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

interface SwatchProps {
  name: string;
  color: string;
}

function Swatch({ name, color }: SwatchProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-16 w-16 rounded-lg border border-border bg-[var(--swatch-color)]"
        style={{ "--swatch-color": color } as React.CSSProperties}
      />
      <span className="font-mono text-xs text-muted">{name}</span>
      <span className="font-mono text-[10px] text-muted">{color}</span>
    </div>
  );
}

interface PaletteGridProps {
  palette: Palette;
  label: string;
}

function PaletteGrid({ palette, label }: PaletteGridProps) {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-medium text-foreground">
        {label}
      </h3>
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-5">
        {(Object.entries(palette) as [string, string][]).map(([name, hex]) => (
          <Swatch key={name} name={name} color={hex} />
        ))}
      </div>
    </div>
  );
}

export const KickColors: StoryObj = {
  render: () => (
    <div>
      <h3 className="mb-4 font-display text-lg font-medium text-foreground">
        Kick Colors — Nintendo Retro
      </h3>
      <div className="grid grid-cols-4 gap-6">
        {(Object.entries(KICK) as [string, string][]).map(([name, hex]) => (
          <Swatch key={name} name={name} color={hex} />
        ))}
      </div>
    </div>
  ),
};

export const LightPalette: StoryObj = {
  render: () => <PaletteGrid palette={LIGHT} label="Light Palette" />,
};

export const DarkPalette: StoryObj = {
  render: () => <PaletteGrid palette={DARK} label="Dark Palette" />,
};

export const SemanticTokens: StoryObj = {
  render: () => {
    const tokens = [
      { name: "background", cls: "bg-background" },
      { name: "foreground", cls: "bg-foreground" },
      { name: "surface", cls: "bg-surface" },
      { name: "surface-alt", cls: "bg-surface-alt" },
      { name: "surface-elevated", cls: "bg-surface-elevated" },
      { name: "muted", cls: "bg-muted" },
      { name: "border", cls: "bg-border" },
      { name: "border-strong", cls: "bg-border-strong" },
      { name: "accent", cls: "bg-accent" },
    ];

    return (
      <div>
        <h3 className="mb-4 font-display text-lg font-medium text-foreground">
          Semantic Tokens (Tailwind)
        </h3>
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-5">
          {tokens.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2">
              <div
                className={`h-16 w-16 rounded-lg border border-border ${t.cls}`}
              />
              <span className="font-mono text-xs text-muted">{t.name}</span>
              <span className="font-mono text-[10px] text-muted">{t.cls}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

interface GraphGrayGridProps {
  gray: GraphGray;
  label: string;
}

function GraphGrayGrid({ gray, label }: GraphGrayGridProps) {
  return (
    <div>
      <h4 className="mb-3 font-display text-base font-medium text-foreground">
        {label}
      </h4>
      <div className="grid grid-cols-4 gap-4">
        {(Object.entries(gray) as [string, string][]).map(([name, hex]) => (
          <Swatch key={name} name={name} color={hex} />
        ))}
      </div>
    </div>
  );
}

export const GraphColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h3 className="font-display text-lg font-medium text-foreground">
        Graph Gray — Canvas Colors
      </h3>
      <GraphGrayGrid
        gray={GRAPH_GRAY.light}
        label="Light (반전: 다크 캔버스)"
      />
      <GraphGrayGrid
        gray={GRAPH_GRAY.dark}
        label="Dark (반전: 라이트 캔버스)"
      />
    </div>
  ),
};

export const Shadows: StoryObj = {
  render: () => {
    const shadows = [
      { name: "shadow-sm", var: "var(--shadow-sm)" },
      { name: "shadow-md", var: "var(--shadow-md)" },
      { name: "shadow-lg", var: "var(--shadow-lg)" },
    ];

    return (
      <div>
        <h3 className="mb-6 font-display text-lg font-medium text-foreground">
          Shadows
        </h3>
        <div className="flex gap-8">
          {shadows.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3">
              <div
                className="h-20 w-20 rounded-xl bg-surface"
                style={{ boxShadow: s.var }}
              />
              <span className="font-mono text-xs text-muted">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const AnimationTokens: StoryObj = {
  render: () => {
    const durations = [
      { name: "duration-fast", value: "150ms" },
      { name: "duration-normal", value: "200ms" },
      { name: "duration-slow", value: "350ms" },
    ];

    const easings = [
      { name: "ease-out", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
      { name: "ease-in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)" },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-display text-lg font-medium text-foreground">
            Duration Tokens
          </h3>
          <div className="space-y-4">
            {durations.map((d) => (
              <div key={d.name} className="flex items-center gap-4">
                <span className="w-36 font-mono text-xs text-muted">
                  {d.name} ({d.value})
                </span>
                <div className="relative h-2 w-64 overflow-hidden rounded-full bg-surface">
                  <div
                    className="absolute inset-y-0 left-0 w-full rounded-full bg-accent animate-[slideRight_2s_ease-in-out_infinite]"
                    style={{
                      animationDuration: `calc(${d.value} * 8)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg font-medium text-foreground">
            Easing Curves
          </h3>
          <div className="space-y-3">
            {easings.map((e) => (
              <div key={e.name} className="flex items-center gap-4">
                <span className="w-36 font-mono text-xs text-muted">
                  {e.name}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
