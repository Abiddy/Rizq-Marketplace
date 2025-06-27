'use client'
import React from 'react';
import { motion } from 'framer-motion';

const SERVICES = [
  { label: 'WEB DESIGN', color: '#FF2D55' },
  { label: 'FACEBOOK ADS', color: '#7C3AED' },
  { label: 'SOCIAL MEDIA MARKETING', color: '#111111' },
  { label: 'GOOGLE ADS', color: '#F4B400' },
  { label: 'VIDEO EDITING', color: '#3B82F6' },
  { label: 'GRAPHIC DESIGN', color: '#FF2D55' },
  { label: 'TIKTOK ADS', color: '#78716C' },
  { label: 'UX/UI DESIGN', color: '#1E3A5C' },
];

const bubbleVariants = {
  animate: (direction) => ({
    x: [direction === 'right' ? '-100%' : '100%', '0%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 18,
        ease: 'linear',
      },
    },
  }),
};

function BubbleRow({ direction, offset = 0 }) {
  // Repeat bubbles for seamless animation
  const bubbles = [...SERVICES, ...SERVICES];
  return (
    <motion.div
      className="flex space-x-6 py-3"
      custom={direction}
      variants={bubbleVariants}
      animate="animate"
      initial={false}
      style={{
        flexWrap: 'nowrap',
        willChange: 'transform',
        marginLeft: direction === 'right' ? 0 : 'auto',
      }}
    >
      {bubbles.map((service, idx) => (
        <div
          key={service.label + idx}
          className="flex items-center px-6 py-3 rounded-full bg-white shadow-md font-semibold text-sm whitespace-nowrap mr-2"
          style={{ borderLeft: `12px solid ${service.color}` }}
        >
          {service.label}
        </div>
      ))}
    </motion.div>
  );
}

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A1B] text-gray-100 flex flex-col items-center py-16 px-4">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Request Digital Services with Rizq</h1>
        <p className="text-lg text-gray-300 mb-6">
          Rizq connects you with top freelancers for all your digital needs. From web design and social media marketing to video editing and ad campaigns, we help you find the right talent for your business.
        </p>
      </div>
      <div className="w-full max-w-4xl overflow-hidden">
        <BubbleRow direction="right" />
        <BubbleRow direction="left" />
        <BubbleRow direction="right" />
      </div>
      <button
        onClick={() => window.open('https://mtm5pywke9g.typeform.com/to/zAMrB3iu', '_blank')}
        className="mt-16 px-10 py-5 bg-white text-black text-lg font-semibold rounded-3xl shadow-lg hover:bg-gray-100 transition"
      >
        Request a service →
      </button>
    </div>
  );
} 