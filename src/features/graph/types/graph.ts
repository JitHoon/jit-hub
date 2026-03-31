export interface GraphNode {
  id: string;
  title: string;
  cluster: string;
  difficulty: string;
  tags: string[];
}

export type EdgeType = "prerequisite" | "related" | "child";

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  relationship?: string;
}

export interface GraphCluster {
  id: string;
  label: string;
  color: string;
  nodeCount: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}
