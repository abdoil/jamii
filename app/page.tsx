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
import { Search, ShoppingBag, Truck, Shield } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/header";

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
      <section id="features" className="py-6 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with intuitive
              design to transform logistics.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-background p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">
                  Transparent Marketplace
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Every transaction is verified and recorded on the blockchain,
                ensuring complete transparency and trust.
              </p>
            </div>

            <div className="bg-background p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">
                  Smart Delivery Network
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Our competitive bidding system connects you with the most
                efficient delivery partners for your needs.
              </p>
            </div>

            <div className="bg-background p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">
                  Secure Smart Contracts
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Hedera-powered smart contracts protect your payments with
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

      <footer className="py-12 bg-muted/30 border-t">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Image
                src="/placeholder.svg?height=40&width=180"
                alt="Jamii"
                width={180}
                height={40}
                className="mb-4"
              />
              <p className="text-muted-foreground">
                Transforming supply chains with blockchain technology for a more
                transparent, efficient future.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Business</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Business Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/store-signup"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Become a Partner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <p className="text-muted-foreground">
                info@jamii.online
                <br />
                +254 712 345 678
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Jamii. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
