'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { ShareIcon, ChatBubbleLeftRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import ChatBox from '@/app/components/ChatBox';

export default function DemandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [demand, setDemand] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser();
    fetchDemandDetails();
  }, [params.id]);

  const fetchDemandDetails = async () => {
    try {
      const { data: demandData, error: demandError } = await supabase
        .from('demands')
        .select('*')
        .eq('id', params.id)
        .single();

      if (demandError) throw demandError;
      setDemand(demandData);

      // Fetch buyer profile
      const { data: buyerData, error: buyerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', demandData.user_id)
        .single();

      if (buyerError) throw buyerError;
      setBuyer(buyerData);
    } catch (err) {
      console.error('Error fetching demand details:', err);
      setError('Failed to load demand details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = demand?.title || 'Check out this project';
    
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

  const handleContactClick = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    if (buyer.id === user.id) {
      setError('You cannot message yourself');
      return;
    }
    
    setChatRecipientId(buyer.id);
    setChatRecipientName(buyer.full_name || 'Buyer');
    setIsChatOpen(true);
  };

  const navigateToProfile = () => {
    if (!buyer) return;
    router.push(`/user/${buyer.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !demand) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg">
            {error || "Demand not found"}
          </div>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button 
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
        </button>
        
        <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-800">
          {/* Header section */}
          <div className="border-l-4 border-yellow-500 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-white mb-2">{demand.title}</h1>
              <div className="relative">
                <button 
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="p-2 rounded-full hover:bg-gray-700 text-gray-300"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                
                {showShareOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#252525] rounded-md shadow-lg z-10 border border-gray-700">
                    <div className="py-1">
                      <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Copy Link
                      </button>
                      <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Share on Twitter
                      </button>
                      <button onClick={() => handleShare('facebook')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Share on Facebook
                      </button>
                      <button onClick={() => handleShare('linkedin')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Share on LinkedIn
                      </button>
                      <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Share on WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center mt-4 text-gray-400 text-sm">
              <div className="mr-4">Category: <span className="text-indigo-400">{demand.category}</span></div>
              <div>Posted on {new Date(demand.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="p-6">
            <p className="text-gray-300 whitespace-pre-wrap mb-6">{demand.description}</p>
            
            <div className="bg-[#171717] p-4 rounded-lg border border-gray-800 mb-6">
              <div className="text-2xl font-bold text-white mb-1">${demand.budget}</div>
              <div className="text-gray-400 text-sm">Project budget</div>
            </div>
            
            {/* Buyer information */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  {buyer?.avatar_url ? (
                    <img src={buyer.avatar_url} alt={buyer.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {buyer?.full_name?.charAt(0) || 'B'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-white">{buyer?.full_name || 'Buyer'}</h3>
                  <p className="text-gray-400 text-sm">@{buyer?.username || 'username'}</p>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(buyer?.rating || 5) ? 'text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-400 text-xs ml-2">{buyer?.review_count || 0} reviews</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleContactClick}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Contact Buyer
                  </button>
                  
                  <button 
                    onClick={navigateToProfile}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatBox 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        recipientId={chatRecipientId}
        recipientName={chatRecipientName}
      />
    </div>
  );
} 