import React, { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, XCircle, Eye, Loader2, Bell, Send, Users, Settings, Plus, Trash2, RefreshCw, Sparkles, Copy, Check, Package, Zap, Globe, Code2 } from 'lucide-react';

interface Submission {
  id: string;
  app_id: string | null;
  developer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  validation_result: any;
  created_at: number;
}

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  developer_id: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ─── App Category Templates for Auto-Generation ───
const APP_CATEGORIES = [
  { id: 'transportation', name: 'Transportation & Vehicles', icon: '🚗', color: 'from-blue-500 to-cyan-600',
    operators: ['NM18', 'NM19', 'NM22', 'NM25', 'KO42'],
    domains: ['vehicle dynamics', 'aerodynamics', 'traffic flow'] },
  { id: 'machine-learning', name: 'Advanced Machine Learning', icon: '🧠', color: 'from-emerald-500 to-teal-600',
    operators: ['CS43', 'CS44', 'CS47', 'CS87', 'QL1', 'KO42'],
    domains: ['neural networks', 'reinforcement learning', 'signal processing'] },
  { id: 'physics', name: 'Advanced Physics & Engineering', icon: '⚛️', color: 'from-violet-500 to-purple-600',
    operators: ['NM22', 'NM23', 'NM25', 'QM1', 'GR33', 'KO42'],
    domains: ['fluid dynamics', 'thermodynamics', 'electromagnetism'] },
  { id: 'life-sciences', name: 'Life Sciences & Biotech', icon: '🧬', color: 'from-green-500 to-lime-600',
    operators: ['MED1', 'MED2', 'BIO1', 'BIO2', 'QM1', 'KO42'],
    domains: ['pharmacokinetics', 'genomics', 'biomechanics'] },
  { id: 'earth-sciences', name: 'Earth & Geosciences', icon: '🌍', color: 'from-amber-500 to-orange-600',
    operators: ['NM21', 'NM22', 'ENV1', 'ENERGY1', 'KO42'],
    domains: ['seismology', 'oceanography', 'power systems'] },
  { id: 'custom', name: 'Custom Category', icon: '✨', color: 'from-cyan-500 to-blue-600',
    operators: ['KO42'], domains: [] },
];

interface ManagedApp {
  id: string;
  name: string;
  route: string;
  category: string;
  status: 'active' | 'disabled' | 'draft';
  developer: string;
  operators: string[];
  created: string;
}

