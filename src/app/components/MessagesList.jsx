import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function MessagesList({ userId, onSelectChat, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Set up real-time listener for new messages
    const subscription = supabase
      .channel('new_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        () => {
          fetchConversations();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'messages' }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();
    
    return () => {
      supabase.channel('new_messages').unsubscribe();
    };
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // First get all unique users who have messaged with the current user
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('recipient_id')
        .eq('sender_id', userId);
      
      if (sentError) throw sentError;
      
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('recipient_id', userId);
      
      if (receivedError) throw receivedError;
      
      // Get unique user IDs
      const uniqueUserIds = [...new Set([
        ...sentMessages.map(msg => msg.recipient_id),
        ...receivedMessages.map(msg => msg.sender_id)
      ])];
      
      // For each user, get the latest message and unread count
      const conversationPromises = uniqueUserIds.map(async (otherUserId) => {
        // Get latest message
        const { data: latestMessage, error: latestError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestError && latestError.code !== 'PGRST116') throw latestError;
        
        // Get unread count
        const { data: unreadMessages, error: unreadError } = await supabase
          .from('messages')
          .select('id')
          .eq('sender_id', otherUserId)
          .eq('recipient_id', userId)
          .eq('is_read', false);
        
        if (unreadError) throw unreadError;
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherUserId)
          .single();
        
        if (profileError) throw profileError;
        
        return {
          userId: otherUserId,
          name: profile.full_name || 'User',
          avatar: profile.avatar_url,
          lastMessage: latestMessage?.content || '',
          timestamp: latestMessage?.created_at,
          unreadCount: unreadMessages.length
        };
      });
      
      const conversationsData = await Promise.all(conversationPromises);
      
      // Sort by timestamp (most recent first)
      conversationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div 
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 shadow-xl z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Messages</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((convo) => (
            <div 
              key={convo.userId}
              className="p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => onSelectChat(convo.userId, convo.name)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 mr-3 overflow-hidden">
                  {convo.avatar ? (
                    <img src={convo.avatar} alt={convo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{convo.name}</p>
                  <p className="text-gray-400 text-sm truncate">{convo.lastMessage}</p>
                </div>
                {convo.unreadCount > 0 && (
                  <div className="ml-2 bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-white text-xs">{convo.unreadCount}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No conversations yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 