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
import { useQuery } from "@tanstack/react-query";

// Mock delivery bids
const deliveryBids = [
  {
    id: "bid-1",
    orderId: "2",
    deliveryAgentId: "3",
    deliveryAgentName: "John Delivery",
    amount: 5.0,
    estimatedDeliveryTime: "2023-05-15T14:00:00Z",
    status: "pending",
  },
  {
    id: "bid-2",
    orderId: "2",
    deliveryAgentId: "4",
    deliveryAgentName: "Sarah Express",
    amount: 6.5,
    estimatedDeliveryTime: "2023-05-15T13:30:00Z",
    status: "pending",
  },
];

// Mock customer data
const customer = {
  id: "1",
  name: "John Customer",
  email: "customer@example.com",
  phone: "+1 (555) 123-4567",
  address: "456 Park Ave, Uptown, USA",
  orders: 5,
  totalSpent: 124.85,
  joinedDate: "2023-01-10T00:00:00Z",
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const { data: order, isLoading: isOrderLoading } = useGetOrder(
    resolvedParams.id
  );
  const { data: products, isLoading: isProductsLoading } = useGetProducts();
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
      toast.success(`Order status changed to KES {status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const acceptedBid = deliveryBids.find((bid) => bid.id === bidId);
      if (acceptedBid && order) {
        order.status = "confirmed";
        order.deliveryAgentId = acceptedBid.deliveryAgentId;
      }

      toast.success("Delivery agent has been assigned to this order");
    } catch (error) {
      toast.error("Failed to accept bid");
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

  // Inside the component, add this function to generate QR code data
  const generateQRCodeData = (orderId: string, type: "pickup" | "delivery") => {
    // Create a data object with order ID, type, and timestamp for security
    const qrData = {
      orderId,
      type,
      timestamp: Date.now(),
      // In a real app, you would add a signature or token for verification
      signature: `${orderId}-${type}-${Date.now()}`,
    };

    // Convert to JSON string
    return JSON.stringify(qrData);
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
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="mt-2 text-3xl font-bold">
            Order #{resolvedParams.id}
          </h1>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
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
                    {order.trackingInfo && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>
                          Last update:{" "}
                          {new Date(
                            order.trackingInfo.timestamp
                          ).toLocaleString()}
                        </p>
                        <p>{order.trackingInfo.status}</p>
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
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <p className="text-sm">{customer.email}</p>
                    <p className="text-sm">{customer.phone}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <p>
                        Customer since{" "}
                        {new Date(customer.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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

          {order.status === "pending" && deliveryBids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Bids</CardTitle>
                <CardDescription>
                  Select a delivery agent for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {bid.deliveryAgentName}
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
                  <span>KES 5.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>KES {(order.totalAmount + 5).toFixed(2)}</span>
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
                        {order.trackingInfo
                          ? new Date(
                              order.trackingInfo.timestamp
                            ).toLocaleString()
                          : "N/A"}
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
                        {order.trackingInfo
                          ? new Date(
                              order.trackingInfo.timestamp
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {order.status === "confirmed" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pickup QR Code</CardTitle>
                <CardDescription>
                  Show this QR code to the delivery agent for scanning when they
                  pick up the order
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRGenerator
                  value={generateQRCodeData(order.id, "pickup")}
                  title="Pickup Verification"
                  description={`Order ${order.id}`}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
