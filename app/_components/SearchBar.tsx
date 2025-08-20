'use client';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  onPageReset: () => void; // ADD THIS PROP
}

export default function SearchBar({ onSearch, onPageReset }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
    onPageReset(); // CALL THE RESET FUNCTION
  };

  return (
    <form onSubmit={handleSubmit} className="mr-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search cars..."
        className="border p-2 border-gray-300 rounded-none w-md "
      />
      <button type="submit" className="bg-black text-white p-2 ml-2 w-36 rounded-none">
        Search
      </button>
    </form>
  );
}