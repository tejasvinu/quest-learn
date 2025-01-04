import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuestLearn - Interactive AI Learning Adventures",
  description: "Embark on personalized educational journeys with AI-powered interactive storytelling. Learn any topic through engaging adventures that adapt to your choices and understanding.",
  keywords: ["education", "AI learning", "interactive learning", "personalized education", "educational games"],
  authors: [{ name: "QuestLearn Team" }],
  openGraph: {
    title: "QuestLearn - Interactive AI Learning Adventures",
    description: "Learn anything through AI-powered interactive storytelling",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuestLearn",
    description: "AI-Powered Interactive Learning Adventures",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
