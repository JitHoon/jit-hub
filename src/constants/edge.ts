import type { EdgeType } from "@/types/graph";

export const EDGE_PRIORITY: Record<EdgeType, number> = {
  prerequisite: 0,
  child: 1,
  related: 2,
};
