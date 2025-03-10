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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

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

  const confirmDelete = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleDeleteGig = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;
      
      setUserGigs(userGigs.filter(gig => gig.id !== itemToDelete));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting gig:', err);
      setError('Failed to delete gig');
    }
  };

  const handleDeleteDemand = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from('demands')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;
      
      setUserDemands(userDemands.filter(demand => demand.id !== itemToDelete));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
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
        
        {/* Desktop View - Side by side layout */}
        <div className="hidden md:flex space-x-6 mb-6">
          {/* Gigs Column */}
          <div className="w-1/2 bg-[#222222] rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Your Gigs
              </h2>
              <button 
                onClick={() => router.push('/new-gig')}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors"
              >
                + New Gig
              </button>
            </div>
            
            <div className="space-y-4">
              {userGigs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">You haven't posted any gigs yet.</p>
              ) : (
                userGigs.map(gig => (
                  <div key={gig.id} className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                    <h3 className="font-medium text-white mb-1">{gig.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{gig.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium">${gig.budget}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditGig(gig)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => confirmDelete(gig.id, 'gig')}
                          className="text-xs bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Demands Column */}
          <div className="w-1/2 bg-[#222222] rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Your Demands
              </h2>
              <button 
                onClick={() => router.push('/new-demand')}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors"
              >
                + New Demand
              </button>
            </div>
            
            <div className="space-y-4">
              {userDemands.length === 0 ? (
                <p className="text-gray-400 text-center py-4">You haven't posted any demands yet.</p>
              ) : (
                userDemands.map(demand => (
                  <div key={demand.id} className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                    <h3 className="font-medium text-white mb-1">{demand.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{demand.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-medium">${demand.budget}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditDemand(demand)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => confirmDelete(demand.id, 'demand')}
                          className="text-xs bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile View - Tabs */}
        <div className="md:hidden">
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab('gigs')}
              className={`flex-1 py-2 text-center ${
                activeTab === 'gigs' 
                  ? 'bg-[#222222] text-white border-t-2 border-green-500' 
                  : 'bg-[#1A1A1A] text-gray-400'
              }`}
            >
              Your Gigs
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex-1 py-2 text-center ${
                activeTab === 'demands' 
                  ? 'bg-[#222222] text-white border-t-2 border-yellow-500' 
                  : 'bg-[#1A1A1A] text-gray-400'
              }`}
            >
              Your Demands
            </button>
          </div>
          
          {activeTab === 'gigs' && (
            <div className="bg-[#222222] rounded-lg p-4 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Your Gigs</h2>
                <button 
                  onClick={() => router.push('/new-gig')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                >
                  + New Gig
                </button>
              </div>
              
              <div className="space-y-3">
                {userGigs.map(gig => (
                  <div key={gig.id} className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                    <h3 className="font-medium text-white mb-1">{gig.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{gig.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium">${gig.budget}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditGig(gig)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => confirmDelete(gig.id, 'gig')}
                          className="text-xs bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'demands' && (
            <div className="bg-[#222222] rounded-lg p-4 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Your Demands</h2>
                <button 
                  onClick={() => router.push('/new-demand')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                >
                  + New Demand
                </button>
              </div>
              
              <div className="space-y-3">
                {userDemands.map(demand => (
                  <div key={demand.id} className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                    <h3 className="font-medium text-white mb-1">{demand.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{demand.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-medium">${demand.budget}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditDemand(demand)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => confirmDelete(demand.id, 'demand')}
                          className="text-xs bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#222222] rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteType === 'gig' ? handleDeleteGig : handleDeleteDemand}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 