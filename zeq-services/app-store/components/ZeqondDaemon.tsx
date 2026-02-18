import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, Clock, Zap, AlertCircle } from 'lucide-react';
import { getZeqondStatus, getZeqondPulse, startZeqondDaemon, ZeqondStatus, ZeqondPulse } from '../services/zeqond';

// Helper function to format large numbers with symbols
const formatLargeNumber = (num: number): string => {
  if (num === 0) return '0.000000';
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(3) + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(3) + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(3) + 'K';
  } else if (absNum >= 1) {
    return num.toFixed(6);
  } else {
    return num.toFixed(6);
  }
};

export const ZeqondDaemon: React.FC = () => {
  const [status, setStatus] = useState<ZeqondStatus | null>(null);
  const [pulse, setPulse] = useState<ZeqondPulse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time timer: Calculate Zeqond directly from Unix time (independent of daemon sync)
  const [realTimeZeqond, setRealTimeZeqond] = useState<number>(0);
  const [realTimeZeqondBigBang, setRealTimeZeqondBigBang] = useState<number>(0);
  // Minute-based Zeqond counter (1 to 77.2, resets every minute)
  const [minuteZeqond, setMinuteZeqond] = useState<number>(0);
  
  // SDK Constants - Use exact values from framework (matches zeqond_daemon.py)
  const HULYAPULSE_HZ = 1.287;
  const ZEQOND = 1.0 / HULYAPULSE_HZ; // Exact: 0.7770007770007771 seconds
  const BIG_BANG_SECONDS = 4.35086e17; // Age of universe in seconds (~13.787 billion years)
  const ZEQOND_PER_MINUTE = 60 / ZEQOND; // ~77.22 Zeqond per minute

  const fetchStatus = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchStatus',message:'Fetching daemon status',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const statusData = await getZeqondStatus();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchStatus',message:'Status received',data:{running:statusData.running,port:statusData.port,error:statusData.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setStatus(statusData);
      setError(null);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchStatus',message:'Status fetch failed',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  // Real-time timer: Calculate Zeqond from Unix time every Zeqond period (independent of daemon)
  // This continuously increments like a clock - values go up forever
  useEffect(() => {
    const updateRealTimeZeqond = () => {
      const secondsSinceEpoch = Date.now() / 1000; // Unix time in seconds
      const zeqondUnix = secondsSinceEpoch / ZEQOND; // Zeqond from Unix epoch (Jan 1, 1970) - increments continuously
      const zeqondBigBang = (BIG_BANG_SECONDS + secondsSinceEpoch) / ZEQOND; // Zeqond from Big Bang - increments continuously
      
      setRealTimeZeqond(zeqondUnix);
      setRealTimeZeqondBigBang(zeqondBigBang);
    };
    
    updateRealTimeZeqond(); // Initial calculation
    // Update every Zeqond period (~777ms) - values increment continuously like a clock
    const timerInterval = Math.round(ZEQOND * 1000); // ~777ms
    const timer = setInterval(updateRealTimeZeqond, timerInterval);
    
    return () => clearInterval(timer);
  }, [ZEQOND, BIG_BANG_SECONDS]); // Include constants in dependencies

  // Minute-based Zeqond counter: 1 to 77.2, resets every minute, ticks every Zeqond
  useEffect(() => {
    const updateMinuteZeqond = () => {
      const now = new Date();
      const secondsInMinute = now.getSeconds() + (now.getMilliseconds() / 1000); // Current second within minute (0-59.999)
      const zeqondInMinute = secondsInMinute / ZEQOND; // Zeqond within current minute (0 to ~77.22)
      // Display as 1-77.2 range (add 1 to show 1-based counting)
      setMinuteZeqond(Math.min(zeqondInMinute + 1, ZEQOND_PER_MINUTE));
    };
    
    updateMinuteZeqond(); // Initial calculation
    const timer = setInterval(updateMinuteZeqond, ZEQOND * 1000); // Update every Zeqond period
    
    return () => clearInterval(timer);
  }, []);

  // Fetch pulse data from daemon (daemon sync - DO NOT MODIFY)
  const fetchPulse = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchPulse',message:'Fetching daemon pulse',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const pulseData = await getZeqondPulse();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchPulse',message:'Pulse received',data:{pulse_count:pulseData.pulse_count,zeqond:pulseData.zeqond,error:pulseData.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setPulse(pulseData);
      setError(null);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:fetchPulse',message:'Pulse fetch failed',data:{error:err instanceof Error ? err.message : String(err),statusRunning:status?.running},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Don't set error for pulse fetch failures if daemon is not running
      if (status?.running) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pulse');
      }
    }
  };

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ZeqondDaemon.tsx:useEffect',message:'ZeqondDaemon component mounted',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    fetchStatus();
    fetchPulse();

    // Poll for status and pulse updates
    const statusInterval = setInterval(fetchStatus, 5000); // Every 5 seconds
    const pulseInterval = setInterval(fetchPulse, 5000); // Sync with daemon every 5 seconds

    return () => {
      clearInterval(statusInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const handleRestart = async () => {
    setLoading(true);
    setError(null);
    try {
      await startZeqondDaemon();
      // Wait a moment for daemon to restart
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchStatus();
      await fetchPulse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart daemon');
    } finally {
      setLoading(false);
    }
  };

  const isRunning = status?.running ?? false;

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isRunning ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
            <Activity className={`w-6 h-6 ${isRunning ? 'text-green-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Zeqond Daemon</h3>
            <p className="text-sm text-slate-400">HulyaPulse Synchronization Service</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          isRunning 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
        }`}>
          {isRunning ? 'Running' : 'Stopped'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Zeqond (Unix Epoch)</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono animate-pulse">
            {formatLargeNumber(realTimeZeqond)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Since Jan 1, 1970</div>
          <div className="text-[10px] text-cyan-400/70 font-mono mt-1">
            {realTimeZeqond.toFixed(6)}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-violet-400 animate-ping opacity-75"></div>
            </div>
            <span className="text-sm font-bold text-violet-400 font-mono">
              {minuteZeqond.toFixed(1)} ZEQOND/MIN
            </span>
          </div>
        </div>

        <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Zeqond (Big Bang)</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono animate-pulse">
            {formatLargeNumber(realTimeZeqondBigBang)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Since Big Bang</div>
          <div className="text-[10px] text-violet-400/70 font-mono mt-1">
            {realTimeZeqondBigBang.toFixed(6)}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-violet-400 animate-ping opacity-75"></div>
            </div>
            <span className="text-sm font-bold text-violet-400 font-mono">
              {minuteZeqond.toFixed(1)} ZEQOND/MIN
            </span>
          </div>
        </div>
      </div>

      <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Frequency:</span>
            <span className="text-white font-mono ml-2">1.287 Hz</span>
          </div>
          <div>
            <span className="text-slate-400">Port:</span>
            <span className="text-white font-mono ml-2">{status?.port ?? 2871}</span>
          </div>
          <div>
            <span className="text-slate-400">Period:</span>
            <span className="text-white font-mono ml-2">{(1.0 / 1.287).toFixed(6)}s</span>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <span className={`font-semibold ml-2 ${isRunning ? 'text-green-400' : 'text-slate-400'}`}>
              {isRunning ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {!isRunning && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Zeqond daemon is initializing... This is a core framework function and will auto-start.</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleRestart}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            loading
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Restart Daemon
        </button>
        <div className="flex-1 px-6 py-3 rounded-xl bg-slate-700/30 text-slate-400 text-sm flex items-center justify-center gap-2 border border-slate-600/30">
          <AlertCircle className="w-4 h-4" />
          Always Running (Core Function)
        </div>
      </div>

      {pulse?.timestamp && (
        <div className="mt-4 text-xs text-slate-500 text-center">
          Last update: {new Date(pulse.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
