import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { nextAuth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching order with ID:", params.id); // Debug log

    // Get the session to check authentication
    const session = await nextAuth();
    if (!session) {
      console.log("No session found"); // Debug log
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", session.user); // Debug log

    // Get the order document
    const orderRef = doc(db, "orders", params.id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.log("Order not found in Firestore"); // Debug log
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data();
    console.log("Order data:", orderData); // Debug log

    // Check authorization
    // Admins can see all orders
    // Users can only see their own orders
    // Delivery agents can see orders they can bid on or are assigned to
    if (
      session.user.role === "admin" ||
      orderData.customerId === session.user.id ||
      (session.user.role === "delivery" &&
        (orderData.status === "pending" ||
          orderData.deliveryAgentId === session.user.id))
    ) {
      // Return the order data with its ID
      return NextResponse.json({
        id: orderSnap.id,
        ...orderData,
      });
    }

    console.log("User not authorized to view this order"); // Debug log
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
