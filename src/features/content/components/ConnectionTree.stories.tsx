import type { Meta, StoryObj } from "@storybook/react";
import ConnectionTree from "./ConnectionTree";
import type { ConnectedNodeInfo } from "../utils/connected-nodes";

const meta = {
  title: "Content/ConnectionTree",
  component: ConnectionTree,
} satisfies Meta<typeof ConnectionTree>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNodes: ConnectedNodeInfo[] = [
  {
    slug: "epsg-code",
    title: "EPSG 코드 체계",
    cluster: "coordinate",
    edgeType: "prerequisite",
  },
  {
    slug: "webgl-pipeline",
    title: "WebGL 렌더링 파이프라인",
    cluster: "data",
    edgeType: "related",
  },
  {
    slug: "cesium-tiling",
    title: "Cesium 3D Tiles 구현",
    cluster: "feature",
    edgeType: "child",
  },
  {
    slug: "lod-optimization",
    title: "LOD 최적화 전략",
    cluster: "performance",
    edgeType: "related",
  },
];

export const Default: Story = {
  args: {
    currentTitle: "좌표 참조 시스템 (CRS)",
    currentCluster: "coordinate",
    nodes: mockNodes,
    defaultOpen: true,
  },
};

export const Collapsed: Story = {
  args: {
    currentTitle: "좌표 참조 시스템 (CRS)",
    currentCluster: "coordinate",
    nodes: mockNodes,
    defaultOpen: false,
  },
};

export const SeoMode: Story = {
  args: {
    currentTitle: "좌표 참조 시스템 (CRS)",
    currentCluster: "coordinate",
    nodes: mockNodes,
    defaultOpen: true,
    linkMode: "seo",
  },
};
