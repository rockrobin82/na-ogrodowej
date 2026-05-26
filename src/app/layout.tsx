import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Na-Ogrodowej — Wymiana nasion",
  description:
    "Bezpłatna wymiana nasion między ogrodnikami. Dodawaj paczki, zamawiaj i dziel się plonami.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
