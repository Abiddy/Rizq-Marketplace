import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';

export default function ChatBox({ isOpen, onClose, recipientId, recipientName }) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch messages when chat is opened
  useEffect(() => {
    if (isOpen && currentUser && recipientId) {
      fetchMessages();
      
      // Mark messages as read immediately when chat opens
      markMessagesAsRead();
      
      // Also periodically mark new incoming messages as read while chat is open
      const readInterval = setInterval(() => {
        markMessagesAsRead();
      }, 3000);
      
      // Subscribe to new messages
      const channel = supabase
        .channel('new_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUser.id},recipient_id=eq.${recipientId}`,
        }, payload => {
          const newMsg = payload.new;
          setMessages(prev => [...prev, newMsg]);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${recipientId},recipient_id=eq.${currentUser.id}`,
        }, payload => {
          const newMsg = payload.new;
          setMessages(prev => [...prev, newMsg]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        clearInterval(readInterval); // Clean up interval
      };
    }
  }, [isOpen, currentUser, recipientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't render if no current user or recipient
  if (!currentUser || !recipientId) return null;

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // Get messages where current user is sender and recipient is receiver
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', currentUser.id)
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: true });

      if (sentError) throw sentError;

      // Get messages where current user is recipient and sender is receiver
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', recipientId)
        .eq('recipient_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (receivedError) throw receivedError;

      // Combine and sort messages by timestamp
      const allMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUser || !recipientId) return;
    
    try {
      const { error, count } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', recipientId)
        .eq('recipient_id', currentUser.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // If any messages were updated, trigger a refresh of the unread counter
      if (count > 0) {
        console.log(`Marked ${count} messages as read`);
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input field immediately
    
    // Create message object
    const newMessageObj = {
      id: Date.now().toString(), // Temporary ID
      sender_id: currentUser.id,
      recipient_id: recipientId,
      content: messageContent,
      created_at: new Date().toISOString(),
      read: false
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, newMessageObj]);
    
    // Then send to database
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        recipient_id: recipientId,
        content: messageContent,
      });

      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      // If there was an error, you could remove the optimistic message
      // or show an error indicator
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-80 md:w-96 bg-[#1E1E1E] rounded-lg shadow-xl z-50 flex flex-col"
      style={{ height: '500px', maxHeight: '80vh' }}
    >
      {/* Chat Header */}
      <div className="bg-[#121212] p-3 rounded-t-lg flex justify-between items-center border-b border-gray-800">
        <h3 className="text-white font-medium">{recipientName}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2 ${
                  message.sender_id === currentUser.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#121212] text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
} 