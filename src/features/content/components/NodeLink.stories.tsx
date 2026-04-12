import type { Meta, StoryObj } from "@storybook/react";
import NodeLink from "./NodeLink";
import { CLUSTER_IDS } from "@/constants/cluster";

const meta = {
  title: "Content/NodeLink",
  component: NodeLink,
} satisfies Meta<typeof NodeLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "coordinate-reference-system",
    title: "좌표 참조 시스템 (CRS)",
    cluster: "geodesy",
  },
};

export const WithLabel: Story = {
  args: {
    id: "coordinate-reference-system",
    title: "좌표 참조 시스템 (CRS)",
    cluster: "geodesy",
    showLabel: true,
  },
};

export const SeoMode: Story = {
  args: {
    id: "coordinate-reference-system",
    title: "좌표 참조 시스템 (CRS)",
    cluster: "geodesy",
    linkMode: "seo",
  },
};

export const AllClusters: Story = {
  args: {
    id: "coordinate-reference-system",
    title: "좌표 참조 시스템",
    cluster: "geodesy",
  },
  render: () => (
    <div className="space-y-2">
      {CLUSTER_IDS.map((id) => (
        <NodeLink
          key={id}
          id={id}
          title={`${id} 노드 제목`}
          cluster={id}
          showLabel
        />
      ))}
    </div>
  ),
};
