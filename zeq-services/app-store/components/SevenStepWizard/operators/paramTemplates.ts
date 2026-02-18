import { getExampleParams } from '../../../services/operators';
import type { SelectedOperator } from './OperatorDrawer';

export type GlobalParams = Record<string, any>;

function isKinematic(id: string): boolean {
  if (!id) return false;
  if (!id.startsWith('KO')) return false;
  // Exclude KO42 family from “1–3 kinematic operators” count
  if (id === 'KO42' || id === 'KO42.1' || id === 'KO42.2') return false;
  return true;
}

/**
 * Build per-operator params for STANDALONE operator execution.
 * 
 * CRITICAL CONTEXT SEPARATION:
 * ----------------------------
 * This function is used ONLY for standalone operator execution (e.g., in AutoPilot
 * or Step5ExecuteChain), where operators are called directly with physical parameters.
 * 
 * In MASTER EQUATION context, operators receive ONLY:
 *   - Field value phi (from the master equation state)
 *   - Weight (from ko_settings)
 * 
 * Physical parameters (mass, velocity, radius, etc.) in master equation context
 * are placed in the master equation's params list, NOT passed to operators.
 * 
 * Two Execution Contexts:
 * ------------------------
 * 1. STANDALONE (this function): Operators receive physical parameters directly
 *    - Used for: Direct operator calculations, testing, chain execution
 *    - Example: executeOperator('NM19', {m: 1.0, a: 9.8})
 * 
 * 2. MASTER EQUATION: Operators receive only phi and weight
 *    - Used for: Unified field equation integration
 *    - Physical params go in: params = [m, M, R, ..., ko_settings, ...]
 *    - Operators contribute via: C_k(kid, phi, weight)
 * 
 * Parameter Priority (highest to lowest):
 * ---------------------------------------
 * 1. explicit params (passed directly)
 * 2. globalParams (measurements/constants from presets)
 * 3. operator example params (fallback defaults)
 * 
 * @param operatorId - Operator ID (e.g., 'KO1', 'NM19', 'GR35')
 * @param globalParams - Global physical parameters (mass_kg, speed_m_s, etc.)
 * @param explicit - Explicit per-operator parameters (highest priority)
 * @returns Parameter object for standalone operator execution
 */
export function buildOperatorParams(operatorId: string, globalParams: GlobalParams, explicit: Record<string, any> = {}): Record<string, any> {
  const base = { ...(getExampleParams(operatorId) || {}) };
  const g = globalParams || {};

  // Minimal templating for common physics operators used in presets.
  // (We will expand coverage over time to more operators.)
  if (operatorId === 'NM19') {
    // F = m a
    if (typeof g.mass_kg === 'number' && base.m === undefined) base.m = g.mass_kg;
    if (typeof g.g_m_s2 === 'number' && base.a === undefined) base.a = g.g_m_s2;
  }

  if (operatorId === 'NM21') {
    // Newtonian gravity: try to fill common names if present
    if (typeof g.m1_kg === 'number' && base.m1 === undefined) base.m1 = g.m1_kg;
    if (typeof g.m2_kg === 'number' && base.m2 === undefined) base.m2 = g.m2_kg;
    if (typeof g.r_m === 'number' && base.r === undefined) base.r = g.r_m;
    if (typeof g.mu_m3_s2 === 'number' && base.mu === undefined) base.mu = g.mu_m3_s2;
  }

  if (operatorId === 'GR35') {
    // Relativistic time correction: Δt = Δt0 / sqrt(1-2GM/(rc^2))
    if (typeof g.mu_m3_s2 === 'number' && base.GM === undefined) base.GM = g.mu_m3_s2;
    if (typeof g.r_m === 'number' && base.r === undefined) base.r = g.r_m;
    if (typeof g.c === 'number' && base.c === undefined) base.c = g.c;
  }

  if (operatorId === 'KO1') {
    // position magnitude - use height as z if present
    if (typeof g.height_m === 'number') {
      if (base.x === undefined) base.x = 0;
      if (base.y === undefined) base.y = 0;
      if (base.z === undefined) base.z = g.height_m;
    }
  }

  if (operatorId === 'KO2') {
    // velocity magnitude - use speed if present
    if (typeof g.speed_m_s === 'number') {
      if (base.vx === undefined) base.vx = g.speed_m_s;
      if (base.vy === undefined) base.vy = 0;
      if (base.vz === undefined) base.vz = 0;
    }
  }

  // KO42 variants: let global params carry hulya_f, alpha/beta if user sets them.
  if (operatorId === 'KO42.1' && typeof g.alpha === 'number') {
    if (base.alpha === undefined) base.alpha = g.alpha;
  }
  if (operatorId === 'KO42.2' && typeof g.beta === 'number') {
    if (base.beta === undefined) base.beta = g.beta;
  }

  return { ...g, ...base, ...(explicit || {}) };
}

export function normalizeOperatorChain(
  operatorIds: string[],
  ko42Mode: 'KO42.1' | 'KO42.2' = 'KO42.1'
): string[] {
  const ids = Array.from(new Set(operatorIds || []));
  const withoutKo42 = ids.filter((x) => x !== 'KO42' && x !== 'KO42.1' && x !== 'KO42.2');

  // Enforce 1–3 kinematic operators (excluding KO42 family)
  const kinematic = withoutKo42.filter(isKinematic).slice(0, 3);
  const nonKinematic = withoutKo42.filter((x) => !isKinematic(x));
  const ensuredKinematic = kinematic.length > 0 ? kinematic : ['KO1'];

  return Array.from(new Set(['KO42', ko42Mode, ...ensuredKinematic, ...nonKinematic]));
}

export function hydrateSelectedOperators(
  operatorIds: string[],
  globalParams: GlobalParams,
  ko42Mode: 'KO42.1' | 'KO42.2' = 'KO42.1'
): SelectedOperator[] {
  const ids = normalizeOperatorChain(operatorIds, ko42Mode);
  return ids.map((id) => ({ id, params: buildOperatorParams(id, globalParams, {}) }));
}

export function normalizeSelectedOperators(
  selected: SelectedOperator[],
  globalParams: GlobalParams,
  ko42Mode: 'KO42.1' | 'KO42.2' = 'KO42.1'
): SelectedOperator[] {
  const map: Record<string, SelectedOperator> = {};
  for (const s of selected || []) map[s.id] = s;
  const ids = normalizeOperatorChain((selected || []).map((s) => s.id), ko42Mode);
  return ids.map((id) => {
    const existing = map[id];
    if (existing) return existing;
    return { id, params: buildOperatorParams(id, globalParams || {}, {}) };
  });
}
