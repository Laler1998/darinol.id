import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.darinol.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Darinol.id - Radar Tren dan Berita Terbaru",
    template: "%s | Darinol.id",
  },
  description:
    "Pantau topik yang sedang naik dan baca berita terbaru dari puluhan sumber media dalam satu layar.",
  keywords: [
    "trend radar",
    "berita terbaru",
    "tren Indonesia",
    "berita global",
    "social trends",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  applicationName: "Darinol.id",
  manifest: "/site.webmanifest?v=7",
  icons: {
    icon: [
      { url: "/darinol-icon-16.png?v=7", sizes: "16x16", type: "image/png" },
      { url: "/darinol-icon-32.png?v=7", sizes: "32x32", type: "image/png" },
      { url: "/darinol-icon-192.png?v=7", sizes: "192x192", type: "image/png" },
      { url: "/darinol-icon-512.png?v=7", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/darinol-icon-32.png?v=7",
    apple: "/darinol-icon-180.png?v=7",
    other: [
      {
        rel: "mask-icon",
        url: "/darinol-icon-512.png?v=7",
        color: "#FF7A45",
      },
    ],
  },
  openGraph: {
    title: "Darinol.id - Radar Tren dan Berita Terbaru",
    description:
      "Pantau topik yang sedang naik dan baca berita terbaru dari puluhan sumber media dalam satu layar.",
    url: siteUrl,
    siteName: "Darinol.id",
    images: [
      {
        url: "/darinol-og.png",
        width: 1200,
        height: 630,
        alt: "Darinol.id",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darinol.id - Radar Tren dan Berita Terbaru",
    description:
      "Pantau topik yang sedang naik dan baca berita terbaru dari puluhan sumber media dalam satu layar.",
    images: ["/darinol-og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7A45",
};

/**
 * Tells search engines this is a news aggregator rather than a generic page, so
 * the radar and the feed can be understood as a curated collection.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Darinol.id",
      description:
        "Pantau topik yang sedang naik dan baca berita terbaru dari puluhan sumber media dalam satu layar.",
      inLanguage: "id-ID",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Darinol.id",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/darinol-icon-512.png`,
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/#collection`,
      url: siteUrl,
      name: "Radar Tren dan Berita Terbaru",
      description:
        "Topik yang sedang naik dan berita terbaru, dikumpulkan dari feed media dan sinyal publik.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      inLanguage: "id-ID",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <script
          // Applies the stored (or default dark) theme before first paint so
          // the new dark-first design doesn't flash light on every load.
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('darinol-theme');document.documentElement.classList.toggle('dark', m !== 'light');}catch(e){document.documentElement.classList.add('dark');}",
          }}
        />
        {children}
        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ServiceWorker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
