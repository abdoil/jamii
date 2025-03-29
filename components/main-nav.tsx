"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/components/auth-provider";
import {
  Menu,
  Store,
  Package,
  LayoutDashboard,
  Truck,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  onMenuClick?: () => void;
}

export function MainNav({ className, onMenuClick, ...props }: MainNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");
  const isDeliveryRoute = pathname.startsWith("/delivery");
  const isShopRoute = pathname.startsWith("/shop");

  // Only show navigation items for the current user role
  const routes = [
    {
      href: "/shop",
      label: "Shop",
      icon: Store,
      active: isShopRoute,
      show: !isAdminRoute && !isDeliveryRoute,
    },
    {
      href: "/orders",
      label: "My Orders",
      icon: Package,
      active: pathname === "/orders" || pathname.startsWith("/orders/"),
      show: user?.role === "user",
    },
  ].filter((route) => route.show !== false);

  const authLinks = !user ? (
    <>
      <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start">
          <LogIn className="mr-2 h-4 w-4" />
          Log in
        </Button>
      </Link>
      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
        <Button className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Sign up
        </Button>
      </Link>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">{user.email}</span>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          logout();
          setIsMenuOpen(false);
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </Button>
    </>
  );

  return (
    <nav
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/logo.png" alt="Jamii" width={80} height={80} />
          <span className="font-bold text-primary uppercase text-xl hidden md:block">
            Jamii
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop auth links */}
      <div className="hidden md:flex items-center gap-4 mx-2">
        {!user ? (
          <>
            <Link href="/auth/signin">
              <Button variant="ghost">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.email}</span>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile menu toggle - remains the same */}
      <div className="md:hidden">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                if (onMenuClick) {
                  onMenuClick();
                } else {
                  setIsMenuOpen(true);
                }
              }}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Store className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl">Jamii</span>
                </Link>
              </div>
              <div className="flex flex-col gap-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsMenuOpen(false)}
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
              </div>
              <div className="mt-auto flex flex-col gap-2">{authLinks}</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
