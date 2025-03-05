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
        onPostGig={() => router.push('/')}
        onPostDemand={() => router.push('/')}
        onProfile={() => {}}
        onLogOut={handleLogOut}
      />
      
      <div className="p-6 max-w-[1600px] mx-auto">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Profile Header */}
        <div className="bg-[#181818] rounded-lg p-6 mb-6 border border-gray-800">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile.full_name || 'User'} 
                  className="w-24 h-24 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#999">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {userProfile?.full_name || 'Update Your Profile'}
              </h1>
              
              {userProfile?.company_name && (
                <p className="text-gray-400 mb-2">{userProfile.company_name}</p>
              )}
              
              {userProfile?.location && (
                <p className="text-gray-400 mb-2">📍 {userProfile.location}</p>
              )}
              
              {userProfile?.bio && (
                <p className="text-gray-300 mt-3">{userProfile.bio}</p>
              )}
              
              {userProfile?.skills && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.skills.split(',').map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <button
                onClick={handleEditProfile}
                className="border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-800"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        {/* User Gigs and Demands */}
        <div className="grid grid-cols-2 gap-6">
          {/* User's Gigs */}
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h2 className="text-sm font-medium text-white">My Gigs ({userGigs.length})</h2>
            </div>
            
            <div className="space-y-3">
              {userGigs.length === 0 && (
                <p className="text-gray-400 text-sm py-2">You haven't posted any gigs yet.</p>
              )}
              
              {userGigs.map((gig) => (
                <EditableGigCard
                  key={gig.id}
                  gig={gig}
                  onEdit={handleEditGig}
                  onDelete={handleDeleteGig}
                />
              ))}
            </div>
          </div>
          
          {/* User's Demands */}
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <h2 className="text-sm font-medium text-white">My Demands ({userDemands.length})</h2>
            </div>
            
            <div className="space-y-3">
              {userDemands.length === 0 && (
                <p className="text-gray-400 text-sm py-2">You haven't posted any demands yet.</p>
              )}
              
              {userDemands.map((demand) => (
                <EditableDemandCard
                  key={demand.id}
                  demand={demand}
                  onEdit={handleEditDemand}
                  onDelete={handleDeleteDemand}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
} 