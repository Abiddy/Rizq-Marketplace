'use client';

import { createContext, useContext, useState } from 'react';
import ChatBox from '@/app/components/ChatBox';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chatState, setChatState] = useState({
    isOpen: false,
    recipientId: null,
    recipientName: ''
  });

  const openChat = (userId, userName) => {
    setChatState({
      isOpen: true,
      recipientId: userId,
      recipientName: userName
    });
  };

  const closeChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat }}>
      {children}
      {chatState.isOpen && chatState.recipientId && (
        <ChatBox
          isOpen={chatState.isOpen}
          onClose={closeChat}
          currentUser={null} // This will be set dynamically in the ChatBox component
          recipientId={chatState.recipientId}
          recipientName={chatState.recipientName}
        />
      )}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 