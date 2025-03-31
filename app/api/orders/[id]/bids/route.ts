import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { nextAuth } from "@/auth";

export async function GET(
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

    // Check authorization
    if (
      session.user.role === "admin" ||
      orderData.customerId === session.user.id ||
      (session.user.role === "delivery" &&
        (orderData.status === "pending" ||
          orderData.deliveryAgentId === session.user.id))
    ) {
      // Get all bids for this order
      const bidsQuery = query(
        collection(db, "bids"),
        where("orderId", "==", params.id)
      );
      const bidsSnapshot = await getDocs(bidsQuery);
      const bids = bidsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json(bids);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await nextAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, estimatedDeliveryTime, transactionId } =
      await request.json();

    const bidData = {
      orderId: params.id,
      deliveryAgentId: session.user.id,
      amount,
      estimatedDeliveryTime,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactionId,
    };

    // Create the bid
    const bidRef = await addDoc(collection(db, "bids"), bidData);

    // Update the order with the bid transaction
    const orderRef = doc(db, "orders", params.id);
    await updateDoc(orderRef, {
      transactions: {
        bidPlaced: {
          amount,
          timestamp: new Date().toISOString(),
          transactionId,
          deliveryAgentId: session.user.id,
        },
      },
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: bidRef.id, ...bidData });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
