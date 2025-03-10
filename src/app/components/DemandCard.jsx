import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { ShareIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function DemandCard({ demand, onContactClick }) {
  const router = useRouter();
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleClick = () => {
    router.push(`/demand/${demand.id}`);
  };

  const handleShare = async (e, platform) => {
    e.stopPropagation(); // Prevent card click
    
    const url = `${window.location.origin}/demand/${demand.id}`;
    const title = demand.title || 'Check out this project';
    
    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
    }
    
    setShowShareOptions(false);
  };

  const toggleShareOptions = (e) => {
    e.stopPropagation();
    setShowShareOptions(!showShareOptions);
  };

  return (
    <div 
      className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={handleClick}
    >
      <div className="border-l-4 border-yellow-500 p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white">{demand.title}</h3>
          <div className="relative">
            <button 
              onClick={toggleShareOptions}
              className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-[#252525] rounded-md shadow-lg z-10 border border-gray-700">
                <div className="py-1">
                  <button onClick={(e) => handleShare(e, 'copy')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                    Copy Link
                  </button>
                  <button onClick={(e) => handleShare(e, 'twitter')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                    Share on Twitter
                  </button>
                  <button onClick={(e) => handleShare(e, 'facebook')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                    Share on Facebook
                  </button>
                  <button onClick={(e) => handleShare(e, 'linkedin')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                    Share on LinkedIn
                  </button>
                  <button onClick={(e) => handleShare(e, 'whatsapp')} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                    Share on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-400 mt-2 text-sm line-clamp-2">{demand.description}</p>
      </div>
      
      <div className="p-4 pt-0">
        <div className="mt-2 flex justify-between items-center">
          <div className="text-white font-bold">${demand.budget}</div>
          <div className="text-sm text-gray-400">
            {demand.category}
          </div>
        </div>
        
        <div className="mt-3 flex items-center border-t border-gray-800 pt-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
            {demand.user_avatar ? (
              <img src={demand.user_avatar} alt={demand.user_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                {(demand.user_name || 'User').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <p className="text-sm text-white truncate">{demand.user_name || 'Anonymous'}</p>
            <p className="text-xs text-gray-500 truncate">{demand.user_title || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 