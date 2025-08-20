import Link from 'next/link';
import { Car } from '../_lib/types';

interface CarCardProps {
    car: Car;
    isDashBoardPage: boolean;
    onEditClick?: (car: Car) => void;
    onDeleteClick?: (car: Car) => void;
}

export default function CarCard({ car, isDashBoardPage, onEditClick, onDeleteClick }: CarCardProps) {
  return (
    <div className="border relative rounded-xl shadow-gray-200 shadow-md border-gray-200  flex justify-between items-center overflow-hidden h-52 py-4 px-5">
      {/* Updated section to display the car image */}
      <div className='h-full w-56 mr-5'>
        <img
          src={car.imageUrl || 'https://res.cloudinary.com/dwpldlqbv/image/upload/v1755585552/zdjebzcgakzcgpo2uhwj.jpg'} // Use the imageUrl from the database
          alt={`${car.make} ${car.model}`}
          className="object-cover h-full w-full rounded-md"
        />
      </div>

      <div className=' w-full flex flex-col justify-start h-full pt-2'>
         <h3 className="text-3xl font-extrabold">{car.make} {car.model}</h3>
         <p>Year: {car.year}</p>
         <p>Type: {car.carType}</p>
         <p>Transmission: {car.transmission}</p>
      </div>

      <div className='flex flex-col justify-center items-center mr-2'>
        <p className='mt-1.5 font-extrabold text-black text-3xl mb-3'>${car.price}/day</p>

        {!isDashBoardPage ? (
          <Link href={`/cars/${car._id}`} className="text-white bg-black text-nowrap px-5 py-2 hover:bg-gray-700 transition-colors">View Details</Link> 
        ) : (
          <div className='flex gap-2'>
            <button
              onClick={() => onEditClick && onEditClick(car)}
              className="text-white bg-black text-nowrap px-5 py-2 hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteClick && onDeleteClick(car)}
              className="text-white bg-red-500 text-nowrap px-5 py-2 hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}