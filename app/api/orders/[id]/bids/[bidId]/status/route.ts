import { NextResponse } from "next/server";
import { nextAuth } from "@/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(
  request: Request,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await nextAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const bidRef = doc(db, "bids", params.bidId);
    await updateDoc(bidRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    // If bid is accepted, update the order status and delivery agent
    if (status === "accepted") {
      const orderRef = doc(db, "orders", params.id);
      await updateDoc(orderRef, {
        status: "confirmed",
        deliveryAgentId: session.user.id,
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ message: "Bid status updated successfully" });
  } catch (error) {
    console.error("Error updating bid status:", error);
    return NextResponse.json(
      { error: "Failed to update bid status" },
      { status: 500 }
    );
  }
}
