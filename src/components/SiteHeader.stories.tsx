import type { Meta, StoryObj } from "@storybook/react";
import SiteHeader from "./SiteHeader";

const meta = {
  title: "Components/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithChildren: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs text-muted">
        검색 슬롯
      </div>
    ),
  },
};
