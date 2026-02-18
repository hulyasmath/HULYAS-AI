import React, { useMemo, useState, useEffect } from 'react';
import { Search, BookOpen, Code, FileText, Terminal, Layers, Shield, HelpCircle, Loader2, Building2, Rocket, Microscope, Zap, DollarSign, Cpu, Brain, Atom, Factory, Leaf, Dna, FlaskConical, Gauge, Ship, Construction } from 'lucide-react';
import { getDocContent } from '../services/docs';

type DocKind = 'guide' | 'tutorial' | 'api' | 'operators' | 'industry' | 'security' | 'reference' | 'ai';

interface DocEntry {
  id: string;
  title: string;
  kind: DocKind;
  path: string;
  summary: string;
  snippet?: string;
  inlineContent?: string;
}

const DOCS: DocEntry[] = [
  // Getting Started Guides
  {
    id: 'getting-started',
    title: 'Getting Started',
    kind: 'guide',
    path: 'docs/source/getting_started.rst',
    summary: 'Complete beginner guide: installation, first calculation with KO42 sync, understanding the 1.287 Hz HulyaPulse, and building precision-verified applications.',
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
# Returns: sin(2π × 1.287 × t + φ) for synchronization

# KO1: Position magnitude
# Formula: r = √(x² + y² + z²)
position = sdk.compute('KO1', {
    'x': 3.0, 'y': 4.0, 'z': 0.0
})
print(f"Position: {position.value} m")  # 5.0 m

# KO11: Kinetic Energy
# Formula: KE = ½mv²
energy = sdk.compute('KO11', {
    'mass': 10.0,      # kg
    'velocity': 5.0    # m/s
})
print(f"Kinetic Energy: {energy.value} J")  # 125 J
print(f"Sync Phase: {sync.value}")
print(f"Verified: {energy.verified}")`,
  },
  // MI AI - Consolidated Section
  {
    id: 'mathematical-intelligence',
    title: 'Mathematical Intelligence (MI) AI',
    kind: 'ai',
    path: 'docs/source/mathematical_intelligence.rst',
    summary: 'Make any AI system physics-aware with 1549 kinematic operators, KO42 HulyaPulse 1.287 Hz synchronization, response verification, hallucination detection, and ≤0.1% precision.',
    snippet: `from zeq_mi import MathematicalIntelligence, MIWrapper, HallucinationDetector
from anthropic import Anthropic

# Initialize MI with KO42 sync (MANDATORY for all operations)
# KO42 Formula: sin(2π × 1.287 Hz × t + φ)
mi = MathematicalIntelligence(
    pulse_frequency=1.287,   # Hz - Golden ratio derived: φ/(2π)
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
mi_claude = MIWrapper(Anthropic(), model="claude-3-opus")
response = mi_claude.chat("Calculate the Schwarzschild radius of the Sun")

# Detect hallucinations using operator verification
detector = HallucinationDetector(mi)
analysis = detector.analyze("Light travels at 300,000 m/s")
# is_hallucination: True (should be 3×10⁸ m/s)`,
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

INITIALIZATION
--------------
from zeq_mi import MathematicalIntelligence

mi = MathematicalIntelligence(
    pulse_frequency=1.287,   # Golden ratio frequency
    precision_target=0.001,  # 0.1% max error
    operators="all"          # Load all 1549 operators
)

# KO42 MUST run first to establish sync
sync = mi.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})
# Returns: {'value': 0.0, 'description': 'Universal sync to 1.287 Hz HulyaPulse'}

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
| KO19 | Phase Velocity          | v_phase = ω/k                        |
| KO20 | Group Velocity          | v_group = dω/dk                      |
| KO21 | Synchronized Velocity   | v_sync = v(1 + 0.1·sin(2π×1.287×t))  |
| KO23 | Harmonic Motion         | x = A·sin(ωt + φ)                    |
| KO24 | Damped Harmonic         | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync          | sin(2π × 1.287 × t + φ)              |

KO42.1 - AUTOMATIC METRIC TENSIONER
-----------------------------------
Formula: ds² = g_μν dx^μ dx^ν + α sin(2π × 1.287t) dt²
Where α = 1.29×10⁻³ (modulation amplitude)

result = mi.compute('KO42.1', {
    'g_mu_nu': [[1,0,0,0],[0,-1,0,0],[0,0,-1,0],[0,0,0,-1]],
    'dx_mu': [1, 0.1, 0.1, 0.1],
    'alpha': 1.29e-3,
    't': 0.5
})

KO42.2 - MANUAL METRIC TENSIONER
--------------------------------
Formula: ds² = g_μν dx^μ dx^ν + β sin(2π × 1.287t) dt²
Where β = 3.718 (customizable tuning parameter)

result = mi.compute('KO42.2', {
    'beta': 3.718,
    't': 1.0
})

KO423 - CONSCIOUSNESS FIELD COHERENCE
-------------------------------------
Formula: KO423 = φ_c^42 · T_metric
       = ∇_μ g^μν [1.287 Hz ⊗ 0.618 Hz ⊗ 2.083 Hz]

Components:
  - φ (golden ratio) = 0.618033988749895
  - Primary: 1.287 Hz (golden harmonic)
  - Secondary: 0.618 Hz (φ inverse)
  - Tertiary: 2.083 Hz (φ × golden ratio)

coherence = mi.compute('KO423', {
    'tick_count': 100,
    'elapsed_time': 10.0
})
# Returns coherence metric 0.0-1.0

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

# Step 5: Apply synchronized modulation (KO21)
v_sync = mi.compute('KO21', {
    'v_base': vel.value,
    'time': 1.0,
    'phase': 0
})
# Formula: v_sync = 22.91 × (1 + 0.1·sin(2π×1.287×1)) = 23.14 m/s

AI MODEL WRAPPING
-----------------
from zeq_mi import MIWrapper
from anthropic import Anthropic

mi_claude = MIWrapper(Anthropic(), model="claude-3-opus")

# AI responses are now verified against 1549 operators
response = mi_claude.chat("What is the escape velocity from Earth?")

# MI verifies: KO2 velocity formula √(2GM/r) = 11,186 m/s
print(f"Verified: {response.verified}")
print(f"Operator Used: {response.operator}")  # KO2
print(f"Precision: {response.precision}")     # <0.001

HALLUCINATION DETECTION
-----------------------
from zeq_mi import HallucinationDetector

detector = HallucinationDetector(mi)

# Test against KO operators
analysis = detector.analyze("The Moon orbits Earth at 1000 m/s")

# Checks against KO2: v = √(GM/r) ≈ 1022 m/s
# is_hallucination: False (within 0.1% tolerance)

analysis = detector.analyze("Light travels at 300,000 m/s")
# Checks against c = 299,792,458 m/s
# is_hallucination: True (should be 3×10⁸ m/s)`,
  },
  {
    id: 'installation',
    title: 'Installation Guide',
    kind: 'guide',
    path: 'docs/source/installation.rst',
    summary: 'Full installation matrix for Python SDK, Rust Core, Node.js SDK, and Docker deployment.',
  },
  {
    id: 'sdk-comprehensive',
    title: 'SDK Comprehensive Guide',
    kind: 'guide',
    path: 'docs/source/sdk_comprehensive_guide.rst',
    summary: 'Complete guide covering architecture, API reference, building applications across industries, batch processing, pipeline workflows, and production deployment.',
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    kind: 'guide',
    path: 'docs/source/architecture.rst',
    summary: 'In-depth architecture guide: operator execution pipeline, HulyaPulse 1.287 Hz synchronization, precision validation, cross-domain integration, and performance optimization.',
  },
  // Industry Applications - All with inline content and REAL operators
  {
    id: 'industry-structural',
    title: 'Structural Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build structural analysis applications using real kinematic operators with KO42 synchronization for precision-verified calculations.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
# Formula: KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO11: Kinetic Energy for impact analysis
# Formula: KE = ½mv²
impact = sdk.compute('KO11', {
    'mass': 1000,      # kg (falling object)
    'velocity': 10     # m/s
})
print(f"Impact Energy: {impact.value} J")  # 50,000 J

# KO3: Acceleration from load
# Formula: a = √(ax² + ay² + az²)
accel = sdk.compute('KO3', {
    'ax': 0, 'ay': -9.81, 'az': 0
})
print(f"Gravitational Accel: {accel.value} m/s²")

# KO23: Harmonic vibration analysis
# Formula: x = A·sin(ωt + φ)
vibration = sdk.compute('KO23', {
    'amplitude': 0.01,
    'omega': 2 * 3.14159 * 10,  # 10 Hz
    'time': 0.5,
    'phase': 0
})
print(f"Displacement: {vibration.value} m")`,
    inlineContent: `STRUCTURAL ENGINEERING
======================

Build structural analysis applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All calculations MUST sync to KO42 (1.287 Hz HulyaPulse):

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

This ensures all operators maintain phase coherence.

REAL OPERATORS FOR STRUCTURAL ANALYSIS
--------------------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO1  | Position              | r = √(x² + y² + z²)                  |
| KO2  | Velocity              | v = √(vx² + vy² + vz²)               |
| KO3  | Acceleration          | a = √(ax² + ay² + az²)               |
| KO9  | Linear Momentum       | p = m × v                            |
| KO11 | Kinetic Energy        | KE = ½mv²                            |
| KO23 | Harmonic Motion       | x = A·sin(ωt + φ)                    |
| KO24 | Damped Harmonic       | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

EXAMPLE: Structural Dynamics Analysis
-------------------------------------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# Step 2: Calculate load position (KO1)
# Formula: r = √(x² + y² + z²)
load_pos = sdk.compute('KO1', {
    'x': 5.0,   # meters from support
    'y': 0.0,
    'z': 0.0
})
print(f"Load position: {load_pos.value} m")

# Step 3: Calculate impact velocity (KO2)
# Formula: v = √(vx² + vy² + vz²)
velocity = sdk.compute('KO2', {
    'vx': 0,
    'vy': -14.0,  # falling at 14 m/s
    'vz': 0
})
print(f"Impact velocity: {velocity.value} m/s")

# Step 4: Calculate momentum (KO9)
# Formula: p = m × v
momentum = sdk.compute('KO9', {
    'mass': 500,
    'velocity': velocity.value
})
print(f"Impact momentum: {momentum.value} kg·m/s")

# Step 5: Calculate kinetic energy (KO11)
# Formula: KE = ½mv²
energy = sdk.compute('KO11', {
    'mass': 500,
    'velocity': velocity.value
})
print(f"Impact energy: {energy.value} J")

# Step 6: Analyze harmonic response (KO23)
# Formula: x = A·sin(ωt + φ)
response = sdk.compute('KO23', {
    'amplitude': 0.005,  # 5mm max deflection
    'omega': 62.83,      # 10 Hz natural frequency
    'time': 0.1,
    'phase': 0
})
print(f"Dynamic deflection: {response.value} m")

# Step 7: Damped vibration decay (KO24)
# Formula: x = A·e^(-γt)·sin(ωdt + φ)
damped = sdk.compute('KO24', {
    'amplitude': 0.005,
    'gamma': 0.5,        # damping coefficient
    'omega_d': 62.5,     # damped frequency
    'time': 1.0,
    'phase': 0
})
print(f"Damped response at t=1s: {damped.value} m")`,
  },
  {
    id: 'industry-aerospace',
    title: 'Aerospace Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build aerospace applications using real kinematic operators for orbital mechanics, relativistic corrections, and trajectory calculations with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Orbital velocity magnitude
# Formula: v = √(vx² + vy² + vz²)
orbit_v = sdk.compute('KO2', {
    'vx': 7660,  # ISS orbital velocity components
    'vy': 0,
    'vz': 0
})
print(f"Orbital Velocity: {orbit_v.value} m/s")

# KO14: Lorentz Factor for high-speed corrections
# Formula: γ = 1/√(1 - v²/c²)
gamma = sdk.compute('KO14', {'velocity': 7660})
print(f"Lorentz Factor: {gamma.value}")  # ~1.0000000003

# KO10: Angular Momentum for orbit stability
# Formula: L = r × p
angular_mom = sdk.compute('KO10', {
    'r': 6.778e6,  # orbital radius
    'p': 7660 * 420000  # momentum (ISS mass × velocity)
})
print(f"Angular Momentum: {angular_mom.value} kg·m²/s")`,
    inlineContent: `AEROSPACE ENGINEERING
=====================

Build aerospace applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All aerospace calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR AEROSPACE
----------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO1  | Position              | r = √(x² + y² + z²)                  |
| KO2  | Velocity              | v = √(vx² + vy² + vz²)               |
| KO3  | Acceleration          | a = √(ax² + ay² + az²)               |
| KO7  | Angular Velocity      | ω = √(ωx² + ωy² + ωz²)               |
| KO10 | Angular Momentum      | L = r × p                            |
| KO13 | Relativistic Velocity | v_rel = (v1+v2)/(1+v1v2/c²)          |
| KO14 | Lorentz Factor        | γ = 1/√(1 - v²/c²)                   |
| KO15 | Relativistic Momentum | p_rel = γmv                          |
| KO16 | Relativistic Energy   | E_rel = γmc²                         |
| KO19 | Phase Velocity        | v_phase = ω/k                        |
| KO20 | Group Velocity        | v_group = dω/dk                      |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

EXAMPLE: Orbital Mechanics with Real Operators
----------------------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# Step 2: Calculate orbital radius (KO1)
# Formula: r = √(x² + y² + z²)
# ISS at 408 km altitude
earth_radius = 6.371e6
altitude = 408e3
orbital_r = sdk.compute('KO1', {
    'x': earth_radius + altitude,
    'y': 0,
    'z': 0
})
print(f"Orbital radius: {orbital_r.value/1e6:.3f} million m")

# Step 3: Calculate orbital velocity (KO2)
# v = √(GM/r) ≈ 7660 m/s for ISS
# Using KO2 for velocity magnitude
v_orbital = math.sqrt(3.986e14 / orbital_r.value)
velocity = sdk.compute('KO2', {
    'vx': v_orbital,
    'vy': 0,
    'vz': 0
})
print(f"Orbital velocity: {velocity.value:.2f} m/s")

# Step 4: Calculate angular velocity (KO7)
# Formula: ω = v/r
omega = velocity.value / orbital_r.value
angular_v = sdk.compute('KO7', {
    'omega_x': 0,
    'omega_y': 0,
    'omega_z': omega
})
print(f"Angular velocity: {angular_v.value:.6f} rad/s")

# Step 5: Calculate relativistic corrections (KO14)
# Formula: γ = 1/√(1 - v²/c²)
# Even at 7660 m/s, there's a tiny relativistic effect
lorentz = sdk.compute('KO14', {
    'velocity': velocity.value
})
print(f"Lorentz factor: {lorentz.value:.12f}")

# Step 6: Calculate momentum (KO9)
# Formula: p = m × v
iss_mass = 420000  # kg
momentum = sdk.compute('KO9', {
    'mass': iss_mass,
    'velocity': velocity.value
})
print(f"Linear momentum: {momentum.value:.2e} kg·m/s")

# Step 7: Calculate angular momentum (KO10)
# Formula: L = r × p
L = orbital_r.value * momentum.value
print(f"Angular momentum: {L:.2e} kg·m²/s")

# Step 8: Calculate kinetic energy (KO11)
# Formula: KE = ½mv²
kinetic = sdk.compute('KO11', {
    'mass': iss_mass,
    'velocity': velocity.value
})
print(f"Kinetic energy: {kinetic.value:.2e} J")

# Step 9: Synchronized velocity modulation (KO21)
# Formula: v_sync = v_base(1 + 0.1·sin(2π×1.287×t+φ))
# Useful for orbital perturbation analysis
v_sync = sdk.compute('KO21', {
    'v_base': velocity.value,
    'time': 1.0,
    'phase': 0
})
print(f"Synchronized velocity: {v_sync.value:.2f} m/s")`,
  },
  {
    id: 'industry-medical',
    title: 'Medical & Healthcare',
    kind: 'industry',
    path: 'inline',
    summary: 'Build healthcare applications using real kinematic operators for physiological modeling, cardiac dynamics, and pharmacokinetics with KO42 precision sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.0001)  # Higher precision for medical

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Blood flow velocity
# Formula: v = √(vx² + vy² + vz²)
blood_flow = sdk.compute('KO2', {
    'vx': 0.3,  # m/s in aorta
    'vy': 0.1,
    'vz': 0.05
})
print(f"Blood velocity: {blood_flow.value:.3f} m/s")

# KO23: Cardiac rhythm (harmonic motion)
# Formula: x = A·sin(ωt + φ)
# Heart rate 72 bpm = 1.2 Hz
heart_rhythm = sdk.compute('KO23', {
    'amplitude': 1.0,
    'omega': 2 * 3.14159 * 1.2,  # 72 bpm
    'time': 0.5,
    'phase': 0
})
print(f"Cardiac phase: {heart_rhythm.value:.3f}")

# KO24: Drug decay (damped exponential)
# Formula: x = A·e^(-γt)·sin(ωdt + φ)
drug_level = sdk.compute('KO24', {
    'amplitude': 100,    # initial dose mg
    'gamma': 0.1,        # elimination rate
    'omega_d': 0.01,
    'time': 4,           # hours
    'phase': 0
})
print(f"Drug level at 4h: {drug_level.value:.2f} mg")`,
    inlineContent: `MEDICAL & HEALTHCARE
====================

Build healthcare applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All medical calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

This provides the precision framework for physiological modeling.

REAL OPERATORS FOR MEDICAL APPLICATIONS
---------------------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Flow Velocity         | v = √(vx² + vy² + vz²)               |
| KO3  | Acceleration          | a = √(ax² + ay² + az²)               |
| KO9  | Momentum              | p = m × v (blood flow momentum)      |
| KO11 | Kinetic Energy        | KE = ½mv² (hemodynamics)             |
| KO23 | Harmonic Motion       | x = A·sin(ωt + φ) (cardiac rhythm)   |
| KO24 | Damped Decay          | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

PHYSIOLOGICAL APPLICATIONS
--------------------------
• Cardiac rhythm modeling: KO23 (heart rate oscillation)
• Drug pharmacokinetics: KO24 (exponential decay)
• Blood flow dynamics: KO2, KO9, KO11
• Respiratory mechanics: KO23 (breathing cycles)
• Neural signals: KO23, KO24 (action potentials)

EXAMPLE: Physiological Dynamics Analysis
----------------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.0001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# Step 2: Model cardiac rhythm with KO23
# Heart rate: 72 bpm = 1.2 Hz
# Formula: x = A·sin(ωt + φ)
heart_rate_hz = 72 / 60  # 1.2 Hz
omega_heart = 2 * math.pi * heart_rate_hz

cardiac = sdk.compute('KO23', {
    'amplitude': 1.0,     # normalized
    'omega': omega_heart, # 7.54 rad/s
    'time': 0.5,          # seconds
    'phase': 0
})
print(f"Cardiac phase at t=0.5s: {cardiac.value:.4f}")

# Step 3: Blood flow velocity in aorta (KO2)
# Formula: v = √(vx² + vy² + vz²)
# Peak velocity ~1.0 m/s in healthy aorta
aorta_flow = sdk.compute('KO2', {
    'vx': 0.8,
    'vy': 0.4,
    'vz': 0.2
})
print(f"Aortic flow velocity: {aorta_flow.value:.3f} m/s")

# Step 4: Blood momentum (KO9)
# Formula: p = m × v
# Stroke volume ~70 mL, blood density ~1060 kg/m³
stroke_mass = 0.070 * 1060  # ~74.2 g
blood_momentum = sdk.compute('KO9', {
    'mass': stroke_mass / 1000,  # kg
    'velocity': aorta_flow.value
})
print(f"Blood momentum: {blood_momentum.value:.4f} kg·m/s")

# Step 5: Kinetic energy of blood flow (KO11)
# Formula: KE = ½mv²
blood_ke = sdk.compute('KO11', {
    'mass': stroke_mass / 1000,
    'velocity': aorta_flow.value
})
print(f"Blood kinetic energy: {blood_ke.value:.4f} J")

# Step 6: Drug concentration decay (KO24)
# Formula: C(t) = C0·e^(-kt)
# Using KO24 damped harmonic for pharmacokinetics
# Half-life 4 hours: k = ln(2)/4 = 0.173
initial_dose = 500  # mg
elimination_rate = 0.173  # per hour

# At t=6 hours
drug_level = sdk.compute('KO24', {
    'amplitude': initial_dose,
    'gamma': elimination_rate,
    'omega_d': 0.001,  # minimal oscillation
    'time': 6,
    'phase': 0
})
print(f"Drug level at 6h: {drug_level.value:.2f} mg")

# Step 7: Respiratory cycle (KO23)
# Breathing rate: 12 breaths/min = 0.2 Hz
breath_rate = 12 / 60
omega_breath = 2 * math.pi * breath_rate

respiratory = sdk.compute('KO23', {
    'amplitude': 0.5,      # liters tidal volume
    'omega': omega_breath,
    'time': 2.5,           # mid-inspiration
    'phase': -math.pi/2    # start at minimum
})
print(f"Lung volume change: {respiratory.value:.3f} L")

# Step 8: Neural action potential (KO24)
# Fast depolarization, slower repolarization
# Frequency ~1000 Hz for action potential
neural = sdk.compute('KO24', {
    'amplitude': 0.1,      # 100 mV peak
    'gamma': 500,          # rapid decay
    'omega_d': 6283,       # ~1000 Hz
    'time': 0.001,         # 1 ms
    'phase': 0
})
print(f"Membrane potential: {neural.value*1000:.2f} mV")`,
  },
  {
    id: 'industry-finance',
    title: 'Finance & Economics',
    kind: 'industry',
    path: 'inline',
    summary: 'Build financial applications using real kinematic and CS operators for stochastic modeling, time series analysis, and risk calculations with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO23: Market oscillation modeling
# Formula: x = A·sin(ωt + φ) - price cycles
price_cycle = sdk.compute('KO23', {
    'amplitude': 10.0,    # $10 amplitude
    'omega': 0.1,         # market cycle frequency
    'time': 30,           # days
    'phase': 0
})
print(f"Price oscillation: {price_cycle.value:.2f}")

# KO24: Volatility decay (mean reversion)
# Formula: x = A·e^(-γt)·sin(ωdt + φ)
vol_decay = sdk.compute('KO24', {
    'amplitude': 0.30,    # 30% initial vol
    'gamma': 0.05,        # decay rate
    'omega_d': 0.01,
    'time': 20,           # days
    'phase': 0
})
print(f"Volatility after 20d: {vol_decay.value:.4f}")

# CS50: Monte Carlo simulation operator
# For risk modeling with multiple paths
mc_result = sdk.compute('CS50', {
    'paths': 10000,
    'timesteps': 252,
    'initial_value': 100
})
print(f"MC Expected: {mc_result.value:.2f}")`,
    inlineContent: `FINANCE & ECONOMICS
===================

Build financial applications with real kinematic and CS operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All financial calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

Ensures precision in time-series and stochastic calculations.

REAL OPERATORS FOR FINANCE
--------------------------
| Code  | Name                  | Formula                              |
|-------|-----------------------|--------------------------------------|
| KO23  | Harmonic (Cycles)     | x = A·sin(ωt + φ)                    |
| KO24  | Damped (Mean Rev)     | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO11  | Kinetic (Momentum)    | KE = ½mv² (market momentum)          |
| KO2   | Velocity (Rate)       | v = √(vx² + vy² + vz²)               |
| KO42  | Universal Sync        | sin(2π × 1.287 × t + φ)              |
| CS43  | FFT Algorithm         | Fast Fourier Transform               |
| CS50  | Monte Carlo           | Stochastic simulation                |
| CS92  | Optimization          | Gradient descent / Newton's method   |

COMPUTER SCIENCE OPERATORS (CS43-CS92)
--------------------------------------
The framework includes 50 CS operators for quantitative finance:
• CS43: FFT for signal processing
• CS50: Monte Carlo simulation
• CS60: Matrix operations
• CS70: Numerical integration
• CS80: Differential equations
• CS92: Optimization algorithms

EXAMPLE: Quantitative Finance Pipeline
--------------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# Step 2: Model market cycles (KO23)
# Formula: x = A·sin(ωt + φ)
# Annual cycle: ω = 2π/365
annual_omega = 2 * math.pi / 365
market_cycle = sdk.compute('KO23', {
    'amplitude': 50,       # $50 swing
    'omega': annual_omega,
    'time': 180,           # days (mid-year)
    'phase': 0
})
print(f"Seasonal component: {market_cycle.value:.2f}")

# Step 3: Volatility mean reversion (KO24)
# Formula: σ(t) = σ_long + (σ_0 - σ_long)·e^(-κt)
# Using KO24 for Ornstein-Uhlenbeck process
vol_initial = 0.35    # 35% initial vol
vol_longterm = 0.20   # 20% long-term vol
kappa = 0.1           # mean reversion speed

vol_level = sdk.compute('KO24', {
    'amplitude': vol_initial - vol_longterm,
    'gamma': kappa,
    'omega_d': 0.001,
    'time': 30,
    'phase': 0
})
current_vol = vol_longterm + vol_level.value
print(f"Vol at 30 days: {current_vol:.2%}")

# Step 4: Price velocity / momentum (KO2)
# Formula: v = √(vx² + vy² + vz²)
# Interpret as multi-factor momentum
momentum = sdk.compute('KO2', {
    'vx': 2.5,   # price momentum
    'vy': 1.2,   # volume momentum
    'vz': 0.8    # breadth momentum
})
print(f"Market momentum: {momentum.value:.2f}")

# Step 5: Portfolio kinetic energy (KO11)
# Formula: KE = ½mv²
# Interpret: m = portfolio value, v = return velocity
portfolio_value = 1000000
return_velocity = 0.08  # 8% annualized
portfolio_energy = sdk.compute('KO11', {
    'mass': portfolio_value,
    'velocity': return_velocity
})
print(f"Portfolio energy: {portfolio_energy.value:,.2f}")

# Step 6: Monte Carlo simulation (CS50)
# Geometric Brownian Motion paths
mc_sim = sdk.compute('CS50', {
    'initial_price': 100,
    'drift': 0.08,
    'volatility': current_vol,
    'time_horizon': 1.0,
    'num_paths': 10000,
    'num_steps': 252
})
print(f"MC Expected Price: {mc_sim.mean:.2f}")
print(f"MC 5th Percentile: {mc_sim.percentile_5:.2f}")
print(f"MC 95th Percentile: {mc_sim.percentile_95:.2f}")

# Step 7: FFT for price pattern analysis (CS43)
# Detect dominant frequencies in price series
price_data = [100, 102, 99, 103, 101, 105, 102, 108]
fft_result = sdk.compute('CS43', {
    'signal': price_data,
    'sample_rate': 1.0  # daily
})
print(f"Dominant frequency: {fft_result.dominant_freq:.4f} cycles/day")

# Step 8: Risk metrics using synchronized operators
# VaR = Portfolio × σ × z × √t
z_99 = 2.326  # 99% confidence
time_horizon = 10  # days
var_10d = portfolio_value * current_vol * z_99 * math.sqrt(time_horizon/252)
print(f"10-day VaR (99%): {var_10d:,.2f}")

# Step 9: Apply KO42 modulation for precision timing
# Useful for high-frequency trading sync
sync_factor = sdk.compute('KO42', {
    'time_seconds': 1.0,
    'phase_radians': 0
})
print(f"Sync factor: {sync_factor.value:.6f}")`,
  },
  {
    id: 'industry-energy',
    title: 'Energy Systems',
    kind: 'industry',
    path: 'inline',
    summary: 'Build energy applications using real kinematic operators for power flow, rotational dynamics, and grid synchronization with KO42 at 1.287 Hz.',
    snippet: `from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO7: Wind turbine angular velocity
# Formula: ω = √(ωx² + ωy² + ωz²)
# Turbine at 15 RPM = 1.57 rad/s
turbine_rpm = 15
omega = turbine_rpm * 2 * math.pi / 60
angular_v = sdk.compute('KO7', {
    'omega_x': 0, 'omega_y': 0, 'omega_z': omega
})
print(f"Turbine ω: {angular_v.value:.3f} rad/s")

# KO12: Rotational kinetic energy
# Formula: KE_rot = ½Iω²
# Turbine moment of inertia ~1e7 kg·m²
rot_energy = sdk.compute('KO12', {
    'I': 1e7,
    'omega': angular_v.value
})
print(f"Rotor KE: {rot_energy.value/1e6:.2f} MJ")

# KO11: Kinetic energy of wind
# Formula: KE = ½mv² -> Power = ½ρAv³
# Betz limit: max 59.3% extractable
wind_power = sdk.compute('KO11', {
    'mass': 1.225 * 5000 * 12,  # ρ × A × v per second
    'velocity': 12
})
print(f"Wind power: {wind_power.value * 0.593 / 1000:.2f} kW")`,
    inlineContent: `ENERGY SYSTEMS
==============

Build energy applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
Grid synchronization requires KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR ENERGY
-------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Wind Velocity         | v = √(vx² + vy² + vz²)               |
| KO7  | Angular Velocity      | ω = √(ωx² + ωy² + ωz²)               |
| KO8  | Angular Acceleration  | α = √(αx² + αy² + αz²)               |
| KO11 | Kinetic Energy        | KE = ½mv²                            |
| KO12 | Rotational KE         | KE_rot = ½Iω²                        |
| KO23 | Harmonic (AC Power)   | x = A·sin(ωt + φ)                    |
| KO24 | Damped (Transients)   | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

EXAMPLE: Wind Turbine Analysis
------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: Initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Wind velocity (KO2)
wind_v = sdk.compute('KO2', {'vx': 12, 'vy': 2, 'vz': 0})
print(f"Wind speed: {wind_v.value:.2f} m/s")

# Step 3: Turbine angular velocity (KO7)
# Tip speed ratio ~7, blade radius 50m
tsr = 7
blade_r = 50
omega = tsr * wind_v.value / blade_r
angular_v = sdk.compute('KO7', {'omega_x': 0, 'omega_y': 0, 'omega_z': omega})
print(f"Rotor ω: {angular_v.value:.3f} rad/s")
print(f"Rotor RPM: {angular_v.value * 60 / (2*math.pi):.1f}")

# Step 4: Rotational kinetic energy (KO12)
I_rotor = 1.5e7  # kg·m² for large turbine
rot_ke = sdk.compute('KO12', {'I': I_rotor, 'omega': angular_v.value})
print(f"Rotor KE: {rot_ke.value/1e6:.2f} MJ")

# Step 5: Power extraction (KO11 based)
# P = ½ρAv³ × Cp (Betz limit Cp_max = 0.593)
rho = 1.225
A = math.pi * blade_r**2
Cp = 0.45  # typical coefficient
power = 0.5 * rho * A * wind_v.value**3 * Cp
print(f"Power output: {power/1e6:.2f} MW")

# Step 6: AC power waveform (KO23)
# Grid frequency 60 Hz
grid_freq = 60
ac_power = sdk.compute('KO23', {
    'amplitude': 1.0,
    'omega': 2 * math.pi * grid_freq,
    'time': 0.01,
    'phase': 0
})
print(f"AC phase at t=10ms: {ac_power.value:.4f}")`,
  },
  {
    id: 'industry-material',
    title: 'Material Science',
    kind: 'industry',
    path: 'inline',
    summary: 'Build material science applications using real kinematic operators for stress-strain dynamics, thermal analysis, and fatigue modeling with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO11: Strain energy in material
# Formula: KE = ½mv² → Strain Energy = ½σε·V
strain_energy = sdk.compute('KO11', {
    'mass': 0.001,      # effective mass (volume × density)
    'velocity': 200e6   # stress as "velocity" analog
})
print(f"Strain energy density: {strain_energy.value:.2e} J/m³")

# KO24: Creep/fatigue decay model
# Formula: x = A·e^(-γt)·sin(ωdt + φ)
fatigue_decay = sdk.compute('KO24', {
    'amplitude': 1.0,     # initial strength ratio
    'gamma': 0.001,       # fatigue decay rate
    'omega_d': 0.01,
    'time': 1000,         # cycles
    'phase': 0
})
print(f"Strength after 1000 cycles: {fatigue_decay.value:.4f}")

# KO23: Thermal vibration (Debye model)
# Formula: x = A·sin(ωt + φ)
thermal_vib = sdk.compute('KO23', {
    'amplitude': 1e-11,   # atomic displacement
    'omega': 1e13,        # Debye frequency
    'time': 1e-12,
    'phase': 0
})
print(f"Thermal vibration: {thermal_vib.value:.2e} m")`,
    inlineContent: `MATERIAL SCIENCE
================

Build material science applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All material calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR MATERIALS
----------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Strain Rate           | v = √(vx² + vy² + vz²)               |
| KO3  | Stress Rate           | a = √(ax² + ay² + az²)               |
| KO11 | Strain Energy         | KE = ½mv² (energy density analog)    |
| KO23 | Thermal Vibration     | x = A·sin(ωt + φ) (Debye model)      |
| KO24 | Fatigue Decay         | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

MATERIAL APPLICATIONS
---------------------
• Stress-strain dynamics: KO2, KO3, KO11
• Fatigue life prediction: KO24 (exponential decay)
• Thermal vibrations: KO23 (Debye oscillation model)
• Creep modeling: KO24 (time-dependent decay)
• Impact analysis: KO11 (energy absorption)

EXAMPLE: Material Dynamics Analysis
-----------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Strain rate (KO2)
# Formula: ε̇ = √(ε̇x² + ε̇y² + ε̇z²)
strain_rate = sdk.compute('KO2', {
    'vx': 0.001,  # strain rate components
    'vy': 0.0005,
    'vz': 0.0002
})
print(f"Total strain rate: {strain_rate.value:.6f} /s")

# Step 3: Strain energy density (KO11)
# U = ½σε = ½Eε² for elastic
E = 200e9  # Young's modulus (steel)
strain = 0.002
stress = E * strain
energy_density = sdk.compute('KO11', {
    'mass': 1.0,        # unit volume
    'velocity': stress  # stress as velocity analog
})
print(f"Strain energy: {stress * strain / 2:.2e} J/m³")

# Step 4: Fatigue life model (KO24)
# S-N curve: σ = σf'(2N)^b
# Using damped decay for cyclic loading
sigma_f = 800e6   # fatigue strength coefficient
b = -0.12         # fatigue exponent
N_cycles = 10000

fatigue = sdk.compute('KO24', {
    'amplitude': sigma_f,
    'gamma': abs(b),
    'omega_d': 0.001,
    'time': math.log(2 * N_cycles),
    'phase': 0
})
print(f"Fatigue stress at N={N_cycles}: {fatigue.value:.2e} Pa")

# Step 5: Thermal vibration amplitude (KO23)
# Debye model: <u²> = 3ℏ²T/(mkθD²)
# Using harmonic model for atomic vibrations
debye_freq = 1e13  # Hz (typical for metals)
temp_kelvin = 300

thermal = sdk.compute('KO23', {
    'amplitude': 1e-11,  # ~0.1 Angstrom
    'omega': 2 * math.pi * debye_freq,
    'time': 1e-13,
    'phase': 0
})
print(f"Atomic displacement: {thermal.value:.2e} m")

# Step 6: Creep strain (KO24)
# ε_creep = A·σ^n·t^m·exp(-Q/RT)
# Using damped model for primary creep
creep = sdk.compute('KO24', {
    'amplitude': 0.01,   # initial creep strain
    'gamma': 0.0001,     # creep rate decay
    'omega_d': 0.00001,
    'time': 3600,        # 1 hour
    'phase': 0
})
print(f"Creep strain after 1h: {creep.value:.6f}")`,
  },
  {
    id: 'industry-quantum',
    title: 'Quantum Computing',
    kind: 'industry',
    path: 'inline',
    summary: 'Build quantum applications using real QM operators with KO42 sync for wave functions, tunneling, uncertainty principles, and quantum state calculations.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# QM2: Heisenberg Uncertainty Principle
# Formula: Δx·Δp ≥ ℏ/2
uncertainty = sdk.compute('QM2', {
    'delta_x': 1e-10,     # position uncertainty (m)
    'delta_p': 5.27e-25   # momentum uncertainty (kg·m/s)
})
print(f"Uncertainty product: {uncertainty.value:.2e} J·s")
print(f"Satisfies ℏ/2: {uncertainty.verified}")

# QM5: Quantum Tunneling Probability
# Formula: T = exp(-2κL) where κ = √(2m(V-E))/ℏ
tunnel = sdk.compute('QM5', {
    'mass': 9.109e-31,      # electron mass
    'barrier_height': 1e-19, # Joules
    'barrier_width': 1e-10   # meters
})
print(f"Tunneling probability: {tunnel.value:.6f}")

# KO17: Quantum Momentum
# Formula: p_q = ℏk
qmomentum = sdk.compute('KO17', {
    'k': 1e10  # wave number
})
print(f"Quantum momentum: {qmomentum.value:.2e} kg·m/s")`,
    inlineContent: `QUANTUM COMPUTING
=================

Build quantum applications with real QM and KO operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All quantum calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL QUANTUM OPERATORS
----------------------
| Code | Name                    | Formula                           |
|------|-------------------------|-----------------------------------|
| QM1  | Schrödinger Equation    | iℏ∂Ψ/∂t = ĤΨ                     |
| QM2  | Heisenberg Uncertainty  | Δx·Δp ≥ ℏ/2                       |
| QM5  | Quantum Tunneling       | T = exp(-2κL)                     |
| QM9  | Wave-Particle Duality   | λ = h/p (de Broglie)              |
| QM12 | Quantum Entanglement    | |Ψ⟩ = (|00⟩ + |11⟩)/√2            |
| QM17 | Born Rule               | P = |Ψ|²                          |
| KO17 | Quantum Momentum        | p_q = ℏk                          |
| KO18 | Quantum Velocity        | v_q = ℏk/m                        |
| KO19 | Phase Velocity          | v_phase = ω/k                     |
| KO20 | Group Velocity          | v_group = dω/dk                   |
| KO42 | Universal Sync          | sin(2π × 1.287 × t + φ)           |

CONSTANTS USED
--------------
ℏ (reduced Planck) = 1.054571817e-34 J·s
h (Planck)         = 6.62607015e-34 J·s
m_e (electron)     = 9.10938370e-31 kg
c (light speed)    = 299792458 m/s

EXAMPLE: Complete Quantum Mechanics Pipeline
--------------------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Physical constants
hbar = 1.054571817e-34  # J·s
h = 6.62607015e-34      # J·s
m_e = 9.10938370e-31    # kg

# Step 1: ALWAYS initialize KO42 sync
sync = sdk.compute('KO42', {
    'time_seconds': 0,
    'phase_radians': 0
})

# Step 2: QM9 - de Broglie wavelength
# Formula: λ = h/p
# For electron at 1 eV energy
electron_v = math.sqrt(2 * 1.602e-19 / m_e)  # ~5.93e5 m/s
electron_p = m_e * electron_v
wavelength = sdk.compute('QM9', {
    'h': h,
    'momentum': electron_p
})
print(f"de Broglie wavelength: {wavelength.value:.2e} m")

# Step 3: QM2 - Heisenberg Uncertainty
# Formula: Δx·Δp ≥ ℏ/2
# If we know position to 1 Angstrom...
delta_x = 1e-10  # 1 Angstrom
min_delta_p = hbar / (2 * delta_x)
uncertainty = sdk.compute('QM2', {
    'delta_x': delta_x,
    'delta_p': min_delta_p
})
print(f"Minimum Δp: {min_delta_p:.2e} kg·m/s")
print(f"Product Δx·Δp: {uncertainty.value:.2e} J·s")

# Step 4: QM5 - Quantum Tunneling
# Formula: T = exp(-2κL) where κ = √(2m(V-E))/ℏ
# Electron tunneling through 1 eV barrier, 0.5 nm wide
V = 1.602e-19  # 1 eV barrier
E = 0.5 * 1.602e-19  # 0.5 eV electron
L = 5e-10  # 0.5 nm barrier width

kappa = math.sqrt(2 * m_e * (V - E)) / hbar
T_calc = math.exp(-2 * kappa * L)

tunnel = sdk.compute('QM5', {
    'mass': m_e,
    'barrier_height': V,
    'particle_energy': E,
    'barrier_width': L
})
print(f"Tunneling probability: {tunnel.value:.4f}")

# Step 5: KO17 - Quantum Momentum
# Formula: p_q = ℏk
k = 2 * math.pi / wavelength.value  # wave number
quantum_p = sdk.compute('KO17', {
    'hbar': hbar,
    'k': k
})
print(f"Quantum momentum: {quantum_p.value:.2e} kg·m/s")

# Step 6: KO19 - Phase Velocity
# Formula: v_phase = ω/k
omega = electron_v * k  # angular frequency
phase_v = sdk.compute('KO19', {
    'omega': omega,
    'k': k
})
print(f"Phase velocity: {phase_v.value:.2e} m/s")

# Step 7: QM17 - Born Rule Probability
# Formula: P = |Ψ|²
psi = 0.707 + 0.707j  # normalized state
born = sdk.compute('QM17', {
    'psi_real': 0.707,
    'psi_imag': 0.707
})
print(f"Probability density: {born.value:.4f}")

# Step 8: KO423 - Quantum Coherence Metric
# Formula: KO423 = φ_c^42 · T_metric
coherence = sdk.compute('KO423', {
    'tick_count': 100,
    'elapsed_time': 10.0
})
print(f"Quantum coherence: {coherence.value:.4f}")`,
  },
  {
    id: 'industry-robotics',
    title: 'Robotics & Automation',
    kind: 'industry',
    path: 'inline',
    summary: 'Build robotics applications using real kinematic operators KO1-KO12 for position, velocity, acceleration, and angular motion with KO42 timing sync.',
    snippet: `from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first - critical for real-time control
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO1: End effector position
# Formula: r = √(x² + y² + z²)
position = sdk.compute('KO1', {
    'x': 0.5, 'y': 0.3, 'z': 0.2
})
print(f"End effector distance: {position.value:.3f} m")

# KO6: Joint angles (spherical coordinates)
# Formula: (θ, φ) angular position
joint_angle = sdk.compute('KO6', {
    'theta': 0.785,  # 45 degrees
    'phi': 1.047     # 60 degrees
})
print(f"Joint angles: θ={joint_angle.theta:.3f}, φ={joint_angle.phi:.3f}")

# KO7: Angular velocity of joint
# Formula: ω = √(ωx² + ωy² + ωz²)
joint_omega = sdk.compute('KO7', {
    'omega_x': 0, 'omega_y': 0.5, 'omega_z': 0.2
})
print(f"Joint angular velocity: {joint_omega.value:.3f} rad/s")

# KO21: Synchronized motion
# Formula: v_sync = v_base(1 + 0.1·sin(2π×1.287×t+φ))
sync_motion = sdk.compute('KO21', {
    'v_base': 0.1, 'time': 1.0, 'phase': 0
})
print(f"Synchronized velocity: {sync_motion.value:.4f} m/s")`,
    inlineContent: `ROBOTICS & AUTOMATION
=====================

Build robotics applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
Real-time robot control requires KO42 timing:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

Ensures all joints and sensors sync to master clock.

REAL OPERATORS FOR ROBOTICS (KO1-KO12)
--------------------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO1  | Position              | r = √(x² + y² + z²)                  |
| KO2  | Velocity              | v = √(vx² + vy² + vz²)               |
| KO3  | Acceleration          | a = √(ax² + ay² + az²)               |
| KO4  | Jerk                  | j = √(jx² + jy² + jz²)               |
| KO5  | Snap                  | s = √(sx² + sy² + sz²)               |
| KO6  | Angular Position      | (θ, φ) spherical coordinates         |
| KO7  | Angular Velocity      | ω = √(ωx² + ωy² + ωz²)               |
| KO8  | Angular Acceleration  | α = √(αx² + αy² + αz²)               |
| KO9  | Linear Momentum       | p = m × v                            |
| KO10 | Angular Momentum      | L = r × p                            |
| KO11 | Kinetic Energy        | KE = ½mv²                            |
| KO12 | Rotational KE         | KE_rot = ½Iω²                        |
| KO21 | Synchronized Velocity | v_sync = v(1+0.1·sin(2π×1.287×t))    |
| KO22 | Synchronized Accel    | a_sync = a·cos(2π×1.287×t+φ)         |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

EXAMPLE: 6-DOF Robot Arm Kinematics
-----------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: Initialize KO42 sync (MANDATORY for real-time control)
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Define joint states using KO6
# 6 joints: base, shoulder, elbow, wrist1, wrist2, wrist3
joints = [
    sdk.compute('KO6', {'theta': 0.0, 'phi': 0.0}),      # base
    sdk.compute('KO6', {'theta': 0.785, 'phi': 0.0}),   # shoulder 45°
    sdk.compute('KO6', {'theta': -1.047, 'phi': 0.0}),  # elbow -60°
    sdk.compute('KO6', {'theta': 0.523, 'phi': 0.0}),   # wrist1 30°
    sdk.compute('KO6', {'theta': 0.0, 'phi': 0.785}),   # wrist2
    sdk.compute('KO6', {'theta': 0.0, 'phi': 0.0}),     # wrist3
]

# Step 3: Calculate end effector position (KO1)
# Forward kinematics result
end_effector = sdk.compute('KO1', {
    'x': 0.45,
    'y': 0.32,
    'z': 0.28
})
print(f"End effector distance: {end_effector.value:.3f} m")

# Step 4: Calculate end effector velocity (KO2)
ee_velocity = sdk.compute('KO2', {
    'vx': 0.1,
    'vy': 0.05,
    'vz': -0.02
})
print(f"End effector speed: {ee_velocity.value:.3f} m/s")

# Step 5: Joint angular velocities (KO7)
joint_velocities = []
for i, omega in enumerate([0.5, 0.3, 0.4, 0.2, 0.1, 0.1]):
    jv = sdk.compute('KO7', {
        'omega_x': 0,
        'omega_y': omega if i < 3 else 0,
        'omega_z': omega if i >= 3 else 0
    })
    joint_velocities.append(jv.value)
print(f"Joint velocities: {joint_velocities}")

# Step 6: Calculate arm kinetic energy (KO11 + KO12)
# Link masses and velocities
total_ke = 0
link_masses = [5, 4, 3, 1, 0.5, 0.3]  # kg
link_velocities = [0.1, 0.2, 0.25, 0.15, 0.1, 0.05]  # m/s
for m, v in zip(link_masses, link_velocities):
    ke = sdk.compute('KO11', {'mass': m, 'velocity': v})
    total_ke += ke.value
print(f"Total kinetic energy: {total_ke:.4f} J")

# Step 7: Smooth trajectory with jerk limits (KO4)
max_jerk = sdk.compute('KO4', {
    'jx': 10,
    'jy': 10,
    'jz': 5
})
print(f"Max jerk magnitude: {max_jerk.value:.2f} m/s³")

# Step 8: Synchronized motion control (KO21)
# Smooth velocity profile synced to 1.287 Hz
for t in [0, 0.25, 0.5, 0.75, 1.0]:
    v_sync = sdk.compute('KO21', {
        'v_base': 0.1,
        'time': t,
        'phase': 0
    })
    print(f"t={t:.2f}s: v_sync={v_sync.value:.4f} m/s")`,
  },
  {
    id: 'industry-environmental',
    title: 'Environmental Science',
    kind: 'industry',
    path: 'inline',
    summary: 'Build environmental applications using real kinematic operators for fluid dynamics, dispersion modeling, and ecosystem analysis with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Wind velocity for dispersion
# Formula: v = √(vx² + vy² + vz²)
wind = sdk.compute('KO2', {
    'vx': 5.0, 'vy': 2.0, 'vz': 0.5
})
print(f"Wind speed: {wind.value:.2f} m/s")

# KO24: Pollutant decay (exponential)
# Formula: C(t) = C0·e^(-kt)
decay = sdk.compute('KO24', {
    'amplitude': 100,     # initial concentration
    'gamma': 0.1,         # decay rate
    'omega_d': 0.001,
    'time': 10,           # hours
    'phase': 0
})
print(f"Concentration after 10h: {decay.value:.2f} ppm")

# KO23: Seasonal temperature cycle
# Formula: T(t) = T_avg + A·sin(ωt + φ)
seasonal = sdk.compute('KO23', {
    'amplitude': 15,      # °C variation
    'omega': 0.0172,      # annual cycle (2π/365)
    'time': 180,          # day 180 (summer)
    'phase': -1.57        # shift for Jan minimum
})
print(f"Seasonal temp anomaly: {seasonal.value:.1f}°C")`,
    inlineContent: `ENVIRONMENTAL SCIENCE
=====================

Build environmental applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All environmental calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR ENVIRONMENT
------------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Wind Velocity         | v = √(vx² + vy² + vz²)               |
| KO9  | Momentum (Flow)       | p = m × v (mass transport)           |
| KO11 | Kinetic Energy        | KE = ½mv² (turbulent energy)         |
| KO23 | Seasonal Cycles       | x = A·sin(ωt + φ)                    |
| KO24 | Decay/Dispersion      | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

ENVIRONMENTAL APPLICATIONS
--------------------------
• Wind field modeling: KO2 (velocity vectors)
• Pollutant dispersion: KO24 (exponential decay)
• Seasonal cycles: KO23 (harmonic temperature/rainfall)
• Population dynamics: KO24 (growth/decay)
• Turbulent mixing: KO11 (energy dissipation)

EXAMPLE: Environmental Dynamics
-------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: Initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Wind velocity field (KO2)
wind = sdk.compute('KO2', {'vx': 5, 'vy': 3, 'vz': 0.5})
print(f"Wind speed: {wind.value:.2f} m/s")

# Step 3: Atmospheric momentum flux (KO9)
# ρ_air ≈ 1.225 kg/m³
rho_air = 1.225
momentum_flux = sdk.compute('KO9', {
    'mass': rho_air,
    'velocity': wind.value
})
print(f"Momentum flux: {momentum_flux.value:.3f} kg/(m²·s)")

# Step 4: Turbulent kinetic energy (KO11)
# TKE = ½(u'² + v'² + w'²)
tke = sdk.compute('KO11', {
    'mass': rho_air,
    'velocity': 0.5  # turbulent fluctuation
})
print(f"TKE density: {tke.value:.4f} J/m³")

# Step 5: Pollutant decay (KO24)
# C(t) = C0·exp(-k·t)
initial_conc = 100  # ppm
decay_rate = 0.05   # per hour
pollutant = sdk.compute('KO24', {
    'amplitude': initial_conc,
    'gamma': decay_rate,
    'omega_d': 0.001,
    'time': 24,
    'phase': 0
})
print(f"Concentration at 24h: {pollutant.value:.2f} ppm")

# Step 6: Seasonal temperature (KO23)
# T(t) = T_mean + ΔT·sin(2πt/365 + φ)
annual_omega = 2 * math.pi / 365
temp_cycle = sdk.compute('KO23', {
    'amplitude': 15,       # °C seasonal swing
    'omega': annual_omega,
    'time': 172,           # June 21 (summer)
    'phase': -math.pi/2    # Jan minimum
})
print(f"Summer anomaly: +{temp_cycle.value:.1f}°C")

# Step 7: Population dynamics (KO24)
# dN/dt = rN(1 - N/K) → damped growth
population = sdk.compute('KO24', {
    'amplitude': 1000,
    'gamma': 0.01,
    'omega_d': 0.001,
    'time': 100,
    'phase': 0
})
print(f"Population: {population.value:.0f}")`,
  },
  {
    id: 'industry-biotech',
    title: 'Biotechnology',
    kind: 'industry',
    path: 'inline',
    summary: 'Build biotech applications using real kinematic operators for enzyme kinetics, cell growth dynamics, and molecular motion with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO24: Enzyme reaction kinetics (saturation curve)
# Formula: v = Vmax·[S]/(Km + [S]) modeled as damped approach
enzyme = sdk.compute('KO24', {
    'amplitude': 100,     # Vmax
    'gamma': 0.5,         # rate approach to saturation
    'omega_d': 0.01,
    'time': 10,           # substrate concentration
    'phase': 0
})
print(f"Reaction velocity: {enzyme.value:.2f} µmol/min")

# KO23: Cell division oscillation
# Formula: x = A·sin(ωt + φ) - cell cycle
cell_cycle = sdk.compute('KO23', {
    'amplitude': 1.0,
    'omega': 0.087,       # ~24h cell cycle (2π/72)
    'time': 36,           # hours
    'phase': 0
})
print(f"Cell cycle phase: {cell_cycle.value:.3f}")

# KO2: Molecular diffusion velocity
# Formula: v = √(vx² + vy² + vz²)
diffusion = sdk.compute('KO2', {
    'vx': 1e-6, 'vy': 1e-6, 'vz': 1e-6
})
print(f"Diffusion velocity: {diffusion.value:.2e} m/s")`,
    inlineContent: `BIOTECHNOLOGY
=============

Build biotech applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All biotech calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR BIOTECH
--------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Diffusion Velocity    | v = √(vx² + vy² + vz²)               |
| KO9  | Momentum (Flow)       | p = m × v (mass transport)           |
| KO11 | Kinetic Energy        | KE = ½mv² (molecular energy)         |
| KO23 | Biological Rhythms    | x = A·sin(ωt + φ) (circadian)        |
| KO24 | Growth/Decay          | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

BIOTECH APPLICATIONS
--------------------
• Enzyme kinetics: KO24 (Michaelis-Menten saturation)
• Cell growth: KO24 (exponential/logistic growth)
• Circadian rhythms: KO23 (24h oscillation)
• Molecular diffusion: KO2 (Brownian motion)
• Protein dynamics: KO11, KO23 (folding energy)

EXAMPLE: Fermentation Process
-----------------------------
from zeq_sdk import ZeqSDK

sdk = ZeqSDK()

# Enzyme kinetics
rate = sdk.compute('BIO101', {
    'substrate_conc': 0.01,
    'Vmax': 100,
    'Km': 0.005
})

# Microbial growth
growth = sdk.compute('BIO102', {
    'max_growth_rate': 0.5,
    'substrate_conc': 10,
    'Ks': 2
})

# Bioreactor
reactor = sdk.compute('BIO106', {
    'volume': 1000,
    'feed_rate': 10,
    'feed_conc': 50
})`,
  },
  {
    id: 'industry-naval',
    title: 'Naval & Maritime',
    kind: 'industry',
    path: 'inline',
    summary: 'Build naval applications using real kinematic operators for ship dynamics, wave motion, propulsion, and stability with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Ship velocity
# Formula: v = √(vx² + vy² + vz²)
ship_v = sdk.compute('KO2', {
    'vx': 7.7,  # 15 knots ≈ 7.7 m/s
    'vy': 0.5,
    'vz': 0.1
})
print(f"Ship speed: {ship_v.value:.2f} m/s")

# KO9: Ship momentum
# Formula: p = m × v
displacement = 10000e3  # 10,000 tonnes in kg
momentum = sdk.compute('KO9', {
    'mass': displacement,
    'velocity': ship_v.value
})
print(f"Ship momentum: {momentum.value:.2e} kg·m/s")

# KO23: Wave-induced motion (heave/pitch)
# Formula: x = A·sin(ωt + φ)
wave_period = 8  # seconds
heave = sdk.compute('KO23', {
    'amplitude': 2.0,                    # 2m wave height
    'omega': 2 * math.pi / wave_period,
    'time': 4,
    'phase': 0
})
print(f"Heave motion: {heave.value:.2f} m")`,
    inlineContent: `NAVAL & MARITIME
================

Build naval applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All naval calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR NAVAL
------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Ship Velocity         | v = √(vx² + vy² + vz²)               |
| KO7  | Angular Velocity      | ω = √(ωx² + ωy² + ωz²) (roll/pitch)  |
| KO9  | Ship Momentum         | p = m × v                            |
| KO10 | Angular Momentum      | L = I × ω (rotational stability)     |
| KO11 | Kinetic Energy        | KE = ½mv² (propulsion power)         |
| KO12 | Rotational KE         | KE_rot = ½Iω²                        |
| KO23 | Wave Motion           | x = A·sin(ωt + φ)                    |
| KO24 | Damped Oscillation    | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

NAVAL APPLICATIONS
------------------
• Ship velocity/course: KO2 (speed through water)
• Ship momentum: KO9 (stopping distance)
• Wave response: KO23 (heave, pitch, roll)
• Damping: KO24 (motion decay)
• Propulsion: KO11 (power requirements)
• Stability: KO7, KO10 (rotational dynamics)

EXAMPLE: Ship Dynamics Analysis
-------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: Initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Ship velocity (KO2)
knots_to_ms = 0.5144
speed_knots = 15
ship_v = sdk.compute('KO2', {
    'vx': speed_knots * knots_to_ms,
    'vy': 0,
    'vz': 0
})
print(f"Ship speed: {ship_v.value:.2f} m/s ({speed_knots} knots)")

# Step 3: Ship momentum (KO9)
displacement = 10000e3  # 10,000 tonnes
momentum = sdk.compute('KO9', {
    'mass': displacement,
    'velocity': ship_v.value
})
print(f"Ship momentum: {momentum.value:.2e} kg·m/s")

# Step 4: Propulsion kinetic energy (KO11)
ke = sdk.compute('KO11', {
    'mass': displacement,
    'velocity': ship_v.value
})
print(f"Kinetic energy: {ke.value/1e9:.2f} GJ")

# Step 5: Wave-induced heave (KO23)
wave_height = 3.0  # meters
wave_period = 10   # seconds
omega_wave = 2 * math.pi / wave_period

heave = sdk.compute('KO23', {
    'amplitude': wave_height / 2,
    'omega': omega_wave,
    'time': 5,
    'phase': 0
})
print(f"Heave at t=5s: {heave.value:.2f} m")

# Step 6: Roll motion (KO7 + KO23)
roll_period = 12  # seconds (typical)
roll_omega = 2 * math.pi / roll_period
max_roll = 15 * math.pi / 180  # 15° max roll

roll = sdk.compute('KO23', {
    'amplitude': max_roll,
    'omega': roll_omega,
    'time': 6,
    'phase': 0
})
print(f"Roll angle: {roll.value * 180 / math.pi:.1f}°")

# Step 7: Damped pitch motion (KO24)
pitch = sdk.compute('KO24', {
    'amplitude': 5 * math.pi / 180,  # 5° initial pitch
    'gamma': 0.1,                     # damping
    'omega_d': roll_omega,
    'time': 20,
    'phase': 0
})
print(f"Damped pitch at t=20s: {pitch.value * 180 / math.pi:.2f}°")`,
  },
  {
    id: 'industry-civil',
    title: 'Civil Engineering',
    kind: 'industry',
    path: 'inline',
    summary: 'Build civil engineering applications using real kinematic operators for structural dynamics, hydraulic flow, and geotechnical analysis with KO42 sync.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# KO2: Water flow velocity
# Formula: v = √(vx² + vy² + vz²)
flow_v = sdk.compute('KO2', {
    'vx': 2.5, 'vy': 0.5, 'vz': 0
})
print(f"Flow velocity: {flow_v.value:.2f} m/s")

# KO9: Flow momentum
# Formula: p = ρ × Q = ρ × A × v
water_density = 1000  # kg/m³
flow_area = 10        # m²
momentum = sdk.compute('KO9', {
    'mass': water_density * flow_area,
    'velocity': flow_v.value
})
print(f"Flow momentum: {momentum.value:.2f} kg·m/s per m")

# KO23: Traffic flow oscillation
# Formula: q(t) = q_avg + A·sin(ωt + φ)
traffic = sdk.compute('KO23', {
    'amplitude': 500,     # vehicles/hr variation
    'omega': 0.262,       # peak every 24h
    'time': 8,            # 8 AM
    'phase': -1.57        # shift for morning peak
})
print(f"Traffic variation: {traffic.value:.0f} veh/hr")`,
    inlineContent: `CIVIL ENGINEERING
=================

Build civil engineering applications with real kinematic operators.

CRITICAL: KO42 SYNCHRONIZATION
------------------------------
All civil calculations sync to KO42:

  KO42(t, φ) = sin(2π × 1.287 Hz × t + φ)

REAL OPERATORS FOR CIVIL
------------------------
| Code | Name                  | Formula                              |
|------|-----------------------|--------------------------------------|
| KO2  | Flow Velocity         | v = √(vx² + vy² + vz²)               |
| KO3  | Seismic Acceleration  | a = √(ax² + ay² + az²)               |
| KO9  | Flow Momentum         | p = m × v (hydraulic force)          |
| KO11 | Impact Energy         | KE = ½mv² (pile driving)             |
| KO23 | Traffic Cycles        | x = A·sin(ωt + φ)                    |
| KO24 | Consolidation         | x = A·e^(-γt)·sin(ωdt + φ)           |
| KO42 | Universal Sync        | sin(2π × 1.287 × t + φ)              |

CIVIL APPLICATIONS
------------------
• Hydraulic flow: KO2, KO9 (velocity, momentum)
• Seismic analysis: KO3, KO23 (ground motion)
• Traffic modeling: KO23 (daily cycles)
• Consolidation: KO24 (time-dependent settlement)
• Impact loads: KO11 (pile driving energy)

EXAMPLE: Civil Dynamics Analysis
--------------------------------
from zeq_sdk import ZeqSDK
import math

sdk = ZeqSDK(precision=0.001)

# Step 1: Initialize KO42 sync
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Step 2: Open channel flow velocity (KO2)
# Manning: v = (1/n)·R^(2/3)·S^(1/2)
flow_v = sdk.compute('KO2', {'vx': 2.5, 'vy': 0, 'vz': 0})
print(f"Flow velocity: {flow_v.value:.2f} m/s")

# Step 3: Hydraulic momentum (KO9)
rho_water = 1000
flow_area = 10
Q = flow_area * flow_v.value
momentum = sdk.compute('KO9', {
    'mass': rho_water * flow_area,
    'velocity': flow_v.value
})
print(f"Discharge: {Q:.1f} m³/s")
print(f"Momentum flux: {momentum.value:.0f} N")

# Step 4: Seismic ground motion (KO3 + KO23)
pga = 0.3 * 9.81  # 0.3g peak ground acceleration
seismic_omega = 2 * math.pi * 2  # 2 Hz dominant frequency

seismic = sdk.compute('KO23', {
    'amplitude': pga,
    'omega': seismic_omega,
    'time': 5,
    'phase': 0
})
print(f"Ground acceleration at t=5s: {seismic.value/9.81:.3f}g")

# Step 5: Pile driving energy (KO11)
hammer_mass = 5000  # kg
drop_height = 1.5   # m
impact_v = math.sqrt(2 * 9.81 * drop_height)

pile_energy = sdk.compute('KO11', {
    'mass': hammer_mass,
    'velocity': impact_v
})
print(f"Pile driving energy: {pile_energy.value/1000:.1f} kJ")

# Step 6: Traffic flow pattern (KO23)
# Peak hour factor with daily cycle
traffic = sdk.compute('KO23', {
    'amplitude': 800,      # veh/hr peak variation
    'omega': 2*math.pi/24, # 24-hour cycle
    'time': 8,             # 8 AM (peak hour)
    'phase': -math.pi/2    # Morning peak
})
q_avg = 2000  # average flow
print(f"Peak hour flow: {q_avg + traffic.value:.0f} veh/hr")

# Step 7: Consolidation settlement (KO24)
# S(t) = S_ult × (1 - e^(-t/τ))
# Using damped model
settlement = sdk.compute('KO24', {
    'amplitude': 0.15,   # 15 cm ultimate settlement
    'gamma': 0.001,      # consolidation rate
    'omega_d': 0.0001,
    'time': 365,         # days
    'phase': 0
})
print(f"Settlement after 1 year: {settlement.value*100:.1f} cm")`,
  },
  // Tutorials
  {
    id: 'tutorial-batch-processing',
    title: 'Tutorial: Batch Processing',
    kind: 'tutorial',
    path: 'docs/source/tutorials/building_apps.rst',
    summary: 'Learn high-throughput batch processing with real operators: parallel KO11 energy calculations, KO2 velocity sweeps, and KO42-synchronized pipelines.',
    snippet: `from zeq_sdk import ZeqSDK

sdk = ZeqSDK(precision=0.001)

# ALWAYS sync with KO42 first
sync = sdk.compute('KO42', {'time_seconds': 0, 'phase_radians': 0})

# Batch KO11: Kinetic Energy calculations
# Formula: KE = ½mv²
# Sweep mass and velocity combinations
configs = [
    {'mass': m, 'velocity': v}
    for m in range(1, 101)      # 1-100 kg
    for v in range(1, 51)       # 1-50 m/s
]

# Process 5000 calculations in parallel
results = sdk.batch('KO11', configs, parallel=16)

print(f"Processed: {len(results)} calculations")
print(f"Throughput: {results.throughput:.0f} calcs/second")
print(f"Max KE: {max(r.value for r in results):.2f} J")

# Batch KO14: Lorentz Factor at different velocities
# Formula: γ = 1/√(1 - v²/c²)
relativistic = sdk.batch('KO14', [
    {'velocity': v * 1e6} for v in range(1, 300)
])
print(f"γ at 0.99c: {relativistic[-1].value:.6f}")`,
  },
  {
    id: 'tutorial-pipeline-workflows',
    title: 'Tutorial: Pipeline Workflows',
    kind: 'tutorial',
    path: 'docs/source/tutorials/building_apps.rst',
    summary: 'Chain multiple operators for complex multi-step calculations: structural analysis pipelines, aerospace trajectories, and financial modeling.',
  },
  {
    id: 'tutorial-hite-encryption',
    title: 'Tutorial: HITE Encryption',
    kind: 'tutorial',
    path: 'docs/source/security.rst',
    summary: 'Implement HITE encryption: AES-256-GCM with HulyaPulse synchronization, Landauer principle security, and secure data transmission.',
    snippet: `from zeq_sdk.security import HITEEncryption

hite = HITEEncryption(
    frequency=1.287,
    iterations=100_000
)

encrypted = await hite.encrypt(
    plaintext=json.dumps(result),
    password=secure_key
)

security = hite.analyze_security(encrypted)
print(f"Bits: {security.bits}")
print(f"Min energy to break: {security.energy:.2e} J")`,
  },
  // API & Reference
  {
    id: 'api-python',
    title: 'Python SDK Reference',
    kind: 'api',
    path: 'docs/source/sdk_comprehensive_guide.rst',
    summary: 'Complete Python API reference: ZeqSDK class, operators, batch processing, pipelines, verification, and all methods.',
  },
  {
    id: 'api-rest',
    title: 'REST API Reference',
    kind: 'api',
    path: 'docs/source/cli.rst',
    summary: 'REST API endpoints: /api/compute, /api/batch, /api/pipeline, /api/verify, /api/operators with request/response schemas.',
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    kind: 'api',
    path: 'docs/source/cli.rst',
    summary: 'Complete command-line interface reference: zeq compute, zeq batch, zeq pipeline, zeq verify, and all options.',
  },
  // Operators
  {
    id: 'operators-index',
    title: 'Operator Reference',
    kind: 'operators',
    path: 'docs/source/operators/index.rst',
    summary: 'Index of all 1549 operators grouped by domain: engineering, aerospace, medical, financial, energy, material, quantum, and more.',
  },
  // Security & Deployment
  {
    id: 'security',
    title: 'Security Guide',
    kind: 'security',
    path: 'docs/source/security.rst',
    summary: 'Security best practices: HITE encryption, authentication, rate limiting, operator sandboxing, and compliance.',
  },
  {
    id: 'deployment',
    title: 'Deployment Guide',
    kind: 'guide',
    path: 'docs/source/deployment.rst',
    summary: 'Deploy ZEQ OS in production: Docker, Kubernetes, cloud platforms, scaling, and monitoring.',
  },
  // Reference
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Guide',
    kind: 'reference',
    path: 'docs/source/troubleshooting.rst',
    summary: 'Common issues and solutions: API errors, precision problems, performance optimization.',
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    kind: 'reference',
    path: 'docs/source/faq.rst',
    summary: 'Common questions about ZEQ OS: installation, usage, precision, and troubleshooting.',
  },
  {
    id: 'glossary',
    title: 'Glossary',
    kind: 'reference',
    path: 'docs/source/glossary.rst',
    summary: 'Complete glossary: HulyaPulse, operators, domains, precision, and framework terminology.',
  },
];

