import React, { useState } from 'react';

interface BetaBannerProps {
  version?: string;
  dismissible?: boolean;
}

/**
 * Beta warning banner component
 * Displays at the top of the application to indicate beta status
 */
export const BetaBanner: React.FC<BetaBannerProps> = ({ 
  version = '0.4.0-beta',
  dismissible = true 
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white px-4 py-2 text-center text-sm relative">
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20">
          BETA
        </span>
        <span>
          ZEQ OS Framework v{version} - APIs and features may change before stable release
        </span>
        <a 
          href="https://docs.zeq.os/changelog" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-white/80 ml-2"
        >
          Changelog
        </a>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Dismiss beta banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default BetaBanner;
