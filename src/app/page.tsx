'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import GigCard from './components/GigCard';
import DemandCard from './components/DemandCard';
import SearchBar from './components/SearchBar';
import Modal from './components/Modal';
import ProfileForm from './components/ProfileForm';
import ProfilePrompt from './components/ProfilePrompt';
import Link from 'next/link';
import AuthForm from './components/AuthForm';
import { User } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';

// Add type definitions for your Gig and Demand objects
type Profile = {
  id: string;
  full_name?: string;
  company_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  contact_email?: string;
  skills?: string[];
  // Replace any with unknown for better type safety
  [key: string]: unknown;
}

type Gig = {
  id: string;
  title: string;
  description: string;
  rate?: number;
  user_id: string;
  created_at: string;
  profile?: Profile | null;
  // Replace any with unknown
  [key: string]: unknown;
}

type Demand = {
  id: string;
  title: string;
  description: string;
  budget?: number;
  user_id: string;
  created_at: string;
  profile?: Profile | null;
  // Replace any with unknown
  [key: string]: unknown;
}

// Add type for chat-related state
// type ChatRecipient = string | null;

// Add a type for error messages
type ErrorMessage = string | null;

export default function Home() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('gigs');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  // These variables are used in the component - let's keep them
  // but add "// eslint-disable-next-line" comments to suppress the warnings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasProfileInfo, setHasProfileInfo] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<ErrorMessage>(null);
  
  // Chat-related state
  // const { openChat } = useChat();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        // Check if profile is complete
        checkProfileCompleteness(data.session.user.id);
        
        // Fetch gigs and demands
        fetchGigs();
        fetchDemands();
        
        // Fetch user profiles
        fetchProfiles();
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGigs();
        fetchDemands();
        
        // Check if profile is complete for new user
        checkProfileCompleteness(session.user.id);
        fetchProfiles();
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkProfileCompleteness = async (userId: string) => {
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

        // Attach profiles to gigs and ensure type compliance
        const gigsWithProfiles = data.map(gig => ({
          ...gig,
          profile: profiles?.find(profile => profile.id === gig.user_id) || null
        })) as Gig[];
        
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
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, company_name, avatar_url')
          .in('id', userIds);
        
        if (profileError) {
          console.error('Error fetching profiles for demands:', profileError);
        }

        // Attach profiles to demands
        const demandsWithProfiles = data.map(demand => ({
          ...demand,
          profile: profiles?.find(profile => profile.id === demand.user_id) || null
        })) as Demand[];
        
        setDemands(demandsWithProfiles);
      } else {
        setDemands([]);
      }
    } catch (err) {
      console.error('Error fetching demands:', err);
    }
  };

  if (!user) {
    if (showAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <AuthForm onBack={() => setShowAuth(false)} />
        </div>
      );
    }
    
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
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
            onProfileUpdate={(profile: Profile) => {
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
    </div>
  );
}