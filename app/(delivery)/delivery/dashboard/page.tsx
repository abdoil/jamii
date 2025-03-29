"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { ArrowUpRight, Clock, DollarSign, Package, Truck } from "lucide-react";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, router, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status changed to ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  // Calculate dashboard stats
  const activeDeliveries = orders.filter(
    (order) => order.status === "confirmed" || order.status === "in-transit"
  ).length;
  const completedDeliveries = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalEarnings = orders.reduce(
    (sum, order) => sum + order.totalAmount * 0.1,
    0
  ); // Assuming 10% of order value

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Delivery Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your deliveries and track your earnings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {completedDeliveries} completed deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deliveries
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Jobs
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Open for bidding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Deliveries
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="available">Available Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Deliveries</CardTitle>
              <CardDescription>
                Manage and update your current delivery jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading deliveries...</p>
                </div>
              ) : orders.filter(
                  (order) =>
                    order.status === "confirmed" ||
                    order.status === "in-transit"
                ).length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter(
                      (order) =>
                        order.status === "confirmed" ||
                        order.status === "in-transit"
                    )
                    .map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            <span className="font-medium">
                              ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Delivery:</span>{" "}
                            {order.deliveryAddress}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Items:</span>{" "}
                            {order.products.length} products
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {order.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(order.id, "in-transit")
                              }
                            >
                              Start Delivery
                            </Button>
                          )}
                          {order.status === "in-transit" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(order.id, "delivered")
                              }
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/delivery/orders/${order.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">No active deliveries</p>
                  <p className="text-sm text-muted-foreground">
                    Check available jobs to find delivery opportunities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Delivery Jobs</CardTitle>
              <CardDescription>
                Browse and bid on available delivery opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock available jobs */}
                {[1, 2, 3, 4, 5].map((job) => (
                  <div key={job} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Order #JOB-{1000 + job}</h3>
                        <p className="text-sm text-muted-foreground">
                          Posted {job} hour{job !== 1 ? "s" : ""} ago
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          Open for Bids
                        </Badge>
                        <span className="font-medium">Est. $5-8</span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Pickup:</span> Store #
                        {job}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Delivery:</span> Within 5
                        miles
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Items:</span> {job + 1}{" "}
                        products
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/delivery/jobs/${1000 + job}`)
                        }
                      >
                        Place Bid
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/delivery/jobs")}
                >
                  View All Jobs
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
              <CardDescription>
                View your delivery history and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading history...</p>
                </div>
              ) : orders.filter((order) => order.status === "delivered")
                  .length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Completed on{" "}
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            <span className="font-medium">
                              ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Delivery:</span>{" "}
                            {order.deliveryAddress}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Items:</span>{" "}
                            {order.products.length} products
                          </p>
                        </div>
                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/delivery/orders/${order.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">
                    No completed deliveries
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your delivery history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
