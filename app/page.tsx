"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductsStore, type Product } from "@/lib/zustand-store";
import { ProductCard } from "@/components/shop/product-card";
import { CartDrawer } from "@/components/shop/cart-drawer";
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
import { MainNav } from "@/components/main-nav";
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
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-highlight py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-heading-1 text-primary-foreground">
                Decentralized Supply Chain Platform
              </h1>
              <p className="text-paragraph-1 text-primary-foreground/90">
                A transparent, secure, and efficient way to connect customers,
                stores, and delivery agents using blockchain technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="shadow-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/20 text-white border-white"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative h-[400px] w-[400px]">
                <div className="absolute inset-0 bg-white/10 rounded-full opacity-70 blur-3xl"></div>
                <div className="absolute inset-4 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-heading-4 text-white">Powered by</h3>
                    <p className="text-paragraph-1 mt-2 text-white">
                      Hedera Hashgraph
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-heading-2 mb-4">Platform Features</h2>
            <p className="text-paragraph-1 text-muted-foreground max-w-3xl mx-auto">
              Our platform offers a range of features to make logistics simple,
              transparent, and secure.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-heading-4 mb-2">Shop Securely</h3>
              <p className="text-paragraph-2 text-muted-foreground">
                Browse products and place orders with complete transparency and
                blockchain verification.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-heading-4 mb-2">Delivery Bidding</h3>
              <p className="text-paragraph-2 text-muted-foreground">
                Choose your preferred delivery agent through a competitive
                bidding system.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-heading-4 mb-2">Secure Payments</h3>
              <p className="text-paragraph-2 text-muted-foreground">
                All transactions are secured through Hedera smart contracts with
                escrow protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="flex-1 py-16 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-heading-3 mb-2">Shop Products</h2>
              <p className="text-paragraph-2 text-muted-foreground">
                Browse our selection of quality products
              </p>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
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
                <div key={index} className="card space-y-3 p-4">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-heading-4 mb-2">No products found</h3>
              <p className="text-paragraph-2 text-muted-foreground">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-12 bg-foreground text-background">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Image
                src="/placeholder.svg?height=40&width=180"
                alt="DecentLogistics"
                width={180}
                height={40}
                className="mb-4"
              />
              <p className="text-paragraph-2 text-background/70">
                A decentralized logistics platform powered by blockchain
                technology.
              </p>
            </div>

            <div>
              <h4 className="text-heading-4 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className="text-paragraph-2 text-background/70 hover:text-background"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-paragraph-2 text-background/70 hover:text-background"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-paragraph-2 text-background/70 hover:text-background"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-heading-4 mb-4">Business</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-paragraph-2 text-background/70 hover:text-background"
                  >
                    Business Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/store-signup"
                    className="text-paragraph-2 text-background/70 hover:text-background"
                  >
                    Become a Partner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-heading-4 mb-4">Contact</h4>
              <p className="text-paragraph-2 text-background/70">
                info@jamii.online
                <br />
                +254 712 345 678
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-background/20 text-center">
            <p className="text-paragraph-2 text-background/50">
              &copy; {new Date().getFullYear()} Jamii. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
