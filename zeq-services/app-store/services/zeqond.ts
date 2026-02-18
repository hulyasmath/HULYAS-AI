// services/zeqond.ts
// Connect directly to daemon on port 2871 (not through API server)
const DAEMON_URL = 'http://localhost:2871';

export interface ZeqondStatus {
  running: boolean;
  status?: string;
  port?: number;
  error?: string;
  message?: string;
}

export interface ZeqondPulse {
  pulse_count: number;
  zeqond: number;  // From Unix epoch (Jan 1, 1970)
  zeqond_bigbang?: number;  // From Big Bang
  timestamp: number;
  error?: string;
}

export async function getZeqondStatus(): Promise<ZeqondStatus> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondStatus',message:'Fetching status from daemon',data:{url:`${DAEMON_URL}/api/status`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const response = await fetch(`${DAEMON_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`Daemon returned ${response.status}`);
    }
    const data = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondStatus',message:'Status received',data:{running:data.running,port:data.port},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      running: data.running || true,
      status: 'OK',
      port: data.port || 2871
    };
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondStatus',message:'Status fetch failed',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      running: false,
      error: err instanceof Error ? err.message : 'Failed to connect to daemon',
      port: 2871
    };
  }
}

export async function getZeqondPulse(): Promise<ZeqondPulse> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondPulse',message:'Fetching pulse from daemon',data:{url:`${DAEMON_URL}/api/status`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const response = await fetch(`${DAEMON_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`Daemon returned ${response.status}`);
    }
    const data = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondPulse',message:'Pulse received',data:{pulse_count:data.pulse_count,zeqond:data.zeqond},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      pulse_count: data.pulse_count || 0,
      zeqond: data.zeqond || 0,
      zeqond_bigbang: data.zeqond_bigbang || 0,
      timestamp: data.timestamp || Date.now()
    };
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondPulse',message:'Pulse fetch failed',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      pulse_count: 0,
      zeqond: 0,
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'Failed to connect to daemon'
    };
  }
}

export async function startZeqondDaemon(): Promise<{ success: boolean; message: string; pid?: number }> {
  // Daemon is always running - cannot be started/stopped
  return { success: true, message: 'Zeqond daemon is always running (core framework function)' };
}

export async function stopZeqondDaemon(): Promise<{ success: boolean; message: string }> {
  // Daemon cannot be stopped - it's a core framework function
  return { success: false, message: 'Zeqond daemon cannot be stopped - it is a core framework function' };
}

export async function getZeqondCode(): Promise<{ code: string; filename: string; description: string; version: string; port: number; frequency: number }> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondCode',message:'Fetching daemon code',data:{url:`${DAEMON_URL}/api/code`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const response = await fetch(`${DAEMON_URL}/api/code`);
    if (!response.ok) {
      throw new Error(`Daemon returned ${response.status}`);
    }
    const data = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondCode',message:'Daemon code received',data:{hasCode:!!data.code,codeLength:data.code?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return data;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c8a01636-788e-4f18-9e17-07990a6421d8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'zeqond.ts:getZeqondCode',message:'Daemon code fetch failed',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    throw err;
  }
}
