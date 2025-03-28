"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Search, MapPin, Package, Clock, DollarSign } from "lucide-react";

export default function DeliveryOrdersPage() {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();

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
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, router, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
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

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.deliveryAddress.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Deliveries</h1>
        <p className="text-muted-foreground">
          Manage and track your assigned deliveries
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:w-2/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => router.push("/delivery/jobs")}>
          Find New Jobs
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading deliveries...</p>
                </div>
              ) : filteredOrders.filter(
                  (order) =>
                    order.status === "confirmed" ||
                    order.status === "in-transit"
                ).length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders
                    .filter(
                      (order) =>
                        order.status === "confirmed" ||
                        order.status === "in-transit"
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Order #{order.id}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Delivery to: {order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Ordered:{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Earning: ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
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
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/delivery/orders/${order.id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>
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

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading deliveries...</p>
                </div>
              ) : filteredOrders.filter((order) => order.status === "delivered")
                  .length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Order #{order.id}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Delivered to: {order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Completed:{" "}
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Earned: ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
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

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Order #{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>Address: {order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
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
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or check available jobs
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
