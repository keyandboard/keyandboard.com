import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://keyandboard.com"),
  title: "keyandboard — we build things",
  description:
    "A two-person studio building products people actually use. HeyHoney, FlyingPapers, PromptArena, and more.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "keyandboard — we build things",
    description:
      "A two-person studio building products people actually use.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="grain min-h-full overflow-x-hidden text-white">
        {children}
      </body>
    </html>
  );
}
