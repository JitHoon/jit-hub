import type { Meta, StoryObj } from "@storybook/react";
import ContentSkeleton from "./ContentSkeleton";

const meta = {
  title: "Content/ContentSkeleton",
  component: ContentSkeleton,
} satisfies Meta<typeof ContentSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
