import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, BookOpen, Code, FileText, Terminal, Layers, Shield, HelpCircle,
  Loader2, ChevronRight, Building2, Rocket, Microscope, Zap, DollarSign,
  CheckCircle2, Copy, ArrowLeft, Cpu, Factory, Atom, Brain, Ship, Construction,
  Leaf, Dna, FlaskConical
} from 'lucide-react';
import { getDocContent } from '../services/docs';

type DocKind = 'guide' | 'tutorial' | 'api' | 'operators' | 'industry' | 'security' | 'reference' | 'ai';

interface DocEntry {
  id: string;
  title: string;
  kind: DocKind;
  path: string;
  summary: string;
  snippet?: string;
  icon?: React.ReactNode;
  featured?: boolean;
  inlineContent?: string;
}

const DOCS: DocEntry[] = [
  // Featured - Getting Started
  {
    id: 'getting-started',
    title: 'Getting Started',
    kind: 'guide',
    path: 'docs/source/getting_started.rst',
    summary: 'Complete beginner guide: installation, KO42 sync initialization, understanding the 1.287 Hz HulyaPulse, and running your first precision-verified calculations.',
    snippet: `pip install zeq-sdk

from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# IMPORTANT: KO42 is the universal sync operator
# Formula: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)
# All calculations sync to 1.287 Hz HulyaPulse

# First, get sync phase from KO42
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# KO1: Position magnitude
# Formula: r = √(x² + y² + z²)
position = sdk.compute('KO1', {'x': 3, 'y': 4, 'z': 0})
print(f"Position: {position.value} m")  # 5.0 m

# KO11: Kinetic Energy
# Formula: KE = ½mv²
energy = sdk.compute('KO11', {'mass': 10, 'velocity': 5})
print(f"Kinetic Energy: {energy.value} J")  # 125 J`,
    featured: true,
  },
  // MI AI - Featured Section
  {
    id: 'mathematical-intelligence',
    title: 'Mathematical Intelligence (MI) AI',
    kind: 'ai',
    path: 'inline',
    summary: 'Make any AI system physics-aware with 1549 kinematic operators, KO42 HulyaPulse 1.287 Hz synchronization, and precision verification.',
    snippet: `from zeq_mi import MathematicalIntelligence, MIWrapper, HallucinationDetector
from anthropic import Anthropic

# Initialize MI with KO42 sync (MANDATORY)
# KO42 Formula: sin(2π × 1.287 Hz × t + φ)
mi = MathematicalIntelligence(
    pulse_frequency=1.287,   # Hz - Golden ratio: φ/(2π)
    precision_target=0.001,  # 0.1% error threshold
    operators="all"          # Load all 1549 operators
)

# KO42 syncs everything - always runs first
sync = mi.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Use real operators with actual formulas:
# KO14: Lorentz Factor γ = 1/√(1 - v²/c²)
lorentz = mi.compute('KO14', {'velocity': 0.8 * 3e8})

# KO11: Kinetic Energy KE = ½mv²
ke = mi.compute('KO11', {'mass': 1.0, 'velocity': 1000})

# Wrap AI models for physics-verified responses
mi_claude = MIWrapper(Anthropic(), model="claude-3-opus")`,
    featured: true,
    inlineContent: `MATHEMATICAL INTELLIGENCE (MI) AI
==================================

Make any AI system physics-aware with 1549 kinematic operators.

CORE PRINCIPLE: KO42 SYNCHRONIZATION
------------------------------------
Every MI operation syncs to KO42 - the Universal Synchronization Operator:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

Where:
  - 1.287 Hz = φ/(2π) derived from golden ratio φ = 1.618033988749895
  - t = time in seconds
  - φ = phase offset in radians

REAL KINEMATIC OPERATORS (KO1-KO42)
-----------------------------------
| Code | Name                    | Formula                              |
|------|-------------------------|--------------------------------------|
| KO1  | Position Magnitude      | r = √(x² + y² + z²)                  |
| KO2  | Velocity Magnitude      | v = √(vx² + vy² + vz²)               |
| KO3  | Acceleration Magnitude  | a = √(ax² + ay² + az²)               |
| KO9  | Linear Momentum         | p = m × v                            |
| KO10 | Angular Momentum        | L = r × p                            |
| KO11 | Kinetic Energy          | KE = ½mv²                            |
| KO12 | Rotational KE           | KE_rot = ½Iω²                        |
| KO14 | Lorentz Factor          | γ = 1/√(1 - v²/c²)                   |
| KO15 | Relativistic Momentum   | p_rel = γmv                          |
| KO16 | Relativistic Energy     | E_rel = γmc²                         |
| KO17 | Quantum Momentum        | p_q = ℏk                             |
| KO21 | Synchronized Velocity   | v_sync = v(1 + 0.1·sin(2π×1.287×t))  |
| KO23 | Harmonic Motion         | x = A·sin(ωt + φ)                    |
| KO24 | Damped Harmonic         | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync          | sin(2π × 1.287 × t + φ)              |

KO42.1 - AUTOMATIC METRIC TENSIONER
-----------------------------------
Formula: ds² = g_μν dx^μ dx^ν + α sin(2π × 1.287t) dt²
Where α = 1.29×10⁻³ (modulation amplitude)

KO423 - CONSCIOUSNESS FIELD COHERENCE
-------------------------------------
Formula: KO423 = φ_c^42 · T_metric
       = ∇_μ g^μν [1.287 Hz ⊗ 0.618 Hz ⊗ 2.083 Hz]

QUANTUM OPERATORS (QM1-QM17)
----------------------------
| Code | Name                  | Formula                           |
|------|-----------------------|-----------------------------------|
| QM1  | Schrödinger Equation  | iℏ∂Ψ/∂t = ĤΨ                     |
| QM2  | Heisenberg Uncertainty| Δx·Δp ≥ ℏ/2                       |
| QM5  | Quantum Tunneling     | T = exp(-2κL)                     |
| QM9  | Wave-Particle Duality | λ = h/p                           |
| QM17 | Born Rule Probability | P = |Ψ|²                          |

EXAMPLE: Complete Physics Pipeline
----------------------------------
from zeq_mi import MathematicalIntelligence

mi = MathematicalIntelligence(pulse_frequency=1.287)

# Step 1: ALWAYS sync with KO42 first
sync = mi.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Calculate position (KO1)
pos = mi.compute('KO1', {'x': 100, 'y': 200, 'z': 50})
# Formula: r = √(100² + 200² + 50²) = 229.13 m

# Step 3: Calculate velocity (KO2)
vel = mi.compute('KO2', {'vx': 10, 'vy': 20, 'vz': 5})
# Formula: v = √(10² + 20² + 5²) = 22.91 m/s

# Step 4: Calculate kinetic energy (KO11)
ke = mi.compute('KO11', {'mass': 100, 'velocity': vel.value})
# Formula: KE = ½ × 100 × 22.91² = 26,234 J

AI MODEL WRAPPING
-----------------
from zeq_mi import MIWrapper
from anthropic import Anthropic

mi_claude = MIWrapper(Anthropic(), model="claude-3-opus")
response = mi_claude.chat("What is the escape velocity from Earth?")
# MI verifies: KO2 velocity formula √(2GM/r) = 11,186 m/s
print(f"Verified: {response.verified}")`,
  },
  {
    id: 'batch-pipeline',
    title: 'Batch Processing & Pipelines',
    kind: 'guide',
    path: 'docs/source/batch_pipeline.rst',
    summary: 'High-throughput batch processing with real operators: KO11 energy sweeps, KO14 relativistic calculations, and KO42-synchronized pipelines.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Batch KO11: Kinetic Energy calculations
# Formula: KE = ½mv²
configs = [
    {'mass': m, 'velocity': v}
    for m in range(1, 101)
    for v in range(1, 51)
]

results = sdk.batch('KO11', configs, parallel=16)
print(f"Processed: {len(results)} calculations")

# Pipeline: Position -> Velocity -> Energy
pipeline = sdk.pipeline(['KO1', 'KO2', 'KO11'])
result = pipeline.execute(params)`,
    featured: true,
  },
  // Guides
  {
    id: 'installation',
    title: 'Installation Guide',
    kind: 'guide',
    path: 'docs/source/installation.rst',
    summary: 'Full installation for Python SDK, Rust Core, Node.js SDK, and Docker.',
  },
  {
    id: 'sdk-comprehensive',
    title: 'SDK Comprehensive Guide',
    kind: 'guide',
    path: 'docs/source/sdk_comprehensive_guide.rst',
    summary: 'Complete guide: architecture, API reference, building applications, batch processing, and deployment.',
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    kind: 'guide',
    path: 'docs/source/architecture.rst',
    summary: 'Operator execution pipeline, HulyaPulse 1.287 Hz synchronization, precision validation, and performance.',
  },
  {
    id: 'deployment',
    title: 'Deployment Guide',
    kind: 'guide',
    path: 'docs/source/deployment.rst',
    summary: 'Deploy ZEQ OS: Docker, Kubernetes, cloud platforms, scaling, and monitoring.',
  },
  // Industry Applications - All with real operators and KO42 sync
  {
    id: 'industry-structural',
    title: 'Structural Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build structural analysis with real kinematic operators KO1-KO24 for position, dynamics, and harmonic motion with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO11: Impact kinetic energy
# Formula: KE = ½mv²
impact = sdk.compute('KO11', {'mass': 1000, 'velocity': 10})
print(f"Impact Energy: {impact.value} J")  # 50,000 J

# KO23: Harmonic vibration analysis
# Formula: x = A·sin(ωt + φ)
vibration = sdk.compute('KO23', {
    'amplitude': 0.01, 'omega': 62.83, 'time': 0.5, 'phase': 0
})
print(f"Displacement: {vibration.value} m")`,
    inlineContent: `STRUCTURAL ENGINEERING
======================

Build structural analysis with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All calculations sync to KO42: sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name                | Formula                    |
|------|---------------------|----------------------------|
| KO1  | Position            | r = √(x² + y² + z²)        |
| KO2  | Velocity            | v = √(vx² + vy² + vz²)     |
| KO3  | Acceleration        | a = √(ax² + ay² + az²)     |
| KO9  | Linear Momentum     | p = m × v                  |
| KO11 | Kinetic Energy      | KE = ½mv²                  |
| KO23 | Harmonic Motion     | x = A·sin(ωt + φ)          |
| KO24 | Damped Harmonic     | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync      | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: KO11 - Impact energy
impact = sdk.compute('KO11', {'mass': 500, 'velocity': 14})
print(f"Impact energy: {impact.value} J")

# Step 3: KO23 - Harmonic response
response = sdk.compute('KO23', {
    'amplitude': 0.005, 'omega': 62.83, 'time': 0.1, 'phase': 0
})
print(f"Dynamic deflection: {response.value} m")`,
  },
  {
    id: 'industry-aerospace',
    title: 'Aerospace Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build aerospace applications using real kinematic operators for orbital mechanics, relativistic corrections, and KO42 timing sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Orbital velocity
# Formula: v = √(vx² + vy² + vz²)
orbit_v = sdk.compute('KO2', {'vx': 7660, 'vy': 0, 'vz': 0})
print(f"Orbital Velocity: {orbit_v.value} m/s")

# KO14: Lorentz Factor for relativistic corrections
# Formula: γ = 1/√(1 - v²/c²)
gamma = sdk.compute('KO14', {'velocity': 7660})
print(f"Lorentz Factor: {gamma.value}")`,
    inlineContent: `AEROSPACE ENGINEERING
=====================

Build aerospace applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All calculations sync to KO42: sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name                | Formula                    |
|------|---------------------|----------------------------|
| KO1  | Position            | r = √(x² + y² + z²)        |
| KO2  | Velocity            | v = √(vx² + vy² + vz²)     |
| KO7  | Angular Velocity    | ω = √(ωx² + ωy² + ωz²)     |
| KO10 | Angular Momentum    | L = r × p                  |
| KO13 | Relativistic Vel    | v_rel = (v1+v2)/(1+v1v2/c²)|
| KO14 | Lorentz Factor      | γ = 1/√(1 - v²/c²)         |
| KO15 | Relativistic Mom    | p_rel = γmv                |
| KO16 | Relativistic E      | E_rel = γmc²               |
| KO42 | Universal Sync      | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Calculate ISS orbital parameters
orbit = sdk.compute('KO601', {
    'altitude': 408e3,
    'body_mass': 5.972e24,
    'body_radius': 6.371e6
})

# LEO to GEO transfer
transfer = sdk.compute('KO602', {
    'r1': 6.778e6,
    'r2': 42.164e6,
    'mu': 3.986e14
})`,
  },
  {
    id: 'industry-medical',
    title: 'Medical & Healthcare',
    kind: 'industry',
    path: 'inline',
    summary: 'Drug dosage, cardiac output, pharmacokinetics, and diagnostic calculations.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.0001)  # Higher precision for medical

# Drug dosage (Cockcroft-Gault)
dosage = sdk.compute('MED101', {
    'weight': 70,
    'age': 45,
    'serum_creatinine': 1.2,
    'gender': 'male'
})

print(f"Creatinine Clearance: {dosage.clearance:.2f} mL/min")`,
    inlineContent: `MEDICAL & HEALTHCARE
====================

Build healthcare applications with medical precision operators.

OPERATORS
---------
• MED101 - Creatinine Clearance (Cockcroft-Gault)
• MED102 - Cardiac Output (Fick Principle)
• MED103 - Body Mass Index
• MED104 - Body Surface Area
• MED105 - Pharmacokinetic Half-Life
• MED106 - Drug Volume of Distribution
• MED107 - Radiation Dose Calculation

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.0001)

# Renal function
clearance = sdk.compute('MED101', {
    'weight': 70,
    'age': 65,
    'serum_creatinine': 1.5,
    'gender': 'female'
})

# Cardiac assessment
cardiac = sdk.compute('MED102', {
    'oxygen_consumption': 250,
    'arterial_O2': 200,
    'venous_O2': 150
})`,
  },
  {
    id: 'industry-finance',
    title: 'Finance & Economics',
    kind: 'industry',
    path: 'inline',
    summary: 'Risk analysis (VaR), options pricing (Black-Scholes), and portfolio optimization.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Value at Risk
var_result = sdk.compute('FIN201', {
    'portfolio_value': 10_000_000,
    'confidence': 0.99,
    'volatility': 0.15,
    'time_horizon': 10
})

print(f"VaR (99%): {var_result.value:,.2f} USD")`,
    inlineContent: `FINANCE & ECONOMICS
===================

Build financial applications with quantitative operators.

OPERATORS
---------
• FIN201 - Value at Risk (VaR)
• FIN202 - Black-Scholes Options
• FIN203 - Net Present Value
• FIN204 - Internal Rate of Return
• FIN205 - Sharpe Ratio
• FIN206 - Portfolio Variance
• FIN207 - Monte Carlo VaR

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Parametric VaR
var = sdk.compute('FIN201', {
    'portfolio_value': 10_000_000,
    'confidence': 0.99,
    'volatility': 0.15,
    'time_horizon': 10
})

# Option pricing
call = sdk.compute('FIN202', {
    'S': 150,
    'K': 155,
    'T': 0.25,
    'r': 0.05,
    'sigma': 0.20
})`,
  },
  {
    id: 'industry-energy',
    title: 'Energy Systems',
    kind: 'industry',
    path: 'inline',
    summary: 'Solar panel optimization, wind turbine analysis, and battery management.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Solar panel output
solar = sdk.compute('ENR301', {
    'panel_area': 100,
    'efficiency': 0.22,
    'irradiance': 1000
})

print(f"Power: {solar.power:.2f} kW")`,
    inlineContent: `ENERGY SYSTEMS
==============

Build energy applications with power system operators.

OPERATORS
---------
• ENR301 - Solar Panel Output
• ENR302 - Wind Turbine Power (Betz)
• ENR303 - Battery State of Charge
• ENR304 - Grid Frequency Stability
• ENR305 - Heat Transfer Rate
• ENR306 - Thermal Efficiency

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Solar array
solar = sdk.compute('ENR301', {
    'panel_area': 10000,
    'efficiency': 0.22,
    'irradiance': 800,
    'temperature': 35
})

# Wind farm
wind = sdk.compute('ENR302', {
    'air_density': 1.225,
    'rotor_area': 12000,
    'wind_speed': 10,
    'power_coefficient': 0.45
})`,
  },
  {
    id: 'industry-material',
    title: 'Material Science',
    kind: 'industry',
    path: 'inline',
    summary: 'Build material science with real KO operators for stress-strain dynamics and fatigue with KO42 sync.',
    inlineContent: `MATERIAL SCIENCE - REAL OPERATORS
==================================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name              | Formula                    |
|------|-------------------|----------------------------|
| KO11 | Strain Energy     | KE = ½mv² (energy analog)  |
| KO23 | Thermal Vibration | x = A·sin(ωt + φ)          |
| KO24 | Fatigue Decay     | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync    | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# Initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO24: Fatigue life decay
fatigue = sdk.compute('KO24', {
    'amplitude': 800e6, 'gamma': 0.12, 'omega_d': 0.001, 'time': 10000, 'phase': 0
})`,
  },
  {
    id: 'industry-quantum',
    title: 'Quantum Computing',
    kind: 'industry',
    path: 'inline',
    summary: 'Build quantum applications with real QM operators (QM1-QM17) and KO42 sync.',
    inlineContent: `QUANTUM COMPUTING - REAL OPERATORS
===================================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name                 | Formula                 |
|------|----------------------|-------------------------|
| QM1  | Schrödinger Equation | iℏ∂Ψ/∂t = ĤΨ           |
| QM2  | Heisenberg           | Δx·Δp ≥ ℏ/2             |
| QM5  | Quantum Tunneling    | T = exp(-2κL)           |
| QM9  | de Broglie           | λ = h/p                 |
| QM17 | Born Rule            | P = |Ψ|²                |
| KO17 | Quantum Momentum     | p_q = ℏk                |
| KO42 | Universal Sync       | sin(2π × 1.287 × t + φ) |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# QM5: Tunneling probability
tunnel = sdk.compute('QM5', {
    'mass': 9.109e-31, 'barrier_height': 1e-19, 'barrier_width': 1e-10
})`,
  },
  {
    id: 'industry-robotics',
    title: 'Robotics & Automation',
    kind: 'industry',
    path: 'inline',
    summary: 'Build robotics with real KO1-KO12 operators for kinematics and dynamics with KO42 timing.',
    inlineContent: `ROBOTICS - REAL OPERATORS
=========================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name               | Formula                    |
|------|--------------------|----------------------------|
| KO1  | Position           | r = √(x² + y² + z²)        |
| KO2  | Velocity           | v = √(vx² + vy² + vz²)     |
| KO6  | Angular Position   | (θ, φ) spherical           |
| KO7  | Angular Velocity   | ω = √(ωx² + ωy² + ωz²)     |
| KO11 | Kinetic Energy     | KE = ½mv²                  |
| KO21 | Synchronized Vel   | v_sync = v(1+0.1·sin(...)) |
| KO42 | Universal Sync     | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO1: End effector position
pos = sdk.compute('KO1', {'x': 0.5, 'y': 0.3, 'z': 0.2})

# KO7: Joint angular velocity
omega = sdk.compute('KO7', {'omega_x': 0, 'omega_y': 0.5, 'omega_z': 0.2})`,
  },
  {
    id: 'industry-environmental',
    title: 'Environmental Science',
    kind: 'industry',
    path: 'inline',
    summary: 'Build environmental apps with real KO operators for fluid dynamics and dispersion with KO42 sync.',
    inlineContent: `ENVIRONMENTAL - REAL OPERATORS
==============================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name             | Formula                    |
|------|------------------|----------------------------|
| KO2  | Wind Velocity    | v = √(vx² + vy² + vz²)     |
| KO9  | Momentum Flux    | p = m × v                  |
| KO23 | Seasonal Cycles  | x = A·sin(ωt + φ)          |
| KO24 | Pollutant Decay  | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync   | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Wind velocity
wind = sdk.compute('KO2', {'vx': 5, 'vy': 3, 'vz': 0.5})

# KO24: Pollutant decay
decay = sdk.compute('KO24', {
    'amplitude': 100, 'gamma': 0.1, 'omega_d': 0.001, 'time': 10, 'phase': 0
})`,
  },
  {
    id: 'industry-biotech',
    title: 'Biotechnology',
    kind: 'industry',
    path: 'inline',
    summary: 'Build biotech apps with real KO operators for kinetics and growth dynamics with KO42 sync.',
    inlineContent: `BIOTECHNOLOGY - REAL OPERATORS
==============================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name               | Formula                    |
|------|--------------------|----------------------------|
| KO2  | Diffusion Velocity | v = √(vx² + vy² + vz²)     |
| KO11 | Molecular Energy   | KE = ½mv²                  |
| KO23 | Circadian Rhythms  | x = A·sin(ωt + φ)          |
| KO24 | Growth/Decay       | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync     | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO24: Enzyme kinetics
enzyme = sdk.compute('KO24', {
    'amplitude': 100, 'gamma': 0.5, 'omega_d': 0.01, 'time': 10, 'phase': 0
})

# KO23: Cell cycle oscillation
cell_cycle = sdk.compute('KO23', {
    'amplitude': 1.0, 'omega': 0.087, 'time': 36, 'phase': 0
})`,
  },
  {
    id: 'industry-naval',
    title: 'Naval & Maritime',
    kind: 'industry',
    path: 'inline',
    summary: 'Build naval apps with real KO operators for ship dynamics and wave motion with KO42 sync.',
    inlineContent: `NAVAL & MARITIME - REAL OPERATORS
==================================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name              | Formula                    |
|------|-------------------|----------------------------|
| KO2  | Ship Velocity     | v = √(vx² + vy² + vz²)     |
| KO9  | Ship Momentum     | p = m × v                  |
| KO11 | Propulsion Energy | KE = ½mv²                  |
| KO23 | Wave Motion       | x = A·sin(ωt + φ)          |
| KO24 | Damped Roll       | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync    | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Ship velocity (15 knots ≈ 7.7 m/s)
ship_v = sdk.compute('KO2', {'vx': 7.7, 'vy': 0.5, 'vz': 0.1})

# KO23: Wave-induced heave
heave = sdk.compute('KO23', {
    'amplitude': 2.0, 'omega': 0.785, 'time': 4, 'phase': 0
})`,
  },
  {
    id: 'industry-civil',
    title: 'Civil Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build civil engineering apps with real KO operators for hydraulics and dynamics with KO42 sync.',
    inlineContent: `CIVIL ENGINEERING - REAL OPERATORS
===================================

CRITICAL: KO42 SYNCHRONIZATION
All calculations sync to: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS
--------------
| Code | Name               | Formula                    |
|------|--------------------|----------------------------|
| KO2  | Flow Velocity      | v = √(vx² + vy² + vz²)     |
| KO3  | Seismic Accel      | a = √(ax² + ay² + az²)     |
| KO9  | Flow Momentum      | p = m × v                  |
| KO11 | Impact Energy      | KE = ½mv²                  |
| KO23 | Traffic Cycles     | x = A·sin(ωt + φ)          |
| KO24 | Consolidation      | x = A·e^(-γt)·sin(ωdt + φ) |
| KO42 | Universal Sync     | sin(2π × 1.287 × t + φ)    |

EXAMPLE
-------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Channel flow velocity
flow_v = sdk.compute('KO2', {'vx': 2.5, 'vy': 0.5, 'vz': 0})

# KO23: Seismic ground motion
seismic = sdk.compute('KO23', {
    'amplitude': 2.94, 'omega': 12.57, 'time': 5, 'phase': 0
})`,
  },
  // API References
  {
    id: 'api-python',
    title: 'Python SDK Reference',
    kind: 'api',
    path: 'docs/source/api/python.rst',
    summary: 'Complete Python API: ZeqSDK class, operators, batch, pipelines, and verification.',
  },
  {
    id: 'api-javascript',
    title: 'JavaScript/TypeScript SDK',
    kind: 'api',
    path: 'docs/source/api/javascript.rst',
    summary: 'JS/TS API: async operations, Web Workers, React hooks, and TypeScript types.',
  },
  {
    id: 'api-rust',
    title: 'Rust Core Reference',
    kind: 'api',
    path: 'docs/source/api/rust.rst',
    summary: 'Rust core: ZeqProcessor, HulyaSync, operators, and WASM bindings.',
  },
  {
    id: 'api-rest',
    title: 'REST API Reference',
    kind: 'api',
    path: 'docs/source/api/rest.rst',
    summary: 'REST endpoints: /api/compute, /api/batch, /api/pipeline, /api/verify.',
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    kind: 'api',
    path: 'docs/source/cli.rst',
    summary: 'CLI commands: zeq compute, zeq batch, zeq pipeline, zeq verify.',
  },
  // Tutorials
  {
    id: 'tutorial-first-calculation',
    title: 'Your First Calculation',
    kind: 'tutorial',
    path: 'docs/source/tutorials/first_zeq_calculation.rst',
    summary: 'Step-by-step: installation, first operator, understanding results, and exercises.',
  },
  {
    id: 'tutorial-batch-processing',
    title: 'Batch Processing',
    kind: 'tutorial',
    path: 'docs/source/tutorials/batch_processing.rst',
    summary: 'High-throughput batch processing, parameter sweeps, and Monte Carlo simulations.',
  },
  {
    id: 'tutorial-pipeline-workflows',
    title: 'Pipeline Workflows',
    kind: 'tutorial',
    path: 'docs/source/tutorials/pipeline_workflows.rst',
    summary: 'Chain operators for multi-step calculations and complex engineering workflows.',
  },
  {
    id: 'tutorial-precision',
    title: 'Precision Verification',
    kind: 'tutorial',
    path: 'docs/source/tutorials/precision_verification.rst',
    summary: 'Verify ≤0.1% precision, HulyaPulse sync, and compliance reporting.',
  },
  {
    id: 'tutorial-api-integration',
    title: 'API Integration',
    kind: 'tutorial',
    path: 'docs/source/tutorials/api_integration.rst',
    summary: 'Integrate ZEQ OS using REST API: authentication, endpoints, and best practices.',
  },
  {
    id: 'tutorial-building-apps',
    title: 'Building Applications',
    kind: 'tutorial',
    path: 'docs/source/tutorials/building_apps.rst',
    summary: 'Build production apps: Flask/FastAPI backends, React frontends, Docker deployment.',
  },
  {
    id: 'tutorial-hite-encryption',
    title: 'HITE Encryption',
    kind: 'tutorial',
    path: 'docs/source/tutorials/hite_encryption.rst',
    summary: 'AES-256-GCM encryption with HulyaPulse synchronization and Landauer security.',
  },
  // Operators
  {
    id: 'operators-index',
    title: 'Operator Reference',
    kind: 'operators',
    path: 'docs/source/operators/index.rst',
    summary: 'Index of all 1549 operators: engineering, aerospace, medical, financial, energy, quantum.',
  },
  {
    id: 'operators-engineering',
    title: 'Engineering Operators',
    kind: 'operators',
    path: 'docs/source/operators/engineering.rst',
    summary: 'Structural, mechanical, civil: deflection, stress, buckling, load analysis.',
  },
  {
    id: 'operators-aerospace',
    title: 'Aerospace Operators',
    kind: 'operators',
    path: 'docs/source/operators/aerospace.rst',
    summary: 'Orbital mechanics, trajectory, atmospheric, and propulsion operators.',
  },
  {
    id: 'operators-quantum',
    title: 'Quantum Operators',
    kind: 'operators',
    path: 'docs/source/operators/quantum.rst',
    summary: 'Schrodinger, uncertainty, tunneling, and entanglement operators.',
  },
  // Security & Reference
  {
    id: 'security',
    title: 'Security Guide',
    kind: 'security',
    path: 'docs/source/security.rst',
    summary: 'HITE encryption, authentication, rate limiting, and operator sandboxing.',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    kind: 'reference',
    path: 'docs/source/troubleshooting.rst',
    summary: 'Common issues: API errors, precision problems, and performance optimization.',
  },
  {
    id: 'faq',
    title: 'FAQ',
    kind: 'reference',
    path: 'docs/source/faq.rst',
    summary: 'Common questions about installation, usage, precision, and troubleshooting.',
  },
  {
    id: 'glossary',
    title: 'Glossary',
    kind: 'reference',
    path: 'docs/source/glossary.rst',
    summary: 'HulyaPulse, operators, domains, precision, and framework terminology.',
  },
  // Integrations
  {
    id: 'integration-mcp',
    title: 'MCP Integration',
    kind: 'tutorial',
    path: 'docs/source/tutorials/mcp_integration.rst',
    summary: 'Connect ZEQ OS operators to any MCP-compatible AI system for physics-verified tool use.',
  },
  {
    id: 'integration-librechat',
    title: 'LibreChat Integration',
    kind: 'tutorial',
    path: 'docs/source/tutorials/librechat_integration.rst',
    summary: 'Deploy ZEQ OS as a LibreChat plugin for precision-verified AI conversations.',
  },
];

