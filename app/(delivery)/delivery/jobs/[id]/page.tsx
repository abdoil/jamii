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

// Mock job data
const getJobData = (id: string) => ({
  id,
  orderId: `ORD-${id.substring(4)}`,
  storeId: "1",
  storeName: "Jamii Supermarket",
  storeLocation: "Koinange Street, Nairobi, Kenya",
  customerLocation: "456 Park Ave, Uptown",
  distance: "3.5 miles",
  items: 4,
  weight: "5.2 lbs",
  estimatedEarning: "5.00-8.00",
  postedAt: new Date(Date.now() - 3600000).toISOString(),
  deadline: new Date(Date.now() + 7200000).toISOString(),
  status: "open",
  bids: [
    {
      id: "bid-1",
      deliveryAgentId: "3",
      deliveryAgentName: "Mike Swift",
      amount: 6.5,
      estimatedDeliveryTime: new Date(Date.now() + 5400000).toISOString(),
      status: "pending",
    },
    {
      id: "bid-2",
      deliveryAgentId: "4",
      deliveryAgentName: "Lisa Quick",
      amount: 7.25,
      estimatedDeliveryTime: new Date(Date.now() + 4800000).toISOString(),
      status: "pending",
    },
  ],
});

function maskName(name: string): string {
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
  const [job, setJob] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("6.50");
  const [estimatedTime, setEstimatedTime] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/");
      return;
    }

    // Simulate loading job data
    setIsLoading(true);
    setTimeout(() => {
      setJob(getJobData(resolvedParams.id));
      setIsLoading(false);
    }, 1000);
  }, [user, router, resolvedParams.id]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        `Your bid of $${bidAmount} has been submitted for job #${resolvedParams.id}`
      );

      // Update the job with the new bid
      setJob((prev: any) => ({
        ...prev,
        bids: [
          ...prev.bids,
          {
            id: `bid-${Date.now()}`,
            deliveryAgentId: user?.id,
            deliveryAgentName: user?.name,
            amount: Number.parseFloat(bidAmount),
            estimatedDeliveryTime: new Date(
              Date.now() + Number.parseInt(estimatedTime) * 60000
            ).toISOString(),
            status: "pending",
          },
        ],
      }));
    } catch (error) {
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/delivery/dashboard"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <Skeleton className="mt-2 h-9 w-40" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Skeleton className="mx-auto h-8 w-24" />
                  <Skeleton className="mx-auto mt-2 h-4 w-36" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          The requested job could not be found
        </p>
        <Button asChild>
          <Link href="/delivery/jobs">View All Jobs</Link>
        </Button>
      </div>
    );
  }

  // Check if user has already bid on this job
  const userBid = job.bids.find((bid: any) => bid.deliveryAgentId === user?.id);

  // Calculate time remaining until deadline
  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  const timeRemaining = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/delivery/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">
              Job #{resolvedParams.id}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Open for Bids
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Delivery Details</CardTitle>
                  <CardDescription>
                    Information about this delivery job
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Timer className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-amber-600">
                    {hoursRemaining}h {minutesRemaining}m remaining
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Locations */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-3 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                      <Store className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="font-medium">Pickup Location</span>
                  </div>
                  <div className="ml-9 space-y-1">
                    <p className="font-medium">{job.storeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.storeLocation}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="font-medium">Delivery Location</span>
                  </div>
                  <div className="ml-9 space-y-1">
                    <p className="font-medium">Customer Address</p>
                    <p className="text-sm text-muted-foreground">
                      {job.customerLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex flex-col items-center justify-center rounded-lg border p-3 bg-muted/5">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Items</span>
                  <span className="text-lg font-bold">{job.items}</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-3 bg-muted/5">
                  <Package className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Weight</span>
                  <span className="text-lg font-bold">{job.weight}</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-3 bg-muted/5">
                  <Route className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Distance</span>
                  <span className="text-lg font-bold">{job.distance}</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border p-3 bg-muted/5">
                  <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Posted</span>
                  <span className="text-sm font-medium">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Bids Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current Bids</CardTitle>
                  <CardDescription>
                    {job.bids.length} bids from delivery agents
                  </CardDescription>
                </div>
                {userBid && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    You've Bid
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {job.bids.length > 0 ? (
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-3 pb-2">
                    {job.bids.map((bid: any) => (
                      <div
                        key={bid.id}
                        className={`rounded-lg border p-3 ${
                          bid.deliveryAgentId === user?.id
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {maskName(bid.deliveryAgentName)}
                                {bid.deliveryAgentId === user?.id && (
                                  <span className="ml-2 text-xs text-blue-600 font-medium">
                                    (Your Bid)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Bid placed{" "}
                                {new Date(
                                  bid.estimatedDeliveryTime
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            Pending
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 rounded-md bg-muted/20 p-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Bid Amount
                              </div>
                              <div className="font-medium">
                                KES {bid.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 rounded-md bg-muted/20 p-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Est. Delivery
                              </div>
                              <div className="font-medium">
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
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground font-medium">
                    No bids yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to bid on this job
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Earnings Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Estimated Earnings</CardTitle>
              <CardDescription>Potential earnings for this job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border p-4 bg-muted/5">
                <DollarSign className="h-6 w-6 text-green-600 mb-1" />
                <div className="text-3xl font-bold text-green-600">
                  KES {job.estimatedEarning}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on distance and items
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bid Form Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{userBid ? "Your Bid" : "Place Your Bid"}</CardTitle>
              <CardDescription>
                {userBid
                  ? "You've already submitted a bid for this job"
                  : "Submit your bid for this delivery job"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userBid ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <p className="font-medium">Bid Submitted</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your Bid
                        </p>
                        <p className="text-lg font-bold">
                          KES {userBid.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Est. Delivery Time
                        </p>
                        <p className="text-sm font-medium">
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
                    className="w-full"
                    onClick={() => router.push("/delivery/jobs")}
                  >
                    Browse More Jobs
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount" className="text-sm">
                      Your Bid Amount (KES)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        min="1"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suggested range: KES {job.estimatedEarning}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime" className="text-sm">
                      Estimated Delivery Time (minutes)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="15"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum 15 minutes
                    </p>
                  </div>

                  <Button
                    type="submit"
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