// ─── Admin Settings Panel with Auto-Generation ───
const AdminSettingsPanel: React.FC = () => {
  const [settingsTab, setSettingsTab] = useState<'apps' | 'generate' | 'system'>('apps');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-gen state
  const [genCategory, setGenCategory] = useState(APP_CATEGORIES[0]);
  const [genName, setGenName] = useState('');
  const [genDescription, setGenDescription] = useState('');
  const [genRoute, setGenRoute] = useState('');
  const [genDeveloper, setGenDeveloper] = useState('Core Team');
  const [genOperators, setGenOperators] = useState<string[]>(['KO42']);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<string | null>(null);

  // Managed apps from COMMUNITY_APPS that have routes
  const [managedApps] = useState<ManagedApp[]>(() => {
    try {
      const stored = localStorage.getItem('zeq_managed_apps');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [
      { id: '12', name: 'Orbital Mission Planner', route: '/orbital-planner', category: 'Aerospace', status: 'active', developer: 'Aerospace Lab', operators: ['HOHMANN_TRANSFER', 'ORBIT_VELOCITY', 'KO42'], created: '2024-12-01' },
      { id: '13', name: 'Financial Risk Analyzer', route: '/financial-analyzer', category: 'Finance', status: 'active', developer: 'Finance Team', operators: ['FIN1', 'FIN2', 'CS47', 'KO42'], created: '2024-12-01' },
      { id: '14', name: 'Medical Dosage Calculator', route: '/medical-calculator', category: 'Medical', status: 'active', developer: 'Medical Lab', operators: ['MED1', 'MED2', 'MED3', 'KO42'], created: '2024-12-01' },
      { id: '22', name: 'Vehicle Dynamics Analyzer', route: '/vehicle-dynamics', category: 'Transportation', status: 'active', developer: 'Transport Lab', operators: ['NM18', 'NM19', 'KO42'], created: '2025-02-01' },
      { id: '23', name: 'Aerodynamics Wind Tunnel', route: '/aero-wind-tunnel', category: 'Transportation', status: 'active', developer: 'Aero Team', operators: ['NM22', 'NM25', 'KO42'], created: '2025-02-01' },
      { id: '24', name: 'Traffic Flow Optimizer', route: '/traffic-optimizer', category: 'Transportation', status: 'active', developer: 'Transport Lab', operators: ['CS43', 'NM19', 'KO42'], created: '2025-02-01' },
      { id: '25', name: 'Neural Architecture Designer', route: '/neural-architect', category: 'Machine Learning', status: 'active', developer: 'ML Lab', operators: ['CS43', 'CS44', 'CS47', 'KO42'], created: '2025-02-01' },
      { id: '26', name: 'RL Playground', route: '/rl-playground', category: 'Machine Learning', status: 'active', developer: 'ML Lab', operators: ['CS43', 'CS87', 'QL1', 'KO42'], created: '2025-02-01' },
      { id: '27', name: 'Signal Classification Studio', route: '/signal-classifier', category: 'Machine Learning', status: 'active', developer: 'ML Lab', operators: ['CS47', 'CS87', 'KO42'], created: '2025-02-01' },
      { id: '28', name: 'Fluid Dynamics Simulator', route: '/fluid-dynamics', category: 'Physics', status: 'active', developer: 'Physics Lab', operators: ['NM22', 'NM23', 'KO42'], created: '2025-02-01' },
      { id: '29', name: 'Thermodynamic Cycle Analyzer', route: '/thermo-cycles', category: 'Physics', status: 'active', developer: 'Physics Lab', operators: ['NM22', 'NM25', 'KO42'], created: '2025-02-01' },
      { id: '30', name: 'EM Field Visualizer', route: '/em-fields', category: 'Physics', status: 'active', developer: 'Physics Lab', operators: ['QM1', 'NM22', 'KO42'], created: '2025-02-01' },
      { id: '31', name: 'Pharmacokinetics Modeler', route: '/pharma-kinetics', category: 'Life Sciences', status: 'active', developer: 'BioTech Lab', operators: ['MED1', 'MED2', 'KO42'], created: '2025-02-01' },
      { id: '32', name: 'Genomics Sequence Analyzer', route: '/genomics-analyzer', category: 'Life Sciences', status: 'active', developer: 'BioTech Lab', operators: ['BIO1', 'BIO2', 'KO42'], created: '2025-02-01' },
      { id: '33', name: 'Biomechanics Analyzer', route: '/biomechanics', category: 'Life Sciences', status: 'active', developer: 'BioTech Lab', operators: ['NM18', 'NM19', 'KO42'], created: '2025-02-01' },
      { id: '34', name: 'Seismology Station', route: '/seismology', category: 'Earth Sciences', status: 'active', developer: 'GeoScience Lab', operators: ['NM21', 'NM22', 'KO42'], created: '2025-02-01' },
      { id: '35', name: 'Ocean Dynamics Lab', route: '/ocean-dynamics', category: 'Earth Sciences', status: 'active', developer: 'GeoScience Lab', operators: ['NM22', 'NM25', 'KO42'], created: '2025-02-01' },
      { id: '36', name: 'Power Grid Analyzer', route: '/power-grid', category: 'Earth Sciences', status: 'active', developer: 'GeoScience Lab', operators: ['ENERGY1', 'NM22', 'KO42'], created: '2025-02-01' },
    ];
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredApps = filterCategory === 'all'
    ? managedApps
    : managedApps.filter(a => a.category.toLowerCase().includes(filterCategory.toLowerCase()));

  const handleCategorySelect = useCallback((cat: typeof APP_CATEGORIES[0]) => {
    setGenCategory(cat);
    setGenOperators([...cat.operators]);
    setGenRoute('');
    setGenName('');
    setGenDescription('');
  }, []);

  const handleAutoGenRoute = useCallback((name: string) => {
    setGenName(name);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setGenRoute('/' + slug);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!genName.trim() || !genRoute.trim()) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const token = localStorage.getItem('zeq_token');
      const payload = {
        name: genName,
        description: genDescription || `${genCategory.name} application with HulyaPulse synchronization`,
        category: genCategory.name,
        pluginUrl: `zeq-app://${genRoute.replace('/', '')}`,
        tags: [genCategory.id, ...genCategory.domains.slice(0, 2)],
      };

      // Try to submit via API
      try {
        const resp = await fetch(`${API_BASE_URL}/apps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const data = await resp.json();
          setGenResult(`App "${genName}" created successfully (ID: ${data.id || 'pending'}). Route: ${genRoute}\n\nOperators: ${genOperators.join(', ')}\nCategory: ${genCategory.name}\nStatus: Pending approval`);
        } else {
          // API not available - generate scaffold info
          setGenResult(`App scaffold generated for "${genName}".\n\nRoute: ${genRoute}\nCategory: ${genCategory.name}\nOperators: ${genOperators.join(', ')}\nDeveloper: ${genDeveloper}\n\nComponent structure:\n  components/${genName.replace(/\s+/g, '')}/\n  ├── index.tsx (AppPageLayout + useZeqSync)\n  ├── Visualization.tsx (SVG/Canvas)\n  ├── Analysis.tsx (computation)\n  └── Metrics.tsx (PrecisionBadge + EntropyVerifier + KolmogorovChecker)\n\nAdd to constants.ts and App.tsx to activate.`);
        }
      } catch {
        setGenResult(`App scaffold generated for "${genName}".\n\nRoute: ${genRoute}\nCategory: ${genCategory.name}\nOperators: ${genOperators.join(', ')}\nDeveloper: ${genDeveloper}\n\nComponent structure:\n  components/${genName.replace(/\s+/g, '')}/\n  ├── index.tsx (AppPageLayout + useZeqSync)\n  ├── Visualization.tsx (SVG/Canvas)\n  ├── Analysis.tsx (computation)\n  └── Metrics.tsx (PrecisionBadge + EntropyVerifier + KolmogorovChecker)\n\nAdd to constants.ts and App.tsx to activate.`);
      }
    } catch (err) {
      setGenResult(`Error: ${err instanceof Error ? err.message : 'Generation failed'}`);
    } finally {
      setGenerating(false);
    }
  }, [genName, genRoute, genDescription, genCategory, genOperators, genDeveloper]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const statusColor = (s: string) =>
    s === 'active' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
    s === 'disabled' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';

  return (
    <div className="space-y-6">
      {/* Settings Sub-Tabs */}
      <div className="flex gap-2">
        {([
          { id: 'apps' as const, label: 'Manage Apps', icon: Package },
          { id: 'generate' as const, label: 'Auto-Generate', icon: Sparkles },
          { id: 'system' as const, label: 'System', icon: Globe },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setSettingsTab(t.id)}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
              settingsTab === t.id ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Manage Apps ─── */}
      {settingsTab === 'apps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package size={20} className="text-cyan-400" />
              Community Apps ({managedApps.length})
            </h3>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
              >
                <option value="all">All Categories</option>
                <option value="transportation">Transportation</option>
                <option value="machine learning">Machine Learning</option>
                <option value="physics">Physics</option>
                <option value="life">Life Sciences</option>
                <option value="earth">Earth Sciences</option>
                <option value="aerospace">Aerospace</option>
                <option value="finance">Finance</option>
                <option value="medical">Medical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 px-3">ID</th>
                  <th className="pb-3 px-3">Name</th>
                  <th className="pb-3 px-3">Route</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Operators</th>
                  <th className="pb-3 px-3">Developer</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500">#{app.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{app.name}</td>
                    <td className="py-3 px-3">
                      <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-cyan-400">{app.route}</code>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{app.category}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${statusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {app.operators.slice(0, 3).map(op => (
                          <span key={op} className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">{op}</span>
                        ))}
                        {app.operators.length > 3 && (
                          <span className="text-xs text-slate-500">+{app.operators.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs">{app.developer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Auto-Generate App ─── */}
      {settingsTab === 'generate' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-cyan-400" />
              App Auto-Generator
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Select a category and configure your app. The generator creates the scaffold structure with HulyaPulse synchronization, operator integration, and verification badges.
            </p>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {APP_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      genCategory.id === cat.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-semibold text-sm text-white">{cat.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{cat.domains.join(', ')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* App Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">App Name</label>
                <input
                  type="text"
                  value={genName}
                  onChange={e => handleAutoGenRoute(e.target.value)}
                  placeholder="e.g., Structural Resonance Analyzer"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Route (auto-generated)</label>
                <input
                  type="text"
                  value={genRoute}
                  onChange={e => setGenRoute(e.target.value)}
                  placeholder="/auto-generated-slug"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Developer</label>
                <input
                  type="text"
                  value={genDeveloper}
                  onChange={e => setGenDeveloper(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Operators</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/50 border border-slate-700 rounded-xl min-h-[48px]">
                  {genOperators.map(op => (
                    <span key={op} className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/30">
                      {op}
                      {op !== 'KO42' && (
                        <button onClick={() => setGenOperators(prev => prev.filter(o => o !== op))} className="hover:text-red-400">
                          <XCircle size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={genDescription}
                  onChange={e => setGenDescription(e.target.value)}
                  placeholder="Describe what this app does..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !genName.trim() || !genRoute.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate App Scaffold
                </>
              )}
            </button>
          </div>

          {/* Generation Result */}
          {genResult && (
            <div className="glass rounded-3xl p-6 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-cyan-500/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Generated
                </h4>
                <button
                  onClick={() => handleCopy(genResult, 'gen-result')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  {copiedId === 'gen-result' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === 'gen-result' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-xl overflow-auto max-h-80">
                {genResult}
              </pre>
            </div>
          )}

          {/* Quick Templates */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Code2 size={18} className="text-cyan-400" />
              Required Component Pattern
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-cyan-400 font-bold mb-2">index.tsx</p>
                <pre className="text-slate-400 font-mono whitespace-pre">{`import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';

const MyApp: React.FC = () => {
  const { syncValue, elapsedTime } = useZeqSync();
  return (
    <AppPageLayout title="..." description="..." domain="...">
      {/* Visualization + Metrics */}
    </AppPageLayout>
  );
};
export default MyApp;`}</pre>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-orange-400 font-bold mb-2">Metrics.tsx</p>
                <pre className="text-slate-400 font-mono whitespace-pre">{`import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';

// Required in every app:
<PrecisionBadge computed={val} reference={ref} label="..." />
<EntropyVerifier data={numbers[]} label="..." />
<KolmogorovChecker data={serializedStr} label="..." />`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── System Settings ─── */}
      {settingsTab === 'system' && (
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe size={20} className="text-cyan-400" />
              System Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">API Endpoint</p>
                <p className="font-mono text-sm text-cyan-400">{API_BASE_URL}</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">HulyaPulse Frequency</p>
                <p className="font-mono text-sm text-cyan-400">1.287 Hz</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Precision Target</p>
                <p className="font-mono text-sm text-green-400">&le; 0.1%</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Community Apps</p>
                <p className="font-mono text-sm text-orange-400">{managedApps.length} active</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Required Components</p>
                <p className="text-sm text-slate-300">AppPageLayout, useZeqSync, PrecisionBadge, EntropyVerifier, KolmogorovChecker</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Operator Database</p>
                <p className="font-mono text-sm text-cyan-400">1549 operators / 34 domains</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [apps, setApps] = useState<Record<string, App>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'submissions' | 'notifications' | 'settings'>('submissions');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'system' | 'update' | 'app'>('system');
  const [notifTarget, setNotifTarget] = useState<'all' | 'specific'>('all');
  const [notifSending, setNotifSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    target: string;
    sentAt: string;
  }>>([
    { id: 1, title: 'Welcome to Zeq OS', message: 'Your account is ready. Explore the App Store!', type: 'system', target: 'all', sentAt: '2024-02-05 10:30' },
    { id: 2, title: 'SDK v4.0.1 Released', message: 'New operators and improved precision available.', type: 'update', target: 'all', sentAt: '2024-02-05 08:00' },
  ]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const token = localStorage.getItem('zeq_token');
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        
        // Load app details for each submission
        const appIds = data
          .map((s: Submission) => s.app_id)
          .filter((id: string | null): id is string => id !== null);
        
        for (const appId of appIds) {
          try {
            const appResponse = await fetch(`${API_BASE_URL}/apps/${appId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (appResponse.ok) {
              const app = await appResponse.json();
              setApps(prev => ({ ...prev, [appId]: app }));
            }
          } catch (e) {
            console.error('Failed to load app:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('zeq_token');
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await loadSubmissions();
        alert('Submission approved!');
      } else {
        alert('Failed to approve submission');
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve submission');
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('zeq_token');
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await loadSubmissions();
        alert('Submission rejected');
      } else {
        alert('Failed to reject submission');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject submission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      alert('Please fill in title and message');
      return;
    }

    setNotifSending(true);
    try {
      // In production, this would call an API endpoint to broadcast notifications
      // For now, we'll simulate it and store locally
      const newNotification = {
        id: Date.now(),
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        target: notifTarget,
        sentAt: new Date().toLocaleString(),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setSentNotifications(prev => [newNotification, ...prev]);

      // Dispatch a custom event so App.tsx can add to notifications
      window.dispatchEvent(new CustomEvent('admin-notification', {
        detail: {
          id: newNotification.id,
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          time: 'Just now',
          read: false,
        }
      }));

      // Clear form
      setNotifTitle('');
      setNotifMessage('');
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    } finally {
      setNotifSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
          <Shield className="text-cyan-400" size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-bold font-futuristic uppercase tracking-tighter">
            Admin Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage app submissions and send notifications
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveAdminTab('submissions')}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
            activeAdminTab === 'submissions'
              ? 'bg-cyan-600 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Eye size={18} />
          Submissions
        </button>
        <button
          onClick={() => setActiveAdminTab('notifications')}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
            activeAdminTab === 'notifications'
              ? 'bg-cyan-600 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
            activeAdminTab === 'settings'
              ? 'bg-cyan-600 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      {/* Notifications Tab */}
      {activeAdminTab === 'notifications' && (
        <div className="space-y-6">
          {/* Send Notification Form */}
          <div className="glass rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send size={20} className="text-cyan-400" />
              Send Notification
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Notification Type</label>
                <div className="flex gap-2">
                  {(['system', 'update', 'app'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNotifType(type)}
                      className={`px-4 py-2 rounded-xl font-semibold capitalize transition-colors ${
                        notifType === type
                          ? type === 'system' ? 'bg-violet-600 text-white' :
                            type === 'update' ? 'bg-cyan-600 text-white' :
                            'bg-green-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {type === 'system' ? '⚡' : type === 'update' ? '🔄' : '📦'} {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNotifTarget('all')}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
                      notifTarget === 'all'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Users size={16} />
                    All Users
                  </button>
                  <button
                    onClick={() => setNotifTarget('specific')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                      notifTarget === 'specific'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Specific Users
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g., New Feature Available"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Message</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <button
                onClick={handleSendNotification}
                disabled={notifSending || !notifTitle.trim() || !notifMessage.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {notifSending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sent Notifications History */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Sent Notifications</h3>
            {sentNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 bg-slate-900/30 rounded-xl border border-slate-700 flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'system' ? 'bg-violet-500/20 text-violet-400' :
                      notif.type === 'update' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {notif.type === 'system' ? '⚡' : notif.type === 'update' ? '🔄' : '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{notif.title}</p>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                          {notif.target === 'all' ? 'All Users' : 'Specific'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{notif.message}</p>
                      <p className="text-slate-500 text-xs mt-2">{notif.sentAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab - App Management & Auto-Generation */}
      {activeAdminTab === 'settings' && (
        <AdminSettingsPanel />
      )}

      {/* Submissions Tab */}
      {activeAdminTab === 'submissions' && (submissions.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Shield size={48} className="mx-auto mb-4 opacity-50" />
          <p>No submissions to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const app = submission.app_id ? apps[submission.app_id] : null;
            
            return (
              <div
                key={submission.id}
                className="glass rounded-3xl p-6 border border-white/10 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(submission.created_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {app ? (
                      <div>
                        <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                        <p className="text-slate-400 text-sm mb-2">{app.description}</p>
                        <span className="text-xs text-cyan-400 uppercase tracking-widest">
                          {app.category}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold mb-2">Submission #{submission.id.slice(0, 8)}</h3>
                        <p className="text-slate-400 text-sm">Developer ID: {submission.developer_id}</p>
                      </div>
                    )}
                    
                    {submission.validation_result && (
                      <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Validation Result</p>
                        <pre className="text-xs text-slate-300 overflow-auto">
                          {JSON.stringify(submission.validation_result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(submission.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-white/5 rounded-xl"
              >
                ✕
              </button>
            </div>
            <pre className="text-xs text-slate-300 overflow-auto bg-slate-900/50 p-4 rounded-xl">
              {JSON.stringify(selectedSubmission, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
