import type { Meta, StoryObj } from "@storybook/react";
import { CLUSTERS, CLUSTER_IDS, type KickBase } from "@/constants/cluster";
import { KICK } from "@/constants/tokens";

const meta = {
  title: "Design System/Clusters",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

function ClusterCard({
  id,
  label,
  color,
  base,
}: {
  id: string;
  label: string;
  color: string;
  base: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      <div
        className="h-8 w-8 shrink-0 rounded-full bg-[var(--cluster-color)]"
        style={{ "--cluster-color": color } as React.CSSProperties}
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
}

export const AllClusters: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {CLUSTER_IDS.map((id) => {
        const { label, color, base } = CLUSTERS[id];
        return (
          <ClusterCard
            key={id}
            id={id}
            label={label}
            color={color}
            base={base}
          />
        );
      })}
    </div>
  ),
};

export const ClusterByKickBase: StoryObj = {
  render: () => {
    const bases: KickBase[] = ["red", "blue", "green", "yellow"];
    const grouped = bases.map((base) => ({
      base,
      kickColor: KICK[base],
      clusters: CLUSTER_IDS.filter((id) => CLUSTERS[id].base === base),
    }));

    return (
      <div className="space-y-8">
        <h3 className="font-display text-lg font-medium text-foreground">
          Clusters by Kick Base
        </h3>
        {grouped.map((group) => (
          <div key={group.base}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full bg-[var(--kick-color)]"
                style={
                  { "--kick-color": group.kickColor } as React.CSSProperties
                }
              />
              <span className="font-display text-sm font-medium text-foreground">
                {group.base}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {group.kickColor}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {group.clusters.map((id) => {
                const { label, color, base } = CLUSTERS[id];
                return (
                  <ClusterCard
                    key={id}
                    id={id}
                    label={label}
                    color={color}
                    base={base}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
