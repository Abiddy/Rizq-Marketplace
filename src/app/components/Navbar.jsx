import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChatBubbleOvalLeftIcon, EnvelopeIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon, ChevronDownIcon as ChevDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar({ onPostGig, onPostDemand, onLogOut, user, userProfile, onProfile, onMessages, onToggleMessages }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const router = useRouter();
  
  // Conversation state
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [selectedRecipientName, setSelectedRecipientName] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMessages = () => {
    setIsMessagesOpen(!isMessagesOpen);
    if (!isMessagesOpen && user) {
      fetchConversations();
    }
  };

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;
    
    fetchUnreadCount();
    
    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('new_messages_count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch conversations when messages panel opens
  useEffect(() => {
    if (user && isMessagesOpen) {
      fetchConversations();
      
      // Subscribe to new messages to update conversations list
      const channel = supabase
        .channel('new_conversation_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        }, () => {
          fetchConversations();
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`,
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isMessagesOpen]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all unique conversations where user is either sender or recipient
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('recipient_id')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('recipient_id', user.id)
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
              .eq('sender_id', user.id)
              .eq('recipient_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const { data: latestReceived } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('sender_id', profile.id)
              .eq('recipient_id', user.id)
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
              .eq('recipient_id', user.id)
              .eq('sender_id', profile.id)
              .eq('is_read', false);

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

  // Handle selecting a conversation
  const handleSelectConversation = (userId, userName) => {
    // Close the messages panel
    toggleMessages();
    
    // Update unread count
    fetchUnreadCount();
    
    // Call the parent component's callback to open the individual chat
    if (onMessages) {
      onMessages(userId, userName);
    }
    
    // If onToggleMessages exists, call it to open the chat box
    if (onToggleMessages) {
      onToggleMessages(userId, userName);
    }
  };

  return (
    <nav className="bg-[#101010] border-b border-gray-800 text-white">
      <div className="max-w-[95%] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              Rizq
              <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                BETA
              </span>
            </Link>
          </div>

          {user ? (
            <>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex md:items-center md:space-x-2">
                  <Link 
                    href="/new-gig"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-md transition-colors"
                  >
                    Post a Gig
                  </Link>
                  <Link 
                    href="/new-demand"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-md transition-colors"
                  >
                    Post a Demand
                  </Link>
                </div>
                
                {/* Messages Icon */}
                <button
                  onClick={toggleMessages}
                  className="relative text-gray-300 hover:text-white transition-colors"
                  aria-label="Messages"
                >
                  <EnvelopeIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={toggleProfileDropdown}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-600">
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt={userProfile?.full_name || user?.email} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <ChevDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] rounded-md shadow-lg z-50 border border-gray-800">
                      <div className="py-1">
                        <div className="md:hidden">
                          <Link 
                            href="/new-gig"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Post a Gig
                          </Link>
                          <Link 
                            href="/new-demand"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Post a Demand
                          </Link>
                        </div>
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={() => {
                            onLogOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth?signup=true"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Messages Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-[#121212] z-50 transform transition-transform duration-300 ease-in-out ${isMessagesOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl border-l border-gray-800`}>
        <div className="bg-[#121212] p-3 rounded-t-lg flex justify-between items-center border-b border-gray-800">
          <h3 className="text-white font-medium flex items-center">
            <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-2" />
            Messages
          </h3>
          <button 
            onClick={toggleMessages}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(100%-60px)] overflow-y-auto">
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
                  onClick={() => handleSelectConversation(conversation.user.id, conversation.user.full_name)}
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
      </div>
      
      {isMessagesOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMessages}
        ></div>
      )}
    </nav>
  );
} 