import type { Meta, StoryObj } from "@storybook/react";
import { CLUSTERS, CLUSTER_IDS } from "@/constants/cluster";

const meta = {
  title: "Design System/Clusters",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const AllClusters: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {CLUSTER_IDS.map((id) => {
        const { label, color, base } = CLUSTERS[id];
        return (
          <div
            key={id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <div
              className="h-8 w-8 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-medium text-foreground">
                {id}
              </div>
              <div className="text-xs text-muted">{label}</div>
              <div className="font-mono text-[10px] text-muted">
                {color} · {base}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ),
};
