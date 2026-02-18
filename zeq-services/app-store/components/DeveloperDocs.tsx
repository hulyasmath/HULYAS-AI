import React, { useState, useEffect } from 'react';
import { Terminal, Code, Book, Copy, Check, Search, Loader2, Cpu, Building2, Microscope, Zap, Shield, Rocket } from 'lucide-react';
import { listOperators, type Operator } from '../services/operators';

export const DeveloperDocs: React.FC<{ initialTab?: 'cli' | 'api' | 'operators' }> = ({ initialTab = 'cli' }) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'api' | 'operators'>(initialTab);

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [copied, setCopied] = useState<string | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cliCommands = [
    {
      title: 'Execute Computation',
      description: 'Run precision calculations with 1549 kinematic operators at ≤0.1% precision',
      command: 'zeq compute --operator KO501 --params \'{"load": 50000, "length": 10, "E": 200e9}\'',
      example: `# Structural Engineering - Beam deflection analysis
zeq compute --operator KO501 --params '{"load": 50000, "length": 10}'

# Aerospace - Orbital mechanics calculation
zeq compute --operator KO601 --params '{"mass": 1000, "velocity": 7800}'

# Medical - Drug dosage optimization
zeq compute --operator MED101 --params '{"weight": 70, "age": 45}'

# Financial - Risk analysis (VaR calculation)
zeq compute --operator FIN201 --params '{"portfolio": 1000000, "confidence": 0.95}'`
    },
    {
      title: 'List Operators by Domain',
      description: 'Browse operators across 34 physics domains for your industry',
      command: 'zeq operators --domain engineering',
      example: `zeq operators --domain engineering    # 150+ engineering operators
zeq operators --domain medical        # Healthcare & biomedical
zeq operators --domain financial      # Finance & economics
zeq operators --domain aerospace      # Aerospace & orbital mechanics
zeq operators --domain material       # Material science
zeq operators --domain energy         # Energy systems & power
zeq operators --domain quantum        # Quantum computing
zeq operators --domain environmental  # Environmental science`
    },
    {
      title: 'Batch Processing',
      description: 'Process multiple calculations in parallel for high-throughput applications',
      command: 'zeq batch --input calculations.json --output results.json --parallel 8',
      example: `# Process 10,000 structural analyses in parallel
zeq batch --input beam_loads.json --output analysis.json --parallel 16

# Monte Carlo simulation for risk analysis
zeq batch --input scenarios.json --output risk_assessment.json --iterations 100000

# Material property sweep for optimization
zeq batch --input materials.json --operator MAT301 --sweep temperature:0:500:10`
    },
    {
      title: 'Verify Precision',
      description: 'Validate calculation results meet ≤0.1% precision threshold',
      command: 'zeq verify result.json --threshold 0.001',
      example: `# Verify single calculation
zeq verify calculation.json --threshold 0.001

# Cross-validate multiple results
zeq verify --compare result1.json result2.json --tolerance 0.0001

# Generate verification report
zeq verify result.json --report certification.pdf --standard ISO-17025`
    },
    {
      title: 'Pipeline Mode',
      description: 'Chain multiple operators for complex multi-step calculations',
      command: 'zeq pipeline --chain "KO501 -> KO502 -> KO503" --input beam.json',
      example: `# Structural analysis pipeline
zeq pipeline --chain "KO501 -> KO502 -> KO503" --input structure.json
# Runs: Load Analysis -> Stress Calculation -> Safety Factor

# Aerospace trajectory pipeline
zeq pipeline --chain "KO601 -> KO602 -> KO603" --input satellite.json
# Runs: Orbit Calculation -> Trajectory Prediction -> Fuel Optimization

# Medical diagnostic pipeline
zeq pipeline --chain "MED101 -> MED102 -> MED103" --input patient.json`
    }
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/zeq/operators/execute',
      description: 'Execute precision calculations using the ZEQ OS mathematical framework. Supports all 34 physics domains with ≤0.1% precision guarantee.',
      body: {
        operator: 'string (required) - Operator ID (e.g., KO501, MED101, FIN201)',
        params: 'object (required) - Domain-specific parameters',
        options: 'object (optional) - Precision level, output format, caching'
      },
      response: {
        result: 'object - Computed value with unit and precision',
        metadata: 'object - Execution time, operator chain, verification status',
        precision: 'number - Actual precision achieved (≤0.001)',
        verified: 'boolean - HulyaPulse verification status'
      },
      example: {
        request: {
          operator: 'KO501',
          params: {
            load: 50000,
            length: 10,
            E: 200e9,
            I: 8.33e-6
          },
          options: { precision: 'high' }
        },
        response: {
          result: {
            deflection: 0.00375,
            unit: 'meters',
            precision: 0.00001
          },
          metadata: {
            execution_time_ms: 12,
            operator_chain: ['KO501'],
            hulya_pulse_verified: true
          },
          precision: 0.0001,
          verified: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/zeq/batch',
      description: 'High-throughput batch processing for large-scale calculations. Ideal for simulations, parameter sweeps, and Monte Carlo analyses.',
      body: {
        operator: 'string (required) - Operator ID for batch execution',
        data: 'array<object> (required) - Array of parameter sets to process',
        options: 'object (optional) - Parallelism, chunk size, progress webhook'
      },
      response: {
        results: 'array<object> - Computed results for each input',
        summary: 'object - Statistics (mean, std, min, max)',
        execution_time_ms: 'number - Total batch processing time',
        throughput: 'number - Calculations per second achieved'
      },
      example: {
        request: {
          operator: 'KO501',
          data: [
            { load: 50000, length: 10 },
            { load: 75000, length: 12 },
            { load: 100000, length: 15 }
          ],
          options: { parallel: 4 }
        },
        response: {
          results: [
            { deflection: 0.00375, verified: true },
            { deflection: 0.00648, verified: true },
            { deflection: 0.01125, verified: true }
          ],
          summary: {
            count: 3,
            mean_deflection: 0.00716,
            max_deflection: 0.01125
          },
          execution_time_ms: 45,
          throughput: 66.7
        }
      }
    },
    {
      method: 'GET',
      path: '/api/zeq/operators',
      description: 'List all available operators filtered by domain. Returns 1549 kinematic operators across 34 physics domains.',
      query: {
        domain: 'string (optional) - Filter by domain: engineering, medical, financial, aerospace, material, energy, quantum, etc.',
        search: 'string (optional) - Search by operator name or description'
      },
      response: {
        operators: 'array<Operator> - List of operators with ID, name, equation, domain',
        count: 'number - Number of operators returned',
        domains: 'object - Count per domain'
      },
      example: {
        request: 'GET /api/zeq/operators?domain=engineering',
        response: {
          operators: [
            {
              id: 'KO501',
              name: 'Beam Deflection',
              equation: 'δ = PL³/(3EI)',
              domain: 'engineering',
              description: 'Calculate beam deflection under point load'
            },
            {
              id: 'KO502',
              name: 'Von Mises Stress',
              equation: 'σ_vm = √(σ₁² + σ₂² + σ₃² - σ₁σ₂ - σ₂σ₃ - σ₃σ₁)',
              domain: 'engineering'
            }
          ],
          count: 156,
          domains: { engineering: 156, structural: 89, mechanical: 67 }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/zeq/pipeline',
      description: 'Execute multi-step calculation pipelines. Chain operators for complex engineering workflows.',
      body: {
        operators: 'array<string> (required) - Ordered list of operator IDs to execute',
        initial_params: 'object (required) - Parameters for first operator',
        mappings: 'object (optional) - How to map outputs between operators'
      },
      response: {
        final_result: 'object - Output from last operator in chain',
        intermediate: 'array<object> - Results from each step',
        pipeline_verified: 'boolean - All steps verified within precision'
      },
      example: {
        request: {
          operators: ['KO501', 'KO502', 'KO503'],
          initial_params: { load: 50000, length: 10 },
          mappings: {
            'KO501->KO502': { deflection: 'displacement' },
            'KO502->KO503': { stress: 'applied_stress' }
          }
        },
        response: {
          final_result: {
            safety_factor: 2.5,
            status: 'SAFE',
            recommendation: 'Design meets safety requirements'
          },
          intermediate: [
            { operator: 'KO501', result: { deflection: 0.00375 } },
            { operator: 'KO502', result: { stress: 125e6 } },
            { operator: 'KO503', result: { safety_factor: 2.5 } }
          ],
          pipeline_verified: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/zeq/verify',
      description: 'Verify calculation precision meets ≤0.1% threshold. Uses HulyaPulse 1.287 Hz synchronization.',
      body: {
        result: 'object (required) - Calculation result to verify',
        reference: 'object (optional) - Reference value for comparison',
        threshold: 'number (optional) - Precision threshold (default: 0.001)'
      },
      response: {
        verified: 'boolean - True if precision threshold met',
        actual_precision: 'number - Measured precision',
        hulya_sync: 'boolean - HulyaPulse synchronization status',
        certificate: 'string (optional) - Verification certificate ID'
      },
      example: {
        request: {
          result: { value: 0.00375, operator: 'KO501' },
          reference: { value: 0.00376 },
          threshold: 0.001
        },
        response: {
          verified: true,
          actual_precision: 0.000266,
          hulya_sync: true,
          certificate: 'ZEQ-CERT-2024-001234'
        }
      }
    }
  ];

  // Industry-focused operator examples
  const operatorExamples = [
    {
      category: '🏗️ Structural Engineering',
      examples: [
        { id: 'KO501', name: 'Beam Deflection', params: { load: 50000, length: 10, E: 200e9, I: 8.33e-6 } },
        { id: 'KO502', name: 'Von Mises Stress', params: { sigma_x: 100e6, sigma_y: 50e6, tau_xy: 25e6 } },
        { id: 'KO503', name: 'Buckling Analysis', params: { E: 200e9, I: 8.33e-6, L: 5, K: 1.0 } }
      ]
    },
    {
      category: '✈️ Aerospace Engineering',
      examples: [
        { id: 'KO601', name: 'Orbital Velocity', params: { mu: 3.986e14, r: 6.778e6 } },
        { id: 'KO602', name: 'Hohmann Transfer', params: { r1: 6.778e6, r2: 42.164e6, mu: 3.986e14 } },
        { id: 'KO603', name: 'Atmospheric Drag', params: { Cd: 2.2, A: 10, rho: 1.225, v: 7800 } }
      ]
    },
    {
      category: '🏥 Medical & Healthcare',
      examples: [
        { id: 'MED101', name: 'Drug Dosage', params: { weight: 70, age: 45, creatinine_clearance: 90 } },
        { id: 'MED102', name: 'Cardiac Output', params: { stroke_volume: 70, heart_rate: 75 } },
        { id: 'MED103', name: 'BMI Calculation', params: { weight: 70, height: 1.75 } }
      ]
    },
    {
      category: '💰 Finance & Economics',
      examples: [
        { id: 'FIN201', name: 'Value at Risk', params: { portfolio_value: 1000000, confidence: 0.95, volatility: 0.15 } },
        { id: 'FIN202', name: 'Black-Scholes', params: { S: 100, K: 105, T: 0.5, r: 0.05, sigma: 0.2 } },
        { id: 'FIN203', name: 'NPV Calculation', params: { cash_flows: [100, 200, 300], rate: 0.1 } }
      ]
    },
    {
      category: '⚡ Energy Systems',
      examples: [
        { id: 'ENR301', name: 'Solar Panel Output', params: { area: 100, efficiency: 0.2, irradiance: 1000 } },
        { id: 'ENR302', name: 'Wind Turbine Power', params: { rho: 1.225, A: 5000, v: 12, Cp: 0.45 } },
        { id: 'ENR303', name: 'Battery Discharge', params: { capacity: 100, current: 10, temperature: 25 } }
      ]
    },
    {
      category: '🧪 Material Science',
      examples: [
        { id: 'MAT301', name: 'Youngs Modulus', params: { stress: 200e6, strain: 0.001 } },
        { id: 'MAT302', name: 'Thermal Expansion', params: { L0: 1.0, alpha: 12e-6, delta_T: 100 } },
        { id: 'MAT303', name: 'Fatigue Life', params: { sigma_a: 200e6, sigma_f: 800e6, b: -0.12 } }
      ]
    }
  ];

  // Fetch operators on mount and when category changes
  useEffect(() => {
    const fetchOperators = async () => {
      setLoading(true);
      setError(null);
      try {
        const category = selectedCategory === 'all' ? undefined : selectedCategory;
        const response = await listOperators(category);
        if (response && response.operators) {
          setOperators(response.operators);
          setFilteredOperators(response.operators);
        } else {
          setOperators([]);
          setFilteredOperators([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch operators:', error);
        setError(error.message || 'Failed to load operators');
        setOperators([]);
        setFilteredOperators([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'operators') {
      fetchOperators();
    }
  }, [activeTab, selectedCategory]);

  // Filter operators by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredOperators(operators);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = operators.filter(
      (op) =>
        op.id.toLowerCase().includes(query) ||
        (op.name && op.name.toLowerCase().includes(query)) ||
        op.description.toLowerCase().includes(query) ||
        (op.equation && op.equation.toLowerCase().includes(query))
    );
    setFilteredOperators(filtered);
  }, [searchQuery, operators]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(operators.map((op) => op.category));
    return Array.from(cats).sort();
  }, [operators]);

  return (
    <div className="space-y-6">
      {/* Hide internal tabs when used from main menu - tabs are now in main navigation */}
      {!initialTab && (
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'cli'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Terminal size={20} />
            CLI
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'api'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Code size={20} />
            API
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'operators'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Book size={20} />
            Operators ({operators.length || '...'})
          </button>
        </div>
      )}

      {activeTab === 'cli' && (
        <div className="space-y-6">
          {/* CLI Overview */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Terminal className="text-cyan-400" size={20} />
              ZEQ CLI - Build Production Applications
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              High-performance command-line interface for precision engineering calculations. Supports all 34 physics domains with ≤0.1% precision guarantee, batch processing, and pipeline workflows.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-3 text-center border border-cyan-500/20">
                <p className="text-2xl font-bold text-cyan-400">1549</p>
                <p className="text-xs text-slate-400">Operators</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-400">26</p>
                <p className="text-xs text-slate-400">Domains</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-400">≤0.1%</p>
                <p className="text-xs text-slate-400">Precision</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center border border-yellow-500/20">
                <p className="text-2xl font-bold text-yellow-400">1.287</p>
                <p className="text-xs text-slate-400">Hz Sync</p>
              </div>
            </div>

            {/* Installation */}
            <div className="relative">
              <p className="text-xs text-slate-500 uppercase mb-2">Installation</p>
              <pre className="bg-black/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                <code>{'# From source (Rust)\ncd zeq-ecosystem/zeq-cli && cargo build --release\n\n# Python SDK\npip install zeq-sdk\n\n# Node.js SDK\nnpm install zeq-sdk'}</code>
              </pre>
              <button
                onClick={() => copyToClipboard('pip install zeq-sdk', 'install')}
                className="absolute top-8 right-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {copied === 'install' ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
              </button>
            </div>
          </div>

          {cliCommands.map((cmd, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-2">{cmd.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{cmd.description}</p>
              <div className="space-y-2">
                <div className="relative">
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                    <code>{cmd.command}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(cmd.command, `cmd-${idx}`)}
                    className="absolute top-2 right-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {copied === `cmd-${idx}` ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
                  </button>
                </div>
                {cmd.example && (
                  <details className="mt-2">
                    <summary className="text-slate-400 text-sm cursor-pointer hover:text-white">
                      Show industry examples
                    </summary>
                    <div className="relative mt-2">
                      <pre className="bg-black/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                        <code>{cmd.example}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(cmd.example, `example-${idx}`)}
                        className="absolute top-2 right-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {copied === `example-${idx}` ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
                      </button>
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Overview */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Code className="text-cyan-400" size={20} />
              ZEQ Framework API
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              RESTful API for building production applications. Execute precision calculations, run batch simulations, and chain operators for complex engineering workflows.
            </p>

            {/* Supported Industries */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Building2, label: 'Engineering', color: 'cyan' },
                { icon: Rocket, label: 'Aerospace', color: 'purple' },
                { icon: Microscope, label: 'Medical', color: 'emerald' },
                { icon: Zap, label: 'Energy', color: 'yellow' },
              ].map((item, i) => (
                <div key={i} className={`bg-${item.color}-500/10 border border-${item.color}-500/20 rounded-lg p-3 flex items-center gap-2`}>
                  <item.icon size={16} className={`text-${item.color}-400`} />
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="relative mb-4">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Base URL</p>
              <pre className="bg-black/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                <code>http://localhost:8080/api</code>
              </pre>
              <button
                onClick={() => copyToClipboard('http://localhost:8080/api', 'base-url')}
                className="absolute top-8 right-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {copied === 'base-url' ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
              </button>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-xs text-cyan-400 font-semibold mb-1">Production Ready</p>
              <p className="text-xs text-slate-400">
                Built for high-throughput applications. Supports batch processing, parallel execution, and HulyaPulse 1.287 Hz synchronization for verified precision.
              </p>
            </div>
          </div>

          {apiEndpoints.map((endpoint, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-cyan-400 font-mono text-sm">{endpoint.path}</code>
                  </div>
                  <p className="text-slate-400 text-sm">{endpoint.description}</p>
                </div>
              </div>

              {endpoint.body && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest">Request Body</p>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs text-slate-300">
                    <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                  </pre>
                </div>
              )}

              {'query' in endpoint && (endpoint as any).query && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest">Query Parameters</p>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs text-slate-300">
                    <code>{typeof (endpoint as any).query === 'string' ? (endpoint as any).query : JSON.stringify((endpoint as any).query, null, 2)}</code>
                  </pre>
                </div>
              )}

              {endpoint.example && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest">Example</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Request:</p>
                      <pre className="bg-black/50 p-3 rounded-lg text-xs text-slate-300">
                        <code>{JSON.stringify(endpoint.example.request, null, 2)}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Response:</p>
                      <pre className="bg-black/50 p-3 rounded-lg text-xs text-slate-300">
                        <code>{JSON.stringify(endpoint.example.response, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest">Response Schema</p>
                <pre className="bg-black/50 p-3 rounded-lg text-xs text-slate-300">
                  <code>{typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2)}</code>
                </pre>
              </div>
            </div>
          ))}

          {/* Industry Operator Examples Section */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Cpu className="text-cyan-400" size={20} />
              Industry-Specific Operators
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Ready-to-use operators for real-world engineering applications across multiple industries.
            </p>

            {operatorExamples.map((category, catIdx) => (
              <div key={catIdx} className="mb-6 last:mb-0">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3">{category.category}</h4>
                <div className="space-y-3">
                  {category.examples.map((example, exIdx) => (
                    <div key={exIdx} className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <code className="text-cyan-400 font-mono text-sm">{example.id}</code>
                          <span className="text-slate-400 text-sm ml-2">{example.name}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(
                            `curl -X POST "http://localhost:8080/api/zeq/operators/execute" -H "Content-Type: application/json" -d '{"operator": "${example.id}", "params": ${JSON.stringify(example.params)}}'`,
                            `curl-${catIdx}-${exIdx}`
                          )}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          {copied === `curl-${catIdx}-${exIdx}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">Parameters:</div>
                      <pre className="bg-black/50 p-2 rounded text-xs text-slate-300 overflow-x-auto">
                        <code>{JSON.stringify(example.params, null, 2)}</code>
                      </pre>
                      <div className="mt-2 text-xs text-slate-500">
                        <code className="text-cyan-400">POST /api/zeq/operators/execute</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'operators' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Book className="text-cyan-400" size={20} />
              Operator Library
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Browse all {operators.length || 1549} available operators. Use search and domain filters to find operators for your industry.
            </p>

            {/* Domain Quick Links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['engineering', 'aerospace', 'medical', 'financial', 'energy', 'material', 'quantum'].map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedCategory(domain)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === domain
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search operators by ID, name, or equation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Domains</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} ({operators.filter((op) => op.category === cat).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Operators List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
                <span className="ml-3 text-slate-400">Loading operators...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-2">Failed to load operators</p>
                <p className="text-slate-400 text-sm mb-2">{error}</p>
                <p className="text-slate-400 text-sm">Make sure the API server is running on http://localhost:8080</p>
                <p className="text-slate-500 text-xs mt-2">Run: npm run api</p>
                <button
                  onClick={() => {
                    setError(null);
                    const category = selectedCategory === 'all' ? undefined : selectedCategory;
                    listOperators(category).then(response => {
                      setOperators(response.operators || []);
                      setFilteredOperators(response.operators || []);
                    }).catch(err => {
                      setError(err.message);
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            ) : operators.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No operators loaded</p>
                <p className="text-slate-500 text-xs mt-2">Check browser console for errors</p>
              </div>
            ) : filteredOperators.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No operators found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredOperators.map((operator) => (
                  <div
                    key={operator.id}
                    className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-cyan-400 text-sm">{operator.id}</h4>
                        {operator.name && (
                          <p className="text-white text-xs font-semibold mt-1">{operator.name}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded ml-2">
                        {operator.category}
                      </span>
                    </div>
                    {operator.equation ? (
                      <div className="mb-2">
                        <p className="text-xs text-slate-300 mb-1 font-semibold">Equation:</p>
                        <p className="text-xs text-slate-400 font-mono bg-black/50 p-2 rounded border border-cyan-500/20">
                          {operator.equation}
                        </p>
                      </div>
                    ) : null}
                    <p className="text-xs text-slate-500 line-clamp-2">{operator.description}</p>
                    <button
                      onClick={() => {
                        const command = `curl -X POST "http://localhost:8080/api/zeq/operators/execute" -H "Content-Type: application/json" -d '{"operator": "${operator.id}", "params": {}}'`;
                        copyToClipboard(command, operator.id);
                      }}
                      className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copied === operator.id ? (
                        <>
                          <Check size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy API call
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="mt-4 text-sm text-slate-400 text-center">
                Showing {filteredOperators.length} of {operators.length} operators
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
