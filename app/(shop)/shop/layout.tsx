"use client";

import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { Toaster } from "@/components/ui/toaster";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      {/* <MainNav /> */}
      {children}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Jamii. All rights reserved.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
