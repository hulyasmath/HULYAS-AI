import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { installApp } from '../services/api';
import { isAuthenticated } from '../services/auth';

interface InstallButtonProps {
  appId: string;
  appName: string;
}

export const InstallButton: React.FC<InstallButtonProps> = ({ appId, appName }) => {
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async () => {
    if (!isAuthenticated()) {
      setError('Please log in to install apps');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await installApp(appId);
      setInstalled(true);
    } catch (err: any) {
      setError(err.message || 'Failed to install app');
    } finally {
      setLoading(false);
    }
  };

  if (installed) {
    return (
      <button
        disabled
        className="w-full py-4 bg-green-600/20 border border-green-500/50 text-green-400 rounded-2xl font-semibold flex items-center justify-center gap-2"
      >
        <Check size={20} />
        Installed
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleInstall}
        disabled={loading}
        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Installing...
          </>
        ) : (
          <>
            <Download size={20} />
            Install
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
};
