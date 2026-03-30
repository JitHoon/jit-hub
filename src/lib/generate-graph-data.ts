import path from "node:path";
import { writeGraphData } from "./pipeline";

const outputPath = path.join(process.cwd(), "graph-data.json");
writeGraphData(outputPath);
