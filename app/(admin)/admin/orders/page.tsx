"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchOrders(user.id, "admin");
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

  const filteredOrders = orders.filter((order) => {
    // Apply status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.deliveryAddress.toLowerCase().includes(searchLower) ||
        order.customerId.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and process customer orders
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
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as OrderStatus | "all")
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

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
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Customer ID:</span>{" "}
                          {order.customerId}
                        </p>
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
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "confirmed")
                            }
                          >
                            Confirm Order
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(order.id, "in-transit")
                            }
                          >
                            Mark as In Transit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
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
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.filter((order) => order.status === "pending")
                  .length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders
                    .filter((order) => order.status === "pending")
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
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Customer ID:</span>{" "}
                            {order.customerId}
                          </p>
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
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "confirmed")
                            }
                          >
                            Confirm Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/admin/orders/${order.id}`)
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
                  <p className="text-muted-foreground">No pending orders</p>
                  <p className="text-sm text-muted-foreground">
                    All orders have been processed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading orders...</p>
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
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Customer ID:</span>{" "}
                            {order.customerId}
                          </p>
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
                              Mark as In Transit
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
                              router.push(`/admin/orders/${order.id}`)
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
                  <p className="text-muted-foreground">No active orders</p>
                  <p className="text-sm text-muted-foreground">
                    All orders have been completed or are pending
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.filter((order) => order.status === "delivered")
                  .length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders
                    .filter((order) => order.status === "delivered")
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
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Customer ID:</span>{" "}
                            {order.customerId}
                          </p>
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
                              router.push(`/admin/orders/${order.id}`)
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
                  <p className="text-muted-foreground">No completed orders</p>
                  <p className="text-sm text-muted-foreground">
                    Orders will appear here when they are delivered
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
