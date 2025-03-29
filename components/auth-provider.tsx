"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession, signOut, signIn } from "next-auth/react";

type User = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: "user" | "admin" | "delivery";
  hederaAccountId: string;
  hederaPublicKey: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ error?: string } | null>;
  register: (
    userData: Omit<User, "id"> & { password: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<string>;
  isWalletConnected: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const router = useRouter();

  const user = session?.user as User | null;
  const isLoading = status === "loading";

  const login = async (
    email: string,
    password: string
  ): Promise<{ error?: string } | null> => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { error: result.error };
      }

      // If successful, the session will be updated automatically
      return null;
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.message.includes("auth/network-request-failed")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("auth/invalid-credential")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes("auth/too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const register = async (
    userData: Omit<User, "id"> & { password: string }
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast.success("Registration successful");

      router.push("/auth/signin");
    } catch (error: any) {
      toast.error(
        error.message || "Please try again with different credentials"
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Clear any local state
      setIsWalletConnected(false);

      // Redirect to home page
      router.push("/");

      toast.success("Logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const connectWallet = async () => {
    try {
      // Mock Hedera wallet connection
      // In a real implementation, this would use the HashPack SDK
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockWalletAddress = "0.0." + Math.floor(Math.random() * 1000000);
      setIsWalletConnected(true);

      toast.success(`Connected to wallet: ${mockWalletAddress}`);

      return mockWalletAddress;
    } catch (error) {
      toast.error("Wallet connection failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        connectWallet,
        isWalletConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
