import type { Metadata } from "next";
import { Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "装修需求采集",
  description: "帮助我们更好地了解你的生活需求",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
