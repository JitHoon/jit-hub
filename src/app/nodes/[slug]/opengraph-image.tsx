import { ImageResponse } from "next/og";
import { getNodeBySlug } from "@/features/content/utils/pipeline";
import { CLUSTERS } from "@/constants/cluster";
import { SITE_NAME } from "@/constants/site";

export const alt = "Node";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OgImage({
  params,
}: ImageProps): Promise<ImageResponse> {
  const { slug } = await params;
  const node = getNodeBySlug(slug);

  if (!node) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          color: "#FFFFFF",
          fontSize: "48px",
        }}
      >
        Not Found
      </div>,
      { ...size },
    );
  }

  const { title, cluster, tags } = node.frontmatter;
  const clusterMeta = CLUSTERS[cluster];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#111111",
        padding: "60px 80px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "6px",
          backgroundColor: clusterMeta.color,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            color: "#888888",
            fontWeight: 500,
          }}
        >
          {SITE_NAME}
        </span>
        <span style={{ color: "#555555", fontSize: "20px" }}>·</span>
        <span
          style={{
            fontSize: "18px",
            color: clusterMeta.color,
            fontWeight: 600,
          }}
        >
          {clusterMeta.label}
        </span>
      </div>
      <h1
        style={{
          fontSize: "52px",
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "28px",
          flexWrap: "wrap",
        }}
      >
        {tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "18px",
              color: "#AAAAAA",
              backgroundColor: "#222222",
              padding: "6px 16px",
              borderRadius: "6px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
