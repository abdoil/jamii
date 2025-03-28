"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/zustand-store";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

interface CartDrawerProps {
  onCheckout?: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCartStore();
  const { user, isWalletConnected, connectWallet } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to checkout",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    if (!isWalletConnected && user.role === "user") {
      try {
        await connectWallet();
      } catch (error) {
        toast({
          title: "Wallet connection required",
          description:
            "Please connect your Hedera wallet to proceed with checkout",
          variant: "destructive",
        });
        return;
      }
    }

    if (onCheckout) {
      onCheckout();
    }

    router.push("/checkout");
    setIsOpen(false);
  };

  const incrementQuantity = (
    productId: string,
    currentQuantity: number,
    maxStock: number
  ) => {
    if (currentQuantity < maxStock) {
      updateQuantity(productId, currentQuantity + 1);
    } else {
      toast({
        title: "Maximum stock reached",
        description: "Cannot add more of this item",
        variant: "destructive",
      });
    }
  };

  const decrementQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      removeItem(productId);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add items to your cart to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-4"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        decrementQuantity(item.product.id, item.quantity)
                      }
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        incrementQuantity(
                          item.product.id,
                          item.quantity,
                          item.product.stock
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span>TBD</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
                <Button className="flex-1" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
