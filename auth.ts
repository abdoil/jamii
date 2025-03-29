import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { createHederaAccount, encryptPrivateKey } from "@/lib/hedera";

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
        token.name = user.name;
        token.hederaAccountId = user.hederaAccountId;
        token.hederaPublicKey = user.hederaPublicKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.hederaAccountId = token.hederaAccountId as string;
        session.user.hederaPublicKey = token.hederaPublicKey as string;
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
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          let userCredential;

          // Check if this is a new account creation
          if (
            credentials.role &&
            credentials.name &&
            ["admin", "delivery"].includes(credentials.role as string)
          ) {
            // Create new user
            userCredential = await createUserWithEmailAndPassword(
              auth,
              credentials.email as string,
              credentials.password as string
            );

            // Create Hedera account for admin/delivery roles
            const hederaAccount = await createHederaAccount();
            console.log("Created Hedera account:", hederaAccount); // Debug log

            // Store user data in Firestore with Hedera info
            await setDoc(doc(db, "users", userCredential.user.uid), {
              name: credentials.name || "",
              email: credentials.email,
              role: credentials.role,
              hederaAccountId: hederaAccount.accountId,
              hederaPublicKey: hederaAccount.publicKey,
              hederaPrivateKey: encryptPrivateKey(hederaAccount.privateKey),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            userCredential = await signInWithEmailAndPassword(
              auth,
              credentials.email as string,
              credentials.password as string
            );
          }

          const user = userCredential.user;

          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          if (!userData) {
            throw new Error("User data not found");
          }

          // Return all necessary user data including Hedera information
          return {
            id: user.uid,
            email: user.email || "",
            role: (userData.role as UserRole) || "user",
            hederaAccountId: userData.hederaAccountId,
            hederaPublicKey: userData.hederaPublicKey,
            name: userData.name || "",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          if (error instanceof Error && error.message.includes("Hedera")) {
            throw new Error("Failed to create Hedera account");
          }
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
    hederaAccountId?: string;
    hederaPublicKey?: string;
    name?: string | null;
  }

  interface Session {
    user: User & {
      role: UserRole;
      id: string;
      name: string;
      hederaAccountId: string;
      hederaPublicKey: string;
    };
  }
}
