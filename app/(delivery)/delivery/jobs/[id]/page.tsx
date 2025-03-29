"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
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
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Store,
  Truck,
  User,
} from "lucide-react";

// Mock job data
const getJobData = (id: string) => ({
  id,
  orderId: `ORD-${id.substring(4)}`,
  storeId: "1",
  storeName: "Fresh Groceries",
  storeLocation: "123 Market St, Downtown",
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

export default function JobDetailPage({ params }: { params: { id: string } }) {
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
      setJob(getJobData(params.id));
      setIsLoading(false);
    }, 1000);
  }, [user, router, params.id]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        `Your bid of $${bidAmount} has been submitted for job #${params.id}`
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
      <div className="flex h-[60vh] items-center justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="mb-4 text-muted-foreground">
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/delivery/jobs"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Job #{params.id}</h1>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        >
          Open for Bids
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>
                Information about this delivery job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Pickup Location:</span>
                  </div>
                  <p>{job.storeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.storeLocation}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Delivery Location:</span>
                  </div>
                  <p>Customer Address</p>
                  <p className="text-sm text-muted-foreground">
                    {job.customerLocation}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Items:</span>
                  </div>
                  <p>{job.items} items</p>
                  <p className="text-sm text-muted-foreground">
                    Weight: {job.weight}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Distance:</span>
                  </div>
                  <p>{job.distance}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Deadline:</span>
                  </div>
                  <p>{new Date(job.deadline).toLocaleTimeString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Posted:</span>
                </div>
                <p>{new Date(job.postedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Bids</CardTitle>
              <CardDescription>
                Bids from delivery agents for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {job.bids.length > 0 ? (
                <div className="space-y-4">
                  {job.bids.map((bid: any) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {bid.deliveryAgentName}
                          </span>
                          {bid.deliveryAgentId === user?.id && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-blue-100 text-blue-800"
                            >
                              Your Bid
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${bid.amount.toFixed(2)}</span>
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
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      >
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No bids yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to bid on this job
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Estimated Earnings</CardTitle>
              <CardDescription>Potential earnings for this job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  ${job.estimatedEarning}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on distance and items
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {userBid ? (
                <div className="w-full space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <p className="font-medium">
                      You've already bid on this job
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your bid: ${userBid.amount.toFixed(2)}
                    </p>
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
                <form onSubmit={handleSubmitBid} className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">
                      Estimated Delivery Time (minutes)
                    </Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="15"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      required
                    />
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
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
