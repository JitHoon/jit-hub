import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import ErrorCard from "./ErrorCard";

const meta = {
  title: "Components/ErrorCard",
  component: ErrorCard,
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = {
  args: {
    variant: "panel",
    title: "콘텐츠를 불러올 수 없습니다",
    description: "네트워크 오류가 발생했습니다.",
    onRetry: action("retry"),
    alwaysShowDescription: true,
  },
  decorators: [
    (Story) => (
      <div className="h-64 w-80">
        <Story />
      </div>
    ),
  ],
};

export const Fatal: Story = {
  args: {
    variant: "fatal",
    title: "예기치 않은 오류가 발생했습니다",
    description: "페이지를 새로고침해 주세요.",
    onRetry: action("retry"),
    alwaysShowDescription: true,
  },
};

export const PanelWithoutRetry: Story = {
  args: {
    variant: "panel",
    title: "데이터가 없습니다",
    alwaysShowDescription: true,
  },
  decorators: [
    (Story) => (
      <div className="h-64 w-80">
        <Story />
      </div>
    ),
  ],
};
