import { NextResponse } from "next/server"
import type { DeliveryBid } from "@/lib/zustand-store"

// Mock bids data
const bids: DeliveryBid[] = [
  {
    id: "1",
    orderId: "2",
    deliveryAgentId: "3",
    amount: 5.0,
    estimatedDeliveryTime: "2023-05-15T14:00:00Z",
    status: "pending",
  },
  {
    id: "2",
    orderId: "2",
    deliveryAgentId: "4",
    amount: 6.5,
    estimatedDeliveryTime: "2023-05-15T13:30:00Z",
    status: "pending",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("orderId")
  const deliveryAgentId = searchParams.get("deliveryAgentId")

  let filteredBids = bids

  // Filter bids based on query parameters
  if (orderId) {
    filteredBids = filteredBids.filter((bid) => bid.orderId === orderId)
  }

  if (deliveryAgentId) {
    filteredBids = filteredBids.filter((bid) => bid.deliveryAgentId === deliveryAgentId)
  }

  return NextResponse.json(filteredBids)
}

export async function POST(request: Request) {
  try {
    const bidData = await request.json()

    // In a real application, you would validate the data and save it to a database
    // For this mock implementation, we'll create a mock bid with an ID

    const newBid = {
      ...bidData,
      id: `bid-${Date.now()}`,
      status: "pending",
    }

    return NextResponse.json(newBid, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

