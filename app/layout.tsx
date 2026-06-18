import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darinol-id.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Darinol.id - Dari Tren Jadi Konten",
    template: "%s | Darinol.id",
  },
  description: "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
  applicationName: "Darinol.id",
  manifest: "/site.webmanifest?v=6",
  icons: {
    icon: [
      { url: "/darinol-icon.png?v=6", sizes: "1024x1024", type: "image/png" },
      { url: "/favicon.ico?v=6", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/darinol-icon.png?v=6",
    apple: "/darinol-icon.png?v=6",
    other: [
      {
        rel: "mask-icon",
        url: "/icon.svg",
        color: "#FF7A45",
      },
    ],
  },
  openGraph: {
    title: "Darinol.id - Dari Tren Jadi Konten",
    description:
      "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
    url: siteUrl,
    siteName: "Darinol.id",
    images: [
      {
        url: "/darinol-icon.png",
        width: 1024,
        height: 1536,
        alt: "Darinol.id",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darinol.id - Dari Tren Jadi Konten",
    description:
      "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
    images: ["/darinol-og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7A45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
