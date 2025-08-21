// File: app/components/Navbar.tsx
"use client";
// Remove useState, useEffect, and your custom fetch
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  // Use the useSession hook provided by next-auth
  // session will contain user info (name, email, id, role etc.) if authenticated
  // status can be 'loading', 'authenticated', 'unauthenticated'
  const { data: session, status } = useSession();

  const pathname = usePathname(); // Get the current path

  // console.log('Navbar Rendering with useSession. Status:', status, 'Session:', session); // Keep for debugging if needed

  const isUserLoggedIn = status === "authenticated";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const isHistoryPage = pathname === "/history";
  const isDashBoardPage = pathname === "/dashboard";
  // const isAuthPage = isLoginPage || isRegisterPage; // isAuthPage variable is not strictly needed

  // Show a loading state or basic navbar while session status is loading

  return (
    <nav
      style={
        pathname === "/"
          ? {
              background: `linear-gradient(to bottom, rgba(0, 0, 0) 0%,rgba(0, 0, 0) 0%,rgba(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)`,
              position: "absolute",
            }
          : {}
      }
      className=" bg-black  p-4 static top-0 left-0 w-screen z-[1] h-[80px] flex items-center"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Always show the site title linking to Home */}
        <Link
          href="/"
          className="text-xl font-extrabold hover:underline text-white"
        >
          <span className="relative bottom-0.5">🏎️ </span>VROOMIFY
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center">
          {/* Always show Home */}
          {/* {pathname !== "/" && (
            <Link href="/" className="mx-2 hover:underline">
              HOME
            </Link>
          )} */}
          {isUserLoggedIn ? (
            // --- Links for Logged-in Users (using session data) ---
            <>
            
              {/* Hide login/register links when logged in */}
              {!isHistoryPage && !isDashBoardPage ? (
                <Link
                  href="/history"
                  className="mx-2 text-sm border border-white  px-6 py-1 font-light-bold text-white font-bold cursor-pointer"
                >
                  BOOKINGS
                </Link>
              ): (
                <Link
                  href="/"
                  className="mx-2 text-sm border border-white px-6 py-1 font-light-bold text-white font-bold cursor-pointer"
                >
                  HOME
                </Link>
              )}
              {/* Show user role from session data */}
              
              {/* Access user role from session.user (set in callbacks) */}
              {/* Assuming session.user has a role */}
              {/* Show user name/email from session data */}
              {session?.user?.email && (
          
                <div className="relative group p-2 flex justify-center">
                <div className="text-sm text-black font-extrabold bg-white cursor-pointer rounded-full w-7 h-7 flex items-center justify-center">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              
                <button
                  onClick={() => signOut()}
                  className="hidden group-hover:flex absolute top-[100%] text-nowrap cursor-pointer left-1/2 -translate-x-1/2 text-black bg-white underline text-xs font-extrabold px-3 py-1.5 border border-gray-200"
                >
                  Sign Out
                </button>
              </div>
              
              
              )}{" "}
              {/* Assuming session.user has email */}
              {/* Use next-auth's signOut function - it clears the cookie and updates session state */}
              
            </>
          ) : (
            // --- Links for Logged-out Users ---
            <>
              {/* Show Login link only if NOT on the login page */}
              {!isLoginPage && !isRegisterPage && (
                // Link to your login page
                <Link
                  href="/login"
                  className="mx-2 rounded-none bg-white px-6 py-1.5 text-sm font-light-bold text-black font-bold"
                >
                  LOGIN
                </Link>
                // If you wanted to use signIn for a provider button directly:
                // <button onClick={() => signIn('credentials')} className="mx-2 hover:underline">Login</button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
