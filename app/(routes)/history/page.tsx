// app/(routes)/booking-history/page.tsx (Server Component)

// *** Using getServerSession as requested ***
import { getServerSession } from "next-auth/next";
// *** Adjust the import path to your NextAuth config file ***
// Make sure authOptions is exported from this file:
// export const authOptions = { ... }
import { authOptions } from "../../_lib/auth"; // Adjust the import path to your NextAuth config file

import { redirect } from "next/navigation";
import { getMongoClient } from "../../_lib/mongodb"; // Your MongoDB client utility
import { ObjectId } from 'mongodb'; // Import ObjectId for type safety and potential querying

// Define interfaces for your data (Keep these as they were)
interface Booking {
  _id: ObjectId;
  // *** Assuming userId is stored as a string representation of the user's ObjectId ***
  userId: string;
  carId: string; // Assuming carId is stored as a string representation of the Car ObjectId
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  location: string;
  amount: number; // Assuming amount is a number
  currency: string;
  status: string;
  createdAt: Date;
  sessionId: string;
  // Add other booking fields
}

interface Car {
  _id: ObjectId;
  // Assuming car documents have fields like name, make, model, price, image, etc.
  name: string;
  make: string;
  model: string;
  price: number; // Assuming price is a number
  image: string; // Assuming a single image URL
  // Add other car fields you need
}

interface BookingWithCar extends Booking {
    carDetails?: Car; // Add car details to the booking object
}


export default async function BookingHistoryPage() {
  // *** Fetch session using getServerSession(authOptions) as requested ***
  // NOTE: The recommended App Router approach is `const session = await auth();`
  const session = await getServerSession(authOptions);

  // 1. Authentication Check: Ensure user is logged in
  // We need the user ID to fetch their specific bookings
  if (!session || !session.user || !session.user.id) {
    console.log("Booking History: No session found or user ID missing, redirecting to login");
    redirect("/login"); // Perform redirect
    // Alternatively, you could render a "Please log in" message here
    // return (<div><h1>Your Bookings</h1><p>Please log in to view your bookings.</p></div>);
  }

  const loggedInUserId = session.user.id;
  console.log(`Workspaceing booking history for user ID: ${loggedInUserId}`);

  let client;
  let userBookings: Booking[] = [];
  let cars: Car[] = [];
  const bookingsWithCar: BookingWithCar[] = [];

  try {
      // 2. Connect to the database
      client = await getMongoClient(); // Use your preferred DB connection method
      const db = client.db('cars'); // *** Double-check this is your correct database name for bookings/cars ***

      // 3. Query the 'bookings' collection filtering by the logged-in user's ID
      // *** IMPORTANT: Adjust the query if bookings.userId is stored differently (e.g., as ObjectId) ***
      // If bookings.userId is stored as a string ObjectId (which session.user.id is):
      userBookings = await db.collection<Booking>('bookings').find({
          userId: loggedInUserId // Filter by the logged-in user's ID string
      }).toArray();

       console.log(`Found ${userBookings.length} bookings for user ${loggedInUserId}`);

      // 4. Get unique car IDs from the user's bookings
      const carIds = userBookings.map(booking => booking.carId);
      const uniqueCarIds = [...new Set(carIds)]; // Get unique IDs

      console.log(`Workspaceing details for ${uniqueCarIds.length} unique cars.`);

      // 5. Query the 'cars' collection to get details for these cars
      if (uniqueCarIds.length > 0) {
          // Convert string IDs to MongoDB ObjectIds for the query
          const carObjectIds = uniqueCarIds.map(id => {
              try {
                   // Check if the string is a valid ObjectId format before converting
                   if (ObjectId.isValid(id)) {
                       return new ObjectId(id);
                   } else {
                       console.warn(`Skipping invalid Car ObjectId format: ${id}`);
                       return null; // Skip invalid IDs
                   }
              } catch (e) {
                  console.error(`Error processing Car ObjectId: ${id}`, e); // Added context to error
                  return null; // Skip invalid IDs due to error
              }
          }).filter(id => id !== null) as ObjectId[]; // Filter out any nulls

          if (carObjectIds.length > 0) {
             cars = await db.collection<Car>('cars').find({
                 _id: { $in: carObjectIds } // Find all cars whose _id is in the list of unique car ObjectIds
             }).toArray();
              console.log(`Found ${cars.length} car documents for bookings.`); // Added context
          } else {
               console.warn("No valid car ObjectIds found among user bookings.");
          }
      } else {
           console.log("No car IDs found in user bookings.");
      }


      // 6. Combine booking data with corresponding car details
      const carDetailsMap = new Map<string, Car>();
      cars.forEach(car => carDetailsMap.set(car._id.toString(), car));

      userBookings.forEach(booking => {
          const bookingWithCar: BookingWithCar = { ...booking };
          const carDetails = carDetailsMap.get(booking.carId);
          if (carDetails) {
              bookingWithCar.carDetails = carDetails;
          } else {
              console.warn(`Car details not found in DB for carId: ${booking.carId} referenced in booking ${booking._id}.`); // Added context to warning
               // Optionally add a placeholder or error state if car details are missing
          }
          bookingsWithCar.push(bookingWithCar);
      });

       // Sort bookings by date, most recent first
       bookingsWithCar.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  } catch (error) {
      console.error("Failed to fetch booking history:", error);
      // Handle database fetch errors - display an error message to the user
      return (
          <div className="container mx-auto mt-8">
              <h1 className="text-2xl font-bold">Booking History</h1>
              <p className="text-red-600">Failed to load booking history. Please try again later.</p>
          </div>
      );
  }


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Booking History</h1>

      {bookingsWithCar.length === 0 ? (
          <p className="text-center">You have no booking history yet.</p>
      ) : (
          <div className="max-w-2xl mx-auto">
              {bookingsWithCar.map(booking => (
                  <div key={booking._id.toString()} className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
                      <h2 className="text-xl font-semibold mb-2">
                           {booking.carDetails ? `${booking.carDetails.make} ${booking.carDetails.model}` : `Car ID: ${booking.carId} (Details N/A)`} {/* Added fallback text */}
                      </h2>
                       {booking.carDetails?.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={booking.carDetails.image} alt={`${booking.carDetails.make} ${booking.carDetails.model}`} className="w-full h-40 object-cover rounded-md mb-2" />
                       )}
                       <p><strong>Dates:</strong> {booking.pickupDate} to {booking.dropoffDate}</p>
                       <p><strong>Times:</strong> {booking.pickupTime} to {booking.dropoffTime}</p>
                       <p><strong>Location:</strong> {booking.location}</p>
                       {/* Use optional chaining and check for number type before toFixed */}
                       {typeof booking.amount === 'number' && !isNaN(booking.amount) && (
                            <p><strong>Amount Paid:</strong> ${booking.amount.toFixed(2)} {booking.currency?.toUpperCase()}</p>
                       )}
                       <p><strong>Status:</strong> {booking.status}</p>
                       <p className="text-sm text-gray-500">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}