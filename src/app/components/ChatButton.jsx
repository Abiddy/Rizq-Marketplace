'use client';

import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import MessagesList from './MessagesList';
import Chat from './Chat';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check auth
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    
    checkUser();
    
    // Set up global handler
    if (typeof window !== 'undefined') {
      window.openChatWith = (userId, userName) => {
        setActiveChat({ id: userId, name: userName });
        setIsOpen(true);
      };
      
      // Check if there's a pending chat request
      const checkPendingChat = () => {
        if (window.initiateChatWith) {
          const { userId, userName } = window.initiateChatWith;
          setActiveChat({ id: userId, name: userName });
          setIsOpen(true);
          window.initiateChatWith = null;
        }
      };
      
      // Check after a short delay to ensure everything is loaded
      setTimeout(checkPendingChat, 500);
    }
    
    return () => {
      // Cleanup
      if (typeof window !== 'undefined') {
        window.openChatWith = null;
      }
    };
  }, []);
  
  const handleSelectChat = (userId, name) => {
    setActiveChat({ id: userId, name });
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setActiveChat(null);
  };
  
  if (!user) return null;
  
  return (
    <>
      {/* Floating button */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="chat-button-trigger bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Chat or messages panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
            {activeChat ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="w-full sm:w-[400px] md:w-[450px] rounded-t-lg sm:rounded-lg overflow-hidden"
              >
                <Chat
                  userId={user.id}
                  recipientId={activeChat.id}
                  recipientName={activeChat.name}
                  onClose={() => setActiveChat(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="w-full h-[80vh] sm:w-96 sm:h-[600px] sm:mt-12"
              >
                <MessagesList
                  userId={user.id}
                  onSelectChat={handleSelectChat}
                  onClose={handleClose}
                />
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 