import type { Meta, StoryObj } from "@storybook/react";
import ContentHeader from "./ContentHeader";
import { CLUSTER_IDS } from "@/constants/cluster";

const meta = {
  title: "Content/ContentHeader",
  component: ContentHeader,
} satisfies Meta<typeof ContentHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "좌표 참조 시스템 (CRS)",
    cluster: "geodesy",
  },
};

export const AllClusters: Story = {
  args: { title: "좌표 참조 시스템 (CRS)", cluster: "geodesy" },
  render: () => (
    <div className="space-y-6">
      {CLUSTER_IDS.map((id) => (
        <ContentHeader key={id} title={`${id} 샘플 제목`} cluster={id} />
      ))}
    </div>
  ),
};
