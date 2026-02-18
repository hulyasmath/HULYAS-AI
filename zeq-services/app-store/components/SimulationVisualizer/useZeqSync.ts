/**
 * useZeqSync - React hook for KO42 HulyaPulse synchronization
 * 
 * Provides synchronized timing data for React Three Fiber components
 * at the universal 1.287 Hz frequency.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Constants
export const HULYAPULSE_HZ = 1.287;
export const ZEQOND = 1.0 / HULYAPULSE_HZ; // ~0.777 seconds
export const ZEQOND_MS = ZEQOND * 1000;

export interface ZeqSyncState {
  // Current sync value from KO42 operator
  syncValue: number;
  // Current Zeqond count (since Unix epoch)
  zeqond: number;
  // Time elapsed since sync started (seconds)
  elapsedTime: number;
  // Delta time since last frame (seconds)
  delta: number;
  // Total pulse count
  pulseCount: number;
  // Is the sync running
  running: boolean;
}

export interface UseZeqSyncOptions {
  /** Amplitude of the sync wave (default: 0.1) */
  amplitude?: number;
  /** Auto-start the sync (default: true) */
  autoStart?: boolean;
  /** Custom frequency override (default: 1.287 Hz) */
  frequency?: number;
}

/**
 * KO42 Universal Synchronization Operator
 */
export function ko42(t: number, amplitude: number = 0.1, phase: number = 0): number {
  return amplitude * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t + phase);
}

/**
 * KO42.1 Automatic Metric Tensioner
 * ds² = g_μν dx^μ dx^ν + α sin(2π · 1.287t) dt²
 */
export function ko42_1(t: number, metricTerm: number = 1.0, alpha: number = 0.00129): {
  value: number;
  pulseTerm: number;
} {
  const pulseTerm = alpha * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t);
  return {
    value: metricTerm + pulseTerm,
    pulseTerm
  };
}

/**
 * KO42.2 Manual Metric Tensioner
 */
export function ko42_2(t: number, metricTerm: number = 1.0, beta: number = 3.718): {
  value: number;
  pulseTerm: number;
} {
  const pulseTerm = beta * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t);
  return {
    value: metricTerm + pulseTerm,
    pulseTerm
  };
}

/**
 * Get current Zeqond count (since Unix epoch)
 */
export function getCurrentZeqond(): number {
  return Date.now() / 1000 / ZEQOND;
}

/**
 * React hook for KO42 HulyaPulse synchronization
 */
export function useZeqSync(options: UseZeqSyncOptions = {}): ZeqSyncState {
  const {
    amplitude = 0.1,
    autoStart = true,
    frequency = HULYAPULSE_HZ
  } = options;

  const [state, setState] = useState<ZeqSyncState>({
    syncValue: 0,
    zeqond: getCurrentZeqond(),
    elapsedTime: 0,
    delta: 0,
    pulseCount: 0,
    running: autoStart
  });

  const startTimeRef = useRef<number>(Date.now() / 1000);
  const lastTimeRef = useRef<number>(performance.now());
  const frameIdRef = useRef<number>(0);
  const pulseCountRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    const currentTime = Date.now() / 1000;
    const deltaMs = now - lastTimeRef.current;
    const delta = deltaMs / 1000;
    const elapsedTime = currentTime - startTimeRef.current;
    
    // Calculate KO42 sync value
    const syncValue = amplitude * Math.sin(2 * Math.PI * frequency * elapsedTime);
    
    // Calculate Zeqond
    const zeqond = getCurrentZeqond();
    
    // Check if we've crossed a pulse boundary
    const expectedPulses = Math.floor(elapsedTime * frequency);
    if (expectedPulses > pulseCountRef.current) {
      pulseCountRef.current = expectedPulses;
    }

    setState({
      syncValue,
      zeqond,
      elapsedTime,
      delta,
      pulseCount: pulseCountRef.current,
      running: true
    });

    lastTimeRef.current = now;
    frameIdRef.current = requestAnimationFrame(tick);
  }, [amplitude, frequency]);

  useEffect(() => {
    if (autoStart) {
      startTimeRef.current = Date.now() / 1000;
      lastTimeRef.current = performance.now();
      frameIdRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [autoStart, tick]);

  return state;
}

/**
 * Hook for using sync in useFrame (React Three Fiber)
 * Returns a ref that updates every frame without causing re-renders
 */
export function useZeqSyncRef(options: UseZeqSyncOptions = {}) {
  const {
    amplitude = 0.1,
    frequency = HULYAPULSE_HZ
  } = options;

  const ref = useRef({
    syncValue: 0,
    zeqond: getCurrentZeqond(),
    elapsedTime: 0,
    pulseCount: 0
  });

  const startTimeRef = useRef<number>(Date.now() / 1000);

  // Update function to be called in useFrame
  const update = useCallback(() => {
    const currentTime = Date.now() / 1000;
    const elapsedTime = currentTime - startTimeRef.current;
    
    ref.current.syncValue = amplitude * Math.sin(2 * Math.PI * frequency * elapsedTime);
    ref.current.zeqond = getCurrentZeqond();
    ref.current.elapsedTime = elapsedTime;
    ref.current.pulseCount = Math.floor(elapsedTime * frequency);
    
    return ref.current;
  }, [amplitude, frequency]);

  return { ref, update, startTime: startTimeRef };
}

export default useZeqSync;
