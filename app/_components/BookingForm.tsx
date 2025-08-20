// app/(routes)/bookings/[id]/BookingFormClient.tsx
"use client";

import { useState, useEffect } from "react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import { useRouter } from "next/navigation";

interface BookingFormClientProps {
  carId: string;
}

export default function BookingFormClient({ carId }: BookingFormClientProps) {
  const [pickupDate, setPickupDate] = useState<string>("");
  const [dropoffDate, setDropoffDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [dropoffTime, setDropoffTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Square One Mall");
  const [error, setError] = useState<string>("");
  const [carPrice, setCarPrice] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchCarPrice = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch car details");
        }
        const data = await res.json();
        setCarPrice(data.price);
      } catch (err) {
        console.error("Failed to fetch car details:", err);
        setError("Failed to fetch car details");
      }
    };

    if (carId) {
      fetchCarPrice();
    }
  }, [carId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !pickupDate ||
      !dropoffDate ||
      !pickupTime ||
      !dropoffTime ||
      !location ||
      !carId
    ) {
      setError("Please fill in all required fields.");
      return;
    }
  };

  const isFormValid = !!(
    pickupDate &&
    dropoffDate &&
    pickupTime &&
    dropoffTime &&
    location &&
    carPrice
  );
  console.log("Stripe key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  return (
    <div className="container mx-auto py-10 relative">
      <h1 className="text-3xl font-bold mb-6 text-center w-full">
        Book Your Car
      </h1>
      <button
        className="bg-black text-white shadow-md px-4 py-2 absolute top-4 left-4"
        onClick={() => router.back()}
      >
        &larr;
      </button>
      <div className="w-full flex rounded shadow-md border border-gray-100 ">
        <div className="w-full bg-[url(/bookings.jpg)] bg-cover bg-center bg-no-repeat rounded-l"></div>
        <div className="w-full ">
          <div className="max-w-lg mx-auto p-6 rounded-r">
            <form onSubmit={handleBookingSubmit} className=" bg-white  ">
              <div className="flex gap-4">
                <div className="mb-4 w-full">
                  <label htmlFor="pickupDate" className="block mb-1 text-gray-700">
                    Pick-up Date
                  </label>
                  <input
                    id="pickupDate"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4 w-full">
                  <label htmlFor="dropoffDate" className="block mb-1 text-gray-700">
                    Drop-off Date
                  </label>
                  <input
                    id="dropoffDate"
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mb-4 w-full">
                  <label htmlFor="pickupTime" className="block mb-1 text-gray-700">
                    Pick-up Time
                  </label>
                  <input
                    id="pickupTime"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4 w-full">
                  <label htmlFor="dropoffTime" className="block mb-1 text-gray-700">
                    Drop-off Time
                  </label>
                  <input
                    id="dropoffTime"
                    type="time"
                    value={dropoffTime}
                    onChange={(e) => setDropoffTime(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="location" className="block mb-1 text-gray-700">
                  Pick-up Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="Square One Mall">Square One Mall</option>
                  <option value="Pearson International Airport (YYZ)">
                    Pearson International Airport (YYZ)
                  </option>
                  <option value="Union Station">Union Station</option>
                </select>
              </div>
              <div className="">
                <label htmlFor="carPrice" className="block mb-1 text-gray-700">
                  Car Price
                </label>
                <input
                  id="carPrice"
                  type="text"
                  value={carPrice ? `$${carPrice}/day` : "Loading..."}
                  readOnly
                  className="border p-2 rounded w-full bg-gray-200"
                />
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </form>

            {isFormValid ? (
              <StripeCheckoutButton
                carId={carId}
                pickupDate={pickupDate}
                dropoffDate={dropoffDate}
                dropoffTime={dropoffTime}
                pickupTime={pickupTime}
                location={location}
              />
            ) : (
              <div className="w-full bg-black font-bold text-white px-4 h-[47px] cursor-not-allowed mt-10 mb-5 flex justify-center items-center">
                Fill all the details 🚫
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}