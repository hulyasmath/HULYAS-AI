
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Sparkles, Zap } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { COMMUNITY_APPS } from '../constants';
import { ChatMessage } from '../types';

export const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Greetings, pioneer. I am HULYAS, your Neural Guide. I am currently monitoring the 'Community Build' sector where all binaries are currently marketing-free for synchronization. How can I assist your discovery today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await chatWithAssistant(userMsg, COMMUNITY_APPS);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-[100]">
      {isOpen ? (
        <div className="glass w-[90vw] sm:w-[400px] h-[550px] rounded-[2.5rem] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.15)] border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-cyan-600/20 to-violet-600/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20">
                  <Bot size={22} className="text-black" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
              </div>
              <div>
                <span className="block font-bold text-white font-futuristic text-xs tracking-[0.2em]">HULYAS NEURAL GUIDE</span>
                <span className="block text-[8px] text-cyan-400/70 font-bold uppercase tracking-widest mt-0.5">1.287 Hz Sync Active</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-950/40 relative"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20' 
                    : 'glass text-slate-200 rounded-tl-none border-white/5'
                }`}>
                  {m.role === 'model' && (
                    <div className="absolute -top-2 -left-2 opacity-20">
                      <Sparkles size={12} className="text-cyan-400" />
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="glass text-slate-400 p-4 rounded-2xl rounded-tl-none border-white/5 flex flex-col gap-3 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-cyan-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Processing...</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-1/3 animate-[progress_1.5s_infinite_linear]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-2xl">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask HULYAS about free apps..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-600 shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                   <Zap size={14} className="text-cyan-500" />
                </div>
              </div>
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-14 h-14 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:grayscale text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-cyan-900/40 active:scale-90"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-4">
              Zeq OS Neural Link Interface
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="w-18 h-18 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-violet-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] border-2 border-white/20 transition-all hover:scale-110 active:scale-90 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageSquare size={32} className="group-hover:rotate-12 transition-transform" />
            
            {/* Notification badge */}
            <div className="absolute top-4 right-4 w-4 h-4 bg-rose-500 border-2 border-slate-950 rounded-full animate-bounce shadow-lg"></div>
          </button>
          
          {/* Tooltip hint */}
          <div className="absolute -top-12 right-0 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-futuristic whitespace-nowrap tracking-widest uppercase">
            ASK HULYAS GUIDE
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
