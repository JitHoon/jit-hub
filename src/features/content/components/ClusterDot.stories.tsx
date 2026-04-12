import type { Meta, StoryObj } from "@storybook/react";
import ClusterDot from "./ClusterDot";
import { CLUSTERS, CLUSTER_IDS } from "@/constants/cluster";

const meta = {
  title: "Content/ClusterDot",
  component: ClusterDot,
} satisfies Meta<typeof ClusterDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { cluster: "geodesy" },
};

export const AllClusters: Story = {
  args: { cluster: "geodesy" },
  render: () => (
    <div className="flex flex-wrap gap-4">
      {CLUSTER_IDS.map((id) => (
        <div key={id} className="flex items-center gap-2">
          <ClusterDot cluster={id} />
          <span className="font-mono text-xs text-muted">
            {id} ({CLUSTERS[id].color})
          </span>
        </div>
      ))}
    </div>
  ),
};
