"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  useProductsStore,
  useCartStore,
  type Product,
} from "@/lib/zustand-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MainNav } from "@/components/main-nav";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Header } from "@/components/header";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { products, fetchProducts, isLoading } = useProductsStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (products.length === 0) {
        await fetchProducts();
      }

      const foundProduct = products.find((p) => p.id === params.id);
      if (foundProduct) {
        setProduct(foundProduct);

        // Find related products (same store, different product)
        const related = products
          .filter(
            (p) =>
              p.storeId === foundProduct.storeId && p.id !== foundProduct.id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } else if (!isLoading && products.length > 0) {
        // Product not found and products are loaded
        router.push("/shop");
      }
    };

    loadData();
  }, [params.id, products, fetchProducts, isLoading, router]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8">
          <div className="flex h-[60vh] items-center justify-center">
            <p>Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8">
          <div className="flex h-[60vh] flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The requested product could not be found
            </p>
            <Button asChild>
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link
              href="/shop"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <Star className="h-4 w-4 fill-current text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">(4.0)</span>
                </div>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </p>
                <p className="mt-2">
                  {product.stock > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      In Stock: {product.stock}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </p>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={product.stock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-medium">
                          ${relatedProduct.price.toFixed(2)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/shop/${relatedProduct.id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
