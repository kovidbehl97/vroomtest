'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchCar } from '../../../_lib/api';
import { Car } from '../../../_lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await fetchCar(id as string);
        setCar(data);
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadCar();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!car) return <p>Car not found</p>;
  
  return (
    <div className="container mx-auto py-10 px-4 text-black min-h-screen relative">
      <h1 className="text-3xl font-bold mb-10 text-center w-full">Car Details</h1>
      <button
        className="bg-black text-white shadow-md px-4 py-2 absolute top-4 left-4"
        onClick={() => router.back()}
      >
        &larr;
      </button>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-8 border border-gray-200 rounded-lg shadow-md p-6">
        
        {/* Car Image */}
        <div className="w-full md:w-1/2">
          <img
            src={car.imageUrl || 'https://res.cloudinary.com/dwpldlqbv/image/upload/v1755585552/zdjebzcgakzcgpo2uhwj.jpg'} // Use imageUrl from database or fallback to placeholder
            alt={`${car.make} ${car.model}`}
            className="rounded-lg object-cover w-full h-64 md:h-80 shadow-sm"
          />
        </div>
    
        {/* Car Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold mb-4">
                {car.make} {car.model}
              </h1>
    
              <ul className="space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold text-black">Year:</span> {car.year}
                </li>
                <li>
                  <span className="font-semibold text-black">Price:</span> ${car.price}/day
                </li>
                <li>
                  <span className="font-semibold text-black">Mileage:</span> {car.mileage} miles
                </li>
                <li>
                  <span className="font-semibold text-black">Type:</span> {car.carType}
                </li>
                <li>
                  <span className="font-semibold text-black">Transmission:</span> {car.transmission}
                </li>
              </ul>
            </div>
          <Link
            href={`/bookings/${car._id}`}
            className="mt-10 w-md mx-auto bg-black text-white flex justify-center font-medium px-6 py-2"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}