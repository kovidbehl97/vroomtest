// app/(routes)/dashboard/page.tsx (Server Component)

import { redirect } from "next/navigation";
import AdminDashboardClient from './AdminDashboardClient'; // Import the Client Component

// *** Import getServerSession and your authOptions ***
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // *** Adjust the import path as necessary ***


export default async function DashboardPage() {
  // *** Correct way to fetch session with your current authOptions export ***
  const session = await getServerSession(authOptions);

  // Authentication and Authorization Check for the Dashboard Page
  if (!session || !session.user || session.user.role !== 'admin') {
    console.log("Dashboard Access Denied: User not authenticated or not admin.");
    // Redirect users who are not authenticated or not admin
    redirect('/'); // Redirect to homepage or a specific unauthorized page
  }

  // If authenticated and is admin, render the Client Component that manages the modal and CarList
  return (
    // No relative top-34 class here, handle layout in the client component or parent layout
    <AdminDashboardClient />
  );
}