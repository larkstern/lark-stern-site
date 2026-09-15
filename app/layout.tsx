import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title:
    "Lark & Stern | Manufacturing Systems Excellence for Regulated Industries",
  description:
    "Lark & Stern delivers EBR/SiMPL, MES, SAP, and GAMP 5 validation for pharmaceutical and regulated industries — the speed and precision of a cheetah, the discipline of GxP.",
  openGraph: {
    title: "Lark & Stern | Enable. Efficient. Delivery.",
    description:
      "Manufacturing systems excellence for regulated industries. Built on speed, agility, and absolute precision.",
    url: "https://www.lark-stern.com",
    siteName: "Lark & Stern",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${mono.variable} ${serif.variable} bg-canvas font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
