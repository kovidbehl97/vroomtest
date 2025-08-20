// app/(routes)/dashboard/AdminDashboardClient.tsx
'use client';

import { useState } from 'react';
import CarList from '../../_components/CarList';
import AdminCarModal from '../../_components/AdminCarModal'; // You will create this component next
import { Car } from '../../_lib/types'; // Import your Car type

// Define types for modal state
type ModalOperation = 'add' | 'edit' | 'delete' | null;

export default function AdminDashboardClient() {
  // State for controlling the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOperation, setModalOperation] = useState<ModalOperation>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null); // To hold data for edit/delete

  // State to trigger data refresh in CarList
  const [refreshKey, setRefreshKey] = useState(0);

  // Handlers to open the modal for different operations
  const handleAddCarClick = () => {
    setModalOperation('add');
    setSelectedCar(null); // No car selected for add
    setIsModalOpen(true);
  };

  const handleEditCarClick = (car: Car) => {
    setModalOperation('edit');
    setSelectedCar(car); // Pass the car data to the modal
    setIsModalOpen(true);
  };

  const handleDeleteCarClick = (car: Car) => {
    setModalOperation('delete');
    setSelectedCar(car); // Pass the car data to the modal
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalOperation(null);
    setSelectedCar(null);
  };

  // Handler to trigger data refresh in CarList after an operation
  const handleOperationSuccess = () => {
    handleCloseModal(); // Close modal first
    setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger useEffect in CarList
  };


  return (
    <div className='relative top-34'>
      <div className=' font-bold text-center relative bottom-24 container mx-auto'>
        <h1 className='text-5xl w-full'>Dashboard</h1>

        {/* Add Car Button */}
        <button
          onClick={handleAddCarClick}
          className='bg-black text-white px-6 py-2 absolute right-0 top-1 text-nowrap cursor-pointer font-normal'
        >
          Add Car
        </button>
      </div>

      {/* Pass handlers down to CarList */}
      {/* Use refreshKey to force re-fetch in CarList */}
      <CarList
        key={refreshKey} // Changing the key forces the component to remount and refetch
        onEditClick={handleEditCarClick}
        onDeleteClick={handleDeleteCarClick}
      />

      {/* Render the Modal */}
      {isModalOpen && (
        <AdminCarModal
          isOpen={isModalOpen}
          operation={modalOperation}
          car={selectedCar}
          onClose={handleCloseModal}
          onSuccess={handleOperationSuccess} // Pass success handler
        />
      )}
    </div>
  );
}