import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";

const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Jamii | A decentralized supply chain platform",
  description: "A decentralized logistics and supply chain platform",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${merriweather.variable} font-merriweather`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

import "./globals.css";
