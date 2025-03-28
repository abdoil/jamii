import type React from "react";
import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Jamii",
  description: "A decentralized logistics and supply chain platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${merriweather.variable} font-merriweather`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
