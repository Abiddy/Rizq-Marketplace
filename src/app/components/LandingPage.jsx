import React from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from './LandingNavbar';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Globe } from '@/components/magicui/globe';
import { NumberTicker } from '@/components/magicui/number-ticker';

export default function LandingPage({ onGetStarted }) {
  // Custom globe configuration
  const globeConfig = {
    devicePixelRatio: 2,
    width: 600,
    height: 600,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 3,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [0.3, 0.3, 0.6],
    markerColor: [0.1, 0.8, 1],
    glowColor: [0.1, 0.1, 0.5],
    markers: [
      { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
      { location: [40.7128, -74.0060], size: 0.05 },  // New York
      { location: [51.5074, -0.1278], size: 0.05 },   // London
      { location: [25.2048, 55.2708], size: 0.05 },   // Dubai
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A1B] text-gray-100">
      <LandingNavbar onSignIn={onGetStarted} />
      
      {/* Hero Section with Globe */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="z-10"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex space-x-1 text-2xl font-bold text-white bg-black p-4 rounded-lg">
                  <NumberTicker 
                    value={82} // ASCII for 'R'
                    startValue={69} // Start from 'A'
                    className="text-white"
                    isLetter={true}
                  />      
                  <NumberTicker 
                    value={73} // ASCII for 'I'
                    startValue={68} // Start from 'A'
                    className="text-white"
                    delay={0.1}
                    isLetter={true}
                  />             
                  <NumberTicker 
                    value={90} // ASCII for 'Z'
                    startValue={66} // Start from 'A'
                    className="text-white"
                    delay={0.2}
                    isLetter={true}
                  />
                  <NumberTicker 
                    value={81} // ASCII for 'Q'
                    startValue={81} // Start from 'A'
                    className="text-white"
                    delay={0.3}
                    isLetter={true}
                  />    
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="block mt-2">The first</span>
              <span className="text-[#60A5FA] block mb-2">
                community-based
              </span>
              <span className="block mt-2">marketplace for freelancers</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
              We are empowering <span className="font-bold text-blue-400">muslim freelancers</span> to showcase their online skills and connect with clients across the United States!
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-8 py-4 bg-transparent text-white font-medium rounded-xl border border-white/50 hover:bg-white/10 transition-all"
            >
              Get started for free
            </motion.button>
          </motion.div>

          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <Globe config={globeConfig} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1B] via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>
      
      {/* Product Demo Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-[#111126] rounded-2xl p-3 md:p-4 shadow-2xl border border-blue-900/20"
        >
          <div className="w-full">
            {/* Platform Preview */}
            <div className="relative bg-gradient-to-br from-[#0D0D23] to-[#151537] shadow-xl border border-blue-900/10 rounded-lg overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex justify-between items-center p-3 md:p-4 border-b border-blue-900/10">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs md:text-sm font-medium bg-blue-900/20 px-3 py-1 rounded-full text-blue-300">
                  Rizq Market Dashboard
                </div>
              </div>
              
              {/* Dashboard Content - Responsive grid */}
              <div className="p-3 md:p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                  {/* Available Gigs Card */}
                  <div className="bg-gray-700/50 rounded-lg p-3 md:p-4 border border-gray-600">
                    <h3 className="text-base md:text-lg font-medium mb-2">Available Gigs</h3>
                    <div className="space-y-2 md:space-y-3">
                      <div className="bg-gray-600/50 p-2 md:p-3 rounded">
                        <p className="font-medium text-sm md:text-base">Web Development</p>
                        <p className="text-xs md:text-sm text-gray-300">$500 - $1,500</p>
                      </div>
                      <div className="bg-gray-600/50 p-2 md:p-3 rounded">
                        <p className="font-medium text-sm md:text-base">Logo Design</p>
                        <p className="text-xs md:text-sm text-gray-300">$150 - $400</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Requests Card */}
                  <div className="col-span-1 md:col-span-2 bg-gray-700/50 rounded-lg p-3 md:p-4 border border-gray-600">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-4">Project Requests</h3>
                    <div className="space-y-2 md:space-y-4">
                      <div className="bg-gray-600/50 p-2 md:p-4 rounded flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm md:text-base">Mobile App Development</p>
                          <p className="text-xs md:text-sm text-gray-300">Looking for React Native expert</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm md:text-base">$3,500</p>
                          <p className="text-xs text-gray-300">Due in 30 days</p>
                        </div>
                      </div>
                      <div className="bg-gray-600/50 p-2 md:p-4 rounded flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm md:text-base">Content Creation</p>
                          <p className="text-xs md:text-sm text-gray-300">10 blog posts needed</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm md:text-base">$800</p>
                          <p className="text-xs text-gray-300">Due in 14 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Social Proof Section */}
      <div className="py-16 border-t border-blue-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-lg font-medium">
            Rizq is building from the ground up! We are recruiting thousands of talented freelancers to join our growing network
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="mt-8 px-6 py-3 bg-blue-900/20 text-blue-300 font-medium rounded-lg hover:bg-blue-900/30 transition-all"
          >
            Join Now
          </motion.button>
        </div>
      </div>
    </div>
  );
} 