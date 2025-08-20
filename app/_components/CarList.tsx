// app/_components/CarList.tsx
'use client';
import { useState, useEffect } from 'react';
import { fetchCars } from '../_lib/api';
import CarCard from './CarCard';
import SearchBar from './SearchBar';
import Filter from './Filter';
import Pagination from './Pagination';
import { Car } from '../_lib/types';
import { usePathname } from 'next/navigation';

// Define props for the handlers
interface CarListProps {
    onEditClick?: (car: Car) => void;
    onDeleteClick?: (car: Car) => void;
}

// Accept the new props
export default function CarCatalogue({ onEditClick, onDeleteClick }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [carType, setCarType] = useState('');
  const [transmission, setTransmission] = useState('');

  const resetPage = () => {
    setPage(1);
  };

  // This useEffect will now re-run when the 'key' of CarList changes in the parent
  useEffect(() => {
    async function loadCars() {
      try {
        const { cars: fetchedCars, total: totalCount } = await fetchCars({
          search,
          carType,
          transmission,
          page,
          limit,
        });
        console.log('Fetched cars:', fetchedCars, 'Total:', totalCount);
        setCars(fetchedCars);
        setTotal(totalCount);
      } catch (error) {
        console.error('Error fetching cars:', error);
         // Handle error (e.g., set an error state)
      }
    }
    loadCars();
    // Adding refreshKey to dependencies if you manually update it in parent
    // But using the 'key' prop change is usually sufficient to trigger a remount and initial fetch
  }, [search, carType, transmission, page, limit]); // Dependencies for filtering/pagination

  const pathname = usePathname();
  const isDashBoardPage = pathname === "/dashboard";

  return (
    <section className="container mx-auto py-10">
      {/* ... your existing SearchBar and Filter UI ... */}
      <div className="flex mb-6 justify-between items-center shadow-gray-400 shadow-md border border-gray-200 rounded-xl p-5 relative bottom-24 bg-white">
      <SearchBar onSearch={setSearch} onPageReset={resetPage} /> {/* PASS resetPage */}
        <div className='flex'>
          <Filter
            label="Car Type"
            options={['SUV', 'Sedan', 'Hatchback']}
            onChange={setCarType}
            onPageReset={resetPage} // PASS resetPage
          />
          <Filter
            label="Transmission"
            options={['Automatic', 'Manual']}
            onChange={setTransmission}
            onPageReset={resetPage} // PASS resetPage
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 relative bottom-20">
        {cars.length === 0 ? (
            <p className="text-center">No cars found.</p>
        ) : (
            cars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                isDashBoardPage={isDashBoardPage}
                // Pass handlers down to CarCard if on dashboard page
                onEditClick={isDashBoardPage ? onEditClick : undefined}
                onDeleteClick={isDashBoardPage ? onDeleteClick : undefined}
              />
            ))
        )}
      </div>

      {/* ... your existing Pagination UI ... */}
      <Pagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </section>
  );
}