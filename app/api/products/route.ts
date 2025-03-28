import { NextResponse } from "next/server"
import type { Product } from "@/lib/zustand-store"

// Mock products data
const products: Product[] = [
  {
    id: "1",
    name: "Organic Apples",
    description: "Fresh organic apples from local farms",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    stock: 50,
    storeId: "1",
  },
  {
    id: "2",
    name: "Whole Grain Bread",
    description: "Freshly baked whole grain bread",
    price: 4.49,
    image: "/placeholder.svg?height=200&width=200",
    stock: 30,
    storeId: "1",
  },
  {
    id: "3",
    name: "Free-Range Eggs",
    description: "Dozen free-range eggs from local farms",
    price: 5.99,
    image: "/placeholder.svg?height=200&width=200",
    stock: 40,
    storeId: "2",
  },
  {
    id: "4",
    name: "Organic Milk",
    description: "1 gallon of organic whole milk",
    price: 6.49,
    image: "/placeholder.svg?height=200&width=200",
    stock: 25,
    storeId: "2",
  },
  {
    id: "5",
    name: "Grass-Fed Ground Beef",
    description: "1 lb of grass-fed ground beef",
    price: 8.99,
    image: "/placeholder.svg?height=200&width=200",
    stock: 20,
    storeId: "1",
  },
  {
    id: "6",
    name: "Wild-Caught Salmon",
    description: "8 oz wild-caught salmon fillet",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    stock: 15,
    storeId: "2",
  },
  {
    id: "7",
    name: "Organic Avocados",
    description: "Ripe organic avocados",
    price: 2.49,
    image: "/placeholder.svg?height=200&width=200",
    stock: 35,
    storeId: "1",
  },
  {
    id: "8",
    name: "Local Honey",
    description: "16 oz jar of local raw honey",
    price: 9.99,
    image: "/placeholder.svg?height=200&width=200",
    stock: 18,
    storeId: "2",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get("storeId")

  // Filter products by store if storeId is provided
  const filteredProducts = storeId ? products.filter((product) => product.storeId === storeId) : products

  return NextResponse.json(filteredProducts)
}

