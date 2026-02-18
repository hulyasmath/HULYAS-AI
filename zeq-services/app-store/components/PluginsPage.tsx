/**
 * PluginsPage - Download and access ZEQ Sync plugins for all platforms
 * Tabbed layout (Web / Unity / Unreal / Godot) matching Simulator page style
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  ExternalLink, 
  Copy, 
  Check,
  Code2,
  Gamepad2,
  Box,
  Layers,
  Play,
  Terminal,
  FileCode,
  Zap,
  Globe,
  Activity
} from 'lucide-react';

type PluginTab = 'web' | 'unity' | 'unreal' | 'godot';

const CodeBlock: React.FC<{ code: string; language?: string; title?: string }> = ({ code, language = 'javascript', title }) => {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    // Clear any existing timeout to prevent memory leaks
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {title && (
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</div>
      )}
      <pre className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 overflow-x-auto text-sm">
        <code className={`language-${language} text-slate-300`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
      </button>
    </div>
  );
};

export const PluginsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PluginTab>('web');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back to Store</span>
            </Link>
          </div>
          <Link
            to="/simulator"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors text-sm"
          >
            <Play size={16} className="fill-current" />
            Try Simulator
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="pt-24 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl border border-purple-500/20">
              <Zap size={28} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ZEQ Sync Plugins
              </h1>
              <p className="text-slate-500 text-sm">ZEQ42 (KO42) Universal Proper-Time Modulation for Any Engine</p>
            </div>
          </div>
          
          {/* Zeq Equation Card */}
          <div className="mt-6 p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-purple-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Activity size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-2">The Zeq Equation</h3>
                <div className="font-mono text-lg text-cyan-400 mb-3 bg-black/30 px-4 py-2 rounded-lg inline-block">
                  R(t) = S(t)[1 + α·sin(2πft + φ₀)]
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Where <span className="text-cyan-400">f = 1.287 Hz</span> (HulyaPulse), <span className="text-cyan-400">α</span> is the modulation amplitude, 
                  and <span className="text-cyan-400">T = 1/f ≈ 0.777s</span> (one Zeqond). This universal proper-time modulation synchronizes 
                  physics across quantum, classical, and relativistic domains without modifying any established physical laws.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">ZEQ42 (KO42)</span>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">1.287 Hz</span>
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">0.777s Zeqond</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-black/60 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {([
              { id: 'web' as const, label: 'Web / JavaScript', icon: <Code2 size={18} /> },
              { id: 'unity' as const, label: 'Unity', icon: <Gamepad2 size={18} /> },
              { id: 'unreal' as const, label: 'Unreal Engine', icon: <Box size={18} /> },
              { id: 'godot' as const, label: 'Godot', icon: <Layers size={18} /> },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-8">
        {activeTab === 'web' && (
          <div className="space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Play size={20} className="text-cyan-400 fill-current" />
                Live Web Demos
              </h2>
              <p className="text-slate-400 mb-6">
                Run these demos in-browser. They use ZEQ42 (KO42) as a synchronization wrapper over standard physics engines.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Three.js', file: 'threejs-example.html', desc: '3D pulsing sphere (ZEQ42 sync)' },
                  { name: 'Matter.js', file: 'matterjs-example.html', desc: '2D rigid body physics (modulated gravity)' },
                  { name: 'p5.js', file: 'p5js-example.html', desc: 'Creative coding visualization (Zeqond timing)' },
                  { name: 'D3.js', file: 'd3js-example.html', desc: 'Real-time waveform (f = 1.287 Hz)' },
                ].map((demo) => (
                  <a
                    key={demo.file}
                    href={`/plugins/${demo.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{demo.name}</div>
                      <div className="text-sm text-slate-500">{demo.desc}</div>
                    </div>
                    <ExternalLink size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </a>
                ))}
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Terminal size={20} className="text-green-400" />
                Install / Use
              </h2>
              <CodeBlock title="NPM Install" code="npm install zeq-sync-plugin" language="bash" />
              <CodeBlock
                title="Quick Start (ZEQ42 / Zeq Equation wrapper)"
                code={`import { ZeqSync } from 'zeq-sync-plugin';\n\n// ZEQ42 (KO42) sync\nconst sync = ZeqSync.create({ autoStart: true });\n\n// Zeq Equation wrapper: R(t) = S(t)[1 + α·sin(2πft + φ₀)]\n// f = 1.287 Hz (HulyaPulse), T ≈ 0.777s (1 Zeqond)\nsync.onPulse((data) => {\n  console.log('Zeqond:', data.zeqond, 'sync:', data.syncValue);\n});\n\n// Engine integrations\nsync.attachThreeJS(renderer, scene, camera);\nsync.attachMatterJS(engine, { modulateGravity: true });`}
                language="javascript"
              />
            </section>
          </div>
        )}

        {activeTab === 'unity' && (
          <div className="space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Download size={20} className="text-cyan-400" />
                Unity Plugin (C#)
              </h2>
              <p className="text-slate-400 mb-6">
                Download the Unity files and drop them into your project. ZEQ42 (KO42) exposes sync values and Zeqond timing.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/plugins/unity/ZeqSync.cs"
                  download="ZeqSync.cs"
                  className="flex items-center gap-2 px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} /> ZeqSync.cs
                </a>
                <a
                  href="/plugins/unity/ZeqRigidbody.cs"
                  download="ZeqRigidbody.cs"
                  className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} /> ZeqRigidbody.cs
                </a>
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Terminal size={20} className="text-green-400" />
                Installation
              </h2>
              <ol className="list-decimal list-inside text-slate-400 space-y-2">
                <li>Create folder: <code className="text-purple-300">Assets/Plugins/ZeqOS/</code></li>
                <li>Copy the downloaded <code className="text-purple-300">.cs</code> files into that folder</li>
                <li>Use <code className="text-purple-300">ZeqSync.Instance</code> anywhere; singleton auto-creates on first access</li>
              </ol>
              <CodeBlock
                title="Unity Usage Example"
                code={`using ZeqOS;\nusing UnityEngine;\n\npublic class Zeq42Example : MonoBehaviour\n{\n    void Update()\n    {\n        // ZEQ42 (KO42) sync value\n        // Zeq Equation: R(t)=S(t)[1+αsin(2πft+φ0)]\n        float sync = ZeqSync.Instance.GetSyncValue();\n        transform.localScale = Vector3.one * (1f + sync * 0.2f);\n    }\n\n    void Start()\n    {\n        ZeqSync.Instance.OnPulse += (data) =>\n        {\n            Debug.Log($\"Zeqond: {data.Zeqond}  sync: {data.SyncValue}\");\n        };\n    }\n}`}
                language="csharp"
              />
            </section>
          </div>
        )}

        {activeTab === 'unreal' && (
          <div className="space-y-8">
            <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2 text-yellow-300">Unreal Engine (Preview)</h2>
              <p className="text-slate-400">
                The Unreal plugin is a preview/stub right now. The goal is a subsystem + Blueprint nodes for ZEQ42 (KO42).
              </p>
            </section>
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Planned Interface</h3>
              <CodeBlock
                title="Preview Snippet"
                code={`// ZEQ42 (KO42) Universal Synchronization\n// Zeq Equation: R(t)=S(t)[1+αsin(2πft+φ0)]\n\n// Subsystem (planned): GetSyncValue(), GetZeqond(), OnPulse event\n// Blueprint nodes (planned): ZEQ42_KO42(), ZeqondTime()`}
                language="cpp"
              />
            </section>
          </div>
        )}

        {activeTab === 'godot' && (
          <div className="space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Download size={20} className="text-cyan-400" />
                Godot Addon (GDScript)
              </h2>
              <p className="text-slate-400 mb-6">
                Download the addon files and enable the plugin. It exposes a ZeqSync autoload implementing ZEQ42 (KO42).
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/plugins/godot/addons/zeq_sync/ko42.gd"
                  download="ko42.gd"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} /> ko42.gd
                </a>
                <a
                  href="/plugins/godot/addons/zeq_sync/zeq_sync.gd"
                  download="zeq_sync.gd"
                  className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} /> zeq_sync.gd
                </a>
                <a
                  href="/plugins/godot/addons/zeq_sync/plugin.cfg"
                  download="plugin.cfg"
                  className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} /> plugin.cfg
                </a>
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Terminal size={20} className="text-green-400" />
                Installation
              </h2>
              <ol className="list-decimal list-inside text-slate-400 space-y-2">
                <li>Copy files to: <code className="text-blue-300">addons/zeq_sync/</code></li>
                <li>Enable plugin: Project Settings → Plugins</li>
                <li>Use autoload singleton: <code className="text-blue-300">ZeqSync</code></li>
              </ol>
              <CodeBlock
                title="Godot Usage Example"
                code={`extends Node2D\n\nfunc _process(delta):\n    # ZEQ42 (KO42) sync value from Zeq Equation wrapper\n    var sync = ZeqSync.get_sync_value()\n    scale = Vector2.ONE * (1.0 + sync * 0.2)\n\nfunc _ready():\n    ZeqSync.on_pulse.connect(_on_pulse)\n\nfunc _on_pulse(data: Dictionary):\n    print(\"Zeqond:\", data.zeqond, \" sync:\", data.sync_value)`}
                language="gdscript"
              />
            </section>
          </div>
        )}

        {/* Bottom Info */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-xl flex-shrink-0">
              <Globe size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Backwards-Compatible Standard Physics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ZEQ42 (KO42) is implemented as a timing wrapper over standard predictions: <span className="text-cyan-300 font-mono">R(t)=S(t)[1+αsin(2πft+φ0)]</span>.
                Over one Zeqond (<span className="text-cyan-300">T≈0.777s</span>), time averaging recovers standard physics exactly, keeping solvers unchanged and enabling cross-domain phase coherence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginsPage;
