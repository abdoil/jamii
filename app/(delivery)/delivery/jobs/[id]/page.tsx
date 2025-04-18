"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Store,
  User,
  CheckCircle2,
  Timer,
  AlertCircle,
  ShoppingBag,
  Route,
} from "lucide-react";
import { useGetBids, useCreateBid, type Bid } from "@/lib/hooks/use-bids";
import { useGetOrder } from "@/lib/hooks/use-order";

function maskName(name?: string): string {
  if (!name) return "Delivery Agent - 2"; // Default value if name is missing
  const parts = name.split(" ");
  return parts.map((part) => part[0] + "*".repeat(part.length - 1)).join(" ");
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("6.50");
  const [estimatedTime, setEstimatedTime] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading: isOrderLoading } = useGetOrder(
    resolvedParams.id
  );
  // Fetch bids for this order
  const { data: bids, isLoading: isBidsLoading } = useGetBids(
    resolvedParams.id
  );
  // Create bid mutation
  const createBid = useCreateBid();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/");
      return;
    }

    if (orderData) {
      setOrder(orderData);
    }
  }, [user, router, orderData]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createBid.mutateAsync({
        orderId: resolvedParams.id,
        amount: Number(bidAmount),
        estimatedDeliveryTime: new Date(
          Date.now() + Number.parseInt(estimatedTime) * 60000
        ).toISOString(),
      });

      toast.success(
        `Your bid of KES ${bidAmount} has been submitted for job #${resolvedParams.id}`
      );

      // Update the job with the new bid
      // setJob((prev: any) => ({
      //   ...prev,
      //   bids: [
      //     ...prev.bids,
      //     {
      //       id: `bid-${Date.now()}`,
      //       deliveryAgentId: user?.id,
      //       deliveryAgentName: user?.name,
      //       amount: Number.parseFloat(bidAmount),
      //       estimatedDeliveryTime: new Date(
      //         Date.now() + Number.parseInt(estimatedTime) * 60000
      //       ).toISOString(),
      //       status: "pending",
      //     },
      //   ],
      // }));
    } catch (error) {
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrderLoading || isBidsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/delivery/dashboard"
              className="flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <Skeleton className="mt-2 h-6 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="p-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-40" />
              </CardHeader>
              <CardContent className="p-3 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-3 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader className="p-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-32" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center">
                  <Skeleton className="mx-auto h-6 w-20" />
                  <Skeleton className="mx-auto mt-1.5 h-3.5 w-28" />
                </div>
              </CardContent>
              <CardFooter className="p-3">
                <div className="w-full space-y-3">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          The requested job could not be found
        </p>
        <Button asChild size="sm">
          <Link href="/delivery/jobs">View All Jobs</Link>
        </Button>
      </div>
    );
  }

  // Check if user has already bid on this job
  const userBid = bids?.find((bid) => bid.deliveryAgentId === user?.id);

  // Calculate time remaining until deadline (30 minutes from order creation)
  const orderDate = new Date(order.createdAt);
  const deadlineDate = new Date(orderDate.getTime() + 30 * 60 * 1000);
  const now = new Date();
  const timeRemaining = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/delivery/dashboard"
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <div className="mt-1.5 flex items-center gap-2">
            <h4 className="text-lg font-bold md:text-xl">
              Job #{resolvedParams.id}
            </h4>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
            >
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {/* Job Overview Card */}
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Delivery Details</CardTitle>
                  <CardDescription className="text-xs">
                    Information about this delivery job
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Timer className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-medium text-amber-600">
                    {order.status === "delivered"
                      ? "Delivered"
                      : `${hoursRemaining}h ${minutesRemaining}m remaining`}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-4">
              {/* Delivery Transaction Details */}
              {order.status === "delivered" && (
                <div className="rounded-lg border p-2.5 bg-green-50 border-green-200">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium">
                      Delivery Confirmed
                    </span>
                  </div>
                  <div className="ml-5.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Transaction ID
                      </span>
                      <span className="text-xs font-medium">
                        {order.deliveryTransactionId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span className="text-xs font-medium">
                        KES {order.deliveryFee}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() =>
                        window.open(
                          `https://hashscan.io/testnet/tx/${order.deliveryTransactionId}`,
                          "_blank"
                        )
                      }
                    >
                      View on Hashscan
                    </Button>
                  </div>
                </div>
              )}

              {/* Locations */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-2.5 bg-muted/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <Store className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-xs font-medium">Pickup Location</span>
                  </div>
                  <div className="ml-7.5 space-y-0.5">
                    <p className="text-sm font-medium">{order.storeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.storeLocation}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-2.5 bg-muted/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <MapPin className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium">
                      Delivery Location
                    </span>
                  </div>
                  <div className="ml-7.5 space-y-0.5">
                    <p className="text-sm font-medium">Customer Address</p>
                    <p className="text-xs text-muted-foreground">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="flex flex-col items-center justify-center rounded-lg border p-2 bg-muted/5">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium">Items</span>
                  <span className="text-sm font-bold">
                    {order.products.length}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-2 bg-muted/5">
                  <Package className="h-4 w-4 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium">Total Amount</span>
                  <span className="text-sm font-bold">
                    KES {order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-2 bg-muted/5">
                  <Route className="h-4 w-4 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium">Distance</span>
                  <span className="text-sm font-bold">3.5 km</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-2 bg-muted/5">
                  <Calendar className="h-4 w-4 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium">Posted</span>
                  <span className="text-xs font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Bids Card */}
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Current Bids</CardTitle>
                  <CardDescription className="text-xs">
                    {bids?.length || 0} bids from delivery agents
                  </CardDescription>
                </div>
                {userBid && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                  >
                    You've Bid
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {bids && bids.length > 0 ? (
                <ScrollArea className="max-h-[350px] pr-3">
                  <div className="space-y-2.5 pb-1">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`rounded-lg border p-2.5 ${
                          bid.deliveryAgentId === user?.id
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {maskName(bid.deliveryAgentName)}
                                {bid.deliveryAgentId === user?.id && (
                                  <span className="ml-1.5 text-xs text-blue-600 font-medium">
                                    (Your Bid)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Bid placed{" "}
                                {new Date(
                                  bid.estimatedDeliveryTime
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          >
                            {bid.status}
                          </Badge>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 rounded-md bg-muted/20 p-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Bid Amount
                              </div>
                              <div className="text-sm font-medium">
                                KES {bid.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 rounded-md bg-muted/20 p-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Est. Delivery
                              </div>
                              <div className="text-sm font-medium">
                                {new Date(
                                  bid.estimatedDeliveryTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                  <p className="text-sm text-muted-foreground font-medium">
                    No bids yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Be the first to bid on this job
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Earnings Card */}
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <CardTitle className="text-base">Estimated Earnings</CardTitle>
              <CardDescription className="text-xs">
                Potential earnings for this job
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-col items-center justify-center rounded-lg border p-3 bg-muted/5">
                <div className="text-xl font-bold text-green-600">
                  KES {Number(order.totalAmount.toFixed(0)) / 3}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on distance and items
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bid Form Card */}
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <CardTitle className="text-base">
                {userBid ? "Your Bid" : "Place Your Bid"}
              </CardTitle>
              <CardDescription className="text-xs">
                {userBid
                  ? "You've already submitted a bid for this job"
                  : "Submit your bid for this delivery job"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {userBid ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium">Bid Submitted</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your Bid
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
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/delivery/jobs")}
                  >
                    Browse More Jobs
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="bidAmount" className="text-xs">
                      Your Bid Amount (KES)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        min="1"
                        max={Number(order.totalAmount.toFixed(0))}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-7 h-8 text-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suggested range: KES{" "}
                      {Number(order.totalAmount.toFixed(0)) / 3}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="estimatedTime" className="text-xs">
                      Estimated Delivery Time (minutes)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="15"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="pl-7 h-8 text-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum 15 minutes
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bid"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
