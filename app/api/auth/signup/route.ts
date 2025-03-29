import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createHederaAccount, encryptPrivateKey } from "@/lib/hedera";

export async function POST(request: Request) {
  try {
    const { email, password, role, name } = await request.json();

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["user", "admin", "delivery"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Base user data without undefined values
    let userData: Record<string, any> = {
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add name only if it exists
    if (name) {
      userData.name = name;
    }

    // Create Hedera account for delivery agents and admins
    if (role === "delivery" || role === "admin") {
      try {
        const hederaAccount = await createHederaAccount();
        userData = {
          ...userData,
          hederaAccountId: hederaAccount.accountId,
          hederaPublicKey: hederaAccount.publicKey,
          hederaPrivateKey: encryptPrivateKey(hederaAccount.privateKey),
        };
      } catch (error) {
        console.error("Failed to create Hedera account:", error);
        // Continue without Hedera account but log the error
      }
    }

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), userData);

    return NextResponse.json({
      message: "Account created successfully",
      userId: user.uid,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { error: "This email is already registered. Please sign in instead." },
        { status: 400 }
      );
    } else if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password should be at least 6 characters long." },
        { status: 400 }
      );
    } else if (error.code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    } else if (error.code === "invalid-argument") {
      return NextResponse.json(
        { error: "Invalid data format. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 }
    );
  }
}
