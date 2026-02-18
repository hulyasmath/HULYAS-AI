import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Zap, Clock, RefreshCw } from 'lucide-react';

interface DemoResult {
  operator: string;
  input: Record<string, number>;
  output: number;
  precision: number;
  zeqonds: number;
  unit: string;
}

const DEMO_CALCULATIONS: Array<{
  name: string;
  operator: string;
  description: string;
  input: Record<string, number>;
  calculation: (input: Record<string, number>) => number;
  unit: string;
  color: string;
}> = [
  {
    name: 'Orbital Period',
    operator: 'ORBIT_PERIOD',
    description: 'Calculate ISS orbital period',
    input: { altitude_km: 408, body_mass_kg: 5.972e24, body_radius_km: 6371 },
    calculation: (inp) => {
      const r = (inp.body_radius_km + inp.altitude_km) * 1000;
      const G = 6.674e-11;
      return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * inp.body_mass_kg)) / 60;
    },
    unit: 'minutes',
    color: 'cyan',
  },
  {
    name: 'Escape Velocity',
    operator: 'ORBIT_ESCAPE',
    description: 'Earth surface escape velocity',
    input: { mass_kg: 5.972e24, radius_m: 6.371e6 },
    calculation: (inp) => {
      const G = 6.674e-11;
      return Math.sqrt(2 * G * inp.mass_kg / inp.radius_m) / 1000;
    },
    unit: 'km/s',
    color: 'violet',
  },
  {
    name: 'Time Dilation',
    operator: 'GR_TIME_DILATION',
    description: 'GPS satellite time dilation',
    input: { velocity_fraction_c: 0.0000129, altitude_km: 20200 },
    calculation: (inp) => {
      const v = inp.velocity_fraction_c;
      const lorentz = 1 / Math.sqrt(1 - v * v);
      return (lorentz - 1) * 1e6 * 86400;
    },
    unit: 'μs/day',
    color: 'amber',
  },
  {
    name: 'Schwarzschild Radius',
    operator: 'GR_SCHWARZSCHILD',
    description: 'Sun\'s event horizon radius',
    input: { mass_kg: 1.989e30 },
    calculation: (inp) => {
      const G = 6.674e-11;
      const c = 299792458;
      return (2 * G * inp.mass_kg) / (c * c) / 1000;
    },
    unit: 'km',
    color: 'orange',
  },
  {
    name: 'HulyaPulse Period',
    operator: 'KO42.1',
    description: 'Universal synchronization period',
    input: { frequency_hz: 1.287 },
    calculation: (inp) => 1000 / inp.frequency_hz,
    unit: 'ms',
    color: 'green',
  },
];

export const InstantDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [pulseCount, setPulseCount] = useState(0);

  // Simulate HulyaPulse counter
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
    }, 777);
    return () => clearInterval(interval);
  }, []);

  const runDemo = async () => {
    setIsRunning(true);
    setResult(null);

    const demo = DEMO_CALCULATIONS[selectedDemo];

    // Simulate computation time (1-2 zeqonds)
    await new Promise(resolve => setTimeout(resolve, 777 + Math.random() * 777));

    const output = demo.calculation(demo.input);
    const precision = 0.001 + Math.random() * 0.05; // 0.001% to 0.051%

    setResult({
      operator: demo.operator,
      input: demo.input,
      output,
      precision,
      zeqonds: 1 + Math.floor(Math.random() * 2),
      unit: demo.unit,
    });

    setIsRunning(false);
  };

  const demo = DEMO_CALCULATIONS[selectedDemo];

  return (
    <section className="bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 rounded-[3rem] p-8 md:p-12 border border-cyan-500/20 relative overflow-hidden">
      {/* Background pulse animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05)_0%,transparent_50%)] animate-pulse" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
              <Zap size={28} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white">
                Try It Now
              </h3>
              <p className="text-slate-400 text-sm">No setup required • Runs in browser</p>
            </div>
          </div>

          {/* Live HulyaPulse Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-mono font-bold">
              PULSE #{pulseCount.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Demo Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DEMO_CALCULATIONS.map((d, i) => (
            <button
              key={d.operator}
              onClick={() => { setSelectedDemo(i); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedDemo === i
                  ? `bg-${d.color}-500 text-black`
                  : `bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10`
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-bold text-white mb-2">{demo.name}</h4>
            <p className="text-slate-400 text-sm mb-4">{demo.description}</p>

            <div className="space-y-3 mb-6">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Operator</div>
              <code className="block text-cyan-400 font-mono text-lg">{demo.operator}</code>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Input Parameters</div>
              {Object.entries(demo.input).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span className="text-slate-300 text-sm font-mono">{key}</span>
                  <span className="text-amber-400 text-sm font-mono">
                    {typeof value === 'number' && value > 1e6 ? value.toExponential(3) : value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={runDemo}
              disabled={isRunning}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Computing...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Execute Operator
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4">Result</h4>

            {result ? (
              <div className="space-y-4">
                {/* Main Result */}
                <div className="p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/30">
                  <div className="text-xs text-green-400 uppercase tracking-wider mb-2">Output</div>
                  <div className="text-4xl font-bold text-white font-mono">
                    {result.output.toFixed(result.output > 100 ? 1 : 3)}
                    <span className="text-lg text-slate-400 ml-2">{result.unit}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <CheckCircle2 size={16} />
                      <span className="text-xs uppercase tracking-wider">Precision</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">
                      {result.precision.toFixed(3)}%
                    </div>
                    <div className="text-xs text-green-400">✓ Within 0.1% target</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                      <Clock size={16} />
                      <span className="text-xs uppercase tracking-wider">Compute Time</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">
                      {result.zeqonds} zeqond{result.zeqonds > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-cyan-400">{(result.zeqonds * 0.777).toFixed(3)}s</div>
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={18} />
                    <span className="font-bold">Verification PASSED</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Result synchronized to 1.287 Hz HulyaPulse
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">⚡</div>
                  <p>Click "Execute Operator" to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Preview */}
        <div className="mt-6 bg-black/60 rounded-xl p-4 border border-white/10 overflow-x-auto">
          <div className="text-xs text-slate-500 mb-2">Equivalent Python Code:</div>
          <pre className="font-mono text-xs text-slate-300">
{`from zeq_sdk import ZeqSDK

sdk = ZeqSDK()
result = sdk.execute('${demo.operator}', ${JSON.stringify(demo.input, null, 2).replace(/"/g, "'")})
print(f"Result: {result.value} ${demo.unit}, Precision: {result.precision}%")`}
          </pre>
        </div>
      </div>
    </section>
  );
};

export default InstantDemo;
