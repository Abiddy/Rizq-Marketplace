import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import LandingNavbar from './LandingNavbar';
import { Globe } from '@/components/magicui/globe';
import { NumberTicker } from '@/components/magicui/number-ticker';

export default function LandingPage({ onGetStarted }) {
  const { scrollY } = useScroll();
  const [isMounted, setIsMounted] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const chatRef = useRef(null);
  const isInView = useInView(chatRef, { once: true, amount: 0.2 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        if (chatStep < 6) {
          setChatStep(prev => prev + 1);
        }
      }, chatStep === 0 ? 1000 : 2000);

      return () => clearTimeout(timer);
    }
  }, [chatStep, isInView]);

  // Transform values for parallax effect
  const globeScale = useTransform(scrollY, [0, 800], [1, 2]);
  const globeY = useTransform(scrollY, [0, 800], ['0%', '-50%']);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const textBlur = useTransform(scrollY, [0, 400], [0, 10]);
  const chatOpacity = useTransform(scrollY, [300, 500], [0, 1]);

  // Custom globe configuration
  const globeConfig = {
    devicePixelRatio: 2,
    width: 1000,
    height: 1000,
    phi: 0.3,
    theta: 0.5,
    dark: 0.2,
    diffuse: 3,
    mapSamples: 20000,
    mapBrightness: 1.5,
    baseColor: [0.3, 0.3, 0.8],
    markerColor: [0.1, 0.8, 1],
    glowColor: [0.2, 0.2, 0.8],
    markers: [
      // US Markers
      { location: [37.7749, -122.4194], size: 0.03 }, // San Francisco
      { location: [40.7128, -74.0060], size: 0.03 },  // New York
      { location: [34.0522, -118.2437], size: 0.03 }, // Los Angeles
      { location: [41.8781, -87.6298], size: 0.03 },  // Chicago
      { location: [29.7604, -95.3698], size: 0.03 },  // Houston
      
      // Europe Markers
      { location: [51.5074, -0.1278], size: 0.03 },   // London
      { location: [48.8566, 2.3522], size: 0.03 },    // Paris
      { location: [52.5200, 13.4050], size: 0.03 },   // Berlin
      
      // Middle East Markers
      { location: [25.2048, 55.2708], size: 0.03 },   // Dubai
      { location: [24.7136, 46.6753], size: 0.03 },   // Riyadh
      { location: [21.4225, 39.8262], size: 0.03 },   // Mecca
      
      // Asia Markers
      { location: [35.6762, 139.6503], size: 0.03 },  // Tokyo
      { location: [1.3521, 103.8198], size: 0.03 },   // Singapore
      { location: [22.3193, 114.1694], size: 0.03 },  // Hong Kong
      
      // Australia Markers
      { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
      { location: [-37.8136, 144.9631], size: 0.03 }, // Melbourne
    ],
  };

  const TypingIndicator = () => (
    <div className="flex space-x-2 p-3">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatType: "reverse" }}
        className="w-2 h-2 bg-blue-400 rounded-full"
      />
    </div>
  );

  // First, let's create a variant for the message animations
  const messageVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1] // Use a custom cubic-bezier for springy effect
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A1B] text-gray-100 overflow-x-hidden">
      <LandingNavbar onSignIn={onGetStarted} />
      
      {/* Hero Section with Globe */}
      <div className="relative min-h-[200vh]">
        {/* Fixed Content Container */}
        <motion.div
          style={{ 
            opacity: textOpacity,
            filter: `blur(${textBlur}px)`,
          }}
          className="sticky top-0 h-screen flex items-center justify-center z-20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* RIZQ Logo */}
            <motion.div className="flex justify-center mb-4">
              <div className="flex space-x-1 text-2xl sm:text-3xl font-bold text-white bg-black/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
                <NumberTicker value={82} startValue={69} className="text-white" isLetter={true} />
                <NumberTicker value={73} startValue={68} className="text-white" delay={0.1} isLetter={true} />
                <NumberTicker value={90} startValue={66} className="text-white" delay={0.2} isLetter={true} />
                <NumberTicker value={81} startValue={81} className="text-white" delay={0.3} isLetter={true} />
              </div>
            </motion.div>

            {/* Hero Text Container */}
            <div className="relative z-10 pt-4 sm:pt-8">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                <span className="block leading-[1.1] sm:leading-[0.9]">The first</span>
                <span className="text-[#60A5FA] block leading-[1.1] sm:leading-[0.9] my-2">community-based</span>
                <span className="block leading-[1.1] sm:leading-[0.9]">online marketplace</span>
                <span className="block leading-[1.1] sm:leading-[0.9]">for all kinds of services</span>
              </h1>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-transparent text-white text-base sm:text-lg font-medium rounded-xl border border-white/50 hover:bg-white/10 transition-all backdrop-blur-sm mt-8"
              >
                Get started for free
              </motion.button>
            </div>

            {/* Globe Container - Positioned absolutely relative to the viewport */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[800px] sm:h-[1000px]">
                <Globe config={globeConfig} className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1B] via-transparent to-[#0A0A1B] opacity-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Demo Section */}
        <motion.div
          ref={chatRef}
          style={{ opacity: chatOpacity }}
          className="relative z-30 min-h-screen flex items-center justify-center px-8 sm:px-12 lg:px-16"
        >
          <div className="max-w-4xl w-full space-y-8">
            {/* First Message */}
            <AnimatePresence mode="wait">
              {isInView && chatStep >= 1 && (
                <motion.div
                  className="flex justify-start"
                >
                  {chatStep === 1 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#1a365d] backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-lg border border-blue-500/20"
                    >
                      <p className="text-blue-300 text-sm mb-2">Client</p>
                      <TypingIndicator />
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="bg-[#1a365d] backdrop-blur-sm rounded-2xl rounded-tl-none p-6 max-w-lg border border-blue-500/20"
                    >
                      <p className="text-blue-300 text-sm mb-2">Client</p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white text-lg"
                      >
                        I need a skilled React Native developer for my mobile app project. Budget is around $3,500. Are there any experienced developers available?
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Second Message */}
            <AnimatePresence mode="wait">
              {isInView && chatStep >= 3 && (
                <motion.div
                  className="flex justify-end"
                >
                  {chatStep === 3 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#064e3b] backdrop-blur-sm rounded-2xl rounded-tr-none p-4 max-w-lg border border-emerald-500/20"
                    >
                      <p className="text-emerald-300 text-sm mb-2">Freelancer</p>
                      <TypingIndicator />
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="bg-[#064e3b] backdrop-blur-sm rounded-2xl rounded-tr-none p-6 max-w-lg border border-emerald-500/20"
                    >
                      <p className="text-emerald-300 text-sm mb-2">Freelancer</p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white text-lg"
                      >
                        I'm a React Native expert with 5 years of experience. I've built several successful apps and would love to help bring your vision to life. Shall we discuss the project details?
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Third Message */}
            <AnimatePresence mode="wait">
              {isInView && chatStep >= 5 && (
                <motion.div
                  className="flex justify-start"
                >
                  {chatStep === 5 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#1a365d] backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-lg border border-blue-500/20"
                    >
                      <p className="text-blue-300 text-sm mb-2">Client</p>
                      <TypingIndicator />
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="bg-[#1a365d] backdrop-blur-sm rounded-2xl rounded-tl-none p-6 max-w-lg border border-blue-500/20"
                    >
                      <p className="text-blue-300 text-sm mb-2">Client</p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white text-lg"
                      >
                        Perfect! Your portfolio looks great. Let's connect and discuss the project timeline and requirements in detail.
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Social Proof Section */}
      <div className="relative z-40 py-32 border-t border-blue-900/10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <p className="text-gray-400 text-xl font-medium mb-8">
            Join thousands of talented freelancers in our growing network
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-8 py-4 bg-blue-900/20 text-blue-300 text-lg font-medium rounded-lg hover:bg-blue-900/30 transition-all backdrop-blur-sm"
          >
            Join Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 