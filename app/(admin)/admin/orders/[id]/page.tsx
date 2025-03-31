"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Truck,
  User,
  ShoppingBag,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/zustand-store";
import { QRGenerator } from "@/components/qr-code/qr-generator";
import {
  useUpdateOrderStatus,
  useGetOrder,
  useGetProducts,
} from "@/lib/hooks/use-order";
import { use } from "react";
import { useOrdersStore, useProductsStore } from "@/lib/zustand-store";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useGetBids } from "@/lib/hooks/use-bids";
import { useContract } from "@/lib/hooks/use-contract";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { placeBid, confirmDelivery } = useContract();

  const {
    data: order,
    isLoading: isOrderLoading,
    refetch: refetchOrder,
  } = useGetOrder(resolvedParams.id) as unknown as {
    data: Order | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
  };
  const { data: products, isLoading: isProductsLoading } = useGetProducts();
  const { data: bids } = useGetBids(resolvedParams.id);
  const updateOrderStatus = useUpdateOrderStatus();

  const orderProducts =
    order?.products.map((item: any) => {
      const product = products?.find((p: any) => p.id === item.productId);
      return {
        ...product,
        quantity: item.quantity,
        total: (product?.price || 0) * item.quantity,
      };
    }) || [];

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, router]);

  const isLoading = isOrderLoading || isProductsLoading;

  const handleUpdateStatus = async (status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: resolvedParams.id,
        status,
      });
      toast.success(`Order status changed to ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      // First, accept the bid through the API
      const response = await fetch(
        `/api/orders/${resolvedParams.id}/bids/${bidId}/accept`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept bid");
      }

      // Then, interact with the smart contract
      await placeBid.mutateAsync({
        orderId: resolvedParams.id,
        amount: order?.transactions?.bidPlaced?.amount || 0,
      });

      // Refresh order data
      await refetchOrder();
      toast.success("Delivery agent has been assigned to this order");
    } catch (error) {
      toast.error("Failed to accept bid");
      console.error("Error accepting bid:", error);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      // First, update the order status through the API
      await updateOrderStatus.mutateAsync({
        orderId: resolvedParams.id,
        status: "delivered",
      });

      // Then, interact with the smart contract
      await confirmDelivery.mutateAsync(resolvedParams.id);

      // Refresh order data
      await refetchOrder();
      toast.success("Delivery confirmed successfully");
    } catch (error) {
      toast.error("Failed to confirm delivery");
      console.error("Error confirming delivery:", error);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            Confirmed
          </Badge>
        );
      case "in-transit":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
          >
            In Transit
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            Cancelled
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="mb-4 text-muted-foreground">
          The requested order could not be found
        </p>
        <Button asChild>
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
            Order #{resolvedParams.id}
          </h1>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Order Details
              </CardTitle>
              <CardDescription className="text-sm">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Items</h3>
                <div className="space-y-2">
                  {orderProducts.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            KES {item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">KES {item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Delivery Address</h3>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Delivery Status</h3>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {order.status === "delivered"
                          ? "Delivered"
                          : order.status === "in-transit"
                          ? "In Transit"
                          : order.status === "confirmed"
                          ? "Confirmed, Awaiting Pickup"
                          : "Awaiting Confirmation"}
                      </p>
                    </div>
                    {order.deliveryAgentId && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Delivery Agent ID: {order.deliveryAgentId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Customer Information</h3>
                <div className="rounded-lg border p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{order.customerId}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <p>
                        Order placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Transaction Details</h3>
                <div className="space-y-6">
                  {order.transactionId && (
                    <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            Order Placement
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                order.transactionId || ""
                              );
                              toast.success(
                                "Transaction ID copied to clipboard"
                              );
                            }}
                          >
                            Copy ID
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() =>
                              window.open(
                                `https://hashscan.io/testnet/tx/${order.transactionId}`,
                                "_blank"
                              )
                            }
                          >
                            View on Hashscan
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground break-all bg-background p-2 rounded">
                        {order.transactionId}
                      </div>
                    </div>
                  )}
                  {order.transactions?.bidPlaced && (
                    <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            Bid Transaction
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                order.transactions?.bidPlaced?.transactionId ||
                                  ""
                              );
                              toast.success(
                                "Transaction ID copied to clipboard"
                              );
                            }}
                          >
                            Copy ID
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() =>
                              window.open(
                                `https://hashscan.io/testnet/tx/${
                                  order.transactions?.bidPlaced
                                    ?.transactionId || ""
                                }`,
                                "_blank"
                              )
                            }
                          >
                            View on Hashscan
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground break-all bg-background p-2 rounded">
                        {order.transactions.bidPlaced.transactionId}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          KES {order.transactions.bidPlaced.amount}
                        </span>
                      </div>
                    </div>
                  )}
                  {order.status === "delivered" &&
                    order.deliveryTransactionId && (
                      <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">
                              Delivery Transaction
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  order.deliveryTransactionId || ""
                                );
                                toast.success(
                                  "Transaction ID copied to clipboard"
                                );
                              }}
                            >
                              Copy ID
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                window.open(
                                  `https://hashscan.io/testnet/tx/${order.deliveryTransactionId}`,
                                  "_blank"
                                )
                              }
                            >
                              View on Hashscan
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground break-all bg-background p-2 rounded">
                          {order.deliveryTransactionId}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Delivery Fee:
                          </span>
                          <span className="font-medium">
                            KES {order.deliveryFee}
                          </span>
                        </div>
                      </div>
                    )}
                  {!order.transactionId &&
                    !order.transactions?.bidPlaced &&
                    !order.deliveryTransactionId && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No blockchain transactions recorded yet
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {order.status === "pending" && (
                <Button onClick={() => handleUpdateStatus("confirmed")}>
                  Confirm Order
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button onClick={() => handleUpdateStatus("in-transit")}>
                  Mark as In Transit
                </Button>
              )}
              {order.status === "in-transit" && (
                <Button onClick={() => handleUpdateStatus("delivered")}>
                  Mark as Delivered
                </Button>
              )}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("cancelled")}
                >
                  Cancel Order
                </Button>
              )}
            </CardFooter>
          </Card>

          {order.status === "pending" && bids && bids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Bids</CardTitle>
                <CardDescription>
                  Select a delivery agent for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            Delivery Agent {bid.deliveryAgentId}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>KES {bid.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Estimated delivery:{" "}
                              {new Date(
                                bid.estimatedDeliveryTime
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={bid.status !== "pending"}
                      >
                        {bid.status === "accepted"
                          ? "Accepted"
                          : bid.status === "rejected"
                          ? "Rejected"
                          : "Accept Bid"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>KES {(order.totalAmount * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>KES {(order.totalAmount * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.status !== "pending" && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {(order.status === "in-transit" ||
                  order.status === "delivered") && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">In Transit</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Actions</CardTitle>
          <CardDescription>Manage order status and delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {order.status === "confirmed" && (
              <Button
                onClick={handleConfirmDelivery}
                disabled={confirmDelivery.isPending}
                className="w-full"
              >
                {confirmDelivery.isPending
                  ? "Confirming Delivery..."
                  : "Confirm Delivery"}
              </Button>
            )}
            {order.status === "pending" &&
              bids?.map((bid) => (
                <Button
                  key={bid.id}
                  onClick={() => handleAcceptBid(bid.id)}
                  disabled={placeBid.isPending}
                  className="w-full"
                >
                  {placeBid.isPending ? "Accepting Bid..." : "Accept Bid"}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
