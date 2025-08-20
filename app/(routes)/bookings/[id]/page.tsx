// app/(routes)/bookings/[id]/page.tsx (This is now a Server Component)

import { redirect } from "next/navigation";
// Can still use useParams in Server Component for dynamic segments
import BookingFormClient from '../../../_components/BookingForm'; // Import the new Client Component
import { getServerSession } from "next-auth";

// You might want to fetch car details here on the server too for initial render
// import { connectToDatabase } from '@/lib/mongodb'; // Your DB connection
// import { ObjectId } from 'mongodb';

interface BookingPageProps {
  params: {
    id: string;
  };
}
export default async function BookingPage({params}: BookingPageProps) {
  const session = await getServerSession(); // Get session on the server
  const { id: carId } = params;

  // Basic Authentication Check
  if (!session || !session.user) {
    console.log("No session found, redirecting to login from Server Component");
    redirect("/login"); // *** Perform redirect on the SERVER ***
  }

  // Get car ID from params - useParams() works in Server Components for dynamic segments

  // Ensure id is treated as string

  // --- Optional: Fetch car details on the server ---
  // This is often more performant as it happens before the client renders
  // try {
  //   const client = await connectToDatabase();
  //   const db = client.db('your_db_name');
  //   const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });
  //   if (!car) {
  //      // Handle car not found - redirect or show error
  //      redirect('/cars'); // Example: redirect to cars list
  //   }
  //   const carPrice = car.price;
  //   // Pass carPrice to the Client Component
  // } catch (error) {
  //   console.error("Failed to fetch car details on server:", error);
  //    // Handle server error - display error or redirect
  //    redirect('/error-page');
  // }


  // If authenticated, render the Client Component for the interactive form
  return (
    <BookingFormClient
      carId={carId}
      // Pass any data fetched on the server to the client component here, e.g.:
      // initialCarPrice={carPrice}
      // userId={session.user.id} // Pass the user ID for booking creation
    />
  );
}