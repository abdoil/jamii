"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import {
  useOrdersStore,
  type Order,
  type OrderStatus,
} from "@/lib/zustand-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Truck,
  Check,
  QrCode,
} from "lucide-react";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
import { QRScanner } from "@/components/qr-code/qr-scanner";

export default function DeliveryOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState<"pickup" | "delivery">("pickup");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchOrders(user.id, "delivery");

        // Find the order in the store
        const foundOrder = orders.find((o) => o.id === params.id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error("Order not found");
          router.push("/delivery/orders");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, params.id, toast]); // Remove orders and fetchOrders from dependencies

  const handleScan = async (data: string) => {
    try {
      // Parse the QR code data
      const qrData = JSON.parse(data);

      // Verify that the QR code is for the correct order and type
      if (qrData.orderId !== order?.id || qrData.type !== scanType) {
        toast.error("Invalid QR Code");
        return;
      }

      // Update order status based on scan type
      const newStatus: OrderStatus =
        scanType === "pickup" ? "in-transit" : "delivered";

      // In a real app, you would call an API to update the order status
      if (order) {
        await updateOrderStatus(order.id, newStatus);
      }

      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus,
        });
      }

      toast.success(
        scanType === "pickup"
          ? "Order picked up successfully! You can now deliver it to the customer."
          : "Order delivered successfully!"
      );

      // Hide scanner after successful scan
      setShowScanner(false);
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Failed to process QR code. Please try again.");
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
      <DeliveryLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </DeliveryLayout>
    );
  }

  if (!order) {
    return (
      <DeliveryLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The requested order could not be found
          </p>
          <Button asChild>
            <Link href="/delivery/orders">View All Orders</Link>
          </Button>
        </div>
      </DeliveryLayout>
    );
  }

  return (
    <DeliveryLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/delivery/orders"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
            <h1 className="mt-2 text-2xl font-bold">Order #{params.id}</h1>
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
                    {order.products.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Product #{item.productId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-medium">Pickup Address</h3>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p>Store #{order.storeId}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium">Delivery Address</h3>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p>{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Delivery Status</h3>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {order.status === "delivered"
                          ? "Delivered"
                          : order.status === "in-transit"
                          ? "In Transit"
                          : order.status === "confirmed"
                          ? "Ready for Pickup"
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
              </CardContent>
            </Card>

            {showScanner && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Scan {scanType === "pickup" ? "Pickup" : "Delivery"} QR Code
                  </CardTitle>
                  <CardDescription>
                    {scanType === "pickup"
                      ? "Scan the QR code from the store to confirm pickup"
                      : "Scan the QR code from the customer to confirm delivery"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QRScanner
                    onScan={handleScan}
                    title={
                      scanType === "pickup"
                        ? "Pickup Verification"
                        : "Delivery Verification"
                    }
                    description={`Order #${order.id}`}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === "confirmed" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setScanType("pickup");
                      setShowScanner((prev) => !prev);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {showScanner && scanType === "pickup"
                      ? "Hide Scanner"
                      : "Scan Pickup QR Code"}
                  </Button>
                )}

                {order.status === "in-transit" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setScanType("delivery");
                      setShowScanner((prev) => !prev);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {showScanner && scanType === "delivery"
                      ? "Hide Scanner"
                      : "Scan Delivery QR Code"}
                  </Button>
                )}

                {order.status === "delivered" && (
                  <div className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <p className="flex items-center">
                      <Check className="mr-2 h-5 w-5" />
                      Order successfully delivered!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Earnings</span>
                    <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earnings will be transferred to your wallet after successful
                    delivery
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
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
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
}
