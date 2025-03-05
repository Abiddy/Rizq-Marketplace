'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import GigForm from './components/GigForm';
import Modal from './components/Modal';
import DemandCard from './components/DemandCard';
import GigCard from './components/GigCard';
import DemandForm from './components/DemandForm';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import ProfileForm from './components/ProfileForm';

export default function Home() {
  const [gigs, setGigs] = useState([]);
  const [demands, setDemands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGigForm, setIsGigForm] = useState(true); // Toggle between Gig and Demand forms
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gigToEdit, setGigToEdit] = useState(null);
  const [demandToEdit, setDemandToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasProfileInfo, setHasProfileInfo] = useState(false);

  // Fetch both gigs and demands
  useEffect(() => {
    fetchGigs();
    fetchDemands();
    fetchProfiles();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGigs();
        fetchDemands();
        fetchProfiles();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select('*, user_id');

      if (error) throw error;

      // Fetch profiles separately if gigs exist
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(gig => gig.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, company_name, avatar_url')
          .in('id', userIds);

        // Attach profiles to gigs
        const gigsWithProfiles = data.map(gig => ({
          ...gig,
          profile: profiles?.find(profile => profile.id === gig.user_id) || null
        }));
        
        setGigs(gigsWithProfiles);
      } else {
        setGigs([]);
      }
    } catch (err) {
      console.error('Error fetching gigs:', err);
    }
  };

  const fetchDemands = async () => {
    try {
      const { data, error } = await supabase
        .from('demands')
        .select('*, user_id');

      if (error) throw error;

      // Fetch profiles separately if demands exist
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(demand => demand.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, company_name, avatar_url')
          .in('id', userIds);

        // Attach profiles to demands
        const demandsWithProfiles = data.map(demand => ({
          ...demand,
          profile: profiles?.find(profile => profile.id === demand.user_id) || null
        }));
        
        setDemands(demandsWithProfiles);
      } else {
        setDemands([]);
      }
    } catch (err) {
      console.error('Error fetching demands:', err);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setUserProfile(data);
    setHasProfileInfo(data && data.full_name);
  };

  const addGig = async (newGig) => {
    if (!user) {
      setError('Please log in to create a gig.');
      return;
    }
    const gigWithUser = { ...newGig, user_id: user.id };
    const { data, error } = await supabase.from('gigs').insert(gigWithUser).select();
    if (error) console.error('Error adding gig:', error);
    else setGigs((prev) => [...prev, data[0]]);
  };

  const updateGig = async (updatedGig) => {
    if (!user) {
      setError('Please log in to edit a gig.');
      return;
    }
    const { data, error } = await supabase
      .from('gigs')
      .update(updatedGig)
      .eq('id', updatedGig.id)
      .select();
    if (error) console.error('Error updating gig:', error);
    else {
      setGigs((prev) =>
        prev.map((gig) => (gig.id === updatedGig.id ? data[0] : gig))
      );
    }
  };

  const deleteGig = async (gigId) => {
    if (!user) {
      setError('Please log in to delete a gig.');
      return;
    }
    const { error } = await supabase.from('gigs').delete().eq('id', gigId);
    if (error) console.error('Error deleting gig:', error);
    else setGigs((prev) => prev.filter((gig) => gig.id !== gigId));
  };

  const addDemand = async (newDemand) => {
    if (!user) {
      setError('Please log in to create a demand.');
      return;
    }
    const demandWithUser = { ...newDemand, user_id: user.id };
    const { data, error } = await supabase.from('demands').insert(demandWithUser).select();
    if (error) console.error('Error adding demand:', error);
    else setDemands((prev) => [...prev, data[0]]);
  };

  const updateDemand = async (updatedDemand) => {
    if (!user) {
      setError('Please log in to edit a demand.');
      return;
    }
    const { data, error } = await supabase
      .from('demands')
      .update(updatedDemand)
      .eq('id', updatedDemand.id)
      .select();
    if (error) console.error('Error updating demand:', error);
    else {
      setDemands((prev) =>
        prev.map((demand) => (demand.id === updatedDemand.id ? data[0] : demand))
      );
    }
  };

  const deleteDemand = async (demandId) => {
    if (!user) {
      setError('Please log in to delete a demand.');
      return;
    }
    const { error } = await supabase.from('demands').delete().eq('id', demandId);
    if (error) console.error('Error deleting demand:', error);
    else setDemands((prev) => prev.filter((demand) => demand.id !== demandId));
  };

  const signUp = async () => {
    try {
      console.log('Attempting to sign up with:', { email, password });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error('Sign Up error:', error.message, error.status, error.details);
        setError(error.message);
      } else {
        console.log('Sign Up success:', data);
        setError(null);
        alert('Check your email for confirmation link (if enabled)!');
      }
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const logIn = async () => {
    try {
      console.log('Attempting to log in with:', { email, password });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Log In error:', error.message, error.status, error.details);
        setError(error.message);
      } else {
        console.log('Log In success:', data);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Log Out error:', error);
    else {
      setUser(null);
      setGigs([]);
      setDemands([]);
      setError(null);
    }
  };

  const openEditModal = (gig) => {
    if (!user) {
      setError('Please log in to edit a gig.');
      return;
    }
    setGigToEdit(gig);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setGigToEdit(null);
    setDemandToEdit(null);
    setIsModalOpen(false);
  };

  const handleCreatePostClick = (isGig) => {
    if (!hasProfileInfo) {
      setError('Please complete your profile before posting');
      setShowProfileForm(true);
      return;
    }
    
    setIsGigForm(isGig);
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar 
        user={user}
        onPostGig={() => handleCreatePostClick(true)}
        onPostDemand={() => handleCreatePostClick(false)}
        onProfile={() => setShowProfileForm(true)}
        onLogOut={logOut}
      />
      
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Gigs Column */}
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h2 className="text-sm font-medium text-white">Gigs ({gigs.length})</h2>
            </div>
            <div className="space-y-3">
              {gigs.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                />
              ))}
            </div>
          </div>

          {/* Demands Column */}
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <h2 className="text-sm font-medium text-white">Demands ({demands.length})</h2>
            </div>
            <div className="space-y-3">
              {demands.map((demand) => (
                <DemandCard
                  key={demand.id}
                  demand={demand}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {isGigForm ? (
          <GigForm
            onAddGig={addGig}
            onUpdateGig={updateGig}
            onClose={closeModal}
            gigToEdit={gigToEdit}
          />
        ) : (
          <DemandForm
            onAddDemand={addDemand}
            onUpdateDemand={updateDemand}
            onClose={closeModal}
            demandToEdit={demandToEdit}
          />
        )}
      </Modal>

      {showProfileForm && (
        <Modal isOpen={showProfileForm} onClose={() => setShowProfileForm(false)}>
          <ProfileForm 
            user={user}
            onClose={() => setShowProfileForm(false)}
            onProfileUpdate={(profile) => {
              setUserProfile(profile);
              setHasProfileInfo(true);
              fetchGigs();
              fetchDemands();
            }}
          />
        </Modal>
      )}
    </div>
  );
}