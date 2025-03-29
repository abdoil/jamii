"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/zustand-store";
import { useAuth } from "@/components/auth-provider";
import { createEscrowPayment } from "@/lib/hedera-utils";
import { useOrder } from "@/lib/hooks/use-order";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CheckoutPage() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isWalletConnected, connectWallet } = useAuth();
  const router = useRouter();
  const createOrder = useOrder();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/shop");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You need to be logged in to place an order");
      router.push("/auth/signin");
      return;
    }

    if (!address || !city || !county) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      // Mock store wallet address
      const storeWalletAddress = "0.0.123456";

      // Create escrow payment
      const transaction = await createEscrowPayment(
        getTotalPrice(),
        user.walletAddress!,
        storeWalletAddress
      );

      // Create order using React Query mutation
      const orderData = {
        customerId: user.id,
        storeId: items[0].product.storeId,
        products: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        status: "pending" as const,
        totalAmount: getTotalPrice(),
        deliveryAddress: `${address}, ${city}, ${county}`,
        transactionId: transaction.id,
      };

      console.log("Submitting order data:", orderData);

      const order = await createOrder.mutateAsync(orderData);
      console.log("Order created successfully:", order);

      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "There was an error processing your order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Link
          href="/shop"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Complete your order by providing your delivery information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Street Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <div>
                        <Label htmlFor="county">County</Label>
                        <Select
                          value={county}
                          onValueChange={(value) => setCounty(value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a county" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nairobi">Nairobi</SelectItem>
                            <SelectItem value="Mombasa">Mombasa</SelectItem>
                            <SelectItem value="Kisumu">Kisumu</SelectItem>
                            <SelectItem value="Nakuru">Nakuru</SelectItem>
                            <SelectItem value="Eldoret">Eldoret</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any special instructions for delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div> */}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isProcessing || !isWalletConnected}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <div className="flex w-full justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex w-full justify-between">
                <span>Delivery Fee</span>
                <span>TBD (Bidding)</span>
              </div>
              <Separator />
              <div className="flex w-full justify-between font-medium">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                * Final price will include delivery fee determined by delivery
                agent bidding
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
