import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopSphere — Everyday finds, thoughtfully chosen",
  description: "Discover useful everyday products at ShopSphere.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}