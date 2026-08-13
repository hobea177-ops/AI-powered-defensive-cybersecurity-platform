import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CyberShield AI",
  description: "AI-powered defensive cybersecurity platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
