import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LandingNavbar({ onSignIn }) {
  return (
    <header className="w-full py-4 px-6 absolute top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-12 h-12"
            >
              <Image
                src="/rizqnew.png"
                alt="Rizq Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </Link>
        </div>
        
        <button 
          onClick={onSignIn}
          className="px-5 py-2 rounded-full bg-transparent text-white border border-white/50 hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          Sign in
        </button>
      </div>
    </header>
  );
} 