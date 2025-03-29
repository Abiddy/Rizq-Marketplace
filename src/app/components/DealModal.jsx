import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Add custom HandshakeIcon component
const HandshakeIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={1.5}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" 
    />
  </svg>
);

export default function DealModal({ isOpen, onClose, targetItem, targetType, userId }) {
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch user's posts (gigs or demands depending on context)
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      // If user is reaching out to a demand, show their gigs (and vice versa)
      const table = targetType === 'demand' ? 'gigs' : 'demands';
      
      try {
        // First check that the user ID is correct
        console.log(`Fetching ${table} for user ID: ${userId}`);
        
        const { data, error } = await supabase
          .from(table)
          .select('id, title, user_id')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        console.log(`Found ${data?.length || 0} ${table} for user:`, data);
        
        // Make sure we have the data
        if (data && Array.isArray(data)) {
          setUserPosts(data);
          
          // Automatically select the first item if there is one
          if (data.length > 0) {
            setSelectedPostId(data[0].id);
          }
        } else {
          // Handle case where data is null or not an array
          setUserPosts([]);
          console.error(`Unexpected data format when fetching ${table}:`, data);
        }
      } catch (err) {
        console.error(`Error fetching user's ${table}:`, err);
        setError(`Failed to load your ${table}. Please try again.`);
        setUserPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [isOpen, targetType, userId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPostId || !message) {
      alert("Please select a post and enter a message");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, check if the deals table exists by trying to read from it
      const { error: tableCheckError } = await supabase
        .from('deals')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error("Deals table error:", tableCheckError);
        
        // Show a specific message for table not found
        if (tableCheckError.code === '42P01' || tableCheckError.message?.includes('does not exist')) {
          alert("The deals system is currently unavailable. Please contact support.");
          return;
        }
      }
      
      console.log("Creating deal with:", {
        initiator_id: userId,
        recipient_id: targetItem.user_id,
        initiator_item_type: targetType === 'demand' ? 'gig' : 'demand',
        initiator_item_id: selectedPostId,
        recipient_item_type: targetType,
        recipient_item_id: targetItem.id,
        status: 'pending',
        message: message
      });
      
      // Create a new deal record
      const { data, error } = await supabase
        .from('deals')
        .insert({
          initiator_id: userId,
          recipient_id: targetItem.user_id,
          initiator_item_type: targetType === 'demand' ? 'gig' : 'demand',
          initiator_item_id: selectedPostId,
          recipient_item_type: targetType,
          recipient_item_id: targetItem.id,
          status: 'pending',
          message: message,
        });
      
      if (error) {
        console.error("Supabase error details:", error);
        
        // Handle different types of errors with specific messages
        if (error.code === '23505') {
          alert("You've already made a similar offer. Please check your deals page.");
        } else if (error.code === '42501' || error.message?.includes('permission')) {
          alert("You don't have permission to make this deal. Please contact support.");
        } else {
          throw error;
        }
        return;
      }
      
      alert("Deal request sent successfully!");
      onClose();
    } catch (err) {
      console.error("Error creating deal:", err);
      alert(`Failed to send deal request: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg max-w-md w-full shadow-xl border border-gray-800">
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <HandshakeIcon className="h-5 w-5 mr-2 text-blue-400" />
            Make a Deal
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select your {targetType === 'demand' ? 'gig' : 'demand'} to offer:
            </label>
            
            {isLoading ? (
              <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
            ) : error ? (
              <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-md">
                {error} <button type="button" onClick={() => window.location.reload()} className="text-blue-400 hover:underline ml-1">Retry</button>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-yellow-500 text-sm p-3 bg-yellow-500/10 rounded-md">
                You don't have any {targetType === 'demand' ? 'gigs' : 'demands'} to offer. 
                <a 
                  href={targetType === 'demand' ? '/gigs/create' : '/demands/create'}
                  className="text-blue-400 hover:underline ml-1"
                >
                  Create one first.
                </a>
              </div>
            ) : (
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="w-full p-2 bg-[#2A2A2A] border border-gray-700 rounded text-white focus:ring-blue-500 focus:border-blue-500"
              >
                {userPosts.map(post => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (explain why this is a good match):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-[#2A2A2A] border border-gray-700 rounded text-white focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="I'm interested in working on this project because..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || userPosts.length === 0}
              className={`px-4 py-2 text-sm text-white rounded flex items-center ${
                isLoading || userPosts.length === 0
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Request Deal</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 