'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePrompt({ isComplete, onClose }) {
  const router = useRouter();

  // If the profile is incomplete, redirect directly to the edit profile page
  useEffect(() => {
    if (!isComplete) {
      router.push('/edit-profile');
    }
  }, [isComplete]);

  // This component won't render anything as we're redirecting instead
  return null;
} 