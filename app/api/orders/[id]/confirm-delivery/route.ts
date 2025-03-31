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

    const { deliveryCode } = await request.json();

    // Get the order
    const orderRef = doc(db, "orders", params.id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Verify delivery code
    if (orderData.deliveryCode !== deliveryCode) {
      return NextResponse.json(
        { error: "Invalid delivery code" },
        { status: 400 }
      );
    }

    // Generate a unique transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Update order status and record transaction
    await updateDoc(orderRef, {
      status: "delivered",
      updatedAt: new Date().toISOString(),
      transactions: {
        ...orderData.transactions,
        deliveryConfirmed: {
          amount: orderData.transactions.bidPlaced.amount,
          timestamp: new Date().toISOString(),
          transactionId,
          deliveryAgentId: orderData.deliveryAgentId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return NextResponse.json(
      { error: "Failed to confirm delivery" },
      { status: 500 }
    );
  }
}
