"use client";

import { DeliveryLayout } from "@/components/delivery/delivery-layout";
import { Toaster } from "@/components/ui/toaster";

export default function DeliveryRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DeliveryLayout>{children}</DeliveryLayout>
      <Toaster />
    </>
  );
}
