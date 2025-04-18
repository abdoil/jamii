"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  Truck,
  Wallet,
  Copy,
  PlusCircle,
  ArrowDownLeft,
  Coins,
  Timer,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Info,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { HbarConverter } from "@/components/hbar-converter";
import { Separator } from "@/components/ui/separator";
import { useGetBids, useCreateBid, type Bid } from "@/lib/hooks/use-bids";
import { useContract } from "@/lib/hooks/use-contract";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});
  const [estimatedTime, setEstimatedTime] = useState<Record<string, string>>(
    {}
  );
  const [deliveryCode, setDeliveryCode] = useState<Record<string, string>>({});
  const [isStartingDelivery, setIsStartingDelivery] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();
  const createBid = useCreateBid();
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed"
  );
  const { data: allBids } = useGetBids(
    pendingOrders.length > 0
      ? pendingOrders.map((order) => order.id).join(",")
      : ""
  );
  const { placeBid, confirmDelivery } = useContract();

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
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, router, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status changed to ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleBidSubmit = async (jobId: string) => {
    if (!bidAmount[jobId] || Number.parseFloat(bidAmount[jobId]) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (!estimatedTime[jobId] || Number.parseInt(estimatedTime[jobId]) <= 0) {
      toast.error("Please enter a valid estimated delivery time");
      return;
    }

    try {
      await createBid.mutateAsync({
        orderId: jobId,
        amount: Number.parseFloat(bidAmount[jobId]),
        estimatedDeliveryTime: new Date(
          Date.now() + Number.parseInt(estimatedTime[jobId]) * 60000
        ).toISOString(),
      });

      // Reset bid amount and estimated time for this job
      setBidAmount((prev) => ({ ...prev, [jobId]: "" }));
      setEstimatedTime((prev) => ({ ...prev, [jobId]: "" }));
    } catch (error) {
      console.error("Error submitting bid:", error);
    }
  };

  const handleStartDelivery = async (orderId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to start delivery");
      return;
    }

    try {
      setIsStartingDelivery((prev) => ({ ...prev, [orderId]: true }));
      const response = await fetch(`/api/orders/${orderId}/start-delivery`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start delivery");
      }

      toast.success("Delivery started successfully");
      await fetchOrders(user.id, "delivery");
    } catch (error) {
      toast.error("Failed to start delivery");
    } finally {
      setIsStartingDelivery((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handlePlaceBid = async (orderId: string, amount: number) => {
    try {
      await placeBid.mutateAsync({ orderId, amount });
      await fetchOrders(user?.id || "", "delivery");
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await confirmDelivery.mutateAsync(orderId);
      await fetchOrders(user?.id || "", "delivery");
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  };

  // Calculate dashboard stats
  const activeDeliveries = orders.filter(
    (order) => order.status === "confirmed" || order.status === "in-transit"
  ).length;
  const completedDeliveries = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalEarnings = orders.reduce((sum, order) => {
    if (order.status === "delivered" && order.transactions?.bidPlaced?.amount) {
      return sum + order.transactions.bidPlaced.amount;
    }
    return sum;
  }, 0);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Confirmed
          </Badge>
        );
      case "in-transit":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            In Transit
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
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
            Delivery Dashboard
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Manage deliveries and track earnings
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
                <HbarConverter amount={Number(totalEarnings.toFixed(2))} />
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
                    <HbarConverter amount={Number(totalEarnings.toFixed(2))} />
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
                  Earnings
                </p>
                <p className="text-lg font-bold md:text-xl">
                  KES {totalEarnings.toFixed(2)}
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
                  Active
                </p>
                <p className="text-lg font-bold md:text-xl">
                  {activeDeliveries}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-1.5">
                <Truck className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-lg font-bold md:text-xl">5</p>
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
                  Completed
                </p>
                <p className="text-lg font-bold md:text-xl">
                  {completedDeliveries}
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Active Deliveries Tab */}
        <TabsContent value="active" className="space-y-4 mt-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Loading deliveries...</p>
            </div>
          ) : orders.filter(
              (order) =>
                order.status === "confirmed" || order.status === "in-transit"
            ).length > 0 ? (
            <div className="space-y-3">
              {orders
                .filter(
                  (order) =>
                    order.status === "confirmed" ||
                    order.status === "in-transit"
                )
                .map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                            <Truck className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              Order #{order.id}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <span className="font-medium text-sm">
                            KES {(order.totalAmount * 0.1).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                          <div className="overflow-hidden">
                            <p className="font-medium">Delivery Address</p>
                            <p className="text-muted-foreground truncate">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1">
                          <ShoppingBag className="h-3 w-3 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Package</p>
                            <p className="text-muted-foreground">
                              {order.products.length} items
                            </p>
                          </div>
                        </div>
                        {order.bidTransactionId && (
                          <div className="flex items-start gap-1 col-span-2">
                            <Package className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <div className="overflow-hidden">
                              <p className="font-medium">Bid Transaction</p>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground truncate text-xs">
                                  {order.bidTransactionId}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      order.bidTransactionId || ""
                                    );
                                    toast.success("Transaction ID copied");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        {order.deliveryTransactionId && (
                          <div className="flex items-start gap-1 col-span-2">
                            <Truck className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <div className="overflow-hidden">
                              <p className="font-medium">
                                Delivery Transaction
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground truncate text-xs">
                                  {order.deliveryTransactionId}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      order.deliveryTransactionId || ""
                                    );
                                    toast.success("Transaction ID copied");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {order.hashscanUrl && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      window.open(order.hashscanUrl, "_blank")
                                    }
                                  >
                                    <ArrowUpRight className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-3 bg-muted/20 border-t">
                      {order.status === "confirmed" ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartDelivery(order.id)}
                          disabled={isStartingDelivery[order.id]}
                        >
                          {isStartingDelivery[order.id]
                            ? "Starting..."
                            : "Start Delivery"}
                        </Button>
                      ) : order.status === "in-transit" ? (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Enter delivery code"
                              value={deliveryCode[order.id] || ""}
                              onChange={(e) =>
                                setDeliveryCode((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmDelivery(order.id)}
                          >
                            Confirm Delivery
                          </Button>
                        </div>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/delivery/jobs/${order.id}`)
                        }
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center border rounded-lg bg-muted/10">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">
                No active deliveries
              </p>
              <p className="text-xs text-muted-foreground">
                Check available jobs to find delivery opportunities
              </p>
            </div>
          )}
        </TabsContent>

        {/* Available Jobs Tab */}
        <TabsContent value="available" className="space-y-4 mt-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Loading available jobs...</p>
            </div>
          ) : pendingOrders.length > 0 ? (
            <>
              <div className="space-y-3">
                {pendingOrders.map((order) => {
                  const orderBids =
                    allBids?.filter((bid) => bid.orderId === order.id) || [];
                  const userBid = orderBids.find(
                    (bid) => bid.deliveryAgentId === user?.id
                  );
                  const jobId = order.id;

                  return (
                    <Card key={jobId} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                              <Package className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium">
                                  Order #{jobId}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0"
                                >
                                  Bidding
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Timer className="h-2.5 w-2.5" />
                                <span>
                                  Posted{" "}
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Coins className="h-4 w-4 text-primary" />
                            <span>
                              KES {order.totalAmount * 0.1}-
                              {order.totalAmount * 0.15}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-muted-foreground">
                                Jamii Store
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Delivery</p>
                              <p className="text-muted-foreground">
                                {order.deliveryAddress}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1 col-span-2 md:col-span-1">
                            <ShoppingBag className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Package</p>
                              <p className="text-muted-foreground">
                                {order.products.length} items
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {orderBids.length || 0} bids so far
                            </span>
                          </div>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs"
                            onClick={() =>
                              router.push(`/delivery/jobs/${order.id}`)
                            }
                          >
                            View all bids
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-muted/20 border-t">
                        {userBid ? (
                          <div className="w-full rounded-lg bg-blue-50 p-3 border border-blue-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium">Your Bid</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Amount
                                </p>
                                <p className="text-sm font-bold">
                                  KES {userBid.amount.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Est. Delivery Time
                                </p>
                                <p className="text-xs font-medium">
                                  {new Date(
                                    userBid.estimatedDeliveryTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            {userBid.status === "accepted" && (
                              <div className="mt-2 text-xs text-green-600 font-medium">
                                Your bid has been accepted!
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              <Label
                                htmlFor={`bid-${jobId}`}
                                className="text-xs whitespace-nowrap"
                              >
                                Your Bid:
                              </Label>
                              <div className="relative flex-1 max-w-[120px]">
                                <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`bid-${jobId}`}
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-7 h-8 text-sm"
                                  value={bidAmount[jobId] || ""}
                                  onChange={(e) =>
                                    setBidAmount((prev) => ({
                                      ...prev,
                                      [jobId]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <Label
                                htmlFor={`time-${jobId}`}
                                className="text-xs whitespace-nowrap"
                              >
                                Est. Time (min):
                              </Label>
                              <div className="relative flex-1 max-w-[120px]">
                                <Timer className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`time-${jobId}`}
                                  type="number"
                                  placeholder="60"
                                  className="pl-7 h-8 text-sm"
                                  value={estimatedTime[jobId] || ""}
                                  onChange={(e) =>
                                    setEstimatedTime((prev) => ({
                                      ...prev,
                                      [jobId]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                className="flex-1 sm:flex-none"
                                onClick={() => handleBidSubmit(jobId)}
                                disabled={
                                  !bidAmount[jobId] ||
                                  Number.parseFloat(bidAmount[jobId]) <= 0 ||
                                  !estimatedTime[jobId] ||
                                  Number.parseInt(estimatedTime[jobId]) <= 0 ||
                                  createBid.isPending
                                }
                              >
                                {createBid.isPending
                                  ? "Placing Bid..."
                                  : "Place Bid"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() =>
                                  router.push(`/delivery/jobs/${order.id}`)
                                }
                              >
                                Details
                              </Button>
                            </div>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/delivery/jobs")}
                >
                  View All Jobs
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center border rounded-lg bg-muted/10">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">
                No available jobs
              </p>
              <p className="text-xs text-muted-foreground">
                Check back later for new delivery opportunities
              </p>
            </div>
          )}
        </TabsContent>

        {/* Completed Deliveries Tab */}
        <TabsContent value="completed" className="space-y-4 mt-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : orders.filter((order) => order.status === "delivered").length >
            0 ? (
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <div className="space-y-3 pb-4">
                {orders
                  .filter((order) => order.status === "delivered")
                  .map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Order #{order.id}</h4>
                              <p className="text-xs text-muted-foreground">
                                Completed on{" "}
                                {new Date(order.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              KES{" "}
                              {order.transactions?.bidPlaced?.amount?.toFixed(
                                2
                              ) || "0.00"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Earnings
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div className="overflow-hidden">
                              <p className="font-medium">Delivery Address</p>
                              <p className="text-muted-foreground truncate">
                                {order.deliveryAddress}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <ShoppingBag className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Package</p>
                              <p className="text-muted-foreground">
                                {order.products.length} items
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end p-3 bg-muted/20 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/delivery/jobs/${order.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center border rounded-lg bg-muted/10">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">
                No completed deliveries
              </p>
              <p className="text-sm text-muted-foreground">
                Your delivery history will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
