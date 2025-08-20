"use client";

import { useState, useEffect } from "react";
import { createCar, updateCar, deleteCar } from "../_lib/api";
import { Car } from "../_lib/types";

interface AdminCarModalProps {
  isOpen: boolean;
  operation: "add" | "edit" | "delete" | null;
  car: Car | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCarModal({
  isOpen,
  operation,
  car,
  onClose,
  onSuccess,
}: AdminCarModalProps) {
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (operation === "edit" && car) {
      setFormData(car);
      setFile(null);
    } else {
      setFormData({});
      setFile(null);
    }
    setError(null);
  }, [operation, car]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: ["year", "price", "mileage"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;

      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      const carDataToSubmit = {
        ...formData,
        imageUrl,
      };

      if (operation === "add") {
        await createCar(carDataToSubmit);
        console.log("Car added successfully");
      } else if (operation === "edit" && car?._id) {
        await updateCar(car._id.toString(), carDataToSubmit);
        console.log(`Car ${car._id} updated successfully`);
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error during ${operation} car operation:`, err.message);
        setError(err.message || `Failed to ${operation} car.`);
      } else {
        console.error(`Error during ${operation} car operation:`, err);
        setError(`Failed to ${operation} car.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (car?._id && operation === "delete") {
      setLoading(true);
      setError(null);
      try {
        await deleteCar(car._id.toString());
        console.log(`Car ${car._id} deleted successfully`);
        onSuccess();
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(`Error during delete car operation:`, err.message);
          setError(err.message || "Failed to delete car.");
        } else {
          console.error(`Error during delete car operation:`, err);
          setError("Failed to delete car.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const modalTitle =
    operation === "add"
      ? "Add New Car"
      : operation === "edit"
      ? `Edit ${car?.make} ${car?.model}`
      : `Delete ${car?.make} ${car?.model}?`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {operation === "delete" ? (
          <div>
            <p>Are you sure you want to delete this car?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Make</label>
              <input
                type="text"
                name="make"
                value={formData.make || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">
                Price Per Day ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Car Type</label>
              <select
                name="carType"
                value={formData.carType || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Type</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Transmission</label>
              <select
                name="transmission"
                value={formData.transmission || ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Car Image</label>
              <input
                type="file"
                name="imageUrl"
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 rounded w-full"
              />
              {file && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {file.name}
                </p>
              )}
              {operation === "edit" && formData.imageUrl && !file && (
                <p className="mt-1 text-sm text-gray-500">
                  Current Image:{" "}
                  <a
                    href={formData.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </a>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? operation === "add"
                    ? "Adding..."
                    : "Saving..."
                  : operation === "add"
                  ? "Add Car"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
