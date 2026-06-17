import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://darinol-id.vercel.app"),
  title: {
    default: "Darinol.id - Dari Tren Jadi Konten",
    template: "%s | Darinol.id",
  },
  description: "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
  applicationName: "Darinol.id",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Darinol.id - Dari Tren Jadi Konten",
    description:
      "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
    url: "https://darinol-id.vercel.app",
    siteName: "Darinol.id",
    images: [
      {
        url: "/darinol-og.png",
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
