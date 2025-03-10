'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBarDemands() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/demands-center?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-[#181818] border border-gray-700 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search for demands, projects, budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-gray-500"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 flex items-center transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="ml-2 font-medium hidden sm:inline">Search</span>
          </button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Popular:</span>
          {['Website Design', 'Logo Design', 'Content Creation', 'Mobile App'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setSearchQuery(term)}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
} 