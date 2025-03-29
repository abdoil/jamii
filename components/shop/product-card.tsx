"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore, type Product } from "@/lib/zustand-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    });
    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Price badge positioned on the image */}
        <div className="absolute bottom-2 left-2 bg-background/90 px-2 py-1 rounded-md shadow-sm">
          <span className="font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <CardContent className="p-3">
        {/* Product name with improved visibility */}
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center border rounded-md h-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-6 rounded-none border-r p-0"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || product.stock === 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-xs">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-6 rounded-none border-l p-0"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock || product.stock === 0}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="sm"
            className="w-full sm:w-auto px-4 h-8 flex items-center justify-center gap-1"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
