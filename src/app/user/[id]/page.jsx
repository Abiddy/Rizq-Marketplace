'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/solid';
import Modal from '@/app/components/Modal';
import Chat from '@/app/components/Chat';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [userGigs, setUserGigs] = useState([]);
  const [userDemands, setUserDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current logged in user
        const { data: userData } = await supabase.auth.getUser();
        setCurrentUser(userData?.user || null);
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Get user's gigs
        const { data: gigsData, error: gigsError } = await supabase
          .from('gigs')
          .select('*')
          .eq('user_id', params.id);
          
        if (gigsError) throw gigsError;
        setUserGigs(gigsData || []);
        
        // Get user's demands
        const { data: demandsData, error: demandsError } = await supabase
          .from('demands')
          .select('*')
          .eq('user_id', params.id);
          
        if (demandsError) throw demandsError;
        setUserDemands(demandsData || []);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  const handleContact = () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <Navbar user={currentUser} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <Navbar user={currentUser} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg">
            {error || "User not found"}
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
      <Navbar user={currentUser} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button 
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
        </button>
        
        <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-800">
          <div className="p-6">
            <div className="flex items-start">
              <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mr-5">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                    <p className="text-gray-400">@{profile.username || 'username'}</p>
                    
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(profile?.rating || 5) ? 'text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs ml-2">{profile?.review_count || 0} reviews</span>
                    </div>
                    
                    {profile.company_name && (
                      <p className="text-indigo-400 mt-2">{profile.company_name}</p>
                    )}
                  </div>
                  
                  {currentUser && currentUser.id !== profile.id && (
                    <button 
                      onClick={handleContact}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Contact
                    </button>
                  )}
                </div>
                
                {profile.bio && (
                  <div className="mt-4 text-gray-300">{profile.bio}</div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.isArray(profile.skills) ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="bg-indigo-900/30 text-indigo-200 px-3 py-1 text-xs rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="bg-indigo-900/30 text-indigo-200 px-3 py-1 text-xs rounded-full">
                        {profile.skills}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Gigs ({userGigs.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGigs.map(gig => (
                  <div 
                    key={gig.id}
                    onClick={() => router.push(`/gig/${gig.id}`)}
                    className="bg-[#252525] p-4 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer"
                  >
                    <h3 className="text-white font-medium">{gig.title}</h3>
                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">{gig.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-indigo-400">{gig.category}</span>
                      <span className="text-white font-bold">${gig.price}</span>
                    </div>
                  </div>
                ))}
                
                {userGigs.length === 0 && (
                  <p className="text-gray-400 col-span-2">No gigs available.</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Demands ({userDemands.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userDemands.map(demand => (
                  <div 
                    key={demand.id}
                    onClick={() => router.push(`/demand/${demand.id}`)}
                    className="bg-[#252525] p-4 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer"
                  >
                    <h3 className="text-white font-medium">{demand.title}</h3>
                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">{demand.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-indigo-400">{demand.category}</span>
                      <span className="text-white font-bold">${demand.budget}</span>
                    </div>
                  </div>
                ))}
                
                {userDemands.length === 0 && (
                  <p className="text-gray-400 col-span-2">No demands available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showChat && (
        <Modal isOpen={showChat} onClose={() => setShowChat(false)}>
          <Chat 
            userId={currentUser.id}
            recipientId={profile.id}
            recipientName={profile.full_name || 'User'}
            onClose={() => setShowChat(false)}
          />
        </Modal>
      )}
    </div>
  );
} 