import type { Metadata } from "next";
import Script from "next/script";
import { Lexend, Noto_Sans_KR } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-lexend",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "JIT-Hub | 3D GIS 지식 포트폴리오",
  description: "3D GIS 기술 지식을 시각적으로 탐색하는 인터랙티브 포트폴리오",
};

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${lexend.variable} ${notoSansKR.variable}`}
      suppressHydrationWarning
    >
      <body className={`font-sans bg-background text-foreground`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
