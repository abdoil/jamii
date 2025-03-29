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

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});
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

  const handleBidSubmit = (jobId: string) => {
    if (!bidAmount[jobId] || Number.parseFloat(bidAmount[jobId]) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    toast.success(`Bid of $${bidAmount[jobId]} placed for job #${jobId}`);
    // Reset bid amount for this job
    setBidAmount((prev) => ({ ...prev, [jobId]: "" }));
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Delivery Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage deliveries and track earnings
          </p>
        </div>

        {/* Compact Wallet Summary */}
        <div className="flex items-center gap-3 p-2 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <HbarConverter amount={54.7} />
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {user?.hederaAccountId?.substring(0, 8)}...
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
                    <HbarConverter amount={54.7} />
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Earnings
                </p>
                <p className="text-xl font-bold">
                  KES {totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-xl font-bold">{activeDeliveries}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2">
                <Truck className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-xl font-bold">5</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2">
                <Package className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-xl font-bold">{completedDeliveries}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
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
                    <CardFooter className="flex justify-between p-3 bg-muted/20 border-t">
                      {order.status === "confirmed" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, "in-transit")
                          }
                        >
                          Start Delivery
                        </Button>
                      ) : order.status === "in-transit" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, "delivered")
                          }
                        >
                          Mark as Delivered
                        </Button>
                      ) : (
                        <div />
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
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center border rounded-lg bg-muted/10">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">
                No active deliveries
              </p>
              <p className="text-sm text-muted-foreground">
                Check available jobs to find delivery opportunities
              </p>
            </div>
          )}
        </TabsContent>

        {/* Available Jobs Tab */}
        <TabsContent value="available" className="space-y-4 mt-2">
          <div className="space-y-3">
            {/* Enhanced available jobs with bid UI */}
            {[1, 2, 3, 4, 5].map((job) => {
              const jobId = `JOB-${1000 + job}`;
              return (
                <Card key={job} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Package className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Job #{jobId}</h3>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Bidding
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            <span>
                              Posted {job} hour{job !== 1 ? "s" : ""} ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Coins className="h-4 w-4 text-primary" />
                        <span>
                          KES {5 + job}-{8 + job}
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
                            Store #{job}, Downtown
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Delivery</p>
                          <p className="text-muted-foreground">
                            Within {job + 2} miles
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1 col-span-2 md:col-span-1">
                        <ShoppingBag className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Package</p>
                          <p className="text-muted-foreground">
                            {job + 1} items, {(job * 0.5 + 1).toFixed(1)} lbs
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {job + 1} bids so far
                        </span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() =>
                          router.push(`/delivery/jobs/${1000 + job}`)
                        }
                      >
                        View all bids
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-muted/20 border-t">
                    <div className="flex items-center gap-2 flex-1">
                      <Label
                        htmlFor={`bid-${jobId}`}
                        className="text-sm whitespace-nowrap"
                      >
                        Your Bid:
                      </Label>
                      <div className="relative flex-1 max-w-[120px]">
                        <DollarSign className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={`bid-${jobId}`}
                          type="number"
                          placeholder="0.00"
                          className="pl-7"
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
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleBidSubmit(jobId)}
                        disabled={
                          !bidAmount[jobId] ||
                          Number.parseFloat(bidAmount[jobId]) <= 0
                        }
                      >
                        Place Bid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() =>
                          router.push(`/delivery/jobs/${1000 + job}`)
                        }
                      >
                        Details
                      </Button>
                    </div>
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
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <p className="text-xs text-muted-foreground">
                                Completed on{" "}
                                {new Date(order.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              KES {(order.totalAmount * 0.1).toFixed(2)}
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
                            router.push(`/delivery/orders/${order.id}`)
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
