import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Link from 'next/link';

export default function GigCard({ gig, onContactClick }) {
  const router = useRouter();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasImages = gig.images && gig.images.length > 0;
  
  const handleCardClick = () => {
    router.push(`/gig/${gig.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation(); // Prevent card navigation
    setShowShareOptions(!showShareOptions);
  };

  const nextImage = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % gig.images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + gig.images.length) % gig.images.length);
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
  
  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const handleContactClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    onContactClick(gig.user_id, gig.profile?.full_name || 'User');
  };

  return (
    <div 
      className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer w-full h-full"
      onClick={handleCardClick}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] bg-[#121212] overflow-hidden">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 transition-all"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-white" />
                </button>
                
                <button 
                  onClick={nextImage} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 transition-all"
                >
                  <ChevronRightIcon className="h-5 w-5 text-white" />
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
                  {gig.images.map((_, index) => (
                    <button 
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-xl font-bold text-white/30">
              {gig.title?.substring(0, 2) || 'No'} Image
            </div>
          </div>
        )}
        
        {/* Category Label */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-gradient-to-r ${getCategoryColor(gig.category)} text-white`}>
            {gig.category}
          </span>
        </div>
      </div>
      
      <div className="p-2">
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{gig.title}</h3>
        
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{gig.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden">
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
            <span className="text-xs text-gray-300 truncate max-w-[60px]">
              {gig.profile?.full_name || 'User'}
            </span>
          </div>
          
          <div className="text-orange-500 font-semibold text-xs">
            {formatPrice(gig.price)}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between">
          <button 
            onClick={handleContactClick}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded-md transition-colors"
          >
            Contact
          </button>
          
          <button 
            onClick={handleShare}
            className="text-gray-400 hover:text-white p-1 rounded-full"
          >
            <ShareIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
} 