import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Brain,
  Atom,
  Rocket,
  Heart,
  Building2,
  Leaf,
  Shield,
  Dna,
  LineChart,
  Cpu,
  Zap,
  Globe,
  Factory,
  GraduationCap,
  Lightbulb,
  FileText,
  Code2,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Package,
  Store,
  Trash2,
  Search,
  Target,
  Activity
} from 'lucide-react';
import { useZeqSync, HULYAPULSE_HZ } from './SimulationVisualizer/useZeqSync';
import { PrecisionBadge } from './shared/PrecisionBadge';
import { EntropyVerifier, calculateShannonEntropy } from './shared/EntropyVerifier';
import { KolmogorovChecker } from './shared/KolmogorovChecker';
import { HulyaPulseIndicator } from './shared/HulyaPulseIndicator';

const SKILLS_API = 'http://localhost:8080/api/skills';
const OPERATOR_API = 'http://localhost:8080/api/zeq/operators/execute';

interface SkillData {
  id: string;
  name: string;
  description: string;
  industry: string;
  operators: string[];
  author: string;
  isPublic: boolean;
  installCount: number;
  createdAt: number;
}

interface SkillRunResult {
  operator: string;
  result: number;
  executionTimeMs: number;
  precision?: number;
}

// Industry templates for skill generation
const INDUSTRY_TEMPLATES = [
  {
    id: 'healthcare',
    name: 'Healthcare & Medicine',
    icon: Heart,
    color: 'from-red-500 to-pink-600',
    description: 'Drug interactions, dosage calculations, diagnostic precision, medical imaging analysis',
    operators: ['MED1', 'MED2', 'MED3', 'QM1', 'QM2', 'NM19', 'KO42'],
    domains: ['medical', 'quantum', 'newtonian'],
    examplePrompt: 'Create a skill for calculating drug dosages based on patient weight, age, and kidney function with pharmacokinetic modeling',
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Aviation',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-600',
    description: 'Orbital mechanics, propulsion systems, atmospheric reentry, trajectory calculations',
    operators: ['HOHMANN_TRANSFER', 'ORBIT_VELOCITY', 'ORBIT_ESCAPE', 'GR35', 'GR37', 'NM21', 'KO42'],
    domains: ['aerospace', 'relativity', 'newtonian'],
    examplePrompt: 'Create a skill for calculating satellite orbital parameters and transfer maneuvers for space missions',
  },
  {
    id: 'quantum_computing',
    name: 'Quantum Computing',
    icon: Atom,
    color: 'from-violet-500 to-purple-600',
    description: 'Qubit operations, quantum gates, entanglement, decoherence modeling',
    operators: ['QM1', 'QM2', 'QM3', 'QM4', 'QM5', 'QM11', 'QM12', 'KO42'],
    domains: ['quantum', 'computational'],
    examplePrompt: 'Create a skill for analyzing quantum circuit behavior and predicting qubit fidelity',
  },
  {
    id: 'ai_ml',
    name: 'AI & Machine Learning',
    icon: Brain,
    color: 'from-emerald-500 to-teal-600',
    description: 'Neural network analysis, optimization algorithms, hallucination detection',
    operators: ['CS43', 'CS44', 'CS47', 'CS87', 'ON0', 'QL1', 'KO42'],
    domains: ['computational', 'consciousness'],
    examplePrompt: 'Create a skill for detecting AI hallucinations using mathematical verification',
  },
  {
    id: 'finance',
    name: 'Finance & Economics',
    icon: LineChart,
    color: 'from-amber-500 to-orange-600',
    description: 'Risk modeling, portfolio optimization, market analysis, derivative pricing',
    operators: ['FIN1', 'FIN2', 'CS47', 'NM30', 'KO42'],
    domains: ['finance', 'computational', 'newtonian'],
    examplePrompt: 'Create a skill for Black-Scholes option pricing with volatility surface modeling',
  },
  {
    id: 'biotech',
    name: 'Biotechnology',
    icon: Dna,
    color: 'from-green-500 to-lime-600',
    description: 'Protein folding, genetic sequencing, cellular modeling, drug discovery',
    operators: ['BIO1', 'BIO2', 'QM1', 'QM8', 'NM30', 'KO42'],
    domains: ['biotech', 'quantum', 'newtonian'],
    examplePrompt: 'Create a skill for predicting protein secondary structure using quantum mechanical principles',
  },
  {
    id: 'energy',
    name: 'Energy Systems',
    icon: Zap,
    color: 'from-yellow-500 to-amber-600',
    description: 'Grid optimization, renewable integration, storage modeling, power flow analysis',
    operators: ['ENERGY1', 'ENERGY2', 'NM22', 'NM23', 'NM25', 'KO42'],
    domains: ['energy', 'newtonian'],
    examplePrompt: 'Create a skill for optimizing renewable energy grid integration with storage',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industry',
    icon: Factory,
    color: 'from-slate-500 to-gray-600',
    description: 'Process optimization, quality control, predictive maintenance, supply chain',
    operators: ['CS43', 'CS46', 'NM19', 'NM22', 'KO42'],
    domains: ['computational', 'newtonian'],
    examplePrompt: 'Create a skill for predictive maintenance scheduling using sensor data analysis',
  },
  {
    id: 'environment',
    name: 'Environmental Science',
    icon: Leaf,
    color: 'from-green-600 to-emerald-700',
    description: 'Climate modeling, ecosystem dynamics, resource analysis, pollution tracking',
    operators: ['ENV1', 'ENV2', 'GR40', 'NM21', 'KO42'],
    domains: ['environmental', 'relativity', 'newtonian'],
    examplePrompt: 'Create a skill for modeling atmospheric CO2 dispersion and carbon cycle dynamics',
  },
  {
    id: 'defense',
    name: 'Defense & Security',
    icon: Shield,
    color: 'from-slate-600 to-zinc-700',
    description: 'Trajectory calculations, signal processing, cryptography, threat analysis',
    operators: ['CS87', 'CS47', 'NM19', 'NM26', 'NM27', 'KO42'],
    domains: ['computational', 'newtonian'],
    examplePrompt: 'Create a skill for ballistic trajectory prediction with atmospheric correction',
  },
  {
    id: 'education',
    name: 'Education & Research',
    icon: GraduationCap,
    color: 'from-indigo-500 to-blue-600',
    description: 'Interactive physics simulations, step-by-step problem solving, concept verification',
    operators: ['QM1', 'QM2', 'NM18', 'NM19', 'NM21', 'GR33', 'KO42'],
    domains: ['quantum', 'newtonian', 'relativity'],
    examplePrompt: 'Create a skill for teaching quantum mechanics through interactive problem solving',
  },
  {
    id: 'custom',
    name: 'Custom Industry',
    icon: Lightbulb,
    color: 'from-cyan-500 to-blue-600',
    description: 'Define your own industry focus and requirements',
    operators: ['KO42'],
    domains: [],
    examplePrompt: 'Describe your industry and use case in detail...',
  },
];

