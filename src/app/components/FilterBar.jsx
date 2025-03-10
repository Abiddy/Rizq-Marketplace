'use client';

import { useState } from 'react';

export default function FilterBar({ categories, activeCategory, onSelectCategory }) {
  // Handle overflow with horizontal scrolling for mobile
  const [scrollPos, setScrollPos] = useState(0);
  
  // Scroll the filter bar horizontally 
  const scroll = (direction) => {
    const container = document.getElementById('filter-scroll-container');
    if (!container) return;
    
    const scrollAmount = 200; // Pixels to scroll each time
    const newPos = direction === 'left' 
      ? Math.max(scrollPos - scrollAmount, 0)
      : scrollPos + scrollAmount;
    
    container.scrollTo({
      left: newPos,
      behavior: 'smooth'
    });
    
    setScrollPos(newPos);
  };
  
  return (
    <div className="relative mb-6">
      {/* Left scroll button - only show when scrollable and not at beginning */}
      {scrollPos > 0 && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-70 h-8 w-8 flex items-center justify-center rounded-full shadow-lg"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Filter bar with horizontal scrolling */}
      <div 
        id="filter-scroll-container"
        className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 px-1"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === category
                ? 'bg-indigo-600 text-white font-medium'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Right scroll button - only show when there's more to scroll */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-70 h-8 w-8 flex items-center justify-center rounded-full shadow-lg"
        aria-label="Scroll right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Add custom styles to hide scrollbar */}
      <style jsx global>{`
        #filter-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 