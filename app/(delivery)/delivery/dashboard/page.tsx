// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/components/auth-provider";
// import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
// import { DeliveryLayout } from "@/components/delivery/delivery-layout";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import toast from "react-hot-toast";
// import {
//   ArrowUpRight,
//   Clock,
//   DollarSign,
//   Package,
//   Truck,
//   Wallet,
//   Copy,
//   ArrowDownToLine,
//   ArrowUpFromLine,
// } from "lucide-react";

// export default function DeliveryDashboardPage() {
//   const { user } = useAuth();
//   const { orders, fetchOrders, updateOrderStatus } = useOrdersStore();
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       router.push("/auth/signin");
//       return;
//     }

//     if (user.role !== "delivery") {
//       router.push("/");
//       return;
//     }

//     const loadData = async () => {
//       setIsLoading(true);
//       try {
//         await fetchOrders(user.id, "delivery");
//       } catch (error) {
//         console.error("Error loading data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, [user, router, fetchOrders]);

//   const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
//     try {
//       await updateOrderStatus(orderId, status);
//       toast.success(`Order status changed to ${status}`);
//     } catch (error) {
//       toast.error("Failed to update order status");
//     }
//   };

//   // Calculate dashboard stats
//   const activeDeliveries = orders.filter(
//     (order) => order.status === "confirmed" || order.status === "in-transit"
//   ).length;
//   const completedDeliveries = orders.filter(
//     (order) => order.status === "delivered"
//   ).length;
//   const totalEarnings = orders.reduce(
//     (sum, order) => sum + order.totalAmount * 0.1,
//     0
//   ); // Assuming 10% of order value

//   const getStatusBadge = (status: OrderStatus) => {
//     switch (status) {
//       case "pending":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
//           >
//             Pending
//           </Badge>
//         );
//       case "confirmed":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
//           >
//             Confirmed
//           </Badge>
//         );
//       case "in-transit":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
//           >
//             In Transit
//           </Badge>
//         );
//       case "delivered":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//           >
//             Delivered
//           </Badge>
//         );
//       case "cancelled":
//         return (
//           <Badge
//             variant="outline"
//             className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
//           >
//             Cancelled
//           </Badge>
//         );
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">
//           Delivery Dashboard
//         </h1>
//         <p className="text-muted-foreground">
//           Manage your deliveries and track your earnings
//         </p>
//       </div>

//       {/* Wallet Information Card */}
//       <Card className="mt-6">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Wallet className="h-5 w-5" />
//             Hedera Wallet
//           </CardTitle>
//           <CardDescription>
//             Your Hedera account details and HBAR balance
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-6 md:grid-cols-2">
//             {/* Account Details */}
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">
//                   Account ID
//                 </label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <code className="rounded bg-muted px-2 py-1 text-sm">
//                     {user?.hederaAccountId || "Not connected"}
//                   </code>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8"
//                     onClick={() => {
//                       if (user?.hederaAccountId) {
//                         navigator.clipboard.writeText(user.hederaAccountId);
//                         toast.success("Account ID copied to clipboard");
//                       }
//                     }}
//                   >
//                     <Copy className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">
//                   Public Key
//                 </label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <code className="rounded bg-muted px-2 py-1 text-sm truncate max-w-[300px]">
//                     {user?.hederaPublicKey || "Not available"}
//                   </code>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8"
//                     onClick={() => {
//                       if (user?.hederaPublicKey) {
//                         navigator.clipboard.writeText(user.hederaPublicKey);
//                         toast.success("Public key copied to clipboard");
//                       }
//                     }}
//                   >
//                     <Copy className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Balance and Actions */}
//             <div className="space-y-4">
//               <div className="rounded-lg border p-4">
//                 <div className="text-sm font-medium text-muted-foreground">
//                   Available Balance
//                 </div>
//                 <div className="mt-2 flex items-baseline gap-2">
//                   <span className="text-3xl font-bold">1.00</span>
//                   <span className="text-muted-foreground">HBAR</span>
//                 </div>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   ≈ $0.07 USD
//                 </p>
//               </div>

//               <div className="flex gap-2">
//                 <Button className="flex-1" variant="outline">
//                   <ArrowDownToLine className="mr-2 h-4 w-4" />
//                   Receive
//                 </Button>
//                 <Button className="flex-1" variant="outline">
//                   <ArrowUpFromLine className="mr-2 h-4 w-4" />
//                   Send
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Earnings
//             </CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${totalEarnings.toFixed(2)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               From {completedDeliveries} completed deliveries
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Active Deliveries
//             </CardTitle>
//             <Truck className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{activeDeliveries}</div>
//             <p className="text-xs text-muted-foreground">In progress</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Available Jobs
//             </CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">5</div>
//             <p className="text-xs text-muted-foreground">Open for bidding</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Completed Deliveries
//             </CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{completedDeliveries}</div>
//             <p className="text-xs text-muted-foreground">All time</p>
//           </CardContent>
//         </Card>
//       </div>

