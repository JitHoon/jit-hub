import type { Meta, StoryObj } from "@storybook/react";
import ClusterBadge from "./ClusterBadge";
import { CLUSTER_IDS } from "@/constants/cluster";

const meta = {
  title: "Content/ClusterBadge",
  component: ClusterBadge,
} satisfies Meta<typeof ClusterBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { cluster: "geodesy" },
};

export const AllClusters: Story = {
  args: { cluster: "geodesy" },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {CLUSTER_IDS.map((id) => (
        <ClusterBadge key={id} cluster={id} />
      ))}
    </div>
  ),
};
