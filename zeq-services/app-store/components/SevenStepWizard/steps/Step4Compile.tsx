import React, { useMemo } from 'react';
import { Terminal } from 'lucide-react';
import { formatDebuggerLine, mapOperatorsToMasterEquation, generateCompiledMasterEquation } from '../utils/debugger';
import { buildCatalog } from '../operators/catalog';

export function Step4Compile(props: {
  koSettings: Record<string, number>;
  mode: 'interactive' | 'strict';
  selectedOperators?: Array<{ id: string }>;
  ko42Mode: 'KO42.1' | 'KO42.2';
}) {
  const { koSettings, mode, selectedOperators = [], ko42Mode } = props;
  const catalog = useMemo(() => {
    try {
      return buildCatalog();
    } catch (e) {
      console.error('Failed to build catalog:', e);
      return { byId: {}, operators: [] };
    }
  }, []);

  const koList = useMemo(() => {
    if (!selectedOperators || selectedOperators.length === 0) {
      return [];
    }

    // Extract operator IDs, filtering out duplicates
    const operatorIds = selectedOperators
      .map(op => op?.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    // Group KO42 variants: KO42, KO42.1, KO42.2 → show as single "KO42" entry
    const hasKO42 = operatorIds.some(id =>
      id === 'KO42' || id === 'KO42.1' || id === 'KO42.2'
    );

    // Filter out KO42 variants and get domain operators (1-3 max)
    const domainOps = operatorIds.filter(id =>
      id !== 'KO42' && id !== 'KO42.1' && id !== 'KO42.2'
    );

    // Build display list: KO42 (with mode) + domain operators
    const displayList: Array<[string, number]> = [];

    // Add KO42 as single entry with mode indication
    if (hasKO42) {
      const ko42Display = `KO42 (${ko42Mode})`;
      // Get weight from koSettings if available, otherwise default
      const ko42Weight = koSettings[ko42Mode] || koSettings['KO42'] || 1.0;
      displayList.push([ko42Display, ko42Weight]);
    }

    // Add domain operators (1-3 max, respecting framework rule)
    const domainOpsToShow = domainOps.slice(0, 3);
    for (const opId of domainOpsToShow) {
      const weight = koSettings[opId] || 1.0;
      displayList.push([opId, weight]);
    }

    return displayList;
  }, [selectedOperators, koSettings, ko42Mode]);

  // Generate operator mapping for Master Equation with safety checks
  const operatorMapping = useMemo(() => {
    if (!selectedOperators || !Array.isArray(selectedOperators) || selectedOperators.length === 0) {
      return [];
    }
    const mappings: Array<{ index: number; operatorId: string; description: string }> = [];
    for (const op of selectedOperators) {
      if (!op || !op.id || typeof op.id !== 'string') continue;
      try {
        const mapping = mapOperatorsToMasterEquation(op.id);
        if (mapping) {
          mappings.push({
            index: mapping.index,
            operatorId: op.id,
            description: mapping.description,
          });
        }
      } catch (e) {
        console.warn(`Failed to map operator ${op.id}:`, e);
      }
    }
    return mappings.sort((a, b) => a.index - b.index);
  }, [selectedOperators]);

  const operatorList = useMemo(() => {
    if (!selectedOperators || !Array.isArray(selectedOperators) || selectedOperators.length === 0) {
      return 'No operators';
    }
    const ops = selectedOperators
      .filter(op => op && op.id && typeof op.id === 'string')
      .map(op => op.id);
    return ops.length > 0 ? ops.join(' + ') : 'No operators';
  }, [selectedOperators]);

  const compilationStatus = selectedOperators.length > 0 ? 'SUCCESS' : 'PENDING';

  // Generate unique compiled Master Equation based on selected operators
  const compiledMasterEquation = useMemo(() => {
    try {
      return generateCompiledMasterEquation(selectedOperators || [], koSettings || {});
    } catch (e) {
      console.error('Error generating compiled Master Equation:', e);
      // Fallback to default template if generation fails
      return '□ϕ − μ²(r)ϕ − λϕ³ − e^(−ϕ/ϕ_c) + ϕ_c⁴² Σ_{k=1}^{42} C_k(ϕ) = T_μ^μ + β F_{μν} F^{μν} + J_ext';
    }
  }, [selectedOperators, koSettings]);

  return (
    <div className="space-y-6">
      {/* Debugger Output Section */}
      <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          STEP 4: COMPILE VIA MASTER EQUATION
        </div>
        <div className="font-mono text-xs space-y-2 text-slate-300">
          <div className="text-slate-500 mb-2">Debug Operation: Compile Source Code</div>
          <div>{formatDebuggerLine('compiling physics program...')}</div>
          <div>{formatDebuggerLine(`source: ${operatorList}`)}</div>
          <div>{formatDebuggerLine('target: unified_field_ϕ')}</div>

          <div className="mt-4">
            <div className="text-cyan-300 font-semibold mb-2">Master Equation:</div>
            <div className="text-slate-200 text-sm leading-relaxed">
              {compiledMasterEquation}
            </div>
          </div>

          {operatorMapping.length > 0 && (
            <div className="mt-4">
              <div className="text-cyan-300 font-semibold mb-2">Operator Mapping:</div>
              <div className="space-y-1">
                {operatorMapping.map((m, i) => (
                  <div key={i} className="text-slate-300">
                    - C_{m.index} = {m.operatorId} ({m.description})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-cyan-300 font-semibold">Compilation Status: <span className={compilationStatus === 'SUCCESS' ? 'text-emerald-300' : 'text-yellow-300'}>{compilationStatus}</span></div>
            {compilationStatus === 'SUCCESS' && (
              <div className="text-slate-400 mt-1">Output: Compiled field ϕ with embedded physics program</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
              4. Synthesize Engine
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Compiling the natural language prompt and selected physical operators into a unified field equation. This is the master kernel for your simulation.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Compiler Ready</span>
          </div>
        </div>

        <div className="mb-10 bg-slate-950/60 border border-cyan-500/30 rounded-[2rem] p-8 shadow-inner relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Master Equation (CKO)</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">v1.287 Unified Kernel</div>
            </div>
            <div className="font-mono text-xl md:text-2xl text-white text-center py-10 leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {compiledMasterEquation}
            </div>
            <div className="grid md:grid-cols-3 gap-4 pt-8 border-t border-white/5">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Time Kernel</div>
                <div className="text-xs text-cyan-300 font-mono font-bold uppercase tracking-widest">HulyaPulse 1.287Hz</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Metric Tensioner</div>
                <div className="text-xs text-violet-300 font-mono font-bold uppercase tracking-widest">ZEQ42 Proper-Time</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Target Field</div>
                <div className="text-xs text-emerald-300 font-mono font-bold uppercase tracking-widest">&phi;(t) Scalar Potential</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Execution Registry</div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${mode === 'strict' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                {mode === 'strict' ? 'Strict Solver' : 'Manual Solver'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Convergence</div>
                <div className="text-xs text-white font-mono">{mode === 'strict' ? '&le; 0.1% mean error' : 'Single-Pass Verification'}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Resolution</div>
                <div className="text-xs text-white font-mono">1.287 Hz Sampling</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Resource Allocation</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{koList.length} Active Modules</div>
            </div>
            {koList.length === 0 ? (
              <div className="h-20 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em]">
                Registry Empty
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {koList.map(([id, w]) => (
                  <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="font-mono text-cyan-400 text-xs font-bold tracking-wider">{id}</span>
                    <span className="text-[10px] text-slate-500 translate-y-px uppercase font-black tracking-widest">Weight: <span className="text-white font-mono">{w.toFixed(3)}</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

