import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';

export default function GigCard({ gig, onContactClick }) {
  console.log("Gig profile data:", gig.profile);

  return (
    <div className="bg-[#222222] rounded-lg p-4 border-l-4 border-orange-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-white">{gig.title}</h3>
          <p className="text-indigo-400 text-sm mt-1">{gig.category || "Logo Design"}</p>
          <p className="text-gray-400 text-sm mt-1">{gig.description}</p>
          <p className="text-white text-sm font-medium mt-2">${gig.budget || "250.00"}</p>
          
          {/* Display profile info if available */}
          {gig.profile && (
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center">
                {gig.profile?.avatar_url && (
                  <img 
                    src={gig.profile.avatar_url} 
                    alt={gig.profile.full_name || 'User'}
                    className="w-6 h-6 rounded-full mr-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-300 text-xs">{gig.profile.full_name}</p>
                  {gig.profile.company_name && (
                    <p className="text-gray-500 text-xs">{gig.profile.company_name}</p>
                  )}
                </div>
              </div>
              
              {/* Contact Button */}
              <button 
                onClick={() => onContactClick(gig.user_id, gig.profile.full_name)}
                className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1 text-xs"
              >
                <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                <span>Contact</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 