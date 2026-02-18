import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HulyaPulseIndicator } from './HulyaPulseIndicator';

interface AppPageLayoutProps {
  title: string;
  description?: string;
  domain: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const AppPageLayout: React.FC<AppPageLayoutProps> = ({ title, description, domain, children, sidebar }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">App Store</span>
            </Link>
            <div className="h-5 w-px bg-slate-700" />
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              {description && <p className="text-xs text-slate-400">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {domain}
            </span>
            <HulyaPulseIndicator compact />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {sidebar ? (
          <div className="flex gap-6">
            <aside className="w-72 flex-shrink-0 space-y-4">{sidebar}</aside>
            <main className="flex-1 min-w-0 space-y-6">{children}</main>
          </div>
        ) : (
          <main className="space-y-6">{children}</main>
        )}
      </div>
    </div>
  );
};
