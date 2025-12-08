import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboForge - Intelligent CAD for Robotics",
  description:
    "Turn rough sketches and prompts into manufacturable CAD models, instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
