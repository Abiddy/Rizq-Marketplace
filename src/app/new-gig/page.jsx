'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import GigForm from '../components/GigForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NewGig() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.push('/auth');
        return;
      }
      
      setUser(data.session.user);
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);
  
  const handleSubmit = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .insert([{
          ...formData,
          user_id: user.id,
        }]);
        
      if (error) throw error;
      
      router.push('/');
    } catch (error) {
      console.error('Error creating gig:', error);
      alert('Failed to create gig. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-grow flex items-center justify-center p-4 py-8">
        <GigForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/')}
          user={user}
        />
      </main>
      
      <Footer />
    </div>
  );
} 