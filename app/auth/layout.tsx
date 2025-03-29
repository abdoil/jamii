"use client";

import { Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Decorative/Brand Area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />

        {/* Optional pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand/Logo Area */}
          <div className="flex items-center mb-12">
            <Link href="/" className="flex items-center space-x-1">
              {/* <div className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center"> */}
              <Image src="/logo.png" alt="Jamii" width={120} height={120} />
              {/* </div> */}
              <span className="font-bold text-foreground uppercase text-2xl hidden md:block">
                Jamii
              </span>
            </Link>
          </div>

          {/* Main content area */}
          <div className="flex-grow flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Welcome to Jamii
            </h1>
            <p className="text-xl text-foreground/80 max-w-md">
              Secure, transparent, and efficient blockchain-powered marketplace.
            </p>
          </div>

          {/* Testimonial/Quote Area */}
          <div className="mt-auto">
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-2">
              <p className="text-lg text-muted-foreground italic mb-3">
                "Join Jamii and be part of our growing community. Create your
                account and start your journey with us."
              </p>
              <footer className="text-muted-foreground/70">
                <span className="font-medium">— The Jamii Team</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              {/* <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center"> */}
              <Image src="/logo.png" alt="Jamii" width={80} height={80} />
              {/* </div> */}
              {/* <span className="font-bold text-xl text-foreground">Jamii</span> */}
            </Link>
          </div>

          {/* Auth Form */}
          <div className="p-4 lg:p-8 h-full flex items-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
              {children}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Jamii. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    // <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    //   <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
    //     <div className="absolute inset-0 bg-primary" />
    //     <div className="relative z-20 flex items-center text-lg font-medium">
    //       <Link href="/" className="flex items-center space-x-2">
    //         <span className="font-bold text-xl">Jamii</span>
    //       </Link>
    //     </div>
    //     <div className="relative z-20 mt-auto">
    //       <blockquote className="space-y-2">
    //         <p className="text-lg">
    //           "Join Jamii and be part of our growing community. Create your
    //           account and start your journey with us."
    //         </p>
    //       </blockquote>
    //     </div>
    //   </div>
    //   <div className="p-4 lg:p-8 h-full flex items-center">
    //     <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
    //       {children}
    //     </div>
    //   </div>
    // </div>
  );
}
