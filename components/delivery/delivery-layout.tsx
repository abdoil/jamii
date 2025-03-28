"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { DeliverySidebar } from "@/components/delivery/delivery-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";

interface DeliveryLayoutProps {
  children: React.ReactNode;
}

export function DeliveryLayout({ children }: DeliveryLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/shop");
    }
  }, [user, router]);

  if (!user || user.role !== "delivery") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showCart={false} onMenuClick={() => setIsMenuOpen(true)} />
      <SidebarProvider>
        <div className="flex flex-1">
          <div className="fixed inset-y-16 left-0 z-30 hidden w-64 md:block">
            <DeliverySidebar isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} />
          </div>
          <main className="flex-1 p-4 md:p-6 md:ml-64">
            <div className="container">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
