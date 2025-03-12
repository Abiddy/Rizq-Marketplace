'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Navbar from './Navbar';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NavbarWrapper() {
  const { user, logOut } = useAuth();
  const { openChat } = useChat();
  const router = useRouter();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile from Supabase when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
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
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Handle profile click
  const handleProfile = () => {
    setShowProfileForm(true);
  };

  // Handle messages and toggle messages both use the global chat context
  const handleMessages = (userId, userName) => {
    openChat(userId, userName);
  };

  // Only render Navbar if user is logged in
  if (!user) return null;

  return (
    <Navbar
      user={user}
      userProfile={userProfile}
      onLogOut={logOut}
      onProfile={handleProfile}
      onMessages={handleMessages}
      onToggleMessages={handleMessages}
    />
  );
} 