"use client"

import { useState } from "react"
import Image from "next/image"
import { useCartStore, type Product } from "@/lib/zustand-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    })
    setQuantity(1)
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-2 text-sm">
          {product.stock > 0 ? (
            <span className="text-green-600">In Stock: {product.stock}</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-2 w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAddToCart} disabled={product.stock === 0} className="ml-2">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

