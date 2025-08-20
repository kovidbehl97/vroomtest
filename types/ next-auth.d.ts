// next-auth.d.ts
import NextAuth, { DefaultUser } from 'next-auth'; // Import necessary types if used in augmentations

// Extend the built-in User type if needed for role etc.
declare module 'next-auth' {
  interface User extends DefaultUser {
    role: string | undefined; // Ensure consistent modifiers
  }
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string; // Add id to session user
      role: string | undefined; // Ensure consistent modifiers
    };
  }
  interface JWT {
      id?: string;
      role: string | undefined; // Ensure consistent modifiers
  }
}

// Note: You don't need the export statements or any executable code here.
// Just the declare module block(s).