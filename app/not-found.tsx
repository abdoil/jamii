"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Home, Package, Truck } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Set a timeout to redirect after 3 seconds
    const timeout = setTimeout(() => {
      if (!user) {
        router.push("/");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "delivery") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/shop");
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [user, router]);

  const getRedirectButton = () => {
    if (!user) {
      return (
        <Button onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Go to Home
        </Button>
      );
    }

    if (user.role === "admin") {
      return (
        <Button onClick={() => router.push("/admin/dashboard")}>
          <Package className="mr-2 h-4 w-4" />
          Go to Admin Dashboard
        </Button>
      );
    }

    if (user.role === "delivery") {
      return (
        <Button onClick={() => router.push("/delivery/dashboard")}>
          <Truck className="mr-2 h-4 w-4" />
          Go to Delivery Dashboard
        </Button>
      );
    }

    return (
      <Button onClick={() => router.push("/shop")}>
        <Package className="mr-2 h-4 w-4" />
        Go to Shop
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">{getRedirectButton()}</div>
        <p className="text-sm text-muted-foreground">
          Redirecting automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
}
