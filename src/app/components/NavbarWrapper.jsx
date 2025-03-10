'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { useRouter } from 'next/navigation';

export default function NavbarWrapper() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle messages
  const handleMessages = (userId, userName) => {
    setChatRecipientId(userId);
    setChatRecipientName(userName);
  };

  // Toggle messages
  const handleToggleMessages = (userId, userName) => {
    setChatRecipientId(userId);
    setChatRecipientName(userName);
    setIsChatOpen(true);
  };

  // Handle profile click
  const handleProfile = () => {
    setShowProfileForm(true);
  };

  // Only render Navbar if user is logged in
  if (!user) return null;

  return (
    <Navbar
      user={user}
      onLogOut={logOut}
      onProfile={handleProfile}
      onMessages={handleMessages}
      onToggleMessages={handleToggleMessages}
    />
  );
} 