//       <Tabs defaultValue="active" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="active">Active Deliveries</TabsTrigger>
//           <TabsTrigger value="available">Available Jobs</TabsTrigger>
//           <TabsTrigger value="completed">Completed</TabsTrigger>
//         </TabsList>
//         <TabsContent value="active" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Active Deliveries</CardTitle>
//               <CardDescription>
//                 Manage and update your current delivery jobs
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {isLoading ? (
//                 <div className="flex h-40 items-center justify-center">
//                   <p>Loading deliveries...</p>
//                 </div>
//               ) : orders.filter(
//                   (order) =>
//                     order.status === "confirmed" ||
//                     order.status === "in-transit"
//                 ).length > 0 ? (
//                 <div className="space-y-4">
//                   {orders
//                     .filter(
//                       (order) =>
//                         order.status === "confirmed" ||
//                         order.status === "in-transit"
//                     )
//                     .map((order) => (
//                       <div key={order.id} className="rounded-lg border p-4">
//                         <div className="flex flex-wrap items-center justify-between gap-2">
//                           <div>
//                             <h3 className="font-medium">Order #{order.id}</h3>
//                             <p className="text-sm text-muted-foreground">
//                               {new Date(order.createdAt).toLocaleDateString()}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             {getStatusBadge(order.status)}
//                             <span className="font-medium">
//                               ${(order.totalAmount * 0.1).toFixed(2)}
//                             </span>
//                           </div>
//                         </div>
//                         <Separator className="my-2" />
//                         <div className="space-y-1">
//                           <p className="text-sm">
//                             <span className="font-medium">Delivery:</span>{" "}
//                             {order.deliveryAddress}
//                           </p>
//                           <p className="text-sm">
//                             <span className="font-medium">Items:</span>{" "}
//                             {order.products.length} products
//                           </p>
//                         </div>
//                         <div className="mt-4 flex flex-wrap gap-2">
//                           {order.status === "confirmed" && (
//                             <Button
//                               size="sm"
//                               onClick={() =>
//                                 handleUpdateStatus(order.id, "in-transit")
//                               }
//                             >
//                               Start Delivery
//                             </Button>
//                           )}
//                           {order.status === "in-transit" && (
//                             <Button
//                               size="sm"
//                               onClick={() =>
//                                 handleUpdateStatus(order.id, "delivered")
//                               }
//                             >
//                               Mark as Delivered
//                             </Button>
//                           )}
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() =>
//                               router.push(`/delivery/orders/${order.id}`)
//                             }
//                           >
//                             View Details
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               ) : (
//                 <div className="flex h-40 flex-col items-center justify-center">
//                   <p className="text-muted-foreground">No active deliveries</p>
//                   <p className="text-sm text-muted-foreground">
//                     Check available jobs to find delivery opportunities
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="available" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Available Delivery Jobs</CardTitle>
//               <CardDescription>
//                 Browse and bid on available delivery opportunities
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {/* Mock available jobs */}
//                 {[1, 2, 3, 4, 5].map((job) => (
//                   <div key={job} className="rounded-lg border p-4">
//                     <div className="flex flex-wrap items-center justify-between gap-2">
//                       <div>
//                         <h3 className="font-medium">Order #JOB-{1000 + job}</h3>
//                         <p className="text-sm text-muted-foreground">
//                           Posted {job} hour{job !== 1 ? "s" : ""} ago
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge
//                           variant="outline"
//                           className="bg-blue-100 text-blue-800"
//                         >
//                           Open for Bids
//                         </Badge>
//                         <span className="font-medium">Est. $5-8</span>
//                       </div>
//                     </div>
//                     <Separator className="my-2" />
//                     <div className="space-y-1">
//                       <p className="text-sm">
//                         <span className="font-medium">Pickup:</span> Store #
//                         {job}
//                       </p>
//                       <p className="text-sm">
//                         <span className="font-medium">Delivery:</span> Within 5
//                         miles
//                       </p>
//                       <p className="text-sm">
//                         <span className="font-medium">Items:</span> {job + 1}{" "}
//                         products
//                       </p>
//                     </div>
//                     <div className="mt-4">
//                       <Button
//                         size="sm"
//                         onClick={() =>
//                           router.push(`/delivery/jobs/${1000 + job}`)
//                         }
//                       >
//                         Place Bid
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 flex justify-center">
//                 <Button
//                   variant="outline"
//                   onClick={() => router.push("/delivery/jobs")}
//                 >
//                   View All Jobs
//                   <ArrowUpRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="completed" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Completed Deliveries</CardTitle>
//               <CardDescription>
//                 View your delivery history and earnings
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {isLoading ? (
//                 <div className="flex h-40 items-center justify-center">
//                   <p>Loading history...</p>
//                 </div>
//               ) : orders.filter((order) => order.status === "delivered")
//                   .length > 0 ? (
//                 <div className="space-y-4">
//                   {orders
//                     .filter((order) => order.status === "delivered")
//                     .map((order) => (
//                       <div key={order.id} className="rounded-lg border p-4">
//                         <div className="flex flex-wrap items-center justify-between gap-2">
//                           <div>
//                             <h3 className="font-medium">Order #{order.id}</h3>
//                             <p className="text-sm text-muted-foreground">
//                               Completed on{" "}
//                               {new Date(order.updatedAt).toLocaleDateString()}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             {getStatusBadge(order.status)}
//                             <span className="font-medium">
//                               ${(order.totalAmount * 0.1).toFixed(2)}
//                             </span>
//                           </div>
//                         </div>
//                         <Separator className="my-2" />
//                         <div className="space-y-1">
//                           <p className="text-sm">
//                             <span className="font-medium">Delivery:</span>{" "}
//                             {order.deliveryAddress}
//                           </p>
//                           <p className="text-sm">
//                             <span className="font-medium">Items:</span>{" "}
//                             {order.products.length} products
//                           </p>
//                         </div>
//                         <div className="mt-4">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() =>
//                               router.push(`/delivery/orders/${order.id}`)
//                             }
//                           >
//                             View Details
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               ) : (
//                 <div className="flex h-40 flex-col items-center justify-center">
//                   <p className="text-muted-foreground">
//                     No completed deliveries
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     Your delivery history will appear here
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrdersStore, type OrderStatus } from "@/lib/zustand-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Clock,
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
} from "lucide-react";
import { HbarConverter } from "@/components/hbar-converter";

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Delivery Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your deliveries and track your earnings
        </p>
      </div>

      {/* Compact Wallet Card */}
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Hedera Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Balance
                </div>
                <HbarConverter amount={54.7} />
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium">ID:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {user?.hederaAccountId || "Not connected"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (user?.hederaAccountId) {
                        navigator.clipboard.writeText(user.hederaAccountId);
                        toast.success("Account ID copied");
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Load Wallet
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <ArrowDownLeft className="h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {completedDeliveries} completed deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deliveries
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Jobs
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Open for bidding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Deliveries
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="available">Available Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Deliveries</CardTitle>
              <CardDescription>
                Manage and update your current delivery jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading deliveries...</p>
                </div>
              ) : orders.filter(
                  (order) =>
                    order.status === "confirmed" ||
                    order.status === "in-transit"
                ).length > 0 ? (
                <div className="space-y-4">
                  {orders
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
                              ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1">
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
                            size="sm"
                            variant="outline"
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
                  <p className="text-muted-foreground">No active deliveries</p>
                  <p className="text-sm text-muted-foreground">
                    Check available jobs to find delivery opportunities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Delivery Jobs</CardTitle>
              <CardDescription>
                Browse and bid on available delivery opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Enhanced available jobs with bid UI */}
                {[1, 2, 3, 4, 5].map((job) => {
                  const jobId = `JOB-${1000 + job}`;
                  return (
                    <Card key={job} className="overflow-hidden border">
                      <CardHeader className="bg-muted/30 pb-2 pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-primary/10"
                            >
                              #{jobId}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800"
                            >
                              Open for Bids
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Posted {job} hour{job !== 1 ? "s" : ""} ago
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <MapPin className="h-3.5 w-3.5" /> Pickup Location
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Store #{job}, Downtown
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <MapPin className="h-3.5 w-3.5" /> Delivery Area
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Within {job + 2} miles
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <ShoppingBag className="h-3.5 w-3.5" /> Package
                              Details
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job + 1} items, {(job * 0.5 + 1).toFixed(1)} lbs
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 p-2">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              Estimated Earnings:
                            </span>
                            <span className="text-muted-foreground">
                              ${5 + job}-${8 + job}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Current Bids:
                            </span>
                            <Badge variant="secondary">{job + 1}</Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 py-3">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`bid-${jobId}`}
                            className="text-sm font-medium"
                          >
                            Your Bid:
                          </Label>
                          <div className="relative w-24">
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
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
                            onClick={() =>
                              router.push(`/delivery/jobs/${1000 + job}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/delivery/jobs")}
                >
                  View All Jobs
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
              <CardDescription>
                View your delivery history and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p>Loading history...</p>
                </div>
              ) : orders.filter((order) => order.status === "delivered")
                  .length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Completed on{" "}
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            <span className="font-medium">
                              ${(order.totalAmount * 0.1).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1">
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
      </Tabs>
    </div>
  );
}
