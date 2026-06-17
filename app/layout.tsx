import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darinol.id - Dari Tren Jadi Konten",
  description: "Dashboard tren kreator untuk menemukan topik viral dan mengubahnya menjadi ide konten.",
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
