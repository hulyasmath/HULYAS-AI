import React, { useState, useEffect } from 'react';
import { X, Zap, Key, CheckCircle2, Info } from 'lucide-react';

interface ChatApiSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'zeq' | 'custom') => void;
}

/**
 * ChatApiSelector
 * 
 * Modal that allows users to choose between:
 * 1. ZEQ Mathematical Intelligence API (default, recommended)
 * 2. Custom API keys (Gemini, OpenAI, Claude, etc.)
 */
export const ChatApiSelector: React.FC<ChatApiSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect 
}) => {
  const [selectedMode, setSelectedMode] = useState<'zeq' | 'custom' | null>(null);
  const [hasSeenSelector, setHasSeenSelector] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedMode = localStorage.getItem('zeq_chat_api_mode');
    if (savedMode) {
      setHasSeenSelector(true);
      setSelectedMode(savedMode as 'zeq' | 'custom');
      if (!isOpen) {
        onSelect(savedMode as 'zeq' | 'custom');
      }
    }
  }, [isOpen, onSelect]);

  const handleSelect = (mode: 'zeq' | 'custom') => {
    setSelectedMode(mode);
    localStorage.setItem('zeq_chat_api_mode', mode);
    onSelect(mode);
    setHasSeenSelector(true);
    onClose();
  };

  if (!isOpen || hasSeenSelector) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-cyan-400" size={32} />
            <h2 className="text-3xl font-bold font-futuristic text-white uppercase">
              Choose Your AI Provider
            </h2>
          </div>
          <p className="text-slate-400 text-sm">
            Select how you want to use ZEQ Chat
          </p>
        </div>

        {/* Options */}
        <div className="p-8 space-y-6">
          {/* ZEQ Mathematical Intelligence Option */}
          <button
            onClick={() => handleSelect('zeq')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedMode === 'zeq'
                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                : 'border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    ZEQ Mathematical Intelligence AI
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                    <CheckCircle2 size={12} /> Recommended
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-4 leading-relaxed">
              Powered by ZEQ OS Framework with <strong className="text-cyan-400">1549 mathematical operators</strong>, 
              synchronized to the <strong className="text-purple-400">1.287 Hz HulyaPulse</strong>, 
              delivering <strong className="text-pink-400">0.1% precision</strong> scientific-grade accuracy.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <span><strong className="text-white">Real Physics Computations</strong> - Not approximations, actual executable mathematics</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <span><strong className="text-white">HulyaPulse Synchronization</strong> - Temporal coherence across all operations</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <span><strong className="text-white">Multi-Domain Coverage</strong> - Quantum, Classical, Consciousness, Thermodynamics, Field Theory</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <span><strong className="text-white">No API Keys Required</strong> - Auto-configured and ready to use</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-cyan-300">
                  ZEQ AI understands physics, mathematics, and computational science at a fundamental level, 
                  providing answers backed by real mathematical operators rather than text-based approximations.
                </p>
              </div>
            </div>
          </button>

          {/* Custom API Keys Option */}
          <button
            onClick={() => handleSelect('custom')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedMode === 'custom'
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Key size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Use Your Own API Keys
                  </h3>
                  <span className="text-slate-500 text-sm">Gemini, OpenAI, Claude, DeepSeek, etc.</span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-4 leading-relaxed">
              Configure your own API keys for Gemini, OpenAI, Claude, DeepSeek, Azure AI, or Groq. 
              You'll have full control over API usage and costs.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                <span>Use your existing API credits</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                <span>Full control over provider selection</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                <span>Keys stored securely in browser localStorage</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <p className="text-xs text-slate-500 text-center">
            You can change this setting anytime from the chat settings menu
          </p>
        </div>
      </div>
    </div>
  );
};
