
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExtendedApp } from '../constants';
import { Star, Download, Sparkles, ArrowUpRight, Share2, Bookmark, BookmarkCheck, CheckCircle2, Play, ExternalLink } from 'lucide-react';

interface AppCardProps {
  app: ExtendedApp;
  onClick: (app: ExtendedApp) => void;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onClick, className = "" }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle click - navigate if app has route, otherwise use onClick
  const handleCardClick = () => {
    if (app.route) {
      navigate(app.route);
    } else {
      onClick(app);
    }
  };

  // Handle "Get Free" / "Open" button
  const handleGetFree = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.route) {
      navigate(app.route);
    } else {
      onClick(app);
    }
  };

  const sizeClasses = {
    large: 'md:col-span-2 md:row-span-2 min-h-[400px]',
    medium: 'md:col-span-1 md:row-span-2 min-h-[400px]',
    small: 'md:col-span-1 md:row-span-1 min-h-[220px]',
  };

  const handleAction = (e: React.MouseEvent, type: 'share' | 'save') => {
    e.stopPropagation();
    // Clear any existing timeout to prevent memory leaks
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    if (type === 'save') {
      setIsSaved(!isSaved);
      if (!isSaved) {
        setShowToast(true);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
      }
    } else {
      // Placeholder for share
      navigator.clipboard.writeText(`Check out ${app?.name ?? 'this app'} on Zeq OS: Unified Physics.`);
      setShowToast(true);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`${sizeClasses[app.layoutSize]} ${className} group relative rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-900 border border-white/5 active:scale-[0.99] transition-all duration-500 shadow-2xl h-full flex flex-col`}
    >
      {/* Background Image with Tint Overlay */}
      <div className="absolute inset-0 transition-transform duration-1000 md:group-hover:scale-110">
        <img 
          src={app.imageUrl} 
          alt={app.name}
          className="w-full h-full object-cover opacity-60 grayscale-[20%]"
        />
        {/* Brand Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-600/10 to-black/90 mix-blend-multiply transition-opacity group-hover:opacity-70"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 z-20 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => handleAction(e, 'save')}
          className={`p-3 rounded-full transition-all border border-white/10 backdrop-blur-md ${
            isSaved 
              ? 'bg-cyan-500/30 text-cyan-400 border-cyan-500/40' 
              : 'bg-black/40 text-white/50 hover:bg-cyan-500/20 hover:text-cyan-400'
          }`}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
        <button 
          onClick={(e) => handleAction(e, 'share')}
          className="p-3 bg-black/40 hover:bg-cyan-500/20 rounded-full text-white/50 hover:text-cyan-400 transition-all border border-white/10 backdrop-blur-md"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Synchronization Toast */}
      {showToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="glass px-4 py-2 rounded-full border-cyan-500/30 flex items-center gap-2 shadow-2xl">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
              {isSaved ? 'Synchronized to Neural Hub' : 'Link copied to clipboard'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 mt-auto flex flex-col justify-end">
        {app.isNew && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full font-futuristic tracking-widest uppercase mb-4 w-fit">
            <Sparkles size={10} /> New
          </div>
        )}

        <div className="flex justify-between items-end gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-cyan-400 text-[10px] font-bold font-futuristic uppercase tracking-widest mb-2">{app.category}</p>
            <h3 className={`${app.layoutSize === 'large' ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'} font-bold text-white mb-2 font-futuristic leading-tight uppercase tracking-tighter`}>
              {app.name}
            </h3>

            {app.layoutSize !== 'small' && (
              <p className="hidden md:block text-slate-300 text-sm max-w-md line-clamp-2 mb-4 leading-relaxed font-light">
                {app.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                {app.rating}
              </span>
              <span className="flex items-center gap-1.5">
                <Download size={12} />
                {app.downloads}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/5">Free</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Get Free / Open Button */}
            <button
              onClick={handleGetFree}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                app.route 
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {app.route ? (
                <>
                  <Play size={14} className="fill-current" />
                  Open
                </>
              ) : (
                <>
                  <Download size={14} />
                  Get Free
                </>
              )}
            </button>
            
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white md:group-hover:bg-cyan-500 md:group-hover:text-slate-950 md:group-hover:border-transparent transition-all duration-500 shadow-xl">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
