import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Cetak Dokumen",
  description: "Halaman untuk mencetak dokumen.",
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}