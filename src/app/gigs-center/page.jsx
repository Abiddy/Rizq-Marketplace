'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GigCard from '../components/GigCard';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';

export default function GigsCenter() {
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Gigs</h1>
          <SearchBar 
            initialQuery={searchQuery} 
            onSearch={handleSearch} 
            placeholder="Search for gigs..."
          />
        </div>
        
        <FilterBar 
          categories={['All Categories', 'Web Development', 'Mobile Development', 'Logo Design', 'Graphic Design', 'Content Writing', 'Translation', 'Social Media', 'Marketing', 'Video Editing']}
          activeCategory={activeCategory}
          onSelectCategory={handleCategoryChange}
        />
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {isSearching && (
              <div className="mb-4 text-gray-400">
                {filteredGigs.length} results found for "{searchQuery}"
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {filteredGigs.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  onContactClick={handleContactClick}
                />
              ))}
              
              {filteredGigs.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-xl text-gray-400 mb-4">No gigs found</p>
                  {isSearching && (
                    <button 
                      onClick={() => handleSearch('')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 