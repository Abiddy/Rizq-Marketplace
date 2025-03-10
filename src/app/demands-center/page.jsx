'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Footer from '../components/Footer';
import DemandCard from '../components/DemandCardCompact';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchBar from '../components/SearchBar';

function DemandsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demands, setDemands] = useState([]);
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    // Get search parameter from URL if present 
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      setIsSearching(true);
      // We'll handle the actual filtering in the other useEffect after demands are loaded
    }
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    checkAuth();
    fetchDemands();
  }, [searchParams]);
  
  const fetchDemands = async () => {
    try {
      setLoading(true);
      
      // Fetch all demands
      const { data, error } = await supabase
        .from('demands')
        .select('*, user_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles for the demands
      const userIds = [...new Set(data.map(demand => demand.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, company_name, avatar_url')
        .in('id', userIds);
        
      // Attach profile data to demands
      const demandsWithProfiles = data.map(demand => ({
        ...demand,
        profile: profiles?.find(profile => profile.id === demand.user_id) || null
      }));
      
      // Organize demands by category
      const categorizedDemands = {};
      categorizedDemands['all'] = demandsWithProfiles;
      
      demandsWithProfiles.forEach(demand => {
        if (!categorizedDemands[demand.category]) {
          categorizedDemands[demand.category] = [];
        }
        categorizedDemands[demand.category].push(demand);
      });
      
      setDemands(demandsWithProfiles);
      setCategories(categorizedDemands);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demands:', error);
      setLoading(false);
    }
  };
  
  const handleContactClick = (userId, userName) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Don't allow chatting with yourself
    if (userId === user.id) {
      alert('You cannot message yourself');
      return;
    }
    
    // Use the global chat handler if available
    if (typeof window !== 'undefined' && window.openChatWith) {
      window.openChatWith(userId, userName);
    } else {
      // Fallback
      window.initiateChatWith = {
        userId,
        userName
      };
    }
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Update URL to reflect category
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (category === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      router.replace(url.pathname + url.search);
    }
  };

  // Function to filter demands based on search query
  const filterDemandsBySearch = (demandsArray, query) => {
    if (!query || !query.trim()) return demandsArray;
    
    const lowercaseQuery = query.toLowerCase().trim();
    return demandsArray.filter(demand => {
      // Check title
      const titleMatch = demand.title?.toLowerCase().includes(lowercaseQuery);
      // Check description
      const descMatch = demand.description?.toLowerCase().includes(lowercaseQuery);
      // Check budget - match if the search is a number within 20% of the budget
      let budgetMatch = false;
      if (!isNaN(parseFloat(lowercaseQuery))) {
        const searchBudget = parseFloat(lowercaseQuery);
        const demandBudget = parseFloat(demand.budget);
        budgetMatch = Math.abs(searchBudget - demandBudget) / demandBudget <= 0.2;
      }
      // Check category
      const categoryMatch = demand.category?.toLowerCase().includes(lowercaseQuery);
      
      return titleMatch || descMatch || budgetMatch || categoryMatch;
    });
  };

  // This effect will run whenever searchQuery or demands changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() && demands.length > 0) {
      const results = filterDemandsBySearch(demands, searchQuery);
      setSearchResults(results);
      setIsSearching(true);
    }
  }, [searchQuery, demands]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      const results = filterDemandsBySearch(demands, e.target.value);
      setSearchResults(results);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const performSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = filterDemandsBySearch(demands, searchQuery);
      setSearchResults(results);
      setIsSearching(true);
      
      // Update URL to reflect search
      const url = new URL(window.location);
      url.searchParams.set('search', searchQuery);
      router.replace(url.pathname + url.search);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    
    // Remove search parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('search');
    router.replace(url.pathname + url.search);
  };

  // Function to handle search
  const handleSearch = (query) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // Update the URL with the new search parameter
    router.push(`/demands-center?${params.toString()}`);
    
    // Update local state
    setSearchQuery(query);
    setIsSearching(!!query);
    
    // Filter demands based on search query
    if (query) {
      const filtered = demands.filter(demand => 
        demand.title.toLowerCase().includes(query.toLowerCase()) ||
        demand.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
      // Reset to showing all demands by category
      fetchDemands();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Demands Center</h1>
          <button
            onClick={() => router.push('/new-demand')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Post a Demand
          </button>
        </div>
        
        <div className="mb-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}>
            <div className="flex items-center bg-[#181818] border border-gray-700 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search for demands, projects, budgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-gray-500"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 flex items-center transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span className="ml-2 font-medium hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
        
        {/* Display search results or categorized demands */}
        {isSearching ? (
          <div>
            {/* Search results indicator */}
            <div className="mb-4 flex items-center justify-between bg-gray-800 p-3 rounded-md">
              <div>
                <span className="text-gray-300">Search results for: </span>
                <span className="font-medium text-white">{searchQuery}</span>
                <span className="ml-2 text-gray-400">({searchResults.length} results)</span>
              </div>
              <button 
                onClick={clearSearch}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            
            {/* Search results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(demand => (
                <DemandCard
                  key={demand.id}
                  demand={demand}
                  onContactClick={() => handleContactClick(demand.user_id, demand.profile?.full_name || 'User')}
                />
              ))}
              
              {searchResults.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-400">
                  No demands found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Category selector */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                    activeCategory === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Categories
                </button>
                
                {Object.keys(categories).filter(cat => cat !== 'all').map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                      activeCategory === category 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Demands grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(categories[activeCategory] || []).map(demand => (
                    <DemandCard
                      key={demand.id}
                      demand={demand}
                      onContactClick={() => handleContactClick(demand.user_id, demand.profile?.full_name || 'User')}
                    />
                  ))}
                  
                  {(categories[activeCategory] || []).length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      No demands found in this category.
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function DemandsCenterPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading demands...</div>}>
        <DemandsContent />
      </Suspense>
    </div>
  );
} 