const kindLabel: Record<DocKind, string> = {
  guide: 'Guide',
  tutorial: 'Tutorial',
  api: 'API',
  operators: 'Operators',
  industry: 'Industry',
  security: 'Security',
  reference: 'Reference',
  ai: 'MI AI',
};

const kindIcon: Record<DocKind, JSX.Element> = {
  guide: <FileText className="w-3 h-3" />,
  tutorial: <BookOpen className="w-3 h-3" />,
  api: <Code className="w-3 h-3" />,
  operators: <Layers className="w-3 h-3" />,
  industry: <Building2 className="w-3 h-3" />,
  security: <Shield className="w-3 h-3" />,
  reference: <HelpCircle className="w-3 h-3" />,
  ai: <Brain className="w-3 h-3" />,
};

export const DocsViewer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('getting-started');
  const [copied, setCopied] = useState(false);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return DOCS;
    return DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = useMemo(
    () => DOCS.find((d) => d.id === selectedId) ?? DOCS[0],
    [selectedId],
  );

  useEffect(() => {
    const fetchDocContent = async () => {
      if (!selected?.path) return;

      // If inline content, use that instead of fetching
      if (selected.path === 'inline' && selected.inlineContent) {
        setDocContent(selected.inlineContent);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setDocContent(null);

      try {
        const data = await getDocContent(selected.path);
        if (data.success && data.content) {
          setDocContent(data.content);
        } else {
          // If fetch fails but we have inline content, use that
          if (selected.inlineContent) {
            setDocContent(selected.inlineContent);
          } else {
            throw new Error('Documentation not available');
          }
        }
      } catch (err) {
        console.error('[DocsViewer] Error loading documentation:', err);
        // Fallback to inline content if available
        if (selected.inlineContent) {
          setDocContent(selected.inlineContent);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load documentation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocContent();
  }, [selected?.path, selected?.inlineContent]);

  const handleCopySnippet = async () => {
    if (!selected.snippet) return;
    try {
      await navigator.clipboard.writeText(selected.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid md:grid-cols-[280px,minmax(0,1fr)] gap-6 md:gap-8">
      {/* Left: navigation + search */}
      <aside className="rounded-3xl bg-black/40 border border-white/10 p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">
            ZEQ OS Docs
          </span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/70 focus:bg-black/40 transition-all"
          />
        </div>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scroll">
          {filteredDocs.map((doc) => {
            const active = doc.id === selectedId;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedId(doc.id)}
                className={`w-full text-left px-3 py-2 rounded-2xl text-[11px] flex flex-col gap-0.5 border transition-all ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-50'
                    : 'bg-white/3 border-white/5 text-slate-300 hover:bg-white/8 hover:border-emerald-500/40'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {kindIcon[doc.kind]}
                  <span>{doc.title}</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500">
                  {kindLabel[doc.kind]}
                </span>
              </button>
            );
          })}
          {filteredDocs.length === 0 && (
            <p className="text-[11px] text-slate-500 px-1">
              No docs matched. Try "engineering", "aerospace", or "MI AI".
            </p>
          )}
        </div>
      </aside>

      {/* Right: detail view */}
      <section className="glass rounded-[3rem] p-6 md:p-10 border-white/10 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {kindIcon[selected.kind]}
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                {kindLabel[selected.kind]}
              </p>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase">
              {selected.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              {selected.summary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {selected.path !== 'inline' && (
              <span className="text-[10px] font-mono text-slate-500">
                {selected.path}
              </span>
            )}
            {selected.snippet && (
              <button
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <Code className="w-3 h-3" />
                {copied ? 'Copied' : 'Copy Example'}
              </button>
            )}
          </div>
        </header>

        {selected.snippet && (
          <div className="rounded-2xl bg-black/60 border border-emerald-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                Code Example
              </span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-50 whitespace-pre-wrap overflow-x-auto">
              {selected.snippet}
            </pre>
          </div>
        )}

        {/* Documentation Content */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="ml-3 text-slate-400">Loading documentation...</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-red-400 text-sm">Error: {error}</p>
            <p className="text-red-300/70 text-xs mt-2">
              Make sure the API server is running on port 8080
            </p>
          </div>
        )}

        {docContent && !loading && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="text-[13px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {docContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {!docContent && !loading && !error && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Select a document from the left to view its content.
          </p>
        )}
      </section>
    </div>
  );
};
