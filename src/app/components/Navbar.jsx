import Link from 'next/link';
import { useState } from 'react';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

export default function Navbar({ onPostGig, onPostDemand, onLogOut, user, onToggleMessages }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="border-b border-gray-800 bg-[#111111] py-4">
      <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-medium text-white">
            Rizq Marketplace
          </Link>
        </div>

        {user && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={onPostGig}
                className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
              >
                Post a Gig
              </button>
              <button
                onClick={onPostDemand}
                className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
              >
                Post a Demand
              </button>
              <Link 
                href="/profile" 
                className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
              >
                Profile
              </Link>
              <button
                onClick={onLogOut}
                className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
              >
                Log Out
              </button>
            </div>

            {/* Mobile Icons */}
            <div className="md:hidden flex items-center">
              <button
                onClick={onToggleMessages}
                className="text-white mr-4 hover:text-gray-300"
                aria-label="Messages"
              >
                <ChatBubbleOvalLeftIcon className="w-6 h-6" />
              </button>
              
              <button
                onClick={toggleMenu}
                className="text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {!isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-[#181818] mt-2 py-2 px-6 border-t border-gray-800">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                onPostGig();
                setIsMenuOpen(false);
              }}
              className="text-white text-sm py-2 w-full text-left hover:bg-gray-800 rounded px-2"
            >
              Post a Gig
            </button>
            <button
              onClick={() => {
                onPostDemand();
                setIsMenuOpen(false);
              }}
              className="text-white text-sm py-2 w-full text-left hover:bg-gray-800 rounded px-2"
            >
              Post a Demand
            </button>
            <Link 
              href="/profile" 
              className="text-white text-sm py-2 w-full text-left hover:bg-gray-800 rounded px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                onLogOut();
                setIsMenuOpen(false);
              }}
              className="text-white text-sm py-2 w-full text-left hover:bg-gray-800 rounded px-2"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 