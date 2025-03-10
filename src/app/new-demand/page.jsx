'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NewDemandPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Available categories
  const categories = [
    'Web Development',
    'Mobile Development',
    'Logo Design',
    'Graphic Design',
    'Content Writing',
    'Translation',
    'Social Media',
    'Marketing',
    'Video Editing',
    'Other'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session?.user) {
        // Redirect to login if not authenticated
        router.push('/');
        return;
      }
      
      setUser(data.session.user);
      
      // Check if profile is complete
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (!profileData || !profileData.full_name || !profileData.username) {
          // Redirect to edit profile page if profile is incomplete
          router.push('/edit-profile');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        router.push('/edit-profile');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !budget || !category) {
      setError('Please fill out all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newDemand = {
        title,
        description,
        budget: Number(budget),
        category,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('demands')
        .insert(newDemand)
        .select();
        
      if (error) throw error;
      
      // Redirect to the home page with demands tab active
      router.push('/?tab=demands');
    } catch (error) {
      console.error('Error creating demand:', error);
      setError('Failed to create demand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-[#181818] rounded-lg p-6 border border-gray-800">
          <h1 className="text-2xl font-bold mb-6">Create a New Demand</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Demand Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Need a Website Designer"
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you need..."
                rows={6}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="budget" className="block text-sm font-medium mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 500"
                min="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mr-4 px-6 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Post Demand'}
              </button>
            </div>
          </form>
        </div>
      </main>
  
    </div>
  );
} 