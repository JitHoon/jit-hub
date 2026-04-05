import type { ClusterId } from "@/constants/cluster";
import type { GraphNode } from "./graph";

export interface SuggestionGroup {
  clusterId: ClusterId;
  label: string;
  color: string;
  nodes: GraphNode[];
}

export type SearchMode = "suggestions" | "results" | "empty";
