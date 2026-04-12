import type { Meta, StoryObj } from "@storybook/react";
import Skeleton from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  args: { variant: "block", className: "h-24 w-64" },
};

export const Text: Story = {
  args: { variant: "text", lines: 4, className: "w-64" },
};

export const Circle: Story = {
  args: { variant: "circle", className: "size-16" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="space-y-2">
        <span className="font-mono text-xs text-muted">block</span>
        <Skeleton variant="block" className="h-24 w-48" />
      </div>
      <div className="space-y-2">
        <span className="font-mono text-xs text-muted">text (3 lines)</span>
        <Skeleton variant="text" lines={3} className="w-48" />
      </div>
      <div className="space-y-2">
        <span className="font-mono text-xs text-muted">circle</span>
        <Skeleton variant="circle" className="size-16" />
      </div>
    </div>
  ),
};
