"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
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
import {
  Search,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Store,
  ArrowRight,
} from "lucide-react";

// Mock available jobs data
const availableJobs = [
  {
    id: "job-1001",
    orderId: "ORD-1001",
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
  },
  {
    id: "job-1002",
    orderId: "ORD-1002",
    storeId: "2",
    storeName: "Organic Market",
    storeLocation: "789 Oak St, Westside",
    customerLocation: "101 Pine St, Northside",
    distance: "4.2 miles",
    items: 6,
    weight: "7.8 lbs",
    estimatedEarning: "6.50-9.50",
    postedAt: new Date(Date.now() - 7200000).toISOString(),
    deadline: new Date(Date.now() + 5400000).toISOString(),
    status: "open",
  },
  {
    id: "job-1003",
    orderId: "ORD-1003",
    storeId: "1",
    storeName: "Fresh Groceries",
    storeLocation: "123 Market St, Downtown",
    customerLocation: "202 Elm St, Eastside",
    distance: "2.8 miles",
    items: 3,
    weight: "3.5 lbs",
    estimatedEarning: "4.00-7.00",
    postedAt: new Date(Date.now() - 10800000).toISOString(),
    deadline: new Date(Date.now() + 3600000).toISOString(),
    status: "open",
  },
  {
    id: "job-1004",
    orderId: "ORD-1004",
    storeId: "3",
    storeName: "City Supermarket",
    storeLocation: "303 Main St, Downtown",
    customerLocation: "404 Maple Ave, Southside",
    distance: "5.1 miles",
    items: 8,
    weight: "10.2 lbs",
    estimatedEarning: "7.50-11.00",
    postedAt: new Date(Date.now() - 14400000).toISOString(),
    deadline: new Date(Date.now() + 10800000).toISOString(),
    status: "open",
  },
  {
    id: "job-1005",
    orderId: "ORD-1005",
    storeId: "2",
    storeName: "Organic Market",
    storeLocation: "789 Oak St, Westside",
    customerLocation: "505 Cedar Rd, Westside",
    distance: "1.5 miles",
    items: 2,
    weight: "2.3 lbs",
    estimatedEarning: "3.50-6.00",
    postedAt: new Date(Date.now() - 18000000).toISOString(),
    deadline: new Date(Date.now() + 14400000).toISOString(),
    status: "open",
  },
];

export default function DeliveryJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/");
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  // Filter and sort jobs
  const filteredJobs = availableJobs
    .filter((job) => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.storeName.toLowerCase().includes(searchLower) ||
          job.storeLocation.toLowerCase().includes(searchLower) ||
          job.customerLocation.toLowerCase().includes(searchLower)
        );
      }

      // Apply location filter
      if (locationFilter !== "all") {
        return job.storeLocation
          .toLowerCase()
          .includes(locationFilter.toLowerCase());
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance);
        case "earnings":
          return (
            Number.parseFloat(a.estimatedEarning.split("-")[1]) -
            Number.parseFloat(b.estimatedEarning.split("-")[1])
          );
        case "posted":
          return (
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Jobs</h1>
        <p className="text-muted-foreground">
          Browse and bid on available delivery opportunities
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:w-2/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="uptown">Uptown</SelectItem>
              <SelectItem value="westside">Westside</SelectItem>
              <SelectItem value="eastside">Eastside</SelectItem>
              <SelectItem value="northside">Northside</SelectItem>
              <SelectItem value="southside">Southside</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
              <SelectItem value="distance">Distance (Nearest)</SelectItem>
              <SelectItem value="earnings">Earnings (Highest)</SelectItem>
              <SelectItem value="posted">Recently Posted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Available Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{job.storeName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>Pickup: {job.storeLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>Delivery: {job.customerLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {job.items} items ({job.weight})
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {job.distance}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>Est. ${job.estimatedEarning}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            Deadline:{" "}
                            {new Date(job.deadline).toLocaleTimeString()}
                          </span>
                        </div>
                        <Button
                          className="mt-2"
                          onClick={() =>
                            router.push(`/delivery/jobs/${job.id}`)
                          }
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">No jobs found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading jobs...</p>
                </div>
              ) : filteredJobs.filter(
                  (job) => Number.parseFloat(job.distance) < 3
                ).length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs
                    .filter((job) => Number.parseFloat(job.distance) < 3)
                    .map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{job.storeName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Pickup: {job.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Delivery: {job.customerLocation}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            {job.distance}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>Est. ${job.estimatedEarning}</span>
                          </div>
                          <Button
                            className="mt-2"
                            onClick={() =>
                              router.push(`/delivery/jobs/${job.id}`)
                            }
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">No nearby jobs found</p>
                  <p className="text-sm text-muted-foreground">
                    Try expanding your search area
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading jobs...</p>
                </div>
              ) : filteredJobs.filter(
                  (job) =>
                    new Date(job.deadline).getTime() - Date.now() < 3600000 // Less than 1 hour
                ).length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs
                    .filter(
                      (job) =>
                        new Date(job.deadline).getTime() - Date.now() < 3600000
                    )
                    .map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4 border-red-200 bg-red-50 dark:bg-red-950/10"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{job.storeName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Pickup: {job.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Delivery: {job.customerLocation}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          >
                            Urgent
                          </Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-red-500" />
                            <span className="text-red-500 font-medium">
                              Deadline:{" "}
                              {new Date(job.deadline).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>Est. ${job.estimatedEarning}</span>
                          </div>
                          <Button
                            className="mt-2"
                            onClick={() =>
                              router.push(`/delivery/jobs/${job.id}`)
                            }
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">No urgent jobs found</p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for urgent delivery requests
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
