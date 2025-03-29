import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = params.id;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    // Update order status in Firestore
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}
