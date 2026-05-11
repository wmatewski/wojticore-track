import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { siteConfig } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ClerkProvider>
          {children}
          <div id="clerk-captcha" className="fixed bottom-4 right-4 z-50" />
        </ClerkProvider>
      </body>
    </html>
  );
}
