import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import SunIcon from "@/components/icons/SunIcon";
import MoonIcon from "@/components/icons/MoonIcon";

const Icons = { SunIcon, MoonIcon };

const meta = {
  title: "Components/Icons",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

const allIcons = Object.entries(Icons) as [
  string,
  ComponentType<{ size?: number; className?: string }>,
][];

export const Gallery: StoryObj = {
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      {allIcons.map(([name, Icon]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-lg border border-border p-4"
        >
          <Icon size={24} />
          <span className="font-mono text-xs text-muted">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <div>
      <h3 className="mb-4 font-display text-lg font-medium text-foreground">
        Size Variants
      </h3>
      <div className="space-y-6">
        {allIcons.map(([name, Icon]) => (
          <div key={name}>
            <p className="mb-2 font-mono text-xs text-muted">{name}</p>
            <div className="flex items-end gap-4">
              {[16, 20, 24, 32, 48].map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center gap-1 text-foreground"
                >
                  <Icon size={size} />
                  <span className="font-mono text-[10px] text-muted">
                    {size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
