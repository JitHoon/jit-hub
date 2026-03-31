import fs from "node:fs";
import path from "node:path";
import { loadAllNodes } from "@/features/content/utils/pipeline";
import { generateGraphData } from "@/features/graph/utils/builder";
import type { ClusterId } from "@/constants/cluster";

const outputPath = path.join(process.cwd(), "graph-data.json");
const nodes = loadAllNodes();
const data = generateGraphData(nodes);

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf-8");

const clusterIds = data.clusters
  .filter((c) => c.nodeCount > 0)
  .map((c) => c.id as ClusterId);

console.log(
  `graph-data.json 생성 완료: ${data.nodes.length}개 노드, ${data.edges.length}개 엣지, ${clusterIds.length}개 활성 클러스터`,
);
