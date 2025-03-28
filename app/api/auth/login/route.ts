import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

// Mock user database
const users = [
  {
    id: "1",
    name: "John Customer",
    email: "customer@example.com",
    password: "password123",
    role: "customer",
  },
  {
    id: "2",
    name: "Alice Store",
    email: "store@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "3",
    name: "Bob Delivery",
    email: "delivery@example.com",
    password: "password123",
    role: "delivery",
  },
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
