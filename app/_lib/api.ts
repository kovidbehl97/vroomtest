// file:/app/_lib/api.ts
import { Car, Booking } from "./types";
import { getSession } from "next-auth/react";

// Fetch all cars with query parameters
export async function fetchCars(params: {
  search?: string;
  carType?: string;
  transmission?: string;
  page?: number;
  limit?: number;
}): Promise<{ cars: Car[]; total: number }> {
  try {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    const res = await fetch(`/api/cars?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch cars");
    }
    return res.json() as Promise<{ cars: Car[]; total: number }>;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch cars");
    }
    throw new Error("An unknown error occurred while fetching cars");
  }
}

// Fetch a single car by ID
export async function fetchCar(id: string) {
  try {
    const res = await fetch(`/api/cars/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch car");
    }
    return res.json() as Promise<Car>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch car");
  }
}

// Create a booking
export async function createBooking(data: {
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, userId: session.user.id }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create booking");
    }
    return res.json() as Promise<Booking>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create booking");
  }
}

// Fetch booking history
export async function fetchBookingHistory() {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  try {
    const res = await fetch("/api/bookings/history", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch booking history");
    }
    return res.json() as Promise<Booking[]>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch booking history");
  }
}

// Create a car (admin only)
export async function createCar(data: Partial<Car>) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  try {
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create car");
    }
    return res.json() as Promise<Car>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create car");
  }
}

// Update a car (admin only)
export async function updateCar(id: string, data: Partial<Car>) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  try {
    const res = await fetch(`/api/cars/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update car");
    }
    return res.json() as Promise<Car>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update car");
  }
}

// Delete a car (admin only)
export async function deleteCar(id: string) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  try {
    const res = await fetch(`/api/cars/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete car");
    }
    return res.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete car");
  }
}

// Register a user
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to register");
    }
    return res.json() as Promise<{
      _id: string;
      email: string;
      name: string;
      role: string;
    }>;
  } catch (error: any) {
    throw new Error(error.message || "Failed to register");
  }
}
