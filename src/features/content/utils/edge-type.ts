import type { EdgeType } from "@/types/graph";

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  prerequisite: "선수지식",
  related: "관련",
  child: "하위",
};

export const EDGE_TYPE_ORDER: EdgeType[] = ["prerequisite", "related", "child"];
