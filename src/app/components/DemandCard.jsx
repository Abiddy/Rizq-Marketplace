import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

export default function DemandCard({ demand, onContactClick }) {
  return (
    <div className="bg-[#222222] rounded-lg p-4 border-l-4 border-yellow-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-white">{demand.title}</h3>
          <p className="text-green-400 text-sm mt-1">{demand.budget || "300"}</p>
          <p className="text-gray-400 text-sm mt-1">{demand.location || "sa,mds,"}</p>
          
          {/* Display profile info if available */}
          {demand.profile && (
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center">
                {demand.profile?.avatar_url && (
                  <img 
                    src={demand.profile.avatar_url} 
                    alt={demand.profile.full_name || 'User'}
                    className="w-6 h-6 rounded-full mr-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-300 text-xs">{demand.profile.full_name}</p>
                  {demand.profile.company_name && (
                    <p className="text-gray-500 text-xs">{demand.profile.company_name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <p className="text-green-400 text-xs font-medium">{demand.match_percentage || "0"}% Match</p>
                
                {/* Contact Button */}
                <button 
                  onClick={() => onContactClick(demand.user_id, demand.profile.full_name)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1 text-xs"
                >
                  <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                  <span>Contact</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 