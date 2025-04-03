import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Link from 'next/link';
import { useChat } from '@/app/context/ChatContext';
import { useAuth } from '@/app/context/AuthContext';
import DealModal from './DealModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';

export default function GigCard({ gig, size = "normal", userId }) {
  const router = useRouter();
  const { openChat } = useChat();
  const { user } = useAuth();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDealModal, setShowDealModal] = useState(false);
  
  // Use the authenticated user ID if userId prop is not provided
  const currentUserId = userId || user?.id;
  
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
  
  const getRandomGradient = (() => {
    // Professional color gradient combinations
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-cyan-500 to-cyan-600',
      'from-teal-500 to-teal-600',
      'from-violet-500 to-violet-600',
      'from-fuchsia-500 to-fuchsia-600',
      'from-rose-500 to-rose-600',
      'from-orange-500 to-orange-600'
    ];
    
    // Cache to keep consistent colors for categories within a session
    const categoryColors = new Map();
    let currentIndex = 0;
    
    return (category) => {
      if (!categoryColors.has(category)) {
        categoryColors.set(category, gradients[currentIndex % gradients.length]);
        currentIndex++;
      }
      return categoryColors.get(category);
    };
  })();
  
  // Function to format category display text
  const formatCategoryText = (category) => {
    if (category.startsWith('custom:')) {
      return `#${category.replace('custom:', '')}`;
    }
    return category;
  };
  
  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const handleContactClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    
    // If user is not logged in, redirect to auth page
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Don't allow messaging yourself
    if (gig.user_id === user.id) {
      alert("You cannot message yourself");
      return;
    }
    
    openChat(gig.user_id, gig.profile?.full_name || 'User');
  };

  // Determine classes based on size
  const cardClasses = size === "small" 
    ? "bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 h-full flex flex-col"
    : "bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 h-full flex flex-col";
  
  const titleClasses = size === "small"
    ? "text-base font-medium text-white line-clamp-1"
    : "text-lg font-medium text-white";
    
  const descriptionClasses = size === "small"
    ? "text-sm text-gray-400 line-clamp-2 mt-1"
    : "text-gray-400 line-clamp-3 mt-2";

  // Don't show deal button on own gigs
  const isOwnGig = gig.user_id === currentUserId;

  // Safely parse categories once
  const parsedCategories = (() => {
    try {
      return typeof gig.categories === 'string' ? JSON.parse(gig.categories) : (Array.isArray(gig.categories) ? gig.categories : []);
    } catch (e) {
      console.error('Error parsing categories:', e);
      return [];
    }
  })();

  return (
    <div className={cardClasses} onClick={handleCardClick}>
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
        
        {/* Categories Labels */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
          {parsedCategories.slice(0, 2).map((category, index) => (
            <span 
              key={index}
              className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${getRandomGradient(category)} text-white shadow-md backdrop-blur-sm bg-opacity-90`}
            >
              {category}
            </span>
          ))}
          {parsedCategories.length > 2 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm border border-white/10">
              +{parsedCategories.length - 2}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className={titleClasses}>{gig.title}</h3>
        <p className={descriptionClasses}>{gig.description}</p>
        
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
      
      {/* Card footer */}
      <div className="p-4 border-t border-gray-800 bg-[#181818]">
        {/* Make a Deal button - only show for other users' gigs */}
        {!isOwnGig && (
          <div className="border-t border-gray-800 p-3">
            <button 
              onClick={() => setShowDealModal(true)}
              className="w-full flex items-center justify-center py-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
            >
            <FontAwesomeIcon icon={faHandshake} />
              Make a Deal
            </button>
          </div>
        )}
      </div>
      
      {/* Deal Modal */}
      {showDealModal && (
        <DealModal
          isOpen={showDealModal}
          onClose={() => setShowDealModal(false)}
          targetItem={gig}
          targetType="gig"
          userId={currentUserId}
        />
      )}
    </div>
  );
} 