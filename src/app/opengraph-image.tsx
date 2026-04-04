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
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "6px",
          backgroundColor: "#E60012",
        }}
      />
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
            backgroundColor: "#E60012",
            borderRadius: "10px",
            fontSize: "26px",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          JH
        </div>
        <span
          style={{
            fontSize: "28px",
            color: "#888888",
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
        3D GIS 지식 포트폴리오
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
