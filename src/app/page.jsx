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
import ChatBox from './components/ChatBox';
import MessagesPanel from './components/MessagesPanel';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

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
  
  // New state for mobile toggle
  const [activeTab, setActiveTab] = useState('gigs');

  // Add these state variables in the Home component
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');

  // Add these new state variables
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isMessagesPanelMinimized, setIsMessagesPanelMinimized] = useState(false);

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

  // Add this function to handle opening the chat
  const handleContactClick = (userId, userName) => {
    if (!user) {
      setError('Please log in to contact users');
      return;
    }
    
    // Don't allow chatting with yourself
    if (userId === user.id) {
      setError('You cannot message yourself');
      return;
    }
    
    setChatRecipientId(userId);
    setChatRecipientName(userName);
    setIsChatOpen(true);
  };

  // Add this function to handle selecting a conversation
  const handleSelectConversation = (userId, userName) => {
    setChatRecipientId(userId);
    setChatRecipientName(userName);
    setIsChatOpen(true);
    
    // On mobile, close the messages panel when a conversation is selected
    if (window.innerWidth < 768) {
      setIsMessagesOpen(false);
    }
  };

  // Add this function to toggle the messages panel
  const toggleMessages = () => {
    setIsMessagesOpen(!isMessagesOpen);
    setIsMessagesPanelMinimized(false);
  };

  // Add this function to minimize/maximize the messages panel
  const toggleMinimizeMessages = () => {
    setIsMessagesPanelMinimized(!isMessagesPanelMinimized);
  };

  // Create a FloatingMessagesButton component for desktop
  const FloatingMessagesButton = () => (
    <button
      onClick={toggleMessages}
      className="hidden md:flex fixed bottom-4 right-4 z-30 bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 transition-colors"
      aria-label="Messages"
    >
      <ChatBubbleOvalLeftIcon className="w-6 h-6" />
    </button>
  );

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
        onToggleMessages={toggleMessages}
      />
      
      {/* Mobile Toggle */}
      <div className="md:hidden bg-[#181818] p-2 flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('gigs')}
          className={`flex-1 py-2 text-sm rounded-l-md ${
            activeTab === 'gigs' 
              ? 'bg-orange-500/20 text-white font-medium' 
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Gigs ({gigs.length})
        </button>
        <button
          onClick={() => setActiveTab('demands')}
          className={`flex-1 py-2 text-sm rounded-r-md ${
            activeTab === 'demands' 
              ? 'bg-yellow-500/20 text-white font-medium' 
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Demands ({demands.length})
        </button>
      </div>
      
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Desktop View - 2 columns */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
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
                  onContactClick={handleContactClick}
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
                  onContactClick={handleContactClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View - Single column with toggle */}
        <div className="md:hidden">
          {activeTab === 'gigs' && (
            <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
              <div className="space-y-3">
                {gigs.map((gig) => (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    onContactClick={handleContactClick}
                  />
                ))}
                {gigs.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No gigs available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'demands' && (
            <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
              <div className="space-y-3">
                {demands.map((demand) => (
                  <DemandCard
                    key={demand.id}
                    demand={demand}
                    onContactClick={handleContactClick}
                  />
                ))}
                {demands.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No demands available</p>
                )}
              </div>
            </div>
          )}
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

      {/* Messages Panel */}
      {user && (
        <>
          {!isMessagesOpen && <FloatingMessagesButton />}
          <MessagesPanel
            isOpen={isMessagesOpen}
            onToggle={toggleMessages}
            currentUser={user}
            onSelectConversation={handleSelectConversation}
            minimized={isMessagesPanelMinimized}
            onMinimize={toggleMinimizeMessages}
          />
        </>
      )}

      {/* Chat Box */}
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