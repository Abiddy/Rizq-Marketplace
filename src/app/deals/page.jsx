'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon, ClockIcon, XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

// Custom HandshakeIcon component
const HandshakeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);

// Add a new helper function to get profile URL
const getProfileUrl = (profile) => {
  if (!profile) return '#';
  return `/profile/${profile.username || profile.id}`;
};

// Add a UserLink component
const UserLink = ({ profile, isCurrentUser }) => {
  const displayName = isCurrentUser ? 'You' : (profile?.full_name || 'Unknown User');
  
  if (isCurrentUser) {
    return <span className="text-blue-400">{displayName}</span>;
  }
  
  return (
    <Link 
      href={getProfileUrl(profile)} 
      className="text-blue-400 hover:text-blue-300 transition-colors"
    >
      {displayName}
    </Link>
  );
};

export default function ActiveDeals() {
  const [user, setUser] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add new state for reply functionality
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        fetchDeals(data.session.user.id);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/';
      }
    };
    
    checkAuth();
  }, []);
  
  const fetchDeals = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching deals for user ID:", userId);
      
      // Fetch both sent and received deals
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          initiator:profiles!initiator_id(*),
          recipient:profiles!recipient_id(*)
        `)
        .or(`initiator_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Supabase error fetching deals:", error);
        throw error;
      }
      
      console.log("Deals fetched:", data);
      
      // Now fetch gig and demand details separately
      if (data && data.length > 0) {
        // Create a function to fetch related items
        const fetchRelatedItems = async (deals) => {
          const gigIds = deals
            .flatMap(deal => [
              deal.initiator_item_type === 'gig' ? deal.initiator_item_id : null,
              deal.recipient_item_type === 'gig' ? deal.recipient_item_id : null
            ])
            .filter(id => id !== null);

          const demandIds = deals
            .flatMap(deal => [
              deal.initiator_item_type === 'demand' ? deal.initiator_item_id : null,
              deal.recipient_item_type === 'demand' ? deal.recipient_item_id : null
            ])
            .filter(id => id !== null);
          
          // Fetch gigs
          let gigs = [];
          if (gigIds.length > 0) {
            const { data: gigsData, error: gigsError } = await supabase
              .from('gigs')
              .select('*')
              .in('id', gigIds);
              
            if (gigsError) {
              console.error("Error fetching gigs:", gigsError);
            } else {
              gigs = gigsData || [];
              console.log("Fetched gigs:", gigs);
            }
          }
          
          // Fetch demands
          let demands = [];
          if (demandIds.length > 0) {
            const { data: demandsData, error: demandsError } = await supabase
              .from('demands')
              .select('*')
              .in('id', demandIds);
              
            if (demandsError) {
              console.error("Error fetching demands:", demandsError);
            } else {
              demands = demandsData || [];
              console.log("Fetched demands:", demands);
            }
          }
          
          // Attach gigs and demands to deals
          return deals.map(deal => {
            const updatedDeal = { ...deal };
            
            // Attach initiator item
            if (deal.initiator_item_type === 'gig') {
              updatedDeal.initiator_gig = gigs.find(g => g.id === deal.initiator_item_id) || null;
            } else if (deal.initiator_item_type === 'demand') {
              updatedDeal.initiator_demand = demands.find(d => d.id === deal.initiator_item_id) || null;
            }
            
            // Attach recipient item
            if (deal.recipient_item_type === 'gig') {
              updatedDeal.recipient_gig = gigs.find(g => g.id === deal.recipient_item_id) || null;
            } else if (deal.recipient_item_type === 'demand') {
              updatedDeal.recipient_demand = demands.find(d => d.id === deal.recipient_item_id) || null;
            }
            
            return updatedDeal;
          });
        };
        
        // Fetch and attach related items
        const dealsWithItems = await fetchRelatedItems(data);
        setDeals(dealsWithItems);
      } else {
        setDeals([]);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setDeals([]); // Set empty deals on error
    } finally {
      setLoading(false);
    }
  };
  
  const updateDealStatus = async (dealId, newStatus) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId);
        
      if (error) throw error;
      
      // Refresh deals after update
      fetchDeals(user.id);
    } catch (err) {
      console.error('Error updating deal status:', err);
    }
  };
  
  // Filter deals by status
  const pendingDeals = deals.filter(deal => deal.status === 'pending');
  const activeDeals = deals.filter(deal => deal.status === 'active');
  const completedDeals = deals.filter(deal => deal.status === 'completed');
  
  console.log("Deals by status:", {
    pending: pendingDeals.length,
    active: activeDeals.length,
    completed: completedDeals.length
  });
  
  // Helper function to get deal item title
  const getDealItemTitle = (deal, party) => {
    try {
      if (!deal) return 'Unknown Item';
      
      if (party === 'initiator') {
        if (deal.initiator_item_type === 'gig' && deal.initiator_gig) {
          return deal.initiator_gig.title || 'Unavailable Gig';
        } else if (deal.initiator_item_type === 'demand' && deal.initiator_demand) {
          return deal.initiator_demand.title || 'Unavailable Demand';
        }
      } else {
        if (deal.recipient_item_type === 'gig' && deal.recipient_gig) {
          return deal.recipient_gig.title || 'Unavailable Gig';
        } else if (deal.recipient_item_type === 'demand' && deal.recipient_demand) {
          return deal.recipient_demand.title || 'Unavailable Demand';
        }
      }
      return 'Unavailable Item';
    } catch (err) {
      console.error(`Error getting item title for ${party}:`, err, deal);
      return 'Error displaying title';
    }
  };
  
  // Helper function to get deal item amount
  const getDealItemAmount = (deal, party) => {
    try {
      if (!deal) return null;
      
      if (party === 'initiator') {
        if (deal.initiator_item_type === 'gig' && deal.initiator_gig) {
          return deal.initiator_gig.price;
        } else if (deal.initiator_item_type === 'demand' && deal.initiator_demand) {
          return deal.initiator_demand.budget;
        }
      } else {
        if (deal.recipient_item_type === 'gig' && deal.recipient_gig) {
          return deal.recipient_gig.price;
        } else if (deal.recipient_item_type === 'demand' && deal.recipient_demand) {
          return deal.recipient_demand.budget;
        }
      }
      return null;
    } catch (err) {
      console.error(`Error getting item amount for ${party}:`, err, deal);
      return null;
    }
  };
  
  // Add function to handle sending replies
  const sendReply = async (dealId, recipientId) => {
    try {
      setSendingReply(true);
      
      // Create a new message in the messages table
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: replyMessage
        });

      if (error) throw error;
      
      // Clear the reply input
      setReplyMessage('');
      
      // Show success feedback
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4 sm:mb-8 px-2 sm:px-0">Active Deals</h1>
      
      <div className="bg-[#121212] rounded-lg p-2 sm:p-4 md:p-6 shadow-md">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4 sm:mb-6 bg-[#2A2A2A] p-1 sm:p-1.5 rounded-md flex flex-wrap gap-1 sm:gap-2 sm:flex-nowrap">
            <TabsTrigger 
              value="pending" 
              className="flex-1 flex items-center justify-center gap-2 text-white data-[state=active]:bg-blue-500"
            >
              <ClockIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
              {pendingDeals.length > 0 && (
                <span className="bg-blue-500/20 text-blue-400 data-[state=active]:text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingDeals.length}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="active" 
              className="flex-1 flex items-center justify-center gap-2 text-white data-[state=active]:bg-green-500"
            >
              {/* <HandshakeIcon className="h-4 w-4" /> */}
              <span className="hidden sm:inline">Active</span>
              {activeDeals.length > 0 && (
                <span className="bg-green-500/20 text-green-400 data-[state=active]:text-white text-xs px-2 py-0.5 rounded-full">
                  {activeDeals.length}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="completed" 
              className="flex-1 flex items-center justify-center gap-2 text-white data-[state=active]:bg-purple-500"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
              {completedDeals.length > 0 && (
                <span className="bg-purple-500/20 text-purple-400 data-[state=active]:text-white text-xs px-2 py-0.5 rounded-full">
                  {completedDeals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Pending Deals Tab Panel */}
          <TabsContent value="pending">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-[#1A1A1A] rounded-lg h-32"></div>
                ))}
              </div>
            ) : pendingDeals.length === 0 ? (
              <div className="text-center py-6 sm:py-8 bg-[#1A1A1A] rounded-lg">
                <p className="text-gray-400">No pending deals</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pendingDeals.map(deal => (
                  <div key={deal.id} className="bg-[#1A1A1A] rounded-lg p-3 sm:p-4 border border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-1 rounded">
                          {deal.initiator_id === user?.id ? 'Outgoing Request' : 'Incoming Request'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Requested {new Date(deal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Deal items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">
                          Offered by <UserLink 
                            profile={deal.initiator} 
                            isCurrentUser={deal.initiator_id === user?.id} 
                          />
                        </p>
                        <p className="text-white font-medium break-words">{getDealItemTitle(deal, 'initiator')}</p>
                        {getDealItemAmount(deal, 'initiator') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'initiator')}</p>
                        )}
                      </div>
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">
                          Requested from <UserLink 
                            profile={deal.recipient} 
                            isCurrentUser={deal.recipient_id === user?.id} 
                          />
                        </p>
                        <p className="text-sm text-gray-400 mb-1">Requested from {deal.recipient_id === user?.id ? 'You' : deal.recipient.full_name}</p>
                        <p className="text-white font-medium break-words">{getDealItemTitle(deal, 'recipient')}</p>
                        {getDealItemAmount(deal, 'recipient') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'recipient')}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Message with Reply */}
                    {deal.message && (
                      <div className="bg-gray-800/30 p-2 sm:p-3 rounded mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <p className="text-sm text-gray-400">Message:</p>
                          <button
                            onClick={() => {
                              const recipientId = deal.initiator_id === user?.id ? deal.recipient_id : deal.initiator_id;
                              sendReply(deal.id, recipientId);
                            }}
                            className="flex items-center text-blue-400 text-sm hover:text-blue-300 transition-colors"
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            Reply
                          </button>
                        </div>
                        <p className="text-gray-300 mb-3 break-words">{deal.message}</p>
                        
                        {/* Reply Input */}
                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              const recipientId = deal.initiator_id === user?.id ? deal.recipient_id : deal.initiator_id;
                              sendReply(deal.id, recipientId);
                            }}
                            disabled={!replyMessage.trim() || sendingReply}
                            className={`px-3 py-1.5 rounded text-sm flex items-center justify-center ${
                              !replyMessage.trim() || sendingReply
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {sendingReply ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    {deal.recipient_id === user?.id && (
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                        <button 
                          onClick={() => updateDealStatus(deal.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 transition-colors flex items-center justify-center"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                        <button 
                          onClick={() => updateDealStatus(deal.id, 'active')}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded hover:bg-green-500/30 transition-colors flex items-center justify-center"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Active Deals Tab Panel */}
          <TabsContent value="active">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-[#1A1A1A] rounded-lg h-32"></div>
                ))}
              </div>
            ) : activeDeals.length === 0 ? (
              <div className="text-center py-6 sm:py-8 bg-[#1A1A1A] rounded-lg">
                <p className="text-gray-400">No active deals</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeDeals.map(deal => (
                  <div key={deal.id} className="bg-[#1A1A1A] rounded-lg p-3 sm:p-4 border border-gray-800">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Started {new Date(deal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Deal items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Offered by {deal.initiator_id === user?.id ? 'You' : deal.initiator.full_name}</p>
                        <p className="text-white font-medium">{getDealItemTitle(deal, 'initiator')}</p>
                        {getDealItemAmount(deal, 'initiator') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'initiator')}</p>
                        )}
                      </div>
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Provided by {deal.recipient_id === user?.id ? 'You' : deal.recipient.full_name}</p>
                        <p className="text-white font-medium">{getDealItemTitle(deal, 'recipient')}</p>
                        {getDealItemAmount(deal, 'recipient') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'recipient')}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => updateDealStatus(deal.id, 'completed')}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm rounded hover:bg-purple-500/30 transition-colors flex items-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Completed Deals Tab Panel */}
          <TabsContent value="completed">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-[#1A1A1A] rounded-lg h-32"></div>
                ))}
              </div>
            ) : completedDeals.length === 0 ? (
              <div className="text-center py-6 sm:py-8 bg-[#1A1A1A] rounded-lg">
                <p className="text-gray-400">No completed deals yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {completedDeals.map(deal => (
                  <div key={deal.id} className="bg-[#1A1A1A] rounded-lg p-3 sm:p-4 border border-gray-800 opacity-80">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-purple-400 text-xs bg-purple-400/10 px-2 py-1 rounded">
                          Completed
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Completed {new Date(deal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Deal items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Offered by {deal.initiator_id === user?.id ? 'You' : deal.initiator.full_name}</p>
                        <p className="text-white font-medium">{getDealItemTitle(deal, 'initiator')}</p>
                        {getDealItemAmount(deal, 'initiator') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'initiator')}</p>
                        )}
                      </div>
                      <div className="bg-gray-800/50 p-2 sm:p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Requested from {deal.recipient_id === user?.id ? 'You' : deal.recipient.full_name}</p>
                        <p className="text-white font-medium">{getDealItemTitle(deal, 'recipient')}</p>
                        {getDealItemAmount(deal, 'recipient') && (
                          <p className="text-green-400 font-medium">${getDealItemAmount(deal, 'recipient')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 