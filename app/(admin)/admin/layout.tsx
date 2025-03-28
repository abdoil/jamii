"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { Toaster } from "@/components/ui/toaster";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <Toaster />
    </>
  );
}
