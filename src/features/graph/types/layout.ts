import type { NodeObject, LinkObject } from "react-force-graph-3d";

import type { GraphNode, GraphEdge } from "./graph";

export type GraphMode = "fullscreen" | "split";

export interface GraphLayoutState {
  mode: GraphMode;
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
}

export type ForceGraph3DNode = NodeObject<GraphNode>;
export type ForceGraph3DLink = LinkObject<GraphNode, GraphEdge>;
