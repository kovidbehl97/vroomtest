// app/(routes)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react"; // Import signIn
import GoogleSignInButton from "../../_components/GoogleSignInButton"; // Assuming this component exists and handles the signIn('google') call internally or via a prop

export default function LoginPage() {
  // Renamed to LoginPage
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Use the signIn function with the 'credentials' provider
    const result = await signIn("credentials", {
      redirect: false, // Prevent NextAuth.js from redirecting automatically
      email,
      password,
      // callbackUrl: '/' // Optional: specify where to redirect after successful login
    });

    if (result?.error) {
      // Check for result and result.error
      setError(result.error); // NextAuth.js provides an error message here
    } else {
      // Login successful, redirect to the homepage or callbackUrl
      router.push("/"); // Redirect to homepage on success
      // or router.push(result?.url || '/'); // Redirect to callbackUrl if available
    }
  };

  // Assuming GoogleSignInButton component handles its own click and calls signIn('google')
  // If not, you'd have an onClick handler here calling signIn('google')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl underline font-black text-black mb-6 text-center">
        Log In
      </h1>
      {/* Added text-center */}
      <div className="max-w-md mx-auto p-6 shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className=" bg-white ">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-black font-bold text-white px-4 h-[47px] cursor-pointer "
          >
            {/* Made button full width */}
            Log In
          </button>
        </form>

        {/* Centered Google button area */}
        <p className="my-4 w-full text-center">OR</p>
        {/* GoogleSignInButton component should handle its own onClick calling signIn('google') */}
        <GoogleSignInButton />
      </div>
      <p className="mt-4 text-center">
        Don&apos;t have an account?
        <Link
          href="/register"
          className="text-gray-700 font-black hover:underline ml-1"
        >
          Sign Up Here
        </Link>
        {/* Corrected link to /signup */}
      </p>
    </div>
  );
}
