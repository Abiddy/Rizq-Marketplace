import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { ShareIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useChat } from '@/app/context/ChatContext';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import DealModal from './DealModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';

// Add custom HandshakeIcon component
const HandshakeIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={1.5}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M6 12L10 16M10 16L14 12M10 16V4M18 12L14 8M14 8L10 12M14 8V20"
    />
  </svg>
);

export default function DemandCard({ demand, userId }) {
  const router = useRouter();
  const { openChat } = useChat();
  const { user } = useAuth();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  
  // Use the authenticated user ID if userId prop is not provided
  const currentUserId = userId || user?.id;
  
  // Don't show deal button on own demands
  const isOwnDemand = demand.user_id === currentUserId;

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

  const handleContactClick = (e) => {
    e.stopPropagation();
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    if (demand.user_id === user.id) {
      alert("You cannot message yourself");
      return;
    }
    
    openChat(demand.user_id, demand.user_name || 'User');
  };

  return (
    <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
      <Link href={`/demand/${demand.id}`} className="block">
        <div className="p-4">
          <h3 className="text-white font-medium mb-2">
            {demand.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-3">
            {demand.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-700 mr-2">
                {demand.profile?.avatar_url ? (
                  <img 
                    src={demand.profile.avatar_url} 
                    alt={demand.profile?.full_name || 'User'} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-yellow-500/20 flex items-center justify-center text-yellow-300 text-xs">
                    {(demand.profile?.full_name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-gray-300 text-xs">
                {demand.profile?.full_name || demand.profile?.username || 'Unknown User'}
              </span>
            </div>
            {demand.budget && (
              <span className="text-green-400 font-medium text-sm">
                ${demand.budget}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Make a Deal button - only show for other users' demands */}
      {!isOwnDemand && (
        <div className="border-t border-gray-800 p-3">
          <button 
            onClick={() => setShowDealModal(true)}
            className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {/* <HandshakeIcon className="h-5 w-5" /> */}
            Make a Deal
          </button>
        </div>
      )}
      
      {/* Deal Modal */}
      {showDealModal && (
        <DealModal
          isOpen={showDealModal}
          onClose={() => setShowDealModal(false)}
          targetItem={demand}
          targetType="demand"
          userId={currentUserId}
        />
      )}
    </div>
  );
} 