"use client";

import { useEffect, useState, useCallback } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Truck,
  User,
  Check,
  DollarSign,
} from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { ReviewForm } from "@/components/review/review-form";
import QRCode from "react-qr-code";

// Mock delivery bids - moved outside component to prevent recreation on each render
const mockDeliveryBids = [
  {
    id: "bid-1",
    orderId: "2",
    deliveryAgentId: "3",
    deliveryAgentName: "John Delivery",
    rating: 4.8,
    completedDeliveries: 156,
    amount: 5.0,
    estimatedDeliveryTime: "2023-05-15T14:00:00Z",
    status: "pending",
  },
  {
    id: "bid-2",
    orderId: "2",
    deliveryAgentId: "4",
    deliveryAgentName: "Sarah Express",
    rating: 4.9,
    completedDeliveries: 243,
    amount: 6.5,
    estimatedDeliveryTime: "2023-05-15T13:30:00Z",
    status: "pending",
  },
  {
    id: "bid-3",
    orderId: "2",
    deliveryAgentId: "5",
    deliveryAgentName: "Mike Swift",
    rating: 4.6,
    completedDeliveries: 98,
    amount: 4.5,
    estimatedDeliveryTime: "2023-05-15T15:00:00Z",
    status: "pending",
  },
];

// QR Code Generator Component
function QRGenerator({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCode value={value} size={180} />
      </div>
      <p className="mt-2 font-medium text-center">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
      )}
    </div>
  );
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const { orders, fetchOrders } = useOrdersStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryBids, setDeliveryBids] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Generate QR code data - memoized to prevent recreation on each render
  const generateQRCodeData = useCallback(
    (orderId: string, type: "pickup" | "delivery") => {
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
    },
    []
  );

  // Load order data - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        await fetchOrders(user.id, user.role);

        if (!isMounted) return;

        // Find the order in the store
        const foundOrder = orders.find((o) => o.id === params.id);
        if (foundOrder) {
          setOrder(foundOrder);

          // If order is pending, fetch delivery bids
          if (foundOrder.status === "pending") {
            // In a real app, this would be an API call
            // For now, we'll use mock data
            setDeliveryBids(
              mockDeliveryBids.filter((bid) => bid.orderId === params.id)
            );
          }
        } else {
          toast({
            title: "Order not found",
            description: "The requested order could not be found",
            variant: "destructive",
          });
          router.push("/orders");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load order details",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, router, fetchOrders, params.id, toast]);

  // Memoize the handleSelectDeliveryAgent function to prevent recreation on each render
  const handleSelectDeliveryAgent = useCallback(
    async (bidId: string) => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Delivery agent selected",
          description: "Your order will be delivered by the selected agent",
        });

        // Update local state
        const selectedBid = deliveryBids.find((bid) => bid.id === bidId);
        if (selectedBid && order) {
          setOrder({
            ...order,
            status: "confirmed",
            deliveryAgentId: selectedBid.deliveryAgentId,
          });

          setDeliveryBids(
            deliveryBids.map((bid) => ({
              ...bid,
              status: bid.id === bidId ? "accepted" : "rejected",
            }))
          );
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to select delivery agent",
          variant: "destructive",
        });
      }
    },
    [deliveryBids, order, toast]
  );

  // Memoize the getStatusBadge function to prevent recreation on each render
  const getStatusBadge = useCallback((status: OrderStatus) => {
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
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-[60vh] items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!order) {
    return (
      <div className="container py-8">
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The requested order could not be found
          </p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link
              href="/orders"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">Order Items</h3>
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
                                : "Awaiting Pickup"}
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
                  </div>
                </CardContent>
              </Card>

              {order.status === "pending" && deliveryBids.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Bids</CardTitle>
                    <CardDescription>
                      Select a delivery agent for your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deliveryBids.map((bid) => (
                        <div key={bid.id} className="rounded-lg border p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                  <span>
                                    Delivery Fee: ${bid.amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    Estimated delivery:{" "}
                                    {new Date(
                                      bid.estimatedDeliveryTime
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Truck className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {bid.completedDeliveries} deliveries
                                    completed
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(bid.rating)
                                            ? "fill-yellow-400"
                                            : "fill-gray-300"
                                        }`}
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                    <span className="ml-1">
                                      {bid.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleSelectDeliveryAgent(bid.id)}
                              disabled={bid.status !== "pending"}
                              className="min-w-[120px]"
                            >
                              {bid.status === "accepted" ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Selected
                                </>
                              ) : bid.status === "rejected" ? (
                                "Rejected"
                              ) : (
                                "Select"
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>$5.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${(order.totalAmount + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Timeline</CardTitle>
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

              {order.status === "in-transit" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery QR Code</CardTitle>
                    <CardDescription>
                      Show this QR code to the delivery agent when they deliver
                      your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <QRGenerator
                      value={generateQRCodeData(order.id, "delivery")}
                      title="Delivery Verification"
                      description={`Order #${order.id}`}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {order && order.status === "delivered" && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rate the Store</CardTitle>
                  <CardDescription>
                    Share your experience with the store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewForm orderId={order.id} type="store" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate the Delivery</CardTitle>
                  <CardDescription>
                    Share your experience with the delivery service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewForm orderId={order.id} type="delivery" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