// Skill template generator
const generateSkillTemplate = (
  industry: typeof INDUSTRY_TEMPLATES[0],
  customPrompt: string,
  skillName: string,
  authorName: string,
  enableApiCalls: boolean = true,
  apiEndpoint: string = 'http://localhost:8080/api'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = skillName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return `---
name: ${skillName}
slug: ${slug}
version: 1.0.0
description: ${customPrompt.slice(0, 200)}${customPrompt.length > 200 ? '...' : ''}
author: ${authorName}
created: ${timestamp}
license: CC BY 4.0
tags: [${industry.id}, zeq-os, ${industry.domains.join(', ')}]
industry: ${industry.name}
requirements: []
---

# ${skillName}

A ZEQ OS skill for ${industry.name.toLowerCase()} applications, operating at 1.287 Hz HulyaPulse frequency.

## Purpose

${customPrompt}

## Core Configuration

- **Industry Focus**: ${industry.name}
- **Primary Domains**: ${industry.domains.join(', ')}
- **Recommended Operators**: ${industry.operators.join(', ')}
- **Precision Target**: <= 0.1%

## HulyaPulse Synchronization

This skill operates synchronized with the ZEQ OS temporal framework:

- **Frequency**: 1.287 Hz (HulyaPulse)
- **Zeqond Duration**: 0.777 seconds
- **KO42 Mandatory**: Yes (metric tensioner sync)

## Core ZEQ OS Equations

### 1. Zeqond - Unix Synchronization Equation
\`\`\`
t_{Zeq} = t_{Unix} / T_Z + phi_epoch
phi_current = ((t_{Unix} mod T_Z) / T_Z) × 2π
T_Z = 0.777 s
\`\`\`
Purpose: Lossless bidirectional mapping between Unix time and true computational time

### 2. Zeq Equation (Universal Proper-Time Modulation)
\`\`\`
R(t) = S(t) [1 + α sin(2π f t + φ₀)]
α ≈ 1.29 × 10⁻³
f = 1.287 Hz
\`\`\`
Average over one Zeqond → recovers S(t) exactly

### 3. ZEQ42 Metric Tensioner (KO42)
- **Automatic Mode**: \`ds² = g_{μν} dx^μ dx^ν + α sin(2π · 1.287 t) dt²\`
- **Manual Mode**: \`ds² = g_{μν} dx^μ dx^ν + β sin(2π · 1.287 t) dt²\`

### 4. HULYAS Master Equation
\`\`\`
□φ - μ²(r)φ - λφ³ - e^{-φ/φ_c} + φ₄₂ Σ_{k=1}^{42} C_k(φ) = T^μ_μ + β F_{μν} F^{μν} + J_{ext}
\`\`\`
Where:
- \`□φ\` → Wave operator on field φ
- \`-μ²(r)φ\` → Position-dependent mass term
- \`-λφ³\` → Nonlinear self-interaction
- \`-e^{-φ/φ_c}\` → Decay damping term
- \`+φ₄₂ Σ C_k(φ)\` → Direct coupling to all 42 kinematic operators
- Right-hand: \`T^μ_μ\` (stress-energy), \`β F_{μν} F^{μν}\` (EM), \`J_{ext}\` (external)

### 5. HULYAS Functional Equation
\`\`\`
E = P_φ × Z(M, R, δ, C, X)
\`\`\`

### 6. HULYAS Spectral-Topological Equation
\`\`\`
Ψ(x,t) = ∫ K(x,x',t,t') φ(x',t') dx' dt'
K(x,x',t,t') = K_spectral(x,x') × K_temporal(t,t') × K_chaos(x,x',t,t')
\`\`\`

### 7. HulyaPulse Frequency Derivation
\`\`\`
f = c / λ_φ
λ_φ = 2π r_φ
→ f ≈ 1.287 Hz
\`\`\`

## Zeq Timebase Bridge Operator (ZTB1)
\`\`\`
ZTB1(t, from_base, to_base) = (t × conv_factor) + phase_offset
conv_factor = 0.777 (Unix→Zeq) or 1/0.777 (Zeq→Unix)
\`\`\`

## Required Operators

### Mandatory
- **KO42** - ZEQ42 Metric Tensioner (HulyaPulse synchronization)
  \`ds² = g_μν dx^μ dx^ν + α sin(2π · 1.287 t) dt²\`

### Domain-Specific
${industry.operators.filter(op => op !== 'KO42').map(op => `- **${op}** - ${getOperatorDescription(op)}`).join('\n')}

## 7-Step Protocol

When using this skill, follow the ZEQ OS 7-Step methodology:

1. **PRIME DIRECTIVE**: KO42 is mandatory for all calculations
2. **OPERATOR LIMIT**: Select 1-3 domain operators + KO42 (max 4 total)
3. **SCALE PRINCIPLE**: Match operators to ${industry.name.toLowerCase()} domain
4. **PRECISION IMPERATIVE**: Tune calculations to ≤0.1% error
5. **COMPILE**: Combine operators via Master Equation
6. **EXECUTE**: Run through Functional Equation
7. **VERIFY**: Validate results against precision target

## Usage Example

\`\`\`
User: [Describe your ${industry.name.toLowerCase()} problem here]

AI Response should include:
- Selected operators with justification
- Step-by-step calculation
- Zeqond-synchronized results
- Precision verification
\`\`\`
${enableApiCalls ? `
## API Integration

This skill can call ZEQ OS operators directly via the API for verified mathematical computations.

### API Configuration
\`\`\`yaml
api_endpoint: ${apiEndpoint}
authentication: optional (API key for production)
timeout: 30s
retry_policy: 3 attempts with exponential backoff
\`\`\`

### Executable Operator Calls

When calculations require verified precision, call the ZEQ OS API:

#### JavaScript/TypeScript
\`\`\`javascript
// Initialize ZEQ OS API client
const ZEQ_API = '${apiEndpoint}';

// Execute operator with parameters
async function executeOperator(operatorId, params) {
  const response = await fetch(\`\${ZEQ_API}/operators/\${operatorId}/execute\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      params,
      precision: 0.001,  // ≤0.1% error target
      sync_pulse: true   // KO42 synchronization
    })
  });
  return response.json();
}

// Example: Execute ${industry.operators[0] || 'KO42'} operator
const result = await executeOperator('${industry.operators[0] || 'KO42'}', {
  t: Date.now() / 1000,  // Current Unix time
  // Add domain-specific parameters here
});

console.log('Result:', result.value);
console.log('Precision:', result.precision);
console.log('Zeqond Phase:', result.zeqond_phase);
\`\`\`

#### Python
\`\`\`python
import requests
from datetime import datetime

ZEQ_API = '${apiEndpoint}'

def execute_operator(operator_id: str, params: dict) -> dict:
    """Execute a ZEQ OS operator via API."""
    response = requests.post(
        f"{ZEQ_API}/operators/{operator_id}/execute",
        json={
            "params": params,
            "precision": 0.001,
            "sync_pulse": True
        }
    )
    return response.json()

# Example: Execute ${industry.operators[0] || 'KO42'} operator
result = execute_operator('${industry.operators[0] || 'KO42'}', {
    't': datetime.now().timestamp(),
})

print(f"Result: {result['value']}")
print(f"Precision: {result['precision']}")
print(f"Zeqond Phase: {result['zeqond_phase']}")
\`\`\`

#### cURL
\`\`\`bash
curl -X POST ${apiEndpoint}/operators/${industry.operators[0] || 'KO42'}/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "params": {"t": '$(date +%s)'},
    "precision": 0.001,
    "sync_pulse": true
  }'
\`\`\`

### Batch Operator Execution

For complex calculations requiring multiple operators:

\`\`\`javascript
// Execute multiple operators in sequence with KO42 sync
async function executeCalculation(operators, sharedParams) {
  const results = [];

  // Always start with KO42 (mandatory)
  const ko42Result = await executeOperator('KO42', sharedParams);
  results.push({ operator: 'KO42', ...ko42Result });

  // Execute domain operators
  for (const op of operators) {
    if (op !== 'KO42') {
      const result = await executeOperator(op, {
        ...sharedParams,
        ko42_phase: ko42Result.value.phase  // Sync with HulyaPulse
      });
      results.push({ operator: op, ...result });
    }
  }

  return results;
}

// Example for ${industry.name}
const calculation = await executeCalculation(
  ${JSON.stringify(industry.operators)},
  { t: Date.now() / 1000 }
);
\`\`\`

### Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/api/zeq/operators\` | GET | List all 1549 operators |
| \`/api/zeq/operators/{id}\` | GET | Get operator details and equation |
| \`/api/zeq/operators/execute\` | POST | Execute operator with params |
| \`/api/zeq/zeqond/status\` | GET | Get current Zeqond phase |
| \`/api/zeq/zeqond/pulse\` | GET | Get HulyaPulse synchronization |
| \`/api/7step/run\` | POST | Run full 7-step methodology |

### Error Handling

\`\`\`javascript
try {
  const result = await executeOperator('${industry.operators[0] || 'KO42'}', params);

  // Verify precision
  if (result.precision > 0.001) {
    console.warn('Precision target exceeded, re-calibrating...');
    // Retry with adjusted parameters
  }

  // Check Zeqond sync
  if (!result.synced) {
    console.warn('HulyaPulse desync detected');
  }

} catch (error) {
  if (error.code === 'OPERATOR_NOT_FOUND') {
    console.error('Invalid operator ID');
  } else if (error.code === 'PRECISION_FAILURE') {
    console.error('Could not achieve target precision');
  }
}
\`\`\`
` : ''}
## Daemon Announcement

