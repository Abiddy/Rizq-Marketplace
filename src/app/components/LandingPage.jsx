import React from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from './LandingNavbar';
import { AuroraText } from '@/components/magicui/aurora-text';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingNavbar onSignIn={onGetStarted} />
      
      {/* Hero Section - Improved spacing for mobile */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-12 md:pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 md:space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <AuroraText 
              className="font-bold" 
              colors={["#3B82F6", "#6366F1", "#8B5CF6", "#D946EF", "#EC4899"]}
              speed={0.7}
            >
              Community-based
            </AuroraText>
            <span className="block mt-2">marketplace for freelancers</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We are empowering <span className="font-bold text-blue-600">muslim freelancers</span> to showcase their online skills and connect with clients across the United States!
          </p>
          
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors"
            >
              Get started for free
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Product Demo Section - Fixed for responsive view */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="bg-gray-50 rounded-2xl p-3 md:p-4 shadow-lg overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            {/* Platform Preview - Simplified for mobile */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl border border-gray-700 rounded-lg overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs md:text-sm font-medium bg-gray-700 px-2 py-1 md:px-3 md:py-1 rounded-full text-white">
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
          </motion.div>
        </div>
      </div>
      
      {/* Social Proof Section - Improved for mobile */}
      <div className="py-12 md:py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* <p className="text-gray-500 mb-4 md:mb-6">Join 2,000+ talented freelancers</p>
          <div className="flex justify-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold">
                1k+
              </div>
            </div>
          </div> */}
          
          <p className="mt-2 md:mt-2 text-gray-600 text-base md:text-lg font-bold">
            Rizq is building from the ground up! We are recruiting thousands of talented freelancers to join our growing network
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="mt-6 md:mt-8 px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Join Now
          </motion.button>
        </div>
      </div>
    </div>
  );
} 