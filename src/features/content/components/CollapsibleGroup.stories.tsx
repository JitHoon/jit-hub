import type { Meta, StoryObj } from "@storybook/react";
import CollapsibleGroup from "./CollapsibleGroup";
import ClusterDot from "./ClusterDot";

const meta = {
  title: "Content/CollapsibleGroup",
  component: CollapsibleGroup,
} satisfies Meta<typeof CollapsibleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    label: "연결된 노드 (3개)",
    defaultOpen: false,
    children: (
      <div className="space-y-2 p-3">
        <p className="text-sm text-foreground">좌표 참조 시스템</p>
        <p className="text-sm text-foreground">투영법 개요</p>
        <p className="text-sm text-foreground">EPSG 코드 체계</p>
      </div>
    ),
  },
};

export const Open: Story = {
  args: {
    label: "연결된 노드 (3개)",
    defaultOpen: true,
    children: (
      <div className="space-y-2 p-3">
        <p className="text-sm text-foreground">좌표 참조 시스템</p>
        <p className="text-sm text-foreground">투영법 개요</p>
        <p className="text-sm text-foreground">EPSG 코드 체계</p>
      </div>
    ),
  },
};

export const WithLeading: Story = {
  args: {
    label: "측지·좌표계",
    defaultOpen: true,
    leading: <ClusterDot cluster="coordinate" />,
    children: (
      <div className="space-y-2 p-3">
        <p className="text-sm text-foreground">좌표 참조 시스템</p>
        <p className="text-sm text-foreground">투영법 개요</p>
      </div>
    ),
  },
};
