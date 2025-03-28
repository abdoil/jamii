import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./lib/firebase";

// Check server time synchronization
const checkServerTime = () => {
  const serverTime = new Date();
  const realTime = new Date();
  const timeDiff = Math.abs(serverTime.getTime() - realTime.getTime());

  if (timeDiff > 60000) {
    // More than 1 minute difference
    console.warn(
      `Server time is ${timeDiff / 1000} seconds off from real time`
    );
    console.warn("Please ensure NTP is properly configured and running");
  }
};

export type UserRole = "user" | "admin" | "delivery";

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
    clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

export const {
  handlers,
  auth: nextAuth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role || "user";
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email as string,
            credentials.password as string
          );

          const user = userCredential.user;

          // Get user data from Firestore including role
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          if (!userData) {
            throw new Error("User data not found");
          }

          return {
            id: user.uid,
            email: user.email || "",
            role: (userData.role as UserRole) || "user",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  adapter: FirestoreAdapter(firebaseAdminConfig),
  debug: process.env.NODE_ENV === "development",
});

// Type definitions for role-based access
declare module "next-auth" {
  interface User {
    role?: UserRole;
  }

  interface Session {
    user: User & {
      role?: UserRole;
      id: string;
    };
  }
}
