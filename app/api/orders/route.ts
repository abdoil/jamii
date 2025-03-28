import { NextResponse } from "next/server"
import type { Order } from "@/lib/zustand-store"

// Mock orders data
const orders: Order[] = [
  {
    id: "1",
    customerId: "1",
    storeId: "1",
    deliveryAgentId: "3",
    products: [
      { productId: "1", quantity: 2 },
      { productId: "2", quantity: 1 },
    ],
    status: "delivered",
    totalAmount: 12.47,
    createdAt: "2023-05-10T14:30:00Z",
    updatedAt: "2023-05-10T18:45:00Z",
    deliveryAddress: "123 Main St, Anytown, USA",
    trackingInfo: {
      location: "Customer address",
      timestamp: "2023-05-10T18:45:00Z",
      status: "Delivered",
    },
  },
  {
    id: "2",
    customerId: "1",
    storeId: "2",
    deliveryAgentId: undefined,
    products: [
      { productId: "3", quantity: 1 },
      { productId: "4", quantity: 2 },
    ],
    status: "pending",
    totalAmount: 18.97,
    createdAt: "2023-05-15T10:15:00Z",
    updatedAt: "2023-05-15T10:15:00Z",
    deliveryAddress: "123 Main St, Anytown, USA",
  },
  {
    id: "3",
    customerId: "1",
    storeId: "1",
    deliveryAgentId: "3",
    products: [
      { productId: "5", quantity: 1 },
      { productId: "7", quantity: 3 },
    ],
    status: "in-transit",
    totalAmount: 16.46,
    createdAt: "2023-05-18T09:20:00Z",
    updatedAt: "2023-05-18T14:10:00Z",
    deliveryAddress: "123 Main St, Anytown, USA",
    trackingInfo: {
      location: "In transit",
      timestamp: "2023-05-18T14:10:00Z",
      status: "Out for delivery",
      estimatedDelivery: "2023-05-18T17:00:00Z",
    },
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")
  const storeId = searchParams.get("storeId")
  const deliveryAgentId = searchParams.get("deliveryAgentId")

  let filteredOrders = orders

  // Filter orders based on query parameters
  if (customerId) {
    filteredOrders = filteredOrders.filter((order) => order.customerId === customerId)
  }

  if (storeId) {
    filteredOrders = filteredOrders.filter((order) => order.storeId === storeId)
  }

  if (deliveryAgentId) {
    filteredOrders = filteredOrders.filter((order) => order.deliveryAgentId === deliveryAgentId)
  }

  return NextResponse.json(filteredOrders)
}

