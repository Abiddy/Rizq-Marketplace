import { ShareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DemandCardCompact({ demand, onContactClick }) {
  const formatBudget = (budget) => {
    if (budget === null || budget === undefined) return '$0.00';
    return `$${Number(budget).toFixed(2)}`;
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
    <div className="bg-[#181818] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex">
        {/* Category color accent */}
        <div className={`w-2 bg-gradient-to-b ${getCategoryColor(demand.category)}`}></div>
        
        <div className="flex-1 p-4">
          <Link href={`/demand/${demand.id}`} className="block">
            <h2 className="text-lg font-semibold text-white mb-2 hover:text-indigo-400 transition-colors line-clamp-1">
              {demand.title}
            </h2>
          </Link>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {demand.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-2">
                {demand.profile?.avatar_url ? (
                  <img 
                    src={demand.profile.avatar_url} 
                    alt={demand.profile.full_name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                    {demand.profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {demand.profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {demand.profile?.username ? `@${demand.profile.username}` : 'Anonymous'}
                </p>
              </div>
            </div>
            
            <div className="text-yellow-500 font-semibold">
              {formatBudget(demand.budget)}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              {demand.category}
            </span>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onContactClick(demand.user_id, demand.profile?.full_name || 'User')}
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
      </div>
    </div>
  );
} 