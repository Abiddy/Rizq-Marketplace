import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Chat({ userId, recipientId, recipientName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch existing messages when component mounts
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${userId},recipient_id=eq.${recipientId}` 
        }, 
        (payload) => {
          // Add new message to the state
          setMessages(prev => [...prev, payload.new]);
          // Mark the message as read if it's for the current chat
          if (payload.new.recipient_id === userId) {
            markMessageAsRead(payload.new.id);
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${recipientId},recipient_id=eq.${userId}` 
        }, 
        (payload) => {
          // Add new message to the state
          setMessages(prev => [...prev, payload.new]);
          // Mark the message as read since we're currently in the chat
          markMessageAsRead(payload.new.id);
        }
      )
      .subscribe();

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => {
      // Clean up subscription when component unmounts
      supabase.channel('messages_channel').unsubscribe();
    };
  }, [userId, recipientId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark all messages from recipient as read
      const unreadMessages = data.filter(msg => 
        msg.recipient_id === userId && !msg.is_read
      );
      
      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msg => markMessageAsRead(msg.id));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageObj = {
      sender_id: userId,
      recipient_id: recipientId,
      content: newMessage.trim(),
      created_at: new Date(),
      is_read: false
    };
    
    // Optimistically add the message to UI immediately
    const optimisticMessage = { ...messageObj, id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageObj])
        .select();

      if (error) throw error;
      
      // Replace the temporary message with the real one from the database
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? data[0] : msg
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      // If error, remove the optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      // Restore the message to the input
      setNewMessage(messageObj.content);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col max-w-md w-full max-h-[80vh]">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 mr-3" />
          <h3 className="text-white font-medium">{recipientName}</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[450px] space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 pt-4">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender_id === userId 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={sendMessage} className="border-t border-gray-700 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            ref={inputRef}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-l-md px-4 py-3 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 