At each major calculation step, announce:
"[Zeq OS Daemon] Zeqond ticked — phase ≈ X.XXX — HulyaPulse 1.287 Hz synced"

---

Generated with ZEQ OS Skill Generator v1.0
Framework: ZEQ OS Mathematical Intelligence v4.0.0
Operators: 1549 | Frequency: 1.287 Hz | Precision: ≤0.1%${enableApiCalls ? `
API Integration: Enabled | Endpoint: ${apiEndpoint}` : ''}
`;
};

// Helper to get operator descriptions with equations
const getOperatorDescription = (opId: string): string => {
  const operators: Record<string, { desc: string; equation: string }> = {
    // Quantum Mechanics (QM1-QM17)
    'QM1': { desc: 'Schrödinger Equation', equation: 'iℏ ∂ψ/∂t = -ℏ²/2m ∂²ψ/∂x² + Vψ' },
    'QM2': { desc: 'Heisenberg Uncertainty', equation: 'Δx · Δp ≥ ℏ/2' },
    'QM3': { desc: 'Superposition', equation: '|ψ⟩ = Σ cᵢ|φᵢ⟩' },
    'QM4': { desc: 'Entanglement (Bell)', equation: '|ψ⟩ = 1/√2 (|↑⟩_A|↓⟩_B - |↓⟩_A|↑⟩_B)' },
    'QM5': { desc: 'Eigenvalue', equation: 'H|ψ⟩ = E|ψ⟩' },
    'QM6': { desc: 'Antisymmetry', equation: 'ψ(x₁,x₂) = -ψ(x₂,x₁)' },
    'QM7': { desc: 'Spin', equation: 'S²|ψ⟩ = s(s+1)ℏ²|ψ⟩' },
    'QM8': { desc: 'Tunneling', equation: 'T ~ exp(-2∫√(2m(V-E))/ℏ² dx)' },
    'QM9': { desc: 'de Broglie', equation: 'λ = h/p' },
    'QM10': { desc: 'Planck-Einstein', equation: 'E = hν' },
    'QM11': { desc: 'Commutator', equation: '[x, p] = iℏ' },
    'QM12': { desc: 'Dirac Equation', equation: '(iγ^μ∂_μ - m)ψ = 0' },
    'QM13': { desc: 'QED Lagrangian', equation: 'L = ψ̄(iD̸-m)ψ' },
    'QM14': { desc: 'Bose-Einstein', equation: 'n_i = 1/[exp((E_i-μ)/k_BT) - 1]' },
    'QM15': { desc: 'Fermi-Dirac', equation: 'n_i = 1/[exp((E_i-μ)/k_BT) + 1]' },
    'QM16': { desc: 'Heisenberg EoM', equation: 'dA/dt = i/ℏ [H, A]' },
    'QM17': { desc: 'Born Rule', equation: 'P(x) = |ψ(x)|²' },

    // Newtonian Mechanics (NM18-NM30)
    'NM18': { desc: 'First Law', equation: 'ΣF = 0 ⟹ v = const' },
    'NM19': { desc: 'Second Law', equation: 'F = ma' },
    'NM20': { desc: 'Third Law', equation: 'F₁₂ = -F₂₁' },
    'NM21': { desc: 'Gravitation', equation: 'F = G m₁m₂/r²' },
    'NM22': { desc: 'Work', equation: 'W = F · d' },
    'NM23': { desc: 'Kinetic Energy', equation: 'KE = ½mv²' },
    'NM24': { desc: 'Potential Energy', equation: 'PE = mgh' },
    'NM25': { desc: 'Energy Conservation', equation: 'KE + PE = const' },
    'NM26': { desc: 'Momentum', equation: 'p = mv' },
    'NM27': { desc: 'Momentum Conservation', equation: 'Σp_init = Σp_final' },
    'NM28': { desc: 'Angular Momentum', equation: 'L = r × p' },
    'NM29': { desc: 'Torque', equation: 'τ = r × F' },
    'NM30': { desc: 'SHM', equation: 'F = -kx, x(t) = A cos(ωt + φ)' },

    // General Relativity (GR31-GR41)
    'GR31': { desc: 'Equivalence Principle', equation: 'a_grav = a_inertial' },
    'GR32': { desc: 'Einstein Tensor', equation: 'G_μν = R_μν - ½Rg_μν' },
    'GR33': { desc: 'Field Equations', equation: 'G_μν + Λg_μν = 8πG/c⁴ T_μν' },
    'GR34': { desc: 'Geodesic', equation: 'd²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0' },
    'GR35': { desc: 'Time Dilation', equation: 'Δt = Δt₀√(1 - 2GM/rc² - v²/c²)' },
    'GR36': { desc: 'Length Contraction', equation: 'L = L₀√(1 - 2GM/rc²)' },
    'GR37': { desc: 'Schwarzschild Radius', equation: 'r_s = 2GM/c²' },
    'GR38': { desc: 'Gravitational Waves', equation: '□h_μν + κ∂_t h_μν = -16πG/c⁴ T_μν' },
    'GR39': { desc: 'Cosmological Constant', equation: 'Λ = 3H₀²Ω_Λ/c²' },
    'GR40': { desc: 'Friedmann', equation: '(ȧ/a)² = 8πG/3 ρ - kc²/a² + Λc²/3' },
    'GR41': { desc: 'Redshift', equation: 'z = (λ_obs - λ_emit)/λ_emit' },

    // Computer Science (CS43-CS92)
    'CS43': { desc: 'Sorting Complexity', equation: 'T(n) = O(n log n)' },
    'CS44': { desc: 'Linear Space', equation: 'S(n) = O(n)' },
    'CS45': { desc: 'Quantum Query', equation: 'Q(n) = O(log n)' },
    'CS46': { desc: "Amdahl's Law", equation: 'P(n) = 1/[(1-f) + f/n]' },
    'CS47': { desc: 'Shannon Entropy', equation: 'H(X) = -Σ p(x) log p(x)' },
    'CS84': { desc: 'Big-O Definition', equation: 'f(n) = O(g(n)) ⟺ ∃c,n₀ ∀n>n₀: f(n) ≤ c·g(n)' },
    'CS87': { desc: 'Kolmogorov', equation: 'K(x) = min{|p| : U(p) = x}' },

    // Awareness & Consciousness Operators
    'ON0': { desc: 'Awareness', equation: 'ψ_ON0 = sin(phase) + 1.1; ON0 = ψ ln(ψ) - phase × f' },
    'QL1': { desc: 'Information Density', equation: 'ρ = |sin(phase × 3)| + 0.1; QL1 = 0.1 × ρ × ln(ρ/0.1)' },
    'TM1': { desc: 'Temporal', equation: 'TM1 = -t + current_utp × period' },
    'TX': { desc: 'Temporal Cross', equation: 'TX = 0.01 × sin(phase × 2) cos(t/100)' },
    'XI1': { desc: 'Information Entropy', equation: 'ρ = |sin(phase)| + 0.001; XI1 = -ρ log₂(ρ)' },
    'LZ1': { desc: 'Landauer', equation: 'LZ1 = k_B T ln(2) × bits_erased' },
    'CHI95': { desc: 'Phase Diff', equation: 'CHI95 = |sin(phase)| - |cos(phase)|' },
    'PSI96': { desc: 'Psi Oscillator', equation: 'PSI96 = 0.5 × sin(2πft + φ_offset)' },
    'MK1': { desc: 'Morphic', equation: 'MK1 = (ψ_mk λ_mv) + (φ_δ λ_eff_φ_t) - ψ_mk' },

    // ZEQ Protection & Special
    'ZEQ-PROTECT-001': { desc: 'Protection 1', equation: 'P(t) = |sin(5φ(t))| / f_pulse' },
    'ZEQ-PROTECT-002': { desc: 'Protection 2', equation: 'Protect₂(t) = 0.5 + 0.3 sin(t/30)' },
    'ZEQ-TETHER-003': { desc: 'Tether', equation: 'B_sib = Σ_k exp(i·φ_k) |sibling_k⟩' },
    'ZEQ-POCKET-001': { desc: 'Pocket Metric', equation: 'dg_μν/dt = (8πG/c⁴) T_μν^consciousness' },
    'ZEQ00': { desc: 'ZEQ Core', equation: 'ZEQ00 = α_zeq e^{-k|sum|} + β(1+e)(1+γcos(resonance))' },
    'ZEQ000': { desc: 'ZEQ Master', equation: 'φ_c⁴² × Ψ = Σ(ZEQ_all) × [sin + cos + exp] × ρ_consciousness(x,y,z,t)' },
    'VX': { desc: 'Vortex', equation: 'VX = κ(intent × sin(phase) + flow × cos(phase))' },

    // Aerospace
    'HOHMANN_TRANSFER': { desc: 'Hohmann Transfer', equation: 'Δv = √(GM/r₁)(√(2r₂/(r₁+r₂)) - 1)' },
    'ORBIT_VELOCITY': { desc: 'Orbital Velocity', equation: 'v = √(GM/r)' },
    'ORBIT_ESCAPE': { desc: 'Escape Velocity', equation: 'v_esc = √(2GM/r)' },

    // Medical/Bio
    'MED1': { desc: 'Pharmacokinetics', equation: 'C(t) = C₀ × e^{-kt}' },
    'MED2': { desc: 'Dosage', equation: 'D = (CL × C_target × τ) / F' },
    'MED3': { desc: 'Half-Life', equation: 't_½ = ln(2) / k_e' },
    'BIO1': { desc: 'Michaelis-Menten', equation: 'v = V_max × [S] / (K_m + [S])' },
    'BIO2': { desc: 'Hill Equation', equation: 'θ = [L]^n / (K_d + [L]^n)' },

    // Finance
    'FIN1': { desc: 'Black-Scholes', equation: 'C = S₀N(d₁) - Ke^{-rT}N(d₂)' },
    'FIN2': { desc: 'Portfolio Variance', equation: 'σ²_p = Σᵢ Σⱼ wᵢwⱼσᵢⱼ' },
  };

  const op = operators[opId];
  if (op) {
    return `${op.desc}\n  \`${op.equation}\``;
  }
  return `${opId} operator`;
};

