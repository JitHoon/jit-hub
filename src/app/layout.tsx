import type { Metadata } from "next";
import { Lexend, Noto_Sans_KR } from "next/font/google";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  AUTHOR,
} from "@/constants/site";
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
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "jkUV6WJPhvlMl3D04ZjG4Oq6MAk4qEnkZGESH8Nb4a0",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  author: {
    "@type": "Person",
    name: AUTHOR.name,
    url: AUTHOR.url,
    jobTitle: AUTHOR.jobTitle,
    knowsAbout: [...AUTHOR.knowsAbout],
  },
};

// FOUC 방지용 인라인 CSS — globals.css :root/.dark 블록의 색상값과 동기화 필요
const criticalThemeCSS = `
:root {
  --background: #f7f7f7;
  --foreground: #1a1a1a;
  --border: #d0d0d0;
  --graph-bg: #111111;
  --graph-dot: #b0b0b0;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  --color-graph-bg: var(--graph-bg);
  --color-graph-dot: var(--graph-dot);
}
.dark {
  --background: #111111;
  --foreground: #eeeeee;
  --border: #2e2e2e;
  --graph-bg: #f7f7f7;
  --graph-dot: #333333;
}
html { background-color: var(--background); color: var(--foreground); }
`;

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  var d = t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches);
  if (d) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.style.colorScheme = 'light';
  }
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      document.body.classList.add('theme-ready');
    });
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <style dangerouslySetInnerHTML={{ __html: criticalThemeCSS }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${lexend.variable} ${notoSansKR.variable} font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
