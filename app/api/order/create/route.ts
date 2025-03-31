import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    console.log("Received order data:", orderData);

    // Validate required fields
    if (
      !orderData.customerId ||
      !orderData.storeId ||
      !orderData.products ||
      !orderData.totalAmount ||
      !orderData.transactionId ||
      !orderData.hashscanUrl ||
      !orderData.blockchainStatus
    ) {
      console.log("Missing required fields:", {
        customerId: !!orderData.customerId,
        storeId: !!orderData.storeId,
        products: !!orderData.products,
        totalAmount: !!orderData.totalAmount,
        transactionId: !!orderData.transactionId,
        hashscanUrl: !!orderData.hashscanUrl,
        blockchainStatus: !!orderData.blockchainStatus,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add timestamp to order data
    const orderWithTimestamp = {
      ...orderData,
      storeName: "Jamii",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Creating order in Firestore with data:", orderWithTimestamp);

    // Create order in Firestore
    const docRef = await addDoc(collection(db, "orders"), orderWithTimestamp);
    console.log("Order created successfully with ID:", docRef.id);

    return NextResponse.json({
      id: docRef.id,
      ...orderWithTimestamp,
    });
  } catch (error: any) {
    console.error("Detailed error creating order:", error);

    // Handle specific Firebase errors
    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "You don't have permission to create this order" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
