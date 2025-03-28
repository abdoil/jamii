"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { ProtectedLayout } from "@/components/protected-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <Header showCart={false} onMenuClick={() => setIsMenuOpen(true)} />
        <SidebarProvider>
          <div className="flex flex-1">
            <div className="fixed inset-y-16 left-0 z-30 hidden w-64 md:block">
              <AdminSidebar isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} />
            </div>
            <main className="flex-1 p-4 md:p-6 md:ml-64">
              <div className="container">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </ProtectedLayout>
  );
}
