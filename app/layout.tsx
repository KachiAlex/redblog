import type { Metadata } from "next";
import { Inter, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RedBlog — Every reel, developed into print.",
  description:
    "Connect your Instagram account and RedBlog turns your Reels into a permanent, searchable blog — hosted by you, credited to you, indexed by Google.",
  keywords: ["instagram", "reels", "blog", "video blog", "creator tools", "content repurposing"],
  openGraph: {
    title: "RedBlog — Every reel, developed into print.",
    description: "Connect your Instagram and turn your Reels into a permanent, searchable blog.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
