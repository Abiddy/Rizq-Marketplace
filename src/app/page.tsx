'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
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
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import ProfilePrompt from './components/ProfilePrompt';
import Link from 'next/link';
import SearchBar from './components/SearchBar';

export default function Home() {
  const router = useRouter();
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
  
  // New state for mobile
  const [activeTab, setActiveTab] = useState('gigs');

  // Add these state variables in the Home component
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');

  // Add these new state variables
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isMessagesPanelMinimized, setIsMessagesPanelMinimized] = useState(false);

  // Add state for profile prompt
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Add loading state
  const [loading, setLoading] = useState(true);

  // Fetch both gigs and demands
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        // Check if profile is complete
        checkProfileCompleteness(data.session.user.id);
      }
      
      setLoading(false);
    };
    
    const fetchListings = async () => {
      fetchGigs();
      fetchDemands();
      fetchProfiles();
    };
    
    checkAuth();
    fetchListings();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGigs();
        fetchDemands();
        fetchProfiles();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkProfileCompleteness = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Check if essential profile fields are missing
      const isProfileIncomplete = !data || 
        !data.full_name || 
        !data.username;
      
      if (isProfileIncomplete) {
        // Redirect directly to edit profile instead of showing a modal
        router.push('/edit-profile');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

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

  const handleMessages = (userId, userName) => {
    setChatRecipientId(userId);
    setChatRecipientName(userName);
  };

  const handleToggleMessages = (userId, userName) => {
    setChatRecipientId(userId);
    setChatRecipientName(userName);
    setIsChatOpen(true);
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
        onLogOut={logOut}
        onProfile={() => setShowProfileForm(true)}
        onMessages={handleMessages}
        onToggleMessages={handleToggleMessages}
      />
      
      {/* Add SearchBar here with top margin - just for gigs */}
      <div className="mt-8 mb-6">
        <SearchBar />
      </div>
      
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Gigs ({gigs.length})
              </h2>
              <Link 
                href="/gigs-center" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View All Gigs
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gigs.map((gig) => (
                <div key={gig.id} className="transform transition hover:scale-[1.02]">
                  <GigCard
                    gig={gig}
                    onContactClick={handleContactClick}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Demands Column */}
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Demands ({demands.length})
              </h2>
              <Link 
                href="/demands-center" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View All Demands
              </Link>
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

      {showProfilePrompt && (
        <Modal isOpen={showProfilePrompt} onClose={() => setShowProfilePrompt(false)}>
          <ProfilePrompt 
            onComplete={() => {
              setShowProfilePrompt(false);
              setShowProfileForm(true);
            }}
            onCancel={() => setShowProfilePrompt(false)}
          />
        </Modal>
      )}

      Chat Box
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