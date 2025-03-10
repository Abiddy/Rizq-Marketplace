'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import GigForm from '../components/GigForm';
import DemandForm from '../components/DemandForm';
import ProfileForm from '../components/ProfileForm';
import EditableGigCard from '../components/EditableGigCard';
import EditableDemandCard from '../components/EditableDemandCard';
import { PencilIcon, BriefcaseIcon, DocumentTextIcon, StarIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Chat from '../components/Chat';
import MessagesList from '../components/MessagesList';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGigs, setUserGigs] = useState([]);
  const [userDemands, setUserDemands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [gigToEdit, setGigToEdit] = useState(null);
  const [demandToEdit, setDemandToEdit] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeTab, setActiveTab] = useState('gigs');
  const [userRating, setUserRating] = useState(5.0);
  const [reviews, setReviews] = useState(26);
  const [isVerified, setIsVerified] = useState(true);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeChatUserName, setActiveChatUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      setUser(session.user);
      await Promise.all([
        fetchUserProfile(session.user.id),
        fetchUserGigs(session.user.id),
        fetchUserDemands(session.user.id)
      ]);
      
      // Check URL params for chat
      const searchParams = new URLSearchParams(window.location.search);
      const chatUserId = searchParams.get('chat');
      const chatUserName = searchParams.get('name');
      
      if (chatUserId && chatUserName) {
        setActiveChatUser(chatUserId);
        setActiveChatUserName(decodeURIComponent(chatUserName));
        setShowMessages(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      console.log("Profile data retrieved:", data);
      console.log("Avatar URL from DB:", data.avatar_url);

      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data');
    }
  };

  const fetchUserGigs = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserGigs(data || []);
    } catch (err) {
      console.error('Error fetching user gigs:', err);
    }
  };

  const fetchUserDemands = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserDemands(data || []);
    } catch (err) {
      console.error('Error fetching user demands:', err);
    }
  };

  const handleEditGig = (gig) => {
    setGigToEdit(gig);
    setDemandToEdit(null);
    setModalContent('gigForm');
    setIsModalOpen(true);
  };

  const handleEditDemand = (demand) => {
    setDemandToEdit(demand);
    setGigToEdit(null);
    setModalContent('demandForm');
    setIsModalOpen(true);
  };

  const handleDeleteGig = async (gigId) => {
    try {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', gigId);

      if (error) throw error;
      setUserGigs(userGigs.filter(gig => gig.id !== gigId));
    } catch (err) {
      console.error('Error deleting gig:', err);
      setError('Failed to delete gig');
    }
  };

  const handleDeleteDemand = async (demandId) => {
    try {
      const { error } = await supabase
        .from('demands')
        .delete()
        .eq('id', demandId);

      if (error) throw error;
      setUserDemands(userDemands.filter(demand => demand.id !== demandId));
    } catch (err) {
      console.error('Error deleting demand:', err);
      setError('Failed to delete demand');
    }
  };

  const handleUpdateGig = async (updatedGig) => {
    try {
      const { error } = await supabase
        .from('gigs')
        .update(updatedGig)
        .eq('id', updatedGig.id);

      if (error) throw error;
      
      setUserGigs(userGigs.map(gig => 
        gig.id === updatedGig.id ? updatedGig : gig
      ));
      
      setIsModalOpen(false);
      setGigToEdit(null);
    } catch (err) {
      console.error('Error updating gig:', err);
      setError('Failed to update gig');
    }
  };

  const handleUpdateDemand = async (updatedDemand) => {
    try {
      const { error } = await supabase
        .from('demands')
        .update(updatedDemand)
        .eq('id', updatedDemand.id);

      if (error) throw error;
      
      setUserDemands(userDemands.map(demand => 
        demand.id === updatedDemand.id ? updatedDemand : demand
      ));
      
      setIsModalOpen(false);
      setDemandToEdit(null);
    } catch (err) {
      console.error('Error updating demand:', err);
      setError('Failed to update demand');
    }
  };

  const handleEditProfile = () => {
    setModalContent('profileForm');
    setIsModalOpen(true);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setIsModalOpen(false);
    // Refresh all data
    if (user) {
      fetchUserProfile(user.id);
      fetchUserGigs(user.id);
      fetchUserDemands(user.id);
    }
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSelectChat = (userId, userName) => {
    setActiveChatUser(userId);
    setActiveChatUserName(userName);
    setShowMessages(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar 
        user={user}
        onPostGig={() => router.push('/new-gig')}
        onPostDemand={() => router.push('/new-demand')}
        onProfile={() => {}}
        onLogOut={handleLogOut}
        onMessages={() => {
          setActiveChatUser(null); // Reset to show the messages list
          setShowMessages(true);
        }}
      />
      
      <div className="p-4 max-w-[1200px] mx-auto">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Profile Information - Cover removed */}
        <div className="bg-[#222222] rounded-lg p-6 border border-gray-800 mb-6">
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 mb-4">
            {/* Profile Picture */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 relative">
              {userProfile?.avatar_url ? (
                <>
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.full_name || 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', userProfile.avatar_url);
                      // Fallback to default avatar if image fails to load
                      e.target.src = "/default-avatar.png"; 
                    }}
                  />
                  {/* Hidden debug info that only shows in dev tools */}
                  <div className="hidden">{JSON.stringify({imgSrc: userProfile.avatar_url})}</div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              {/* Online status dot */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#222222]"></div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {userProfile?.full_name || 'Update Your Profile'}
                </h1>
                {isVerified && (
                  <CheckBadgeIcon className="h-6 w-6 text-blue-500" />
                )}
              </div>
              
              <p className="text-gray-400 text-sm">
                @{userProfile?.username || 'username'}
              </p>
              
              {/* Bio */}
              <p className="text-gray-300 text-sm mt-2">
                {userProfile?.bio || 'Add a bio to tell people about yourself...'}
              </p>
            </div>
            
            {/* Edit Profile Button */}
            <Link
              href="/edit-profile"
              className="text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 px-4 rounded-md text-sm flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-1.5" />
              Edit Profile
            </Link>
          </div>
          
          {/* Skills */}
          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(userProfile.skills) ? (
                userProfile.skills.map((skill, index) => (
                  <span key={index} className="bg-indigo-900/30 text-indigo-200 px-3 py-1 text-xs rounded-full">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="bg-indigo-900/30 text-indigo-200 px-3 py-1 text-xs rounded-full">
                  {userProfile.skills}
                </span>
              )}
            </div>
          )}
          
          {/* Stats Row */}
          <div className="flex justify-center sm:justify-start items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-white font-semibold">{userGigs.length + userDemands.length}</p>
              <p className="text-gray-400 text-xs">posts</p>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
              <p className="text-white font-semibold">{userProfile?.likes || 0}</p>
              <p className="text-gray-400 text-xs">likes</p>
            </div>
          </div>
          
          {/* Rating and Reviews */}
          <div className="flex items-center mb-5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < Math.floor(userRating) ? 'text-yellow-400' : 'text-gray-600'}`} />
              ))}
            </div>
            <span className="text-gray-400 text-sm ml-2">{reviews} reviews</span>
          </div>
          
          {/* Details Row */}
          <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-5">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Rate</p>
              <p className="text-white font-semibold text-lg">${userProfile?.hourly_rate || '25'}</p>
              <p className="text-gray-400 text-xs">per hour</p>
            </div>
            <div className="text-center border-x border-gray-700">
              <p className="text-gray-400 text-xs">Response Time</p>
              <p className="text-white font-semibold text-lg">5 hrs</p>
              <p className="text-gray-400 text-xs">average</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Jobs</p>
              <p className="text-white font-semibold text-lg">{userGigs.length}</p>
              <p className="text-gray-400 text-xs">completed</p>
            </div>
          </div>
        </div>
        
        {/* Contact Me Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Contact Me</h2>
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
          <p className="text-blue-100 mb-6">
            Have a project in mind? Let's discuss how I can help you bring your ideas to life!
          </p>
          <button 
            onClick={() => {
              // Handle message sending logic here
              if (user) {
                setChatRecipientId(userProfile?.id);
                setChatRecipientName(userProfile?.full_name || 'User');
                setIsChatOpen(true);
              } else {
                setError('Please log in to send messages');
              }
            }}
            className="w-full bg-white text-blue-700 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Send Message
          </button>
        </div>
        
        {/* Tabs for My Gigs and My Demands */}
        <div className="sm:hidden sticky top-0 z-10 mb-3">
          <div className="bg-[#181818] p-1.5 flex border border-gray-800 rounded-lg shadow-lg">
            <button
              onClick={() => setActiveTab('gigs')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1 ${
                activeTab === 'gigs' 
                  ? 'bg-orange-500/30 text-white' 
                  : 'bg-gray-800/80 text-gray-400'
              }`}
            >
              <BriefcaseIcon className="h-4 w-4" />
              <span>My Gigs ({userGigs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex-1 py-2 text-xs font-medium rounded-md ml-1 flex items-center justify-center gap-1 ${
                activeTab === 'demands' 
                  ? 'bg-yellow-500/30 text-white' 
                  : 'bg-gray-800/80 text-gray-400'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>My Demands ({userDemands.length})</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Content */}
        <div className="hidden sm:block space-y-6">
          {/* My Gigs Section */}
          <div className="bg-[#222222] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h2 className="text-lg font-medium text-white">My Gigs ({userGigs.length})</h2>
            </div>
            
            <div className="space-y-4">
              {userGigs.map(gig => (
                <div key={gig.id} className="bg-[#222222] rounded-lg p-4 border-l-4 border-orange-500">
                  <h3 className="font-semibold text-white">{gig.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{gig.description}</p>
                  <p className="text-white font-medium mt-2">${gig.budget}</p>
                  
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => handleEditGig(gig)}
                      className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGig(gig.id)}
                      className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {userGigs.length === 0 && (
                <p className="text-gray-400 text-center py-4">You haven't posted any gigs yet.</p>
              )}
            </div>
          </div>
          
          {/* My Demands Section */}
          <div className="bg-[#222222] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <h2 className="text-lg font-medium text-white">My Demands ({userDemands.length})</h2>
            </div>
            
            <div className="space-y-4">
              {userDemands.map(demand => (
                <div key={demand.id} className="bg-[#222222] rounded-lg p-4 border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-white">{demand.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{demand.description}</p>
                  <p className="text-green-400 font-medium mt-2">{demand.budget}</p>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      onClick={() => handleEditDemand(demand)}
                      className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDemand(demand.id)}
                      className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {userDemands.length === 0 && (
                <p className="text-gray-400 text-center py-4">You haven't posted any demands yet.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile View - based on selected tab */}
        <div className="sm:hidden">
          {activeTab === 'gigs' && (
            <div className="space-y-3">
              {userGigs.map(gig => (
                <div key={gig.id} className="bg-[#222222] rounded-lg p-3 border-l-4 border-orange-500">
                  <h3 className="font-semibold text-white text-sm">{gig.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{gig.description}</p>
                  <p className="text-white font-medium mt-2 text-sm">${gig.budget}</p>
                  
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => handleEditGig(gig)}
                      className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGig(gig.id)}
                      className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {userGigs.length === 0 && (
                <div className="bg-[#222222] rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm py-4">You haven't posted any gigs yet.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'demands' && (
            <div className="space-y-3">
              {userDemands.map(demand => (
                <div key={demand.id} className="bg-[#222222] rounded-lg p-3 border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-white text-sm">{demand.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{demand.description}</p>
                  <p className="text-white font-medium mt-2 text-sm">{demand.budget}</p>
                  
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => handleEditDemand(demand)}
                      className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-1"
                    >
                      <PencilIcon className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDemand(demand.id)}
                      className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {userDemands.length === 0 && (
                <div className="bg-[#222222] rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm py-4">You haven't posted any demands yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showProfileForm && (
        <Modal isOpen={showProfileForm} onClose={() => setShowProfileForm(false)}>
          <ProfileForm 
            user={user}
            onClose={() => setShowProfileForm(false)}
            onProfileUpdate={(updatedProfile) => {
              setUserProfile(updatedProfile);
              setShowProfileForm(false);
            }}
          />
        </Modal>
      )}
      
      {/* Modal for editing forms */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent === 'gigForm' && (
          <GigForm
            onAddGig={() => {}}
            onUpdateGig={handleUpdateGig}
            onClose={() => setIsModalOpen(false)}
            gigToEdit={gigToEdit}
          />
        )}
        
        {modalContent === 'demandForm' && (
          <DemandForm
            onAddDemand={() => {}}
            onUpdateDemand={handleUpdateDemand}
            onClose={() => setIsModalOpen(false)}
            demandToEdit={demandToEdit}
          />
        )}
        
        {modalContent === 'profileForm' && (
          <ProfileForm
            user={user}
            onClose={() => setIsModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </Modal>
      
      {showMessages && (
        <Modal isOpen={showMessages} onClose={() => setShowMessages(false)}>
          {activeChatUser ? (
            <Chat 
              userId={user.id}
              recipientId={activeChatUser}
              recipientName={activeChatUserName}
              onClose={() => {
                setActiveChatUser(null);
                setShowMessages(false);
              }}
            />
          ) : (
            <MessagesList 
              userId={user.id}
              onSelectChat={handleSelectChat}
              onClose={() => setShowMessages(false)}
            />
          )}
        </Modal>
      )}
    </div>
  );
} 