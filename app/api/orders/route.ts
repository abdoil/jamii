import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { nextAuth } from "@/auth";
import { OrderStatus, Product } from "@/lib/zustand-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let ordersQuery;

    // Different queries based on role
    if (role === "admin") {
      // Admin can see all orders
      ordersQuery = query(collection(db, "orders"));
    } else if (role === "delivery") {
      // Delivery agents can see:
      // 1. Orders assigned to them (confirmed, in-transit, delivered)
      // 2. All pending orders (for bidding)
      ordersQuery = query(
        collection(db, "orders"),
        where("status", "in", [
          "pending",
          "confirmed",
          "in-transit",
          "delivered",
        ])
      );
    } else {
      // Customers can only see their own orders
      ordersQuery = query(
        collection(db, "orders"),
        where("customerId", "==", userId)
      );
    }

    const querySnapshot = await getDocs(ordersQuery);
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await nextAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { products, deliveryAddress } = body;

    // Calculate total amount
    const totalAmount = products.reduce(
      (sum: number, product: Product) => sum + product.price,
      0
    );

    // Generate a unique transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const orderData = {
      customerId: session.user.id,
      products,
      totalAmount,
      status: "pending" as OrderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddress,
      transactions: {
        orderPlaced: {
          amount: totalAmount,
          timestamp: new Date().toISOString(),
          transactionId,
        },
      },
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);
    const order = { id: orderRef.id, ...orderData };

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
