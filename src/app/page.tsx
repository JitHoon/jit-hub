import fs from "node:fs";
import path from "node:path";

import type { GraphData } from "@/types/graph";
import HomeLayout from "./HomeLayout";

function loadGraphData(): GraphData {
  const filePath = path.join(process.cwd(), "graph-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GraphData;
}

export default function Home(): React.ReactElement {
  const graphData = loadGraphData();

  return <HomeLayout graphData={graphData} />;
}
