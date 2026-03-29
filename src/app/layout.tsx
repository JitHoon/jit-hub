import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIT-Hub | 3D GIS 지식 포트폴리오",
  description: "3D GIS 기술 지식을 시각적으로 탐색하는 인터랙티브 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
