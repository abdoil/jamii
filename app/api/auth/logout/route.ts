import { NextResponse } from "next/server";
import { signOut } from "next-auth/react";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
