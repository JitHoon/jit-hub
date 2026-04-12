import type { Meta, StoryObj } from "@storybook/react";
import { GraphSkeleton } from "./GraphSkeleton";

const meta = {
  title: "Graph/GraphSkeleton",
  component: GraphSkeleton,
} satisfies Meta<typeof GraphSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="h-96 w-full">
        <Story />
      </div>
    ),
  ],
};
