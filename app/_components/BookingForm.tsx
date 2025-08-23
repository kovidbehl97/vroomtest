"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StripeCheckoutButton from "./StripeCheckoutButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormClientProps {
  carId: string;
}

export default function BookingFormClient({ carId }: BookingFormClientProps) {
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<string>("Square One Mall");
  const [error, setError] = useState<string>("");
  const [carPrice, setCarPrice] = useState<string>("");
  const router = useRouter();

  // Fetch car price
  useEffect(() => {
    const fetchCarPrice = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (!res.ok) throw new Error("Failed to fetch car details");
        const data = await res.json();
        setCarPrice(data.price);
      } catch (err) {
        console.error("Failed to fetch car details:", err);
        setError("Failed to fetch car details");
      }
    };
    if (carId) fetchCarPrice();
  }, [carId]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pickupDate || !dropoffDate || !pickupTime || !dropoffTime || !location || !carId) {
      setError("Please fill in all required fields.");
      return;
    }
  };

  const isFormValid = !!(pickupDate && dropoffDate && pickupTime && dropoffTime && location && carPrice);

  // Helpers to format time
  const formatTime = (date: Date | null) => date ? date.toTimeString().slice(0, 5) : "";

  return (
    <div className="container mx-auto py-10 relative">
      <h1 className="text-3xl font-bold mb-6 text-center w-full">Book Your Car</h1>

      <button
        className="bg-black text-white shadow-md px-4 py-2 absolute top-4 left-4"
        onClick={() => router.back()}
      >
        &larr;
      </button>

      <div className="w-full flex rounded shadow-md border border-gray-100">
        <div className="w-full bg-[url(/bookings.jpg)] bg-cover bg-center bg-no-repeat rounded-l"></div>

        <div className="w-full">
          <div className="max-w-lg mx-auto p-6 rounded-r bg-white">
            <form onSubmit={handleBookingSubmit}>
              {/* Date pickers */}
              <div className="flex gap-4">
                <div className="mb-4 w-full">
                  <label className="block mb-1 text-gray-700">Pick-up Date</label>
                  <DatePicker
                    selected={pickupDate}
                    onChange={(date) => setPickupDate(date)}
                    className="border p-2 rounded w-full"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div className="mb-4 w-full">
                  <label className="block mb-1 text-gray-700">Drop-off Date</label>
                  <DatePicker
                    selected={dropoffDate}
                    onChange={(date) => setDropoffDate(date)}
                    className="border p-2 rounded w-full"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </div>

              {/* Time pickers */}
              <div className="flex gap-4">
                <div className="mb-4 w-full">
                  <label className="block mb-1 text-gray-700">Pick-up Time</label>
                  <DatePicker
                    selected={pickupTime}
                    onChange={(date) => setPickupTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4 w-full">
                  <label className="block mb-1 text-gray-700">Drop-off Time</label>
                  <DatePicker
                    selected={dropoffTime}
                    onChange={(date) => setDropoffTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block mb-1 text-gray-700">Pick-up Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="Square One Mall">Square One Mall</option>
                  <option value="Pearson International Airport (YYZ)">Pearson International Airport (YYZ)</option>
                  <option value="Union Station">Union Station</option>
                </select>
              </div>

              {/* Car Price */}
              <div className="mb-4">
                <label className="block mb-1 text-gray-700">Car Price</label>
                <input
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
                pickupDate={pickupDate?.toISOString().split("T")[0] || ""}
                dropoffDate={dropoffDate?.toISOString().split("T")[0] || ""}
                pickupTime={formatTime(pickupTime)}
                dropoffTime={formatTime(dropoffTime)}
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
