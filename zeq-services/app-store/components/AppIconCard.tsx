
import React from 'react';
import { CommunityApp } from '../types';
import { Star } from 'lucide-react';

interface AppIconCardProps {
  app: CommunityApp;
  onClick: (app: CommunityApp) => void;
}

export const AppIconCard: React.FC<AppIconCardProps> = ({ app, onClick }) => {
  return (
    <button 
      onClick={() => onClick(app)}
      className="flex flex-col items-center gap-2 group w-full active:scale-95 transition-transform"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl md:rounded-[1.5rem] bg-slate-950 flex items-center justify-center overflow-hidden relative shadow-lg group-hover:scale-105 transition-all duration-300">
        <img src={app.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
      </div>
      <div className="text-center w-full px-1">
        <p className="text-[11px] md:text-[13px] font-bold text-slate-100 truncate w-full uppercase tracking-tight">{app.name}</p>
        <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Star size={8} className="text-yellow-500 fill-yellow-500" />
          <span className="text-[9px] font-bold text-slate-400">{app.rating}</span>
        </div>
      </div>
    </button>
  );
};
