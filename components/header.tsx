"use client";

import { MainNav } from "@/components/main-nav";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { cn } from "@/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  showCart?: boolean;
  onMenuClick?: () => void;
}

export function Header({
  className,
  showCart = true,
  onMenuClick,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      <div className="container flex h-16 items-center">
        <MainNav className="flex-1" onMenuClick={onMenuClick} />
        {showCart && (
          <div className="flex items-center space-x-4">
            <CartDrawer />
          </div>
        )}
      </div>
    </header>
  );
}
