import type { Meta, StoryObj } from "@storybook/react";
import { NodeHoverBadge } from "./NodeHoverBadge";
import type { GraphNode } from "../types/graph";

const meta = {
  title: "Graph/NodeHoverBadge",
  component: NodeHoverBadge,
} satisfies Meta<typeof NodeHoverBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNode: GraphNode = {
  id: "coordinate-reference-system",
  title: "좌표 참조 시스템 (CRS)",
  cluster: "coordinate",
  difficulty: "intermediate",
  tags: ["gis", "coordinate"],
};

export const WithNode: Story = {
  args: { node: mockNode },
};

export const Empty: Story = {
  args: { node: null },
};

export const AllClusters: Story = {
  args: { node: mockNode },
  render: () => (
    <div className="space-y-3">
      {(
        [
          { cluster: "coordinate", title: "좌표 참조 시스템" },
          { cluster: "data", title: "WebGL 렌더링 파이프라인" },
          { cluster: "feature", title: "Cesium 타일링 구현" },
          { cluster: "performance", title: "LOD 최적화 전략" },
          { cluster: "feature", title: "React Three Fiber" },
        ] as const
      ).map((item) => (
        <NodeHoverBadge
          key={item.cluster}
          node={{
            id: item.cluster,
            title: item.title,
            cluster: item.cluster,
            difficulty: "intermediate",
            tags: [],
          }}
        />
      ))}
    </div>
  ),
};
