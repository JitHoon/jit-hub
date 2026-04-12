import type { Meta, StoryObj } from "@storybook/react";
import ScrollToTopButton from "./ScrollToTopButton";

const meta = {
  title: "Components/ScrollToTopButton",
  component: ScrollToTopButton,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="relative h-[200vh] bg-background">
        <p className="p-8 text-sm text-muted">
          아래로 스크롤하면 버튼이 나타납니다 (threshold: 200px)
        </p>
        <Story />
      </div>
    ),
  ],
};
