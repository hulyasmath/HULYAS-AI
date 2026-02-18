/**
 * SimulationVisualizer - Multi-demo physics showcase
 * 
 * Demonstrates the Zeq Equation: R(t) = S(t)[1 + α·sin(2πft + φ₀)]
 * Using ZEQ42 (KO42) universal proper-time modulation at 1.287 Hz
 * across five different physics domains.
 */

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html } from '@react-three/drei';
import { 
  Orbit, 
  Sparkles, 
  Waves, 
  Globe2, 
  Grid3X3,
  Play,
  Pause,
  RotateCcw,
  Info,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import demos
import { OrbitalDemo } from './OrbitalDemo';
import { ParticleDemo } from './ParticleDemo';
import { WaveDemo } from './WaveDemo';
import { GravityDemo } from './GravityDemo';
import { SpacetimeDemo } from './SpacetimeDemo';
import { useZeqSync, HULYAPULSE_HZ, ZEQOND } from './useZeqSync';

type DemoType = 'orbital' | 'particle' | 'wave' | 'gravity' | 'spacetime';

interface DemoConfig {
  id: DemoType;
  name: string;
  description: string;
  icon: React.ReactNode;
  operators: string[];
  cameraPosition: [number, number, number];
  Component: React.FC;
}

const DEMOS: DemoConfig[] = [
  {
    id: 'orbital',
    name: 'Orbital Mechanics',
    description: 'Planets and satellites with orbits pulsing at 1.287 Hz',
    icon: <Orbit className="w-5 h-5" />,
    operators: ['KO33', 'KO34', 'ZEQ42 (KO42)'],
    cameraPosition: [15, 10, 15],
    Component: OrbitalDemo
  },
  {
    id: 'particle',
    name: 'Particle System',
    description: '5,000 particles in phase-locked collective motion',
    icon: <Sparkles className="w-5 h-5" />,
    operators: ['ZEQ42 (KO42)', 'ZEQ42.1 (KO42.1)'],
    cameraPosition: [12, 8, 12],
    Component: ParticleDemo
  },
  {
    id: 'wave',
    name: 'Quantum Waves',
    description: 'Wave propagation synchronized to HulyaPulse',
    icon: <Waves className="w-5 h-5" />,
    operators: ['QM1', 'QM2', 'ZEQ42 (KO42)'],
    cameraPosition: [15, 12, 15],
    Component: WaveDemo
  },
  {
    id: 'gravity',
    name: 'N-Body Gravity',
    description: 'Gravitational constant modulated by ZEQ42 (KO42)',
    icon: <Globe2 className="w-5 h-5" />,
    operators: ['KO12', 'ZEQ42 (KO42)', 'GR31'],
    cameraPosition: [18, 12, 18],
    Component: GravityDemo
  },
  {
    id: 'spacetime',
    name: 'Spacetime Fabric',
    description: 'Metric tensor visualization with ZEQ42.1 (KO42.1) / ZEQ42.2 (KO42.2)',
    icon: <Grid3X3 className="w-5 h-5" />,
    operators: ['ZEQ42.1 (KO42.1)', 'ZEQ42.2 (KO42.2)', 'GR31'],
    cameraPosition: [15, 15, 15],
    Component: SpacetimeDemo
  }
];

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="text-white text-center">
      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
      <p className="text-sm text-slate-400">Loading simulation...</p>
    </div>
  </Html>
);

const SyncIndicator: React.FC = () => {
  const sync = useZeqSync({ amplitude: 1.0 });
  
  return (
    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-purple-500/30">
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full transition-all duration-75"
          style={{
            backgroundColor: `hsl(${270 + sync.syncValue * 30}, 80%, ${50 + sync.syncValue * 20}%)`,
            boxShadow: `0 0 ${10 + sync.syncValue * 5}px hsl(270, 80%, 50%)`
          }}
        />
        <div className="text-xs font-mono">
          <div className="text-purple-400">Zeqond: {Math.floor(sync.zeqond)}</div>
          <div className="text-slate-400">Sync: {sync.syncValue.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
};

export const SimulationVisualizer: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<DemoType>('orbital');
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0); // For reset functionality
  
  const currentDemo = DEMOS.find(d => d.id === activeDemo)!;
  const DemoComponent = currentDemo.Component;

  const handleReset = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ZEQ Physics Simulator
              </h1>
              <p className="text-xs text-slate-500">Synchronized to 1.287 Hz HulyaPulse</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <a
              href="https://docs.zeq.os/operators"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Demo Tabs */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {DEMOS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeDemo === demo.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {demo.icon}
                <span>{demo.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="pt-28 h-screen">
        <Canvas
          key={key}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={<LoadingFallback />}>
            {/* Camera */}
            <PerspectiveCamera 
              makeDefault 
              position={currentDemo.cameraPosition}
              fov={50}
            />
            
            {/* Controls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={isPlaying}
              autoRotateSpeed={0.5}
            />
            
            {/* Background */}
            <Stars 
              radius={100} 
              depth={50} 
              count={2000} 
              factor={4} 
              saturation={0.5} 
            />
            
            {/* Demo Component */}
            {isPlaying && <DemoComponent />}
            
            {/* Fog for depth */}
            <fog attach="fog" args={['#0a0a0f', 30, 80]} />
          </Suspense>
        </Canvas>
        
        {/* Sync Indicator */}
        {isPlaying && <SyncIndicator />}
      </div>

      {/* Info Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">{currentDemo.name}</h2>
              <p className="text-sm text-slate-400 mb-2">{currentDemo.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Operators:</span>
                {currentDemo.operators.map((op) => (
                  <span 
                    key={op}
                    className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono"
                  >
                    {op}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-right text-sm">
              <div className="text-slate-400 mb-1">
                <span className="text-purple-400">{HULYAPULSE_HZ}</span> Hz HulyaPulse
              </div>
              <div className="text-slate-500">
                Period: <span className="text-slate-300">{ZEQOND.toFixed(3)}s</span> (1 Zeqond)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help tooltip */}
      <div className="fixed bottom-24 right-4 z-30">
        <button
          className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-colors group"
          title="Mouse: Rotate | Scroll: Zoom | Shift+Mouse: Pan"
        >
          <Info className="w-4 h-4 text-purple-400" />
        </button>
      </div>
    </div>
  );
};

export default SimulationVisualizer;
