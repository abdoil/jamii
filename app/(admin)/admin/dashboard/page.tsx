"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  useOrdersStore,
  useProductsStore,
  type OrderStatus,
} from "@/lib/zustand-store";
import { AdminLayout } from "@/components/admin/admin-layout";
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
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  Copy,
  PlusCircle,
  ArrowDownLeft,
  Coins,
  Timer,
  MapPin,
  ChevronRight,
  Info,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUpdateOrderStatus } from "@/lib/hooks/use-order";
import { HbarConverter } from "@/components/hbar-converter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { orders, fetchOrders } = useOrdersStore();
  const { products, fetchProducts } = useProductsStore();
  const updateOrderStatus = useUpdateOrderStatus();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        await Promise.all([fetchOrders(user.id, "admin"), fetchProducts()]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, router, fetchOrders, fetchProducts]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success(`Order status changed to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Calculate dashboard stats
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalProducts = products.length;
  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed"
  ).length;
  const inTransitOrders = orders.filter(
    (order) => order.status === "in-transit"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;
  const totalDeliveryFees = orders.reduce(
    (sum, order) => sum + order.totalAmount * 0.1,
    0
  );
  const totalProfit = totalRevenue - totalDeliveryFees;

  // Mock wallet balance (replace with actual data)
  const walletBalance = {
    hbar: 54.7,
    kes: 5470, // 1 HBAR = 100 KES
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

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-10">
      {/* Header with Wallet Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Admin Dashboard
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Manage orders and track revenue
          </p>
        </div>

        {/* Compact Wallet Summary */}
        <div className="flex items-center gap-3 p-2 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1 text-sm">
                <HbarConverter amount={walletBalance.hbar} />
                <span className="text-xs text-muted-foreground">
                  (KES {walletBalance.kes.toLocaleString()})
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {user?.hederaAccountId}
              </div>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <h2 className="sr-only">Hedera Wallet Details</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Wallet className="h-5 w-5" /> Hedera Wallet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your wallet and transactions
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="text-sm font-medium">Available Balance</div>
                  <div className="mt-1">
                    <HbarConverter amount={walletBalance.hbar} />
                    <div className="text-sm text-muted-foreground">
                      KES {walletBalance.kes.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Account ID</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-xs flex-1 overflow-hidden text-ellipsis">
                        {user?.hederaAccountId || "Not connected"}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => {
                          if (user?.hederaAccountId) {
                            navigator.clipboard.writeText(user.hederaAccountId);
                            toast.success("Account ID copied");
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div>
                    <label className="text-sm font-medium">Public Key</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-xs flex-1 overflow-hidden text-ellipsis">
                        {user?.hederaPublicKey || "Not connected"}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => {
                          if (user?.hederaPublicKey) {
                            navigator.clipboard.writeText(user.hederaPublicKey);
                            toast.success("Public Key copied");
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Load Wallet
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-lg font-bold md:text-xl">
                  KES {totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Delivery Fees
                </p>
                <p className="text-lg font-bold md:text-xl">
                  KES {totalDeliveryFees.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-1.5">
                <Coins className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Net Profit
                </p>
                <p className="text-lg font-bold md:text-xl">
                  KES {totalProfit.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-1.5">
                <Package className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-lg font-bold md:text-xl">{totalOrders}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Confirmed</span>
                </div>
                <span className="text-sm font-medium">{confirmedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">In Transit</span>
                </div>
                <span className="text-sm font-medium">{inTransitOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Delivered</span>
                </div>
                <span className="text-sm font-medium">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm">Cancelled</span>
                </div>
                <span className="text-sm font-medium">{cancelledOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          order.status === "delivered"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : order.status === "in-transit"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : order.status === "confirmed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : order.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {order.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
