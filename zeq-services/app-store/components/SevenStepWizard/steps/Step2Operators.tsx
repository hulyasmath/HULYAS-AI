import React, { useMemo, useState } from 'react';
import { Search, Layers, ArrowUpRight, Terminal } from 'lucide-react';
import { buildCatalog, categoryLabel, defaultCuratedIds, type RegistryOperator } from '../operators/catalog';
import { OperatorTile } from '../operators/OperatorTile';
import { OperatorDrawer, type SelectedOperator } from '../operators/OperatorDrawer';
import { normalizeSelectedOperators } from '../operators/paramTemplates';
import { formatDebuggerLine, getOperatorEquation } from '../utils/debugger';

export function Step2Operators(props: {
  components: Record<string, any> | null;
  suggested: Record<string, number>;
  koSettings: Record<string, number>;
  setKoSettings: (v: Record<string, number>) => void;
  selectedOperators: SelectedOperator[];
  setSelectedOperators: (ops: SelectedOperator[]) => void;
  ko42Mode: 'KO42.1' | 'KO42.2';
  globalParams: Record<string, any>;
  setGlobalParams: (p: Record<string, any>) => void;
}) {
  const { components, suggested, koSettings, setKoSettings, selectedOperators, setSelectedOperators, ko42Mode, globalParams, setGlobalParams } = props;
  const catalog = useMemo(() => {
    try {
      return buildCatalog();
    } catch (e) {
      console.error('Failed to build catalog:', e);
      return { byId: {}, operators: [] };
    }
  }, []);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false); // Show all 1549 operators or just standard ones
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOpId, setDrawerOpId] = useState<string | null>(null);

  // Check if operator is in standard set (expanded for v4.0 with 1549 operators)
  const isStandardOperator = (id: string): boolean => {
    // Core Physics
    if (/^QM\d+$/.test(id)) return true;           // QM1-QM30
    if (/^NM\d+$/.test(id)) return true;           // NM18-NM30
    if (/^GR\d+$/.test(id)) return true;           // GR31-GR50
    if (/^KO\d+/.test(id)) return true;            // KO1-KO100 + variants
    if (/^CS\d+$/.test(id)) return true;           // CS43-CS92
    // Extended Physics
    if (/^TH\d+$/.test(id)) return true;           // Thermodynamics
    if (/^EM\d+$/.test(id)) return true;           // Electromagnetism
    if (/^FL\d+$/.test(id)) return true;           // Fluid Dynamics
    if (/^SP\d+$/.test(id)) return true;           // Signal Processing
    if (/^CT\d+$/.test(id)) return true;           // Control Systems
    if (/^WM\d+$/.test(id)) return true;           // Wave Mechanics
    if (/^PP\d+$/.test(id)) return true;           // Plasma Physics
    if (/^APX\d+$/.test(id)) return true;          // Astrophysics
    if (/^HYD\d+$/.test(id)) return true;          // Hydrology
    // Industry Operators
    if (/^MED_/.test(id)) return true;             // Medical
    if (/^ORBIT_|^HOHMANN_|^THRUST_/.test(id)) return true;  // Aerospace
    if (/^BEAM_|^STRESS_|^BUCKLING_/.test(id)) return true;  // Engineering
    if (/^SOLAR_|^WIND_|^POWER_/.test(id)) return true;      // Energy
    if (/^VAR_|^BLACK_|^SHARPE_/.test(id)) return true;      // Finance
    return false;
  };

  const setWeight = (id: string, v: number) => {
    const next = { ...koSettings, [id]: v };
    setKoSettings(next);
  };

  const remove = (id: string) => {
    const next = { ...koSettings };
    delete next[id];
    setKoSettings(next);
  };

  const applySuggested = () => {
    setKoSettings({ ...suggested });
  };

  const selectedMap = useMemo(() => {
    const m: Record<string, SelectedOperator> = {};
    for (const s of selectedOperators) m[s.id] = s;
    return m;
  }, [selectedOperators]);

  const curatedSet = useMemo(() => {
    const ids = defaultCuratedIds();
    const exists = new Set(Object.keys(catalog.byId));
    return new Set(ids.filter((id) => exists.has(id)));
  }, [catalog]);

  const categories = useMemo(() => {
    // only categories that appear in the current display set (curated or all)
    const ops = showAll ? catalog.operators : catalog.operators.filter((o) => curatedSet.has(o.id));
    const set = new Set<string>();
    for (const o of ops) set.add(o.category);
    return ['all', ...Array.from(set).sort()];
  }, [catalog, curatedSet, showAll]);

  const filteredOps = useMemo(() => {
    const q = query.trim().toLowerCase();
    let ops = showAll ? catalog.operators : catalog.operators.filter((o) => curatedSet.has(o.id));

    // Filter to standard operators only (QM1-17, NM18-30, GR31-41, KO42) unless "Show More" is enabled
    if (!showMore) {
      ops = ops.filter((o) => isStandardOperator(o.id));
    }

    if (activeCategory !== 'all') ops = ops.filter((o) => o.category === activeCategory);
    if (q) {
      ops = ops.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.description || '').toLowerCase().includes(q) ||
          (o.category || '').toLowerCase().includes(q)
      );
    }
    return ops;
  }, [catalog, curatedSet, showAll, showMore, activeCategory, query]);

  const openDrawer = (id: string) => {
    setDrawerOpId(id);
    setDrawerOpen(true);
  };

  const toggleSelect = (id: string) => {
    if (selectedMap[id]) {
      // keep selected; open drawer for editing
      openDrawer(id);
      return;
    }
    // Enforce max 3 domain operators rule (KO42 variants don't count toward the limit)
    const isKO42Variant = id === 'KO42' || id === 'KO42.1' || id === 'KO42.2';
    if (!isKO42Variant) {
      const domainOpCount = selectedOperators.filter(
        op => op.id !== 'KO42' && op.id !== 'KO42.1' && op.id !== 'KO42.2'
      ).length;
      if (domainOpCount >= 3) {
        // Already at max 3 domain operators - open drawer for info but don't add
        return;
      }
    }
    const next = normalizeSelectedOperators([...selectedOperators, { id, params: {} }], globalParams || {}, ko42Mode);
    setSelectedOperators(next);
    openDrawer(id);
  };

  const updateSelectedParams = (id: string, params: Record<string, any>) => {
    const next = normalizeSelectedOperators(
      selectedOperators.map((s) => (s.id === id ? { ...s, params } : s)),
      globalParams || {},
      ko42Mode
    );
    setSelectedOperators(next);
  };

  const removeSelected = (id: string) => {
    const next = normalizeSelectedOperators(
      selectedOperators.filter((s) => s.id !== id),
      globalParams || {},
      ko42Mode
    );
    setSelectedOperators(next);
    setDrawerOpen(false);
    setDrawerOpId(null);
  };

  const drawerOp: RegistryOperator | null = drawerOpId ? catalog.byId[drawerOpId] || null : null;
  const drawerSelected: SelectedOperator | null = drawerOpId ? selectedMap[drawerOpId] || null : null;

  // Generate driver loading display
  const driverLoadingDisplay = useMemo(() => {
    if (selectedOperators.length === 0) return null;

    const ko42Ops = selectedOperators.filter(op => op.id.startsWith('KO'));
    const otherOps = selectedOperators.filter(op => !op.id.startsWith('KO'));

    return {
      ko42: ko42Ops,
      others: otherOps,
      total: selectedOperators.length,
    };
  }, [selectedOperators]);

  // Get operator driver names
  const getDriverName = (opId: string): string => {
    if (opId === 'KO42' || opId === 'KO42.1' || opId === 'KO42.2') {
      return 'system_clock_1.287Hz.dll';
    } else if (opId.startsWith('NM')) {
      return `newtonian_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('GR')) {
      return `relativistic_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('QM')) {
      return `quantum_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('CS')) {
      return `computation_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('KO')) {
      return `kinematic_${opId.toLowerCase()}.dll`;
    // Extended Physics (v4.0)
    } else if (opId.startsWith('SP')) {
      return `signal_processing_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('CT')) {
      return `control_systems_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('GP')) {
      return `geophysics_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('CHE')) {
      return `chem_engineering_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('WM')) {
      return `wave_mechanics_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('PP')) {
      return `plasma_physics_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('CMP')) {
      return `condensed_matter_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('HEP')) {
      return `high_energy_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('APX')) {
      return `astrophysics_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('HYD')) {
      return `hydrology_${opId.toLowerCase()}.dll`;
    // Industry Operators
    } else if (opId.startsWith('MED_')) {
      return `medical_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('ORBIT_') || opId.startsWith('HOHMANN_') || opId.startsWith('THRUST_')) {
      return `aerospace_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('BEAM_') || opId.startsWith('STRESS_')) {
      return `engineering_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('SOLAR_') || opId.startsWith('WIND_')) {
      return `energy_${opId.toLowerCase()}.dll`;
    } else if (opId.startsWith('VAR_') || opId.startsWith('BLACK_')) {
      return `finance_${opId.toLowerCase()}.dll`;
    }
    return `${opId.toLowerCase()}.dll`;
  };

  return (
    <div className="space-y-6">
      {/* Debugger Output Section - Always Visible */}
      <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          STEP 2: CHOOSE OPERATORS
        </div>
        <div className="font-mono text-xs space-y-2 text-slate-300">
          <div className="text-slate-500 mb-2">Debug Operation: Load Device Drivers/Kinematic Operators</div>
          {selectedOperators.length > 0 ? (
            <>
              {driverLoadingDisplay?.ko42.map(op => (
                <div key={op.id}>
                  {formatDebuggerLine(`loading_driver("${getDriverName(op.id)}") — ${op.id}`)}
                </div>
              ))}
              {driverLoadingDisplay?.others.map(op => (
                <div key={op.id}>
                  {formatDebuggerLine(`loading_driver("${getDriverName(op.id)}") — ${op.id}`)}
                </div>
              ))}

              <div className="mt-4 space-y-2">
                <div className="text-cyan-300 font-semibold">Selected Operators:</div>
                {selectedOperators.map(op => {
                  const catalogOp = catalog.byId[op.id];
                  const equation = getOperatorEquation(op.id, catalog);
                  return (
                    <div key={op.id} className="pl-4 space-y-1">
                      <div className="text-cyan-300">{op.id}: {catalogOp?.description || 'Operator'}</div>
                      {equation && (
                        <div className="text-slate-400 text-xs">{equation}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-slate-400">
                Rule Followed: KO42 (present) + {driverLoadingDisplay?.others.length || 0} domain-specific operator{driverLoadingDisplay?.others.length !== 1 ? 's' : ''}
              </div>
            </>
          ) : (
            <div>{formatDebuggerLine('No operators selected yet')}</div>
          )}
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
              2. Assemble Operators
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Select 1-3 domain-specific operators from our physics library. These building blocks will form your SDK operator chain.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={applySuggested}
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-black uppercase tracking-[0.2em] transition-all hover:border-cyan-500/50"
            >
              Suggested Stack
            </button>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                <Layers size={14} />
                <span>{selectedOperators.length} Active</span>
              </div>
              {selectedOperators.filter(op => op.id !== 'KO42' && op.id !== 'KO42.1' && op.id !== 'KO42.2').length >= 3 && (
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Max 3 domain operators reached</div>
              )}
            </div>
          </div>
        </div>

        {components ? (
          <div className="flex flex-wrap gap-4 mb-10">
            {Object.entries(components).map(([k, v]) => (
              <div key={k} className="bg-slate-950/60 border border-white/5 rounded-2xl px-5 py-3 shadow-inner">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{k}</div>
                <div className="text-sm text-slate-200 font-mono font-bold">{String(v)}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Operator Catalog Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search physics operators..."
              className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] bg-black/40 border-2 border-white/5 focus:border-cyan-500/50 text-slate-100 placeholder:text-slate-700 transition-all focus:ring-4 focus:ring-cyan-500/5"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMore(!showMore)}
              className={`px-6 py-4 rounded-[1.25rem] border-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${showMore
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                }`}
            >
              {showMore ? 'Standard Matrix' : 'Extended Library'}
            </button>
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-6 py-4 rounded-[1.25rem] border-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${showAll
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                }`}
            >
              All Models
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar scroll-smooth">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${activeCategory === c
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10 scale-105'
                  : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-slate-300'
                }`}
            >
              {c === 'all' ? 'Universal' : categoryLabel(c)}
            </button>
          ))}
        </div>

        {/* Periodic Table Grid + Selected Operators */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredOps.map((op) => (
                <OperatorTile
                  key={op.id}
                  op={op}
                  selected={!!selectedMap[op.id]}
                  onClick={() => toggleSelect(op.id)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-950/60 border border-white/10 rounded-[2.5rem] p-8 sticky top-4 shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">SDK Runtime</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Compiled Chain</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold shadow-lg">
                  {selectedOperators.length}
                </div>
              </div>

              {selectedOperators.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                    <Layers className="text-slate-600 w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black leading-relaxed">
                    Awaiting operator selection<br />from the physics grid
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  {selectedOperators.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openDrawer(s.id)}
                      className="w-full flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        <div className="font-mono text-slate-100 font-bold group-hover:text-cyan-300 transition-colors uppercase tracking-wider">{s.id}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-1 rounded-md bg-black/40 text-[9px] font-mono text-cyan-500/80 border border-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                          {koSettings[s.id] ? `w:${koSettings[s.id].toFixed(2)}` : 'NULL'}
                        </div>
                        <ArrowUpRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-cyan-500/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Fine-Tune Resolution</div>
                </div>
                {Object.keys(koSettings).length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest bg-white/[0.02] rounded-2xl border border-white/5">
                    No active tensioners
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                    {Object.entries(koSettings).map(([id, w]) => (
                      <div key={id} className="bg-black/30 border border-white/5 rounded-2xl p-4 shadow-inner">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="font-mono text-cyan-400 text-[10px] font-black uppercase tracking-widest">{id}</div>
                          <div className="font-mono text-white text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">{w.toFixed(3)}</div>
                        </div>
                        <div className="px-1">
                          <input
                            type="range"
                            min={0}
                            max={2}
                            step={0.01}
                            value={w}
                            onChange={(e) => setWeight(id, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 accent-cyan-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OperatorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        op={drawerOp}
        selected={drawerSelected}
        onUpdateParams={updateSelectedParams}
        onRemove={removeSelected}
        globalParams={globalParams}
        setGlobalParams={setGlobalParams}
      />
    </div>
  );
}

