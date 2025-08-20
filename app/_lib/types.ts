//app/_lib/types.ts
export interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrl: string | null;
  mileage: number;
  carType: string;
  transmission: string;
}

export interface Booking {
  _id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  car?: Car;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}