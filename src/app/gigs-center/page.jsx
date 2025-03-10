'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GigCard from '../components/GigCard';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import Link from 'next/link';

// Create a client component wrapper for the search params functionality
function GigsWithSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredGigs, setFilteredGigs] = useState([]);
  
  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkAuth();
  }, []);
  
  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    
    // Get search parameter from URL if present
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      setIsSearching(true);
      // We'll handle the actual filtering in the other useEffect after gigs are loaded
    }
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    fetchGigs();
  }, [searchParams]);
  
  // Handle search and category filtering
  useEffect(() => {
    if (gigs.length > 0) {
      let filtered = [...gigs];
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(gig => 
          gig.title?.toLowerCase().includes(query) || 
          gig.description?.toLowerCase().includes(query)
        );
      }
      
      // Category filter
      if (activeCategory !== 'All Categories') {
        filtered = filtered.filter(gig => gig.category === activeCategory);
      }
      
      setFilteredGigs(filtered);
    } else {
      setFilteredGigs([]);
    }
  }, [gigs, searchQuery, activeCategory]);
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(!!query);
    
    // Update URL without page reload
    if (query) {
      router.push(`/gigs-center?search=${encodeURIComponent(query)}`);
    } else {
      router.push('/gigs-center');
    }
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Update URL without page reload
    if (category !== 'All Categories') {
      router.push(`/gigs-center?category=${encodeURIComponent(category)}`);
    } else {
      router.push('/gigs-center');
    }
  };
  
  const handleContactClick = (userId, userName) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Implement contact logic
    // For now, this could just open a chat modal or navigate to messages
    router.push(`/messages?recipient=${userId}`);
  };

  return (
    <div className="space-y-4">
      {/* Your existing UI */}
      {filteredGigs.map((gig) => (
        <GigCard
          key={gig.id}
          gig={gig}
          onContactClick={handleContactClick}
        />
      ))}
      {filteredGigs.length === 0 && !loading && (
        <p className="text-center text-gray-400 py-8">No gigs found</p>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function GigsCenter() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      
      <div className="mt-8 mb-6">
        <SearchBar />
      </div>
      
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <div className="bg-[#181818] rounded-lg p-4 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-medium text-white">All Gigs</h1>
            <Link 
              href="/"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
          
          {/* Wrap the component that uses useSearchParams in Suspense */}
          <Suspense fallback={<div className="text-center py-8">Loading gigs...</div>}>
            <GigsWithSearch />
          </Suspense>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 