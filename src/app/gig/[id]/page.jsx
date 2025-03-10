'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ShareIcon, ChevronLeftIcon, ChevronRightIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import ChatBox from '@/app/components/ChatBox';

export default function GigDetail() {
  const params = useParams();
  const router = useRouter();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState(null);
  const [chatRecipientName, setChatRecipientName] = useState('');
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkAuth();
    fetchGig();
  }, [params.id]);
  
  const fetchGig = async () => {
    try {
      setLoading(true);
      
      // Fetch the gig
      const { data: gig, error } = await supabase
        .from('gigs')
        .select('*, user_id')
        .eq('id', params.id)
        .single();
      
      if (error) throw error;
      
      // Fetch profile for the gig
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', gig.user_id)
        .single();
      
      if (profileError) console.error('Error fetching profile:', profileError);
      
      setGig({
        ...gig,
        profile: profile || null
      });
    } catch (error) {
      console.error('Error fetching gig:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const nextImage = () => {
    if (!gig?.images || gig.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % gig.images.length);
  };
  
  const prevImage = () => {
    if (!gig?.images || gig.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + gig.images.length) % gig.images.length);
  };
  
  const handleContactClick = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    if (gig.user_id === user.id) {
      alert("You cannot message yourself!");
      return;
    }
    
    setChatRecipientId(gig.user_id);
    setChatRecipientName(gig.profile?.full_name || 'Seller');
    
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gig ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Images */}
            <div className="lg:col-span-2">
              <div className="relative bg-[#121212] rounded-lg overflow-hidden aspect-video mb-4">
                {gig.images && gig.images.length > 0 ? (
                  <>
                    <img 
                      src={gig.images[currentImageIndex]} 
                      alt={gig.title}
                      className="w-full h-full object-contain"
                    />
                    
                    {gig.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage} 
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
                        >
                          <ChevronLeftIcon className="h-6 w-6 text-white" />
                        </button>
                        
                        <button 
                          onClick={nextImage} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
                        >
                          <ChevronRightIcon className="h-6 w-6 text-white" />
                        </button>
                        
                        {/* Dots indicator */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          {gig.images.map((_, index) => (
                            <button 
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 rounded-full transition-all ${
                                index === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-2xl font-bold text-white/30">
                      No Images
                    </div>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
              
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-sm font-medium">
                  {gig.category}
                </span>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 whitespace-pre-line">{gig.description}</p>
              </div>
            </div>
            
            {/* Right column - Seller info & actions */}
            <div>
              <div className="bg-[#121212] rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                    {gig.profile?.avatar_url ? (
                      <img 
                        src={gig.profile.avatar_url} 
                        alt={gig.profile.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold">
                        {gig.profile?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{gig.profile?.full_name || 'User'}</h3>
                    <p className="text-gray-400 text-sm">{gig.profile?.company_name || '@user'}</p>
                  </div>
                </div>
                
                <div className="mb-6 pb-6 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Price</span>
                    <span className="text-2xl font-bold">${Number(gig.price).toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleContactClick}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors mb-3"
                >
                  <ChatBubbleOvalLeftIcon className="h-5 w-5 inline mr-2" />
                  Contact Seller
                </button>
                
                <button
                  className="w-full py-3 px-4 border border-gray-700 hover:bg-gray-800 rounded-md text-white transition-colors flex items-center justify-center"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share Gig
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
            <p className="text-gray-400 mb-6">The gig you're looking for might have been removed or doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>
      
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