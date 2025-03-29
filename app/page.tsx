"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductsStore, type Product } from "@/lib/zustand-store";
import { ProductCard } from "@/components/shop/product-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Truck, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  const { products, isLoading, fetchProducts } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "name-asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
      }

      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <section className="relative pt-16 pb-24 md:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white z-0"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 -z-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm font-medium mb-6">
                  Smart Supply Chain Technology
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Supply Chain, <br />
                  <span className="text-primary">Reimagined</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Connect, trade, and deliver with unprecedented transparency
                  and security on our blockchain-powered platform.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="h-12 px-6 bg-primary hover:bg-primary/80"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6">
                  Learn More
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-muted-foreground">Efficient</span>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute -top-8 -left-8 w-full h-full bg-primary/10 rounded-2xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1551825687-f9de1603ed8b?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Supply Chain Visualization"
                className="relative z-10 w-full h-auto rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg z-20 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Verified by Blockchain</p>
                    <p className="text-xs text-muted-foreground">
                      Immutable and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background z-0"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Supply Chain, <span className="text-primary">Reimagined</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect, trade, and deliver with unprecedented transparency and
              security on our blockchain-powered shopping platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-12 px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center  mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Jamii
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform combines cutting-edge blockchain technology with
              intuitive design to transform how supply chains work.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">
                  Transparent Marketplace
                </h3>
              </div>
              <p className="text-muted-foreground">
                Every transaction is verified and recorded on the blockchain,
                ensuring complete transparency and trust between all parties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">
                  Smart Delivery Network
                </h3>
              </div>
              <p className="text-muted-foreground">
                Our competitive bidding system connects you with the most
                efficient delivery partners for your specific needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">
                  Secure Smart Contracts
                </h3>
              </div>
              <p className="text-muted-foreground">
                Blockchain-powered smart contracts protect your payments with
                automated escrow and verification systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">
                Discover quality items from verified merchants
              </p>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">
                    Price (High to Low)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-background rounded-xl overflow-hidden shadow-sm"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to transform your supply chain?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of businesses and customers already benefiting from
              our platform.
            </p>
            <div className="pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-12 px-8">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
