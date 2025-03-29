"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProviderWrapper>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SessionProviderWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
