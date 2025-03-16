import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingNavbar({ onSignIn }) {
  return (
    <header className="w-full py-4 px-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {/* <motion.div 
              className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg"
              whileHover={{ scale: 1.05 }}
            >
              R
            </motion.div> */}
            <span className="text-xl font-semibold text-gray-900">Rizq</span>
          </Link>
        </div>
        
        <button 
          onClick={onSignIn}
          className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
        >
          Sign in
        </button>
      </div>
    </header>
  );
} 