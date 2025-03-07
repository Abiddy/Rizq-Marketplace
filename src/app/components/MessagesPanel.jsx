import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChatBubbleOvalLeftIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesPanel({ 
  isOpen, 
  onToggle, 
  currentUser, 
  onSelectConversation, 
  minimized, 
  onMinimize 
}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && isOpen) {
      fetchConversations();
      
      // Subscribe to new messages to update conversations list
      const channel = supabase
        .channel('new_conversation_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUser.id}`,
        }, () => {
          fetchConversations();
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUser.id}`,
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, isOpen]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // Get all unique conversations where user is either sender or recipient
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('recipient_id')
        .eq('sender_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('recipient_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Get unique user IDs from conversations
      const sentToIds = sentMessages.map(msg => msg.recipient_id);
      const receivedFromIds = receivedMessages.map(msg => msg.sender_id);
      const uniqueUserIds = [...new Set([...sentToIds, ...receivedFromIds])];

      // Fetch user profiles
      if (uniqueUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', uniqueUserIds);

        if (profilesError) throw profilesError;

        // Get latest message from each conversation
        const conversationsWithLastMessage = await Promise.all(
          profiles.map(async (profile) => {
            // Get the latest message in this conversation (either sent or received)
            const { data: latestSent } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('sender_id', currentUser.id)
              .eq('recipient_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const { data: latestReceived } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('sender_id', profile.id)
              .eq('recipient_id', currentUser.id)
              .order('created_at', { ascending: false })
              .limit(1);

            // Get the more recent message between sent and received
            let latestMessage = null;
            if (latestSent?.length && latestReceived?.length) {
              latestMessage = new Date(latestSent[0].created_at) > new Date(latestReceived[0].created_at)
                ? latestSent[0]
                : latestReceived[0];
            } else if (latestSent?.length) {
              latestMessage = latestSent[0];
            } else if (latestReceived?.length) {
              latestMessage = latestReceived[0];
            }

            // Check for unread messages (where user is recipient and read is false)
            const { data: unreadCount, error: unreadError } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('recipient_id', currentUser.id)
              .eq('sender_id', profile.id)
              .eq('read', false);

            if (unreadError) throw unreadError;

            return {
              user: profile,
              lastMessage: latestMessage,
              unreadCount: unreadCount?.length || 0,
              lastActivity: latestMessage?.created_at || new Date().toISOString()
            };
          })
        );

        // Sort by last activity (most recent first)
        const sortedConversations = conversationsWithLastMessage.sort(
          (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
        );

        setConversations(sortedConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the preview text from the message
  const formatPreview = (text) => {
    if (!text) return '';
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  // Format the time difference for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-4 z-40 md:w-80 w-full md:max-w-sm">
      <div className="bg-[#1E1E1E] rounded-t-lg shadow-xl border border-gray-800 md:mr-0 mr-4">
        {/* Header */}
        <div 
          className="bg-[#121212] p-3 rounded-t-lg flex justify-between items-center cursor-pointer"
          onClick={onMinimize}
        >
          <h3 className="text-white font-medium flex items-center">
            <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-2" />
            Messages
          </h3>
          <div className="flex items-center">
            {minimized ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-pulse text-gray-500">Loading conversations...</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex justify-center items-center py-6">
                    <p className="text-gray-500">No conversations yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-800">
                    {conversations.map((conversation) => (
                      <li 
                        key={conversation.user.id}
                        className={`hover:bg-gray-800/40 cursor-pointer ${
                          conversation.unreadCount > 0 ? 'bg-gray-800/20' : ''
                        }`}
                        onClick={() => onSelectConversation(conversation.user.id, conversation.user.full_name)}
                      >
                        <div className="flex items-center p-3">
                          <div className="relative flex-shrink-0">
                            {conversation.user?.avatar_url ? (
                              <img 
                                src={conversation.user.avatar_url} 
                                alt={conversation.user.full_name || 'User'}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-300 text-sm">
                                  {conversation.user.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                              <h4 className={`text-sm font-medium truncate ${
                                conversation.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                              }`}>
                                {conversation.user.full_name || 'Unknown User'}
                              </h4>
                              <span className="text-xs text-gray-500 ml-1 flex-shrink-0">
                                {formatTime(conversation.lastActivity)}
                              </span>
                            </div>
                            <p className={`text-xs truncate ${
                              conversation.unreadCount > 0 ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              {formatPreview(conversation.lastMessage?.content) || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 