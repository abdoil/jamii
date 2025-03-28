"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "delivery" | "user")[];
  redirectTo?: string;
}

export function ProtectedLayout({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      router.push(`/auth/signin?from=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "delivery":
          router.push("/delivery/dashboard");
          break;
        default:
          router.push("/shop");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
