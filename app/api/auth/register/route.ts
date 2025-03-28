import { NextResponse } from "next/server";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    let errorMessage = "Failed to register user";
    let statusCode = 500;

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already registered";
      statusCode = 400;
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
      statusCode = 400;
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak";
      statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
