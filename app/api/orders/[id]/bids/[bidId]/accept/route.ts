import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { nextAuth } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string; bidId: string } }
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

    // Check if user is the customer who placed the order
    if (orderData.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the bid to check if it exists and is valid
    const bidRef = doc(db, "bids", params.bidId);
    const bidSnap = await getDoc(bidRef);

    if (!bidSnap.exists()) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    const bidData = bidSnap.data();

    // Check if bid belongs to the order
    if (bidData.orderId !== params.id) {
      return NextResponse.json({ error: "Invalid bid" }, { status: 400 });
    }

    // Check if order is still pending
    if (orderData.status !== "pending") {
      return NextResponse.json(
        { error: "Order is not available for accepting bids" },
        { status: 400 }
      );
    }

    // Generate a random 6-digit delivery code
    const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update order with selected delivery agent and delivery code
    await updateDoc(orderRef, {
      status: "confirmed",
      deliveryAgentId: bidData.deliveryAgentId,
      deliveryFee: bidData.amount,
      deliveryCode,
      updatedAt: serverTimestamp(),
    });

    // Update bid status
    await updateDoc(bidRef, {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });

    // Reject all other bids
    const otherBidsQuery = query(
      collection(db, "bids"),
      where("orderId", "==", params.id)
    );
    const otherBidsSnapshot = await getDocs(otherBidsQuery);

    const rejectPromises = otherBidsSnapshot.docs
      .filter((doc) => doc.id !== params.bidId)
      .map((doc) =>
        updateDoc(doc.ref, {
          status: "rejected",
          updatedAt: serverTimestamp(),
        })
      );

    await Promise.all(rejectPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting bid:", error);
    return NextResponse.json(
      { error: "Failed to accept bid" },
      { status: 500 }
    );
  }
}
