import React, { useState, useEffect } from 'react';
import { GitBranch, Shield, Loader2 } from 'lucide-react';
import { API_BASE, VersionData } from './types';
import { IntegrityBadge } from './IntegrityBadge';

interface VersionHistoryProps {
  appId: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ appId }) => {
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/apps/${appId}/versions`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setVersions(Array.isArray(data) ? data : data.versions || []))
      .catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) {
    return <div className="flex justify-center py-6"><Loader2 className="animate-spin text-slate-500" /></div>;
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch size={18} className="text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Version History</h3>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No version history available.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v, i) => (
            <div key={v.id || i} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-cyan-400">v{v.version}</span>
                  {i === 0 && <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">latest</span>}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date((v.createdAt || 0) * 1000).toLocaleDateString()}
                </span>
              </div>
              {v.changelog && <p className="text-sm text-slate-300 mb-3">{v.changelog}</p>}
              <IntegrityBadge
                entropyScore={v.shannonEntropy}
                kolmogorovScore={v.kolmogorovRatio}
                signature={v.signature}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
