// /api/auth/[...nextAuth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Adapter } from "next-auth/adapters";

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { getMongoClient } from "../../../_lib/mongodb";

import bcrypt from "bcryptjs";

// Get the client promise from the shared management
const clientPromise: Promise<MongoClient> = getMongoClient();

// Explicitly type authOptions with AuthOptions
export const authOptions: AuthOptions = {
  // Provide the client promise to the adapter
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("Authorize failed: Missing credentials");
          throw new Error("Missing credentials");
        }

        // Use the existing clientPromise handled by getMongoClient
        const client = await getMongoClient();
        const db = client.db("cars");
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        // Check if user exists
        if (!user) {
          console.warn(
            `Authorize failed: No user found for email ${credentials.email}`
          );
        }

        // If user is found AND has a password (manual registration/credentials)
        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isMatch) {
            console.log(`Authorize successful for email ${credentials.email}`);
            // Return a plain object with necessary user properties
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role || "user",
            };
          } else {
            console.warn(
              `Authorize failed: Password mismatch for email ${credentials.email}`
            );
            return null;
          }
        }

        // Return null if user not found or user has no password(OAuth)
        console.warn(
          `Authorize failed: User not found or has no password for email ${credentials.email}`
        );
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign-in attempt in callback:", {
        user,
        account,
        profile,
        email,
        credentials,
      });

      // set default role for new OAuth users
      if (
        user &&
        account?.type === "oauth" &&
        typeof user.role === "undefined"
      ) {
        user.role = "user";

        let client;
        try {
          client = await getMongoClient();
          const db = client.db("cars");
          const usersCollection = db.collection("users");
          const mongoUser = await usersCollection.findOne({
            email: user.email,
          });

          // If the user document is found in the database
          if (mongoUser) {
            await usersCollection.updateOne(
              { _id: mongoUser._id },
              { $set: { role: "user" } }
            );
          } else {
            console.warn(
              "Could not find MongoDB user document by email in signIn callback to update role. Email:",
              user.email
            );
          }
        } catch (error) {
          console.error(
            "Error updating user document with default role in signIn callback:",
            error
          );
          return false;
        }
      }

      // --- Logic to deny Credentials login if linked OAuth account exists ---
      // This check should happen BEFORE allowing the Credentials sign-in.
      // We moved this logic into the signIn callback itself for the Credentials type.
      if (account?.type === "credentials") {
        // Check if the credentials exist and if the user is found in the database
        if (credentials === undefined) {
          console.warn(
            "Authorize failed: Missing credentials in signIn callback"
          );
          return false; // Deny sign-in if credentials are missing
        }

        let client;
        try {
          client = await getMongoClient();
          const db = client.db("cars"); 
          const userInDb = await db
            .collection("users")
            .findOne({ email: credentials.email });

          if (userInDb) {
            // Check if this user has any linked accounts in the adapter's 'accounts' collection
            const linkedAccount = await db
              .collection("accounts")
              .findOne({ userId: userInDb._id });

            if (linkedAccount) {
              console.warn(
                `Authorize failed (Credentials in signIn callback): Email ${credentials.email} is linked to an OAuth account.`
              );
              return false; // Deny Credentials login if linked OAuth account exists
            }
            console.log(
              `Credentials login allowed for ${credentials.email}. No linked OAuth account found.`
            );
            return true; // Allow Credentials login if authorize succeeded and no linked account
          }
          console.warn(
            `Authorize failed (Credentials in signIn callback): User not found in adapter DB for email ${credentials.email}`
          );
          return false; // User not found
        } catch (error) {
          console.error(
            "Error during signIn callback database check for Credentials:",
            error
          );
          return false; // Prevent sign-in on error
        }
      }

      // Default return for other providers (like OAuth that passed the initial checks)
      // If this is an OAuth sign-in and no existing user was found with a linked account,
      // the adapter will handle creating the new user and account.
      console.log(`Allowing sign-in for account type: ${account?.type}.`);
      return true; // Allow the sign-in to proceed for OAuth etc.
    },

    // Keep your existing jwt and session callbacks below this
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Cast as any or ensure User type includes role
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Assign id and role from the token to the session user object
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Assign role from token
      }
      return session;
    },
  },
  
  session: {
    strategy: "jwt", // Use JWT session strategy
  },
  secret: process.env.NEXTAUTH_SECRET, // Use NEXTAUTH_SECRET for JWT secret
  debug: process.env.NODE_ENV === "development", // Assuming debug is part of your working code
};

// Define handler using the typed options
const handler = NextAuth(authOptions);

// *** Keep the export syntax from your working "old code" ***
export { handler as GET, handler as POST };
