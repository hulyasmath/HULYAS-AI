import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ChatApiSelector } from './ChatApiSelector';

/**
 * ZeqChat
 *
 * Lightweight wrapper that embeds the standalone ZEQ Chat HTML experience
 * as a full-screen iframe. The actual chat UI and AI provider selection
 * live in `public/zeq-apps/zeqchat.html`, which is already wired with
 * ZEQ OS theming and multi-provider support.
 */
export const ZeqChat: React.FC = () => {
  const navigate = useNavigate();
  const [showApiSelector, setShowApiSelector] = useState(false);

  useEffect(() => {
    // Check if user has already selected an API mode
    const savedMode = localStorage.getItem('zeq_chat_api_mode');
    if (!savedMode) {
      // Show selector on first visit
      setShowApiSelector(true);
    }
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const handleApiSelect = (mode: 'zeq' | 'custom') => {
    // Mode is saved in ChatApiSelector component
    setShowApiSelector(false);
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <ChatApiSelector
        isOpen={showApiSelector}
        onClose={() => setShowApiSelector(false)}
        onSelect={handleApiSelect}
      />
      
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/90 via-purple-500/90 to-pink-500/90 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 border-2 border-white/20 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Close chat and return to app store"
      >
        <X 
          size={24} 
          className="text-white group-hover:rotate-90 transition-transform duration-300" 
        />
      </button>
      <iframe
        src="/zeq-apps/zeqchat.html"
        title="ZEQ OS Chat"
        className="w-full h-full border-0"
        style={{ border: 'none' }}
      />
    </div>
  );
};

