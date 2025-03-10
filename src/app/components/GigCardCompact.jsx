import { useState } from 'react';
import { ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function GigCardCompact({ gig, onContactClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasImages = gig.images && gig.images.length > 0;
  
  const nextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % gig.images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + gig.images.length) % gig.images.length);
  };
  
  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Web Development': 'from-blue-500 to-blue-600',
      'Mobile Development': 'from-purple-500 to-purple-600',
      'Logo Design': 'from-orange-500 to-orange-600',
      'Graphic Design': 'from-pink-500 to-pink-600',
      'Content Writing': 'from-green-500 to-green-600',
      'Translation': 'from-yellow-500 to-yellow-600',
      'Social Media': 'from-red-500 to-red-600',
      'Marketing': 'from-teal-500 to-teal-600',
      'Video Editing': 'from-indigo-500 to-indigo-600'
    };
    
    return colorMap[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 flex flex-col bg-[#151515] hover:border-gray-700 transition-all">
      <Link href={`/gigs/${gig.id}`} className="block flex-grow">
        <div className="relative aspect-video overflow-hidden">
          {hasImages ? (
            <>
              <img 
                src={gig.images[currentImageIndex]} 
                alt={gig.title}
                className="w-full h-full object-cover"
              />
              
              {gig.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 transition-all z-10"
                  >
                    <ChevronLeftIcon className="h-4 w-4 text-white" />
                  </button>
                  
                  <button 
                    onClick={nextImage} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 transition-all z-10"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-white" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-base font-bold text-white/30">
                {gig.title?.substring(0, 2) || 'No'} Image
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <h3 className="text-md font-semibold text-white line-clamp-1">{gig.title}</h3>
          </div>
        </div>
      </Link>
      
      <div className="p-3">        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
              {gig.profile?.avatar_url ? (
                <img 
                  src={gig.profile.avatar_url} 
                  alt={gig.profile.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-xs font-bold">
                  {gig.profile?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-300 font-medium line-clamp-1">
              {gig.profile?.full_name || 'User'}
            </span>
          </div>
          
          <div className="text-yellow-500 font-semibold">
            {formatPrice(gig.price)}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <button 
            onClick={() => onContactClick(gig.user_id, gig.profile?.full_name || 'User')}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition-colors"
          >
            Contact
          </button>
          
          <button className="text-gray-400 hover:text-white p-1 rounded-full">
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 