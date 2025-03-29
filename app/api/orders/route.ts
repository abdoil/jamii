import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
      // Delivery agents can see orders assigned to them
      ordersQuery = query(
        collection(db, "orders"),
        where("deliveryAgentId", "==", userId)
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
