'use client';
import { useState } from 'react';

interface FilterProps {
  label: string;
  options: string[];
  onChange: (value: string) => void;
  onPageReset: () => void; // ADD THIS PROP
}

export default function Filter({
  label,
  options,
  onChange,
  onPageReset, // DESTRUCTURE THE PROP
}: FilterProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
    onPageReset(); // CALL THE RESET FUNCTION
  };

  return (
    <div className="mr-4 relative bottom-3">
      <label className="block mb-1 text-gray-600 text-[14px]">{label}</label>
      <select
        value={value}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded-none text-gray-600"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}