import { MainNav } from "@/components/main-nav";
import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainNav />
      {children}
    </div>
  );
}
