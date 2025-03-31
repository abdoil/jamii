import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { nextAuth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await nextAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderIds = searchParams.get("orderIds");

    if (!orderIds) {
      return NextResponse.json(
        { error: "Order IDs are required" },
        { status: 400 }
      );
    }

    // Split the comma-separated order IDs
    const orderIdArray = orderIds.split(",");

    // Get all bids for these orders
    const bidsQuery = query(
      collection(db, "bids"),
      where("orderId", "in", orderIdArray)
    );

    const bidsSnapshot = await getDocs(bidsQuery);
    const bids = bidsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}
