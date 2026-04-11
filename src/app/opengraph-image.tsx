import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage(): ImageResponse {
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
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            fontSize: "26px",
            fontWeight: 700,
            color: "#111111",
          }}
        >
          JH
        </div>
        <span
          style={{
            fontSize: "28px",
            color: "#737373",
            fontWeight: 500,
          }}
        >
          {SITE_NAME}
        </span>
      </div>
      <h1
        style={{
          fontSize: "56px",
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        3D GIS 테크 노트
      </h1>
      <p
        style={{
          fontSize: "24px",
          color: "#999999",
          marginTop: "16px",
          lineHeight: 1.5,
        }}
      >
        {SITE_DESCRIPTION}
      </p>
    </div>,
    { ...size },
  );
}