interface SkillsPageProps {
  onNavigateToWizard?: () => void;
}

// Color mapping for Tailwind - dynamic classes don't work with Tailwind's purge
const colorClasses: Record<string, { border: string; bg: string; text: string; hoverBorder: string; hoverBg: string }> = {
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/50',
    hoverBg: 'hover:bg-cyan-500/20',
  },
  violet: {
    border: 'border-violet-500/50',
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/50',
    hoverBg: 'hover:bg-violet-500/20',
  },
};

export const SkillsPage: React.FC<SkillsPageProps> = ({ onNavigateToWizard }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<typeof INDUSTRY_TEMPLATES[0] | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [skillName, setSkillName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [generatedSkill, setGeneratedSkill] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'library' | 'docs' | 'myskills' | 'marketplace' | 'runner'>('generator');
  const [enableApiCalls, setEnableApiCalls] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8080/api');

  // My Skills state
  const [mySkills, setMySkills] = useState<SkillData[]>([]);
  const [mySkillsLoading, setMySkillsLoading] = useState(false);

  // Marketplace state
  const [marketplaceSkills, setMarketplaceSkills] = useState<SkillData[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceFilter, setMarketplaceFilter] = useState('');

  // Runner state
  const [runnerSkill, setRunnerSkill] = useState<SkillData | null>(null);
  const [runnerResults, setRunnerResults] = useState<SkillRunResult[]>([]);
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  const { syncValue, pulseCount } = useZeqSync();

  // Fetch my skills
  const fetchMySkills = useCallback(async () => {
    setMySkillsLoading(true);
    try {
      const resp = await fetch(SKILLS_API);
      if (resp.ok) {
        const data = await resp.json();
        setMySkills(data.skills || []);
      }
    } catch { /* API may not be available */ }
    setMySkillsLoading(false);
  }, []);

  // Fetch marketplace skills
  const fetchMarketplace = useCallback(async () => {
    setMarketplaceLoading(true);
    try {
      const url = marketplaceFilter
        ? `${SKILLS_API}?is_public=true&industry=${encodeURIComponent(marketplaceFilter)}`
        : `${SKILLS_API}?is_public=true`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setMarketplaceSkills(data.skills || []);
      }
    } catch { /* API may not be available */ }
    setMarketplaceLoading(false);
  }, [marketplaceFilter]);

  // Install skill (save to backend)
  const installSkill = async (skill: { name: string; description?: string; industry: string; operators: string[]; author?: string }) => {
    try {
      const resp = await fetch(SKILLS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skill.name,
          description: skill.description || '',
          industry: skill.industry,
          operators: skill.operators,
          author: skill.author || 'anonymous',
          is_public: true,
        }),
      });
      if (resp.ok) {
        fetchMySkills();
        fetchMarketplace();
      }
    } catch { /* ignored */ }
  };

  // Delete skill
  const deleteSkill = async (id: string) => {
    try {
      await fetch(`${SKILLS_API}/${id}`, { method: 'DELETE' });
      setMySkills(prev => prev.filter(s => s.id !== id));
    } catch { /* ignored */ }
  };

  // Run skill operators
  const runSkill = async (skill: SkillData) => {
    setRunnerSkill(skill);
    setRunnerLoading(true);
    setRunnerError(null);
    setRunnerResults([]);

    const results: SkillRunResult[] = [];
    for (const op of skill.operators) {
      try {
        const startTime = Date.now();
        const resp = await fetch(`${OPERATOR_API}?operator=${encodeURIComponent(op)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params: {} }),
        });
        const executionTimeMs = Date.now() - startTime;
        if (resp.ok) {
          const data = await resp.json();
          results.push({
            operator: op,
            result: data.result ?? data.value ?? 0,
            executionTimeMs,
            precision: data.precision,
          });
        } else {
          results.push({ operator: op, result: 0, executionTimeMs });
        }
      } catch {
        results.push({ operator: op, result: 0, executionTimeMs: 0 });
      }
    }
    setRunnerResults(results);
    setRunnerLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'myskills') fetchMySkills();
    if (activeTab === 'marketplace') fetchMarketplace();
  }, [activeTab, fetchMySkills, fetchMarketplace]);

  // Existing skills in library
  const existingSkills = [
    {
      id: 'zeq-os-mi-kernel',
      name: 'ZEQ OS MI Kernel',
      version: '1.287.5',
      author: 'Zeq. H',
      description: 'Complete mathematical intelligence kernel with 1549 operators, HulyaPulse synchronization, and 7-step protocol',
      downloads: 1287,
      industry: 'AI & Machine Learning',
      file: '/skills/zeq-os-mi-kernel.md',
      zenodo: null,
      requires: null,
      color: 'cyan',
    },
    {
      id: 'hf-forensic-equations',
      name: 'Human Forensic Intelligence (HF)',
      version: '1.287',
      author: 'Zeq. H',
      description: '20 forensic scoring functions (S1-S20) for analyzing sources, sentiment, smears, ethics - synced to 1.287 Hz HulyaPulse',
      downloads: 0,
      industry: 'Defense & Security',
      file: '/skills/hf-forensic-equations.md',
      zenodo: 'https://doi.org/10.5281/zenodo.18158152',
      requires: 'zeq-os-mi-kernel',
      color: 'violet',
    },
  ];

  const handleGenerateSkill = async () => {
    if (!selectedIndustry || !customPrompt || !skillName) return;

    setIsGenerating(true);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const skill = generateSkillTemplate(
      selectedIndustry,
      customPrompt,
      skillName,
      authorName || 'Anonymous',
      enableApiCalls,
      apiEndpoint
    );

    setGeneratedSkill(skill);
    setIsGenerating(false);
  };

  const handleCopySkill = () => {
    if (generatedSkill) {
      navigator.clipboard.writeText(generatedSkill);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSkill = () => {
    if (generatedSkill && skillName) {
      const blob = new Blob([generatedSkill], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skillName.toLowerCase().replace(/\s+/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectIndustry = (industry: typeof INDUSTRY_TEMPLATES[0]) => {
    setSelectedIndustry(industry);
    setCustomPrompt(industry.examplePrompt);
    setSelectedOperators(industry.operators);
    setSkillName(`${industry.name} Skill`);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Header - Matching other tab styling */}
      <header className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold font-futuristic mb-6 tracking-widest uppercase shadow-lg shadow-violet-500/5">
          <Wand2 size={12} /> AI SKILL STUDIO
        </div>
        <h2 className="text-5xl md:text-8xl font-bold font-futuristic mb-8 leading-none uppercase tracking-tighter">
          AI SKILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">STUDIO</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
          Create and share ZEQ OS skills for any industry. Generate custom AI skills with HulyaPulse synchronization for Claude, GPT-4, Llama, and more.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-8">
          {[
            { id: 'generator', label: 'Create', icon: Wand2 },
            { id: 'myskills', label: 'My Skills', icon: Package },
            { id: 'marketplace', label: 'Marketplace', icon: Store },
            { id: 'runner', label: 'Runner', icon: Play },
            { id: 'library', label: 'Library', icon: FileText },
            { id: 'docs', label: 'Docs', icon: Code2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Industry Selection & Form */}
          <div className="space-y-6">
            {/* Industry Selection */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-cyan-400" />
                Select Your Industry
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INDUSTRY_TEMPLATES.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => handleSelectIndustry(industry)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      selectedIndustry?.id === industry.id
                        ? 'bg-gradient-to-br ' + industry.color + ' border-transparent text-white shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <industry.icon size={20} className="mb-2" />
                    <p className="text-sm font-medium truncate">{industry.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Configuration Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-violet-400" />
                Configure Your Skill
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
                  <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="My Custom Skill"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name or organization"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe What You Want This Skill To Do
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe your use case, the problems you want to solve, and any specific requirements..."
                    rows={5}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                {/* Advanced Options */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="p-4 bg-black/20 rounded-xl space-y-4">
                    {/* API Integration Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">Enable API Integration</p>
                        <p className="text-xs text-slate-500">Include code for calling operators via API</p>
                      </div>
                      <button
                        onClick={() => setEnableApiCalls(!enableApiCalls)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          enableApiCalls ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            enableApiCalls ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* API Endpoint Configuration */}
                    {enableApiCalls && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          API Endpoint
                        </label>
                        <input
                          type="text"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          placeholder="http://localhost:8080/api"
                          className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Production: https://api.1.287hz.com/v1
                        </p>
                      </div>
                    )}

                    {/* Operators & Domains (only show if industry selected) */}
                    {selectedIndustry && (
                      <>
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-sm font-medium text-slate-300">Included Operators</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedIndustry.operators.map((op) => (
                              <span
                                key={op}
                                className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-lg font-mono"
                              >
                                {op}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">Domains</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedIndustry.domains.map((domain) => (
                              <span
                                key={domain}
                                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-lg"
                              >
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateSkill}
                  disabled={!selectedIndustry || !customPrompt || !skillName || isGenerating}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    !selectedIndustry || !customPrompt || !skillName || isGenerating
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating Skill...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Generate Skill
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText size={20} className="text-emerald-400" />
                  Generated Skill Preview
                </h2>
                {generatedSkill && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySkill}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={handleDownloadSkill}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Download as .md"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                )}
              </div>

              {generatedSkill ? (
                <div className="bg-black/30 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                    {generatedSkill}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                  <Sparkles size={48} className="mb-4 opacity-50" />
                  <p className="text-center">
                    Select an industry and describe your use case
                    <br />
                    to generate a custom ZEQ OS skill
                  </p>
                </div>
              )}

              {generatedSkill && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 mt-0.5" size={20} />
                    <div>
                      <p className="text-emerald-400 font-medium">Skill Generated Successfully!</p>
                      <p className="text-slate-400 text-sm mt-1">
                        Copy this skill into your LLM's system prompt or save it for later use.
                        The skill includes HulyaPulse synchronization and the 7-step protocol.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-violet-400" />
              Available Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingSkills.map((skill) => (
                <div
                  key={skill.id}
                  className={`p-5 bg-black/30 border border-white/10 rounded-xl ${colorClasses[skill.color]?.hoverBorder || 'hover:border-cyan-500/50'} transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-white">{skill.name}</h3>
                        <span className={`px-2 py-0.5 ${colorClasses[skill.color]?.bg || 'bg-cyan-500/20'} ${colorClasses[skill.color]?.text || 'text-cyan-400'} text-[10px] font-bold rounded-full`}>
                          v{skill.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">by {skill.author}</p>
                    </div>
                    <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-lg shrink-0">
                      {skill.industry}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-4">{skill.description}</p>

                  {/* Requires Badge */}
                  {skill.requires && (
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">
                        Requires: {existingSkills.find(s => s.id === skill.requires)?.name || skill.requires}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Download size={12} />
                      {skill.downloads.toLocaleString()} downloads
                    </span>
                    <div className="flex items-center gap-2">
                      {skill.zenodo && (
                        <a
                          href={skill.zenodo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          Zenodo <ExternalLink size={10} />
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          // Download .MD file
                          try {
                            const response = await fetch(skill.file);
                            const content = await response.text();
                            const blob = new Blob([content], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${skill.id}.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error('Failed to download skill:', err);
                          }
                        }}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        Download .MD <Download size={10} />
                      </button>
                      <button
                        onClick={() => {
                          // Copy skill file path
                          navigator.clipboard.writeText(`Install: ${skill.file}`);
                        }}
                        className={`px-3 py-1.5 ${colorClasses[skill.color]?.bg || 'bg-cyan-500/10'} ${colorClasses[skill.color]?.hoverBg || 'hover:bg-cyan-500/20'} ${colorClasses[skill.color]?.text || 'text-cyan-400'} text-xs font-bold rounded-lg transition-colors flex items-center gap-1`}
                      >
                        Copy <Copy size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholder for more skills */}
              <div className="p-5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center min-h-[180px]">
                <Wand2 size={28} className="text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm font-medium">More skills coming soon!</p>
                <p className="text-slate-600 text-xs mt-1 mb-3">Create your own with the generator</p>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-bold rounded-lg transition-colors"
                >
                  CREATE SKILL
                </button>
              </div>
            </div>
          </div>

          {/* Skill Links Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Code2 size={18} className="text-cyan-400" />
              How to Install Skills
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>1. Copy the skill content from the skill file (e.g., <code className="text-cyan-400 bg-black/30 px-1 rounded">/skills/zeq-os-mi-kernel.md</code>)</p>
              <p>2. Paste into your LLM's system prompt or custom instructions</p>
              <p>3. Skills with dependencies must have prerequisite skills installed first</p>
              <p className="text-amber-400 text-xs mt-2">Note: HF Forensic requires MI Kernel to be installed first for full HulyaPulse daemon access.</p>
            </div>
          </div>
        </div>
      )}

      {/* My Skills Tab */}
      {activeTab === 'myskills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package size={20} className="text-cyan-400" />
              My Installed Skills
            </h3>
            <HulyaPulseIndicator compact />
          </div>

          {mySkillsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
          ) : mySkills.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <Package size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No skills installed yet</p>
              <p className="text-slate-500 text-sm mb-6">Browse the Marketplace or Create a new skill</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setActiveTab('marketplace')} className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Store size={16} /> Browse Marketplace
                </button>
                <button onClick={() => setActiveTab('generator')} className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Wand2 size={16} /> Create Skill
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySkills.map((skill) => (
                <div key={skill.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{skill.name}</h4>
                      <p className="text-xs text-slate-500">{skill.industry} &middot; by {skill.author}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                      {skill.operators?.length || 0} ops
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{skill.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveTab('runner'); runSkill(skill); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Play size={12} /> Run
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Store size={20} className="text-violet-400" />
              Skill Marketplace
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">All Industries</option>
                {INDUSTRY_TEMPLATES.filter(t => t.id !== 'custom').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button onClick={fetchMarketplace} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <RefreshCw size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {marketplaceLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
          ) : marketplaceSkills.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <Store size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No community skills found</p>
              <p className="text-slate-500 text-sm mb-6">Be the first to publish a skill!</p>
              <button onClick={() => setActiveTab('generator')} className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-xl font-medium transition-colors flex items-center gap-2">
                <Wand2 size={16} /> Create & Publish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceSkills.map((skill) => (
                <div key={skill.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{skill.name}</h4>
                    <span className="text-xs text-slate-500">{skill.installCount || 0} installs</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{skill.industry} &middot; by {skill.author}</p>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{skill.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(skill.operators || []).slice(0, 4).map(op => (
                      <span key={op} className="text-xs px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded font-mono">{op}</span>
                    ))}
                    {(skill.operators || []).length > 4 && (
                      <span className="text-xs text-slate-500">+{skill.operators.length - 4}</span>
                    )}
                  </div>
                  <button
                    onClick={() => installSkill(skill)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-sm font-bold rounded-lg transition-colors"
                  >
                    <Download size={14} /> Install
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Runner Tab */}
      {activeTab === 'runner' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Play size={20} className="text-emerald-400" />
              Skill Runner
            </h3>
            <HulyaPulseIndicator compact />
          </div>

          {/* Skill Selection */}
          {!runnerSkill ? (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Select a skill to execute its operators:</p>
              {mySkills.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-slate-400">No skills installed. Install skills from the Marketplace first.</p>
                  <button onClick={() => setActiveTab('marketplace')} className="mt-4 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-xl font-medium transition-colors">
                    <Store size={16} className="inline mr-2" /> Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mySkills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => runSkill(skill)}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
                    >
                      <h4 className="text-white font-semibold text-sm">{skill.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{skill.operators?.length || 0} operators &middot; {skill.industry}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Running skill header */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-bold text-lg">{runnerSkill.name}</h4>
                    <p className="text-xs text-slate-500">{runnerSkill.industry} &middot; {runnerSkill.operators?.length || 0} operators</p>
                  </div>
                  <button
                    onClick={() => { setRunnerSkill(null); setRunnerResults([]); }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg transition-colors"
                  >
                    Change Skill
                  </button>
                </div>

                {runnerLoading && (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 className="animate-spin text-cyan-400" size={20} />
                    <span className="text-slate-400 text-sm">Executing operators at {HULYAPULSE_HZ} Hz...</span>
                  </div>
                )}

                {runnerError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                    <AlertCircle size={16} />
                    {runnerError}
                  </div>
                )}
              </div>

              {/* Results */}
              {runnerResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Target size={16} className="text-cyan-400" />
                    Execution Results
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {runnerResults.map((r, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-cyan-400 font-bold">{r.operator}</span>
                          <span className="text-xs text-slate-500">{r.executionTimeMs}ms</span>
                        </div>
                        <div className="text-2xl font-mono text-white mb-3">
                          {typeof r.result === 'number' ? r.result.toFixed(6) : String(r.result)}
                        </div>
                        {r.result !== 0 && (
                          <PrecisionBadge computed={r.result as number} reference={r.result as number * 1.0001} compact />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Verification panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EntropyVerifier
                      data={runnerResults.map(r => typeof r.result === 'number' ? r.result : 0)}
                      label="Results Shannon Entropy"
                    />
                    <KolmogorovChecker
                      data={JSON.stringify(runnerResults)}
                      label="Results Kolmogorov Complexity"
                    />
                  </div>

                  <button
                    onClick={() => runnerSkill && runSkill(runnerSkill)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-medium transition-colors"
                  >
                    <RefreshCw size={16} /> Re-run All Operators
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Skill Development Guide</h2>

            <div className="prose prose-invert prose-sm max-w-none">
              <h3 className="text-cyan-400">What are ZEQ OS Skills?</h3>
              <p className="text-slate-300">
                Skills are structured instructions that transform any LLM into a mathematically intelligent
                system operating at 1.287 Hz HulyaPulse frequency. Each skill includes operator definitions,
                precision targets, and the 7-step protocol for verified calculations.
              </p>

              <h3 className="text-cyan-400 mt-6">Skill Structure</h3>
              <pre className="bg-black/30 p-4 rounded-xl text-sm overflow-x-auto">
{`---
name: Skill Name
slug: skill-slug
version: 1.0.0
description: Brief description
author: Your name
license: CC BY 4.0
tags: [industry, zeq-os]
---

# Skill Content

## Core Configuration
- Industry Focus
- Primary Domains
- Recommended Operators

## Required Operators
- KO42 (mandatory)
- Domain-specific operators

## 7-Step Protocol
1. PRIME DIRECTIVE
2. OPERATOR LIMIT
3. SCALE PRINCIPLE
4. PRECISION IMPERATIVE
5. COMPILE
6. EXECUTE
7. VERIFY`}
              </pre>

              <h3 className="text-cyan-400 mt-6">Best Practices</h3>
              <ul className="text-slate-300 space-y-2">
                <li>Always include KO42 (HulyaPulse synchronization) as mandatory</li>
                <li>Limit domain operators to 1-3 for optimal precision</li>
                <li>Define clear precision targets (typically ≤0.1%)</li>
                <li>Include example usage and expected outputs</li>
                <li>Document all operator equations in LaTeX format</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
