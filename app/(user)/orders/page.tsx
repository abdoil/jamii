"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav";
import { ArrowLeft, Package, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, fetchOrders } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchOrders(user.id, user.role);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [user, router, fetchOrders]);

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

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link
              href="/shop"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
            <h1 className="mt-4 text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">
              View and track your order history
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle>Order #{order.id}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{order.products.length} items</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-medium">
                              KES {order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-xl font-medium">No orders found</h3>
                  <p className="mb-4 text-muted-foreground">
                    You haven't placed any orders yet
                  </p>
                  <Button asChild>
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="active">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.filter(
                  (order) =>
                    order.status === "pending" ||
                    order.status === "confirmed" ||
                    order.status === "in-transit"
                ).length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orders
                    .filter(
                      (order) =>
                        order.status === "pending" ||
                        order.status === "confirmed" ||
                        order.status === "in-transit"
                    )
                    .map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle>Order #{order.id}</CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{order.products.length} items</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total:
                              </span>
                              <span className="font-medium">
                                KES {order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              Track Order
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-xl font-medium">No active orders</h3>
                  <p className="mb-4 text-muted-foreground">
                    You don't have any active orders at the moment
                  </p>
                  <Button asChild>
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.filter((order) => order.status === "delivered")
                  .length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orders
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle>Order #{order.id}</CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{order.products.length} items</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total:
                              </span>
                              <span className="font-medium">
                                KES {order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-xl font-medium">
                    No completed orders
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    You don't have any completed orders yet
                  </p>
                  <Button asChild>
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
