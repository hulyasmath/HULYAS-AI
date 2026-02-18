import React, { useState, useEffect } from 'react';
import { User, LogOut, Package, Settings } from 'lucide-react';
import { getCurrentUser, fetchApps } from '../services/api';
import { isAuthenticated, getCurrentUser as getStoredUser, removeToken } from '../services/auth';

interface UserAccountProps {
  onClose: () => void;
  onLogout: () => void;
}

export const UserAccount: React.FC<UserAccountProps> = ({ onClose, onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      // TODO: Fetch user's apps from API
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    onLogout();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="glass rounded-3xl p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="glass rounded-3xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold mb-4">Not Logged In</h3>
          <p className="text-slate-400 mb-6">Please log in to view your account.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-futuristic uppercase">My Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                <User size={32} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.username || 'User'}</h3>
                <p className="text-slate-400">{user?.email || ''}</p>
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-lg text-slate-400">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} />
              My Apps
            </h3>
            {myApps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-700">
                <p>No apps submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-900/30 rounded-xl border border-slate-700"
                  >
                    <h4 className="font-semibold">{app.name}</h4>
                    <p className="text-sm text-slate-400">{app.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
