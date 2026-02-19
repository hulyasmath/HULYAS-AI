export interface ParseResponse {
  components: Record<string, any>;
  suggested_kos: Record<string, number>;
}

export interface RunResponse {
  prompt: string;
  mode: string;
  error_pct: number;
  cko_id: string;
  ko_settings: Record<string, number>;
  t_eval: number[];
  solution: number[];
  energy: number;
  tune_iterations?: number;
  beta_final?: number;
}

const BASE =
  import.meta.env.VITE_7STEP_API_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  ''; // Node API default (includes 7-step runner)

export const SEVENSTEP_BASE = BASE;

async function postJSON<T>(path: string, body: any): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out (30s). Is the API server running?');
    }
    throw e;
  }
  clearTimeout(timeoutId);
  if (!res.ok) {
    const msg = await res.text();
    // Try to parse JSON error response to extract the message
    let errorMessage = msg || `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(msg);
      if (parsed.error && parsed.message) {
        errorMessage = `${parsed.error}: ${parsed.message}`;
      } else if (parsed.message) {
        errorMessage = parsed.message;
      } else if (parsed.error) {
        errorMessage = parsed.error;
      }
    } catch {
      // If not JSON, use the message as-is
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}

export function parsePrompt(prompt: string): Promise<ParseResponse> {
  return postJSON<ParseResponse>('/api/7step/parse', { prompt });
}

/**
 * Run master equation in interactive mode.
 * 
 * FRONTEND-BACKEND CONTRACT:
 * -------------------------
 * Frontend sends:
 *   - prompt: Natural language description (e.g., "free fall on earth")
 *   - ko_settings: Operator IDs and weights ONLY (e.g., {'KO42': 1.0, 'NM19': 0.5})
 * 
 * Backend extracts physical parameters (mass, velocity, radius) from the prompt text
 * and places them in the master equation params list. Operators in ko_settings
 * receive ONLY phi and weight via C_k(kid, phi, weight) - NOT physical parameters.
 * 
 * This separation ensures:
 *   - Physical params → master equation params list
 *   - Operator weights → ko_settings dict (no physical params)
 */
export function runInteractive(args: {
  prompt: string;
  alpha: number;
  beta: number;
  ko_settings: Record<string, number>;
  t_max: number;
  dt: number;
}): Promise<RunResponse> {
  return postJSON<RunResponse>('/api/7step/run', { ...args, mode: 'interactive' });
}

/**
 * Run master equation in strict autotune mode.
 * 
 * FRONTEND-BACKEND CONTRACT:
 * -------------------------
 * Same as runInteractive - frontend sends only ko_settings (operator IDs + weights),
 * backend extracts physical parameters from prompt text. Operators in master equation
 * context receive only phi and weight, not physical parameters.
 */
export function runStrict(args: {
  prompt: string;
  t_max: number;
  dt: number;
  ko_settings?: Record<string, number>;
}): Promise<RunResponse> {
  return postJSON<RunResponse>('/api/7step/strict', args);
}

