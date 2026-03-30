import type { Meta, StoryObj } from "@storybook/react";
import { KICK, LIGHT, DARK, type Palette } from "@/lib/tokens";

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
        className="h-16 w-16 rounded-lg border border-border"
        style={{ backgroundColor: color }}
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
      { name: "muted", cls: "bg-muted" },
      { name: "border", cls: "bg-border" },
      { name: "accent", cls: "bg-accent" },
    ];

    return (
      <div>
        <h3 className="mb-4 font-display text-lg font-medium text-foreground">
          Semantic Tokens (Tailwind)
        </h3>
        <div className="grid grid-cols-4 gap-6">
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
