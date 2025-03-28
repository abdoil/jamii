"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  BarChart3,
  Clock,
  Home,
  LogOut,
  Package,
  Settings,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DeliverySidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliverySidebar({
  isOpen,
  onOpenChange,
}: DeliverySidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/delivery/dashboard",
      active: pathname === "/delivery/dashboard",
    },
    // {
    //   label: "Available Jobs",
    //   icon: Package,
    //   href: "/delivery/jobs",
    //   active:
    //     pathname === "/delivery/jobs" || pathname.startsWith("/delivery/jobs/"),
    // },
    {
      label: "My Deliveries",
      icon: Truck,
      href: "/delivery/orders",
      active:
        pathname === "/delivery/orders" ||
        pathname.startsWith("/delivery/orders/"),
    },
    // {
    //   label: "Earnings",
    //   icon: Wallet,
    //   href: "/delivery/earnings",
    //   active: pathname === "/delivery/earnings",
    // },
    // {
    //   label: "History",
    //   icon: Clock,
    //   href: "/delivery/history",
    //   active: pathname === "/delivery/history",
    // },
    // {
    //   label: "Performance",
    //   icon: BarChart3,
    //   href: "/delivery/performance",
    //   active: pathname === "/delivery/performance",
    // },
    {
      label: "Settings",
      icon: Settings,
      href: "/delivery/settings",
      active: pathname === "/delivery/settings",
    },
  ];

  const NavItems = () => (
    <>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          onClick={() => onOpenChange(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            route.active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[240px] sm:w-[280px]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 px-2">
              <Truck className="h-6 w-6" />
              <span className="font-semibold">Delivery Dashboard</span>
            </div>
            <nav className="flex flex-col gap-1">
              <NavItems />
            </nav>
            <div className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  logout();
                  onOpenChange(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className=" sticky hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background">
        <div className="flex items-center gap-2 p-4 border-b">
          <Truck className="h-6 w-6" />
          <span className="font-semibold">Delivery Dashboard</span>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <NavItems />
        </nav>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}
