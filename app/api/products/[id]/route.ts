import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productRef = doc(db, "products", params.id);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: productDoc.id,
      ...productDoc.data(),
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
