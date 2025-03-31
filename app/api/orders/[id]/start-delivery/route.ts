import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { nextAuth } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await nextAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the order to check authorization
    const orderRef = doc(db, "orders", params.id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Check if user is the assigned delivery agent
    if (orderData.deliveryAgentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if order is in confirmed status
    if (orderData.status !== "confirmed") {
      return NextResponse.json(
        { error: "Order is not ready for delivery" },
        { status: 400 }
      );
    }

    // Update order status to in-transit
    await updateDoc(orderRef, {
      status: "in-transit",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting delivery:", error);
    return NextResponse.json(
      { error: "Failed to start delivery" },
      { status: 500 }
    );
  }
}
