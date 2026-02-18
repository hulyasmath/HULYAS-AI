import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

/**
 * FloatingChatButton
 * 
 * Floating circular button at bottom-right corner that opens ZEQ Chat.
 * Synchronized to 1.287 Hz HulyaPulse with pulse animation.
 */
export const FloatingChatButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
      style={{
        animation: 'pulse 0.777s ease-in-out infinite',
      }}
      aria-label="Open ZEQ Chat"
    >
      <MessageSquare 
        size={28} 
        className="text-white group-hover:scale-110 transition-transform" 
      />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7),
                        0 0 20px rgba(139, 92, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(34, 211, 238, 0),
                        0 0 30px rgba(139, 92, 246, 0.8);
          }
        }
      `}</style>
    </button>
  );
};