const kindConfig: Record<DocKind, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  guide: { label: 'Guide', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', icon: <FileText className="w-4 h-4" /> },
  tutorial: { label: 'Tutorial', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', icon: <BookOpen className="w-4 h-4" /> },
  api: { label: 'API', color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/30', icon: <Code className="w-4 h-4" /> },
  operators: { label: 'Operators', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30', icon: <Layers className="w-4 h-4" /> },
  industry: { label: 'Industry', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', icon: <Building2 className="w-4 h-4" /> },
  security: { label: 'Security', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', icon: <Shield className="w-4 h-4" /> },
  reference: { label: 'Reference', color: 'text-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/30', icon: <HelpCircle className="w-4 h-4" /> },
  ai: { label: 'MI AI', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30', icon: <Brain className="w-4 h-4" /> },
};

interface DocumentationPageProps {
  onBack?: () => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocKind | 'all'>('all');
  const [docContent, setDocContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const filteredDocs = useMemo(() => {
    let docs = DOCS;

    if (activeCategory !== 'all') {
      docs = docs.filter(d => d.kind === activeCategory);
    }

    if (query) {
      const q = query.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q)
      );
    }

    return docs;
  }, [query, activeCategory]);

  const featuredDocs = useMemo(() => DOCS.filter(d => d.featured), []);
  const selected = useMemo(() => DOCS.find(d => d.id === selectedId), [selectedId]);

  useEffect(() => {
    if (!selected?.path) {
      setDocContent(null);
      return;
    }

    // If inline content, use that instead of fetching
    if (selected.path === 'inline' && selected.inlineContent) {
      setDocContent(selected.inlineContent);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDocContent(selected.path);
        if (data.success && data.content) {
          setDocContent(data.content);
        } else {
          // Fallback to inline content if available
          if (selected.inlineContent) {
            setDocContent(selected.inlineContent);
          } else {
            throw new Error('Invalid response');
          }
        }
      } catch (err) {
        // Fallback to inline content if available
        if (selected.inlineContent) {
          setDocContent(selected.inlineContent);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [selected?.path, selected?.inlineContent]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    // Clear any existing timeout to prevent memory leaks
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Detail View
  if (selected) {
    const config = kindConfig[selected.kind];
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Documentation</span>
          </button>

          {/* Header */}
          <header className="mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color} text-xs font-bold uppercase tracking-wider mb-4`}>
              {config.icon}
              {config.label}
            </div>
            <h1 className="text-4xl font-bold mb-4">{selected.title}</h1>
            <p className="text-lg text-slate-300 max-w-3xl">{selected.summary}</p>
            <p className="text-xs text-slate-500 mt-4 font-mono">{selected.path}</p>
          </header>

          {/* Code Snippet */}
          {selected.snippet && (
            <div className="mb-8 rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Quick Example</span>
                <button
                  onClick={() => handleCopy(selected.snippet!)}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-6 text-sm text-cyan-300 overflow-x-auto">
                <code>{selected.snippet}</code>
              </pre>
            </div>
          )}

          {/* Content */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="ml-4 text-slate-400">Loading documentation...</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6">
              <p className="text-red-400 font-medium">Error: {error}</p>
              <p className="text-red-300/70 text-sm mt-2">Make sure the API server is running on port 8080</p>
            </div>
          )}

          {docContent && !loading && (
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-8">
              <pre className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                {docContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Documentation Page
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-4 top-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
            <BookOpen size={16} />
            ZEQ OS Documentation
          </div>
          <h1 className="text-5xl font-bold mb-4">Developer Documentation</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Build production applications with 1549 precision operators across 34 industry domains
          </p>
        </header>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-black/40 transition-all"
            />
          </div>
        </div>

        {/* Featured Section */}
        {!query && activeCategory === 'all' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Cpu className="text-cyan-400" size={24} />
              Get Started
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredDocs.map((doc) => {
                const config = kindConfig[doc.kind];
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedId(doc.id)}
                    className="text-left p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${config.bgColor} ${config.color} text-[10px] font-bold uppercase tracking-wider mb-4`}>
                      {config.icon}
                      {config.label}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{doc.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{doc.summary}</p>
                    <div className="flex items-center gap-2 mt-4 text-cyan-400 text-sm font-medium">
                      Read more <ChevronRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Industry Quick Access */}
        {!query && activeCategory === 'all' && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Building2 className="text-orange-400" size={20} />
              Industry Applications (34 Domains)
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { icon: Factory, label: 'Structural', id: 'industry-structural' },
                { icon: Rocket, label: 'Aerospace', id: 'industry-aerospace' },
                { icon: Microscope, label: 'Medical', id: 'industry-medical' },
                { icon: DollarSign, label: 'Finance', id: 'industry-finance' },
                { icon: Zap, label: 'Energy', id: 'industry-energy' },
                { icon: Atom, label: 'Material', id: 'industry-material' },
                { icon: Cpu, label: 'Quantum', id: 'industry-quantum' },
                { icon: Factory, label: 'Robotics', id: 'industry-robotics' },
                { icon: Leaf, label: 'Environment', id: 'industry-environmental' },
                { icon: Dna, label: 'Biotech', id: 'industry-biotech' },
                { icon: Ship, label: 'Naval', id: 'industry-naval' },
                { icon: Construction, label: 'Civil', id: 'industry-civil' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center gap-2"
                >
                  <item.icon size={24} className="text-orange-400" />
                  <span className="text-xs text-slate-300">{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'guide', 'ai', 'industry', 'tutorial', 'api', 'operators', 'reference'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : kindConfig[cat].label}
            </button>
          ))}
        </div>

        {/* Documentation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const config = kindConfig[doc.kind];
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedId(doc.id)}
                className="text-left p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center gap-1.5 ${config.color}`}>
                    {config.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-cyan-400 transition-colors">{doc.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>
              </button>
            );
          })}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">No documentation found matching your search.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-slate-500">
            Build complete docs locally: <code className="text-cyan-400">cd docs && make html</code>
          </p>
        </footer>
      </div>
    </div>
  );
};
