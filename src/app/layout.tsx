import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { GlitchBackground } from "@/components/GlitchBackground";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "DOOMSCROLL | The Protocol of Collapse",
  description: "Every book is a key. Every reader is a node. The DOOM token weaponizes the absurdity of tokenomics against itself.",
  keywords: "DOOM, token, cryptocurrency, Solana, literature, protocol, collapse",
  openGraph: {
    title: "DOOMSCROLL | The Protocol of Collapse",
    description: "Every book is a key. Every reader is a node.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOOMSCROLL | The Protocol of Collapse",
    description: "Every book is a key. Every reader is a node.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${vt323.variable} font-mono text-terminal-green bg-black min-h-screen overflow-x-hidden`}>
        <WalletContextProvider>
          <GlitchBackground />
          <div className="relative z-10">
            {children}
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
