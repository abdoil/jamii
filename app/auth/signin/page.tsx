"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { login } = useAuth();

  // Handle redirection based on session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const from = searchParams.get("from");
      if (from) {
        // Check if the user has permission to access the requested route
        const userRole = session.user.role;
        if (from.startsWith("/admin") && userRole !== "admin") {
          router.push("/shop");
        } else if (from.startsWith("/delivery") && userRole !== "delivery") {
          router.push("/shop");
        } else {
          router.push(from);
        }
      } else {
        // Default redirection based on role
        const userRole = session.user.role;
        if (userRole === "admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "delivery") {
          router.push("/delivery/dashboard");
        } else {
          router.push("/shop");
        }
      }
    }
  }, [session, status, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show loading
  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // If already authenticated, don't show the form
  if (status === "authenticated") {
    return null;
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <Button className="w-full mt-4" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          Are you a store owner?{" "}
          <Link
            href="/auth/store-signup"
            className="text-primary hover:underline"
          >
            Create store account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
