import { useState, useEffect, useCallback } from 'react';
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
  Target,
} from 'lucide-react';
import { useActivePanel } from '~/Providers';

const OPERATOR_API = '/api/zeq/operators/execute';

// Local storage helpers for skills persistence
const SKILLS_STORAGE_KEY = 'zeq-my-skills';

function loadSkillsFromStorage(): SkillData[] {
  try {
    const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSkillsToStorage(skills: SkillData[]): void {
  localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
}

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

// 36 Industry templates - exact match of skills.html
const INDUSTRY_TEMPLATES = [
  // ── PHYSICS (6) ──
  { id: 'quantum_mechanics', name: 'Quantum Mechanics', badge: 'QM', icon: Atom, color: 'from-violet-500 to-purple-600', description: 'Wave functions, uncertainty, superposition, entanglement, tunneling, spin dynamics', operators: ['QM1','QM2','QM3','QM4','QM5','QM6','QM7','QM8','QM9','QM10','QM11','QM12','QM14','QM15','QM17','CS47','KO42'], domains: ['quantum'], examplePrompt: 'Create a skill for solving time-dependent Schr\u00f6dinger equations in multi-particle quantum systems with entanglement analysis, tunneling probability estimation, spin-orbit coupling, and decoherence timescale prediction' },
  { id: 'particle_nuclear', name: 'Particle & Nuclear Physics', badge: 'NP', icon: Atom, color: 'from-amber-500 to-red-600', description: 'Decay chains, cross-sections, Dirac fields, QED, fission/fusion, Bose-Einstein/Fermi-Dirac', operators: ['QM12','QM6','QM7','QM10','QM5','QM14','QM15','QM16','QM17','QM11','CS47','CS87','KO42'], domains: ['particle','quantum'], examplePrompt: 'Create a skill for calculating nuclear decay chains, scattering cross-sections, QED vertex corrections, branching ratios, and Fermi-Dirac distribution analysis for neutron star matter' },
  { id: 'astrophysics', name: 'Astrophysics & Cosmology', badge: 'AC', icon: Globe, color: 'from-indigo-600 to-purple-800', description: 'Stellar evolution, dark energy, Friedmann models, gravitational waves, redshift, CMB', operators: ['GR33','GR34','GR35','GR37','GR38','GR39','GR40','GR41','NM21','NM23','QM10','CS47','KO42'], domains: ['astrophysics','relativity'], examplePrompt: 'Create a skill for modeling stellar evolution through Friedmann equations, gravitational wave strain estimation, dark energy density evolution, CMB power spectrum analysis, and black hole thermodynamics' },
  { id: 'fluid_thermo', name: 'Fluid Dynamics & Thermodynamics', badge: 'FT', icon: Zap, color: 'from-cyan-500 to-blue-700', description: 'Navier-Stokes, turbulence, heat transfer, entropy production, compressible flow', operators: ['NM19','NM22','NM23','NM24','NM25','NM26','NM30','CS47','CS87','CS43','KO42'], domains: ['fluid','newtonian','computational'], examplePrompt: 'Create a skill for turbulent CFD analysis using Reynolds-averaged Navier-Stokes with k-epsilon closure, compressible flow shock dynamics, convective heat transfer coefficients, and entropy generation minimisation' },
  { id: 'optics_waves', name: 'Optics & Wave Physics', badge: 'OW', icon: Zap, color: 'from-yellow-400 to-orange-600', description: 'Diffraction, interference, laser physics, fiber optics, photonic crystals, nonlinear optics', operators: ['QM9','QM10','QM1','QM17','NM30','NM25','CS47','CS44','KO42'], domains: ['optics','quantum','newtonian'], examplePrompt: 'Create a skill for modeling laser cavity dynamics with Gaussian beam propagation, photonic crystal band structure calculation, fiber optic dispersion analysis, and nonlinear four-wave mixing efficiency' },
  { id: 'plasma_fusion', name: 'Plasma & Fusion Science', badge: 'PF', icon: Zap, color: 'from-orange-500 to-red-700', description: 'Tokamak confinement, MHD stability, plasma instabilities, Lawson criterion, fusion yield', operators: ['QM12','QM14','NM19','NM23','NM25','NM30','GR38','CS47','CS87','KO42'], domains: ['plasma','quantum','newtonian'], examplePrompt: 'Create a skill for tokamak MHD stability analysis with plasma beta limits, Lawson criterion evaluation, energy confinement time estimation, divertor heat flux modeling, and fusion triple product optimisation' },

  // ── ENGINEERING (6) ──
  { id: 'aerospace', name: 'Aerospace & Orbital Mechanics', badge: 'AO', icon: Rocket, color: 'from-blue-500 to-cyan-600', description: 'Transfer orbits, delta-v budgets, reentry dynamics, propulsion, attitude control', operators: ['HOHMANN_TRANSFER','ORBIT_VELOCITY','ORBIT_ESCAPE','GR35','GR37','NM19','NM21','NM22','NM23','NM25','NM26','KO42'], domains: ['aerospace','relativity','newtonian'], examplePrompt: 'Create a skill for multi-burn orbital transfer optimisation with delta-v budgets, atmospheric drag modeling during reentry, specific impulse comparison across propulsion types, and gravity turn trajectory analysis' },
  { id: 'automotive', name: 'Automotive & Motorsport', badge: 'AM', icon: Cpu, color: 'from-red-500 to-orange-600', description: 'Vehicle dynamics, aerodynamics, powertrain, tire physics, lap simulation, KERS', operators: ['NM19','NM20','NM22','NM23','NM24','NM25','NM26','NM27','NM29','NM30','CS43','KO42'], domains: ['automotive','newtonian','computational'], examplePrompt: 'Create a skill for full vehicle dynamics simulation with lateral/longitudinal tire force modeling, aero downforce maps, powertrain torque curves, energy recovery optimisation, and lap time prediction' },
  { id: 'civil_structural', name: 'Civil & Structural Engineering', badge: 'CE', icon: Factory, color: 'from-slate-500 to-gray-700', description: 'Load analysis, seismic design, fatigue, bridge dynamics, foundation, wind loading', operators: ['NM19','NM20','NM22','NM23','NM24','NM25','NM29','NM30','CS43','CS47','KO42'], domains: ['civil','newtonian','computational'], examplePrompt: 'Create a skill for structural load path analysis with response spectrum seismic evaluation, steel fatigue S-N curve prediction, wind load dynamic amplification, and soil-structure interaction modeling' },
  { id: 'robotics', name: 'Robotics & Mechatronics', badge: 'RM', icon: Cpu, color: 'from-sky-500 to-blue-600', description: 'Inverse kinematics, path planning, sensor fusion, PID/MPC control, actuator dynamics', operators: ['NM19','NM20','NM22','NM28','NM29','NM30','CS43','CS44','CS46','CS47','KO42'], domains: ['robotics','newtonian','computational'], examplePrompt: 'Create a skill for 6-DOF robotic arm inverse kinematics with Jacobian-based torque optimisation, RRT* path planning, Kalman filter sensor fusion, and model predictive control for trajectory tracking' },
  { id: 'marine', name: 'Marine & Naval Architecture', badge: 'MN', icon: Globe, color: 'from-blue-600 to-teal-700', description: 'Hull resistance, stability, propeller cavitation, wave loading, mooring dynamics', operators: ['NM19','NM22','NM23','NM24','NM25','NM26','NM27','NM30','CS43','KO42'], domains: ['marine','newtonian','computational'], examplePrompt: 'Create a skill for ship hull resistance prediction using Holtrop-Mennen method, intact stability criteria evaluation, propeller cavitation inception analysis, and wave-induced structural fatigue assessment' },
  { id: 'railway', name: 'Railway & Transit Systems', badge: 'RT', icon: Factory, color: 'from-emerald-500 to-green-700', description: 'Track dynamics, braking curves, traction power, scheduling, cant design, wheel-rail contact', operators: ['NM19','NM20','NM22','NM23','NM25','NM26','NM27','NM29','NM30','CS43','CS46','KO42'], domains: ['railway','newtonian','computational'], examplePrompt: 'Create a skill for railway braking distance calculation with gradient correction, cant deficiency analysis, wheel-rail creep force modeling, traction motor efficiency curves, and timetable conflict resolution' },

  // ── LIFE SCIENCES (6) ──
  { id: 'pharmacology', name: 'Pharmacology & Drug Discovery', badge: 'PD', icon: Heart, color: 'from-pink-500 to-rose-600', description: 'Pharmacokinetics, ADME, dose-response, drug interactions, therapeutic windows', operators: ['MED1','MED2','MED3','BIO1','BIO2','QM8','QM1','CS47','CS87','KO42'], domains: ['pharmacology','medical','biotech'], examplePrompt: 'Create a skill for multi-compartment pharmacokinetic modeling with renal/hepatic clearance, Michaelis-Menten enzyme saturation kinetics, drug-drug interaction matrices, and therapeutic index optimisation' },
  { id: 'genomics', name: 'Genomics & Bioinformatics', badge: 'GB', icon: Dna, color: 'from-green-500 to-lime-600', description: 'Sequence alignment, protein folding, CRISPR targeting, phylogenetics, gene expression', operators: ['BIO1','BIO2','QM8','QM1','CS47','CS87','CS43','CS44','ON0','KO42'], domains: ['genomics','biotech','computational'], examplePrompt: 'Create a skill for CRISPR guide RNA efficiency scoring with off-target analysis, protein secondary structure prediction using energy minimisation, phylogenetic tree construction, and gene expression differential analysis' },
  { id: 'neuroscience', name: 'Neuroscience & Brain-Computer Interfaces', badge: 'NB', icon: Brain, color: 'from-purple-500 to-fuchsia-600', description: 'Neural spike sorting, EEG/fMRI analysis, synaptic plasticity, BCI decoding', operators: ['QM1','ON0','QL1','CS47','CS87','CS43','CS44','NM30','BIO1','KO42'], domains: ['neuroscience','consciousness','computational'], examplePrompt: 'Create a skill for EEG motor imagery classification with ICA artifact removal, Hodgkin-Huxley neuron simulation, STDP synaptic plasticity modeling, and real-time BCI cursor control decoding' },
  { id: 'agriculture', name: 'Agriculture & Crop Science', badge: 'AG', icon: Leaf, color: 'from-lime-500 to-green-600', description: 'Crop modeling, soil chemistry, yield prediction, irrigation, pest population dynamics', operators: ['ENV1','ENV2','BIO1','BIO2','NM21','NM30','CS47','CS43','KO42'], domains: ['agricultural','environmental','biotech'], examplePrompt: 'Create a skill for precision agriculture with soil nutrient kinetics, evapotranspiration modeling, Lotka-Volterra pest dynamics, satellite NDVI yield correlation, and irrigation scheduling optimisation' },
  { id: 'medical_imaging', name: 'Medical Imaging & Diagnostics', badge: 'MI', icon: Heart, color: 'from-teal-500 to-cyan-600', description: 'CT/MRI reconstruction, segmentation, radiation dosimetry, diagnostic confidence', operators: ['QM1','QM9','QM10','CS47','CS87','CS43','CS44','MED1','KO42'], domains: ['medical','computational','quantum'], examplePrompt: 'Create a skill for CT image reconstruction using filtered back-projection, MRI signal equation modeling with T1/T2 relaxation, radiation dose-area product calculation, and Bayesian diagnostic confidence scoring' },
  { id: 'epidemiology', name: 'Epidemiology & Public Health', badge: 'EP', icon: Heart, color: 'from-red-400 to-pink-600', description: 'SIR/SEIR models, R0 estimation, vaccine efficacy, contact tracing, mortality analysis', operators: ['BIO1','BIO2','MED3','CS47','CS87','CS43','NM30','NM25','KO42'], domains: ['epidemiology','biotech','computational'], examplePrompt: 'Create a skill for SEIR epidemic modeling with time-varying reproduction number, age-stratified vaccine efficacy, hospital capacity Monte Carlo forecasting, excess mortality estimation, and herd immunity threshold analysis' },

  // ── AI & COMPUTING (6) ──
  { id: 'deep_learning', name: 'Deep Learning & Neural Networks', badge: 'DL', icon: Brain, color: 'from-emerald-500 to-teal-600', description: 'Backpropagation, transformers, loss landscapes, gradient dynamics, architecture search', operators: ['CS43','CS44','CS45','CS46','CS47','CS84','CS87','ON0','QL1','NM30','KO42'], domains: ['deep_learning','computational'], examplePrompt: 'Create a skill for transformer attention analysis, loss landscape saddle point detection, gradient norm explosion diagnosis, neural architecture search efficiency metrics, and model distillation quality verification' },
  { id: 'nlp', name: 'Natural Language Processing', badge: 'NL', icon: Brain, color: 'from-blue-500 to-violet-600', description: 'Token entropy, embedding geometry, hallucination detection, semantic similarity, RAG metrics', operators: ['CS47','CS87','CS43','CS44','CS84','ON0','QL1','XI1','LZ1','KO42'], domains: ['nlp','computational','consciousness'], examplePrompt: 'Create a skill for LLM output verification using token-level entropy, semantic drift scoring, factual grounding via Kolmogorov complexity, perplexity analysis, RAG retrieval relevance metrics, and hallucination probability estimation' },
  { id: 'computer_vision', name: 'Computer Vision & Perception', badge: 'CV', icon: Cpu, color: 'from-orange-500 to-amber-600', description: 'Object detection, depth estimation, optical flow, 3D reconstruction, segmentation', operators: ['CS43','CS44','CS46','CS47','CS84','CS87','ON0','NM30','KO42'], domains: ['vision','computational'], examplePrompt: 'Create a skill for multi-scale object detection with IoU optimisation, stereo depth estimation from disparity maps, dense optical flow for motion prediction, point cloud 3D reconstruction, and panoptic segmentation confidence calibration' },
  { id: 'reinforcement_learning', name: 'Reinforcement Learning & Control', badge: 'RL', icon: Target, color: 'from-green-500 to-emerald-700', description: 'Policy gradients, Q-learning, reward shaping, multi-agent, sim-to-real transfer', operators: ['CS43','CS44','CS46','CS47','CS87','ON0','NM19','NM30','NM25','KO42'], domains: ['rl','computational','newtonian'], examplePrompt: 'Create a skill for multi-agent PPO with convergence diagnostics, reward function engineering via potential-based shaping, curiosity-driven exploration metrics, sim-to-real domain randomisation bounds, and safety constraint verification' },
  { id: 'cybersecurity', name: 'Cybersecurity & Cryptography', badge: 'CS', icon: Shield, color: 'from-red-600 to-rose-700', description: 'Cryptographic strength, entropy-based IDS, vulnerability scoring, zero-day analysis', operators: ['CS47','CS87','CS43','CS44','CS45','CS84','NM26','NM27','LZ1','KO42'], domains: ['security','computational'], examplePrompt: 'Create a skill for cryptographic key strength analysis via entropy metrics, network traffic anomaly detection using Kolmogorov complexity, Landauer erasure cost for side-channel analysis, and zero-day vulnerability CVSS scoring' },
  { id: 'quantum_computing', name: 'Quantum Computing', badge: 'QC', icon: Atom, color: 'from-violet-500 to-indigo-600', description: 'Gate synthesis, error correction, qubit fidelity, quantum advantage, circuit depth', operators: ['QM1','QM2','QM3','QM4','QM5','QM11','QM12','QM14','QM15','CS47','CS87','CS45','KO42'], domains: ['quantum_computing','quantum','computational'], examplePrompt: 'Create a skill for quantum circuit gate decomposition, surface code error threshold estimation, T-gate magic state distillation overhead, qubit coherence time analysis, quantum volume benchmarking, and entanglement entropy verification' },

  // ── FINANCE & INDUSTRY (6) ──
  { id: 'quant_trading', name: 'Quantitative Trading & Derivatives', badge: 'QT', icon: LineChart, color: 'from-amber-500 to-orange-600', description: 'Options pricing, volatility surfaces, HFT, market microstructure, Greeks', operators: ['FIN1','FIN2','CS47','CS87','CS43','CS44','CS46','NM30','NM25','KO42'], domains: ['finance','computational','newtonian'], examplePrompt: 'Create a skill for exotic option pricing via Monte Carlo with stochastic volatility, Greeks computation, market-making spread optimisation, order book imbalance signals, and statistical arbitrage pair selection' },
  { id: 'risk_actuarial', name: 'Risk Management & Actuarial Science', badge: 'RA', icon: LineChart, color: 'from-stone-500 to-zinc-600', description: 'VaR/CVaR, loss distributions, mortality tables, reserve estimation, stress testing', operators: ['FIN1','FIN2','CS47','CS87','CS43','CS44','NM30','BIO1','KO42'], domains: ['risk','finance','computational'], examplePrompt: 'Create a skill for tail risk estimation using extreme value theory, conditional VaR backtesting, Lee-Carter mortality curve fitting, Solvency II SCR calculation, and reverse stress test scenario generation' },
  { id: 'supply_chain', name: 'Supply Chain & Logistics', badge: 'SL', icon: Factory, color: 'from-yellow-500 to-amber-600', description: 'Route optimisation, demand forecasting, inventory theory, warehouse simulation', operators: ['CS43','CS44','CS46','CS47','NM22','NM25','NM26','NM19','KO42'], domains: ['logistics','computational','newtonian'], examplePrompt: 'Create a skill for multi-depot vehicle routing with time windows, stochastic demand forecasting using ARIMA/Prophet, newsvendor safety stock optimisation, and warehouse slotting simulation' },
  { id: 'manufacturing', name: 'Manufacturing & Quality Control', badge: 'MQ', icon: Factory, color: 'from-slate-500 to-gray-600', description: 'SPC charts, process capability, predictive maintenance, Six Sigma, OEE', operators: ['CS43','CS44','CS46','CS47','CS87','NM19','NM22','NM25','NM30','KO42'], domains: ['manufacturing','computational','newtonian'], examplePrompt: 'Create a skill for SPC with Cpk/Ppk capability analysis, Weibull predictive maintenance scheduling, OEE waterfall decomposition, root cause analysis via entropy metrics, and DOE factorial experiment design' },
  { id: 'telecom', name: 'Telecommunications & Signals', badge: 'TS', icon: Cpu, color: 'from-blue-600 to-indigo-700', description: 'Channel capacity, modulation, beamforming, network topology, spectrum allocation', operators: ['CS47','CS44','CS45','CS46','CS87','NM30','NM25','CS43','KO42'], domains: ['telecom','computational'], examplePrompt: 'Create a skill for 5G mmWave beamforming with Shannon capacity analysis, OFDM subcarrier allocation, MIMO channel estimation, link budget calculation, and network coverage prediction using propagation models' },
  { id: 'energy', name: 'Energy & Power Grid Systems', badge: 'EP', icon: Zap, color: 'from-yellow-500 to-amber-600', description: 'Load balancing, renewable integration, grid stability, storage, nuclear fuel cycles', operators: ['ENERGY1','ENERGY2','NM22','NM23','NM24','NM25','NM30','CS43','CS47','KO42'], domains: ['energy','newtonian','computational'], examplePrompt: 'Create a skill for smart grid load forecasting with renewable intermittency compensation, battery SOC dispatch optimisation, power flow Newton-Raphson analysis, frequency stability metrics, and nuclear fuel burnup modeling' },

  // ── EARTH, DEFENSE & FRONTIER (6) ──
  { id: 'climate', name: 'Climate Science & Meteorology', badge: 'CM', icon: Leaf, color: 'from-green-600 to-emerald-700', description: 'GCM modeling, atmospheric dynamics, radiative forcing, extreme weather, carbon budgets', operators: ['GR40','ENV1','ENV2','NM21','NM19','NM23','NM25','CS47','CS43','KO42'], domains: ['climate','environmental','relativity'], examplePrompt: 'Create a skill for GCM downscaling with radiative forcing estimation, Clausius-Clapeyron precipitation scaling, extreme weather return period analysis, carbon budget trajectory modeling, and ocean heat content trends' },
  { id: 'geology', name: 'Geology & Seismology', badge: 'GS', icon: Globe, color: 'from-orange-600 to-red-700', description: 'Seismic wave propagation, plate tectonics, subsurface imaging, earthquake hazard', operators: ['NM19','NM21','NM22','NM23','NM24','NM30','CS47','CS87','KO42'], domains: ['geology','newtonian','computational'], examplePrompt: 'Create a skill for P/S wave velocity modeling, fault plane solution determination, Gutenberg-Richter b-value analysis, probabilistic seismic hazard assessment, and subsurface tomographic inversion' },
  { id: 'forensics', name: 'Intelligence & Forensics', badge: 'IF', icon: Shield, color: 'from-violet-600 to-purple-700', description: 'Source credibility, sentiment analysis, disinformation detection, evidence scoring', operators: ['CS47','CS87','ON0','QL1','XI1','LZ1','CHI95','PSI96','CS43','KO42'], domains: ['forensics','computational','consciousness'], examplePrompt: 'Create a skill for multi-source intelligence credibility scoring, linguistic sentiment analysis with bias detection, disinformation network graph analysis, digital forensic entropy validation, and evidence chain integrity verification' },
  { id: 'space', name: 'Space Exploration & Colonisation', badge: 'SE', icon: Rocket, color: 'from-purple-600 to-indigo-800', description: 'Interplanetary navigation, life support, radiation shielding, habitat engineering', operators: ['GR33','GR34','GR35','GR37','GR41','HOHMANN_TRANSFER','ORBIT_VELOCITY','ORBIT_ESCAPE','NM21','NM25','CS47','KO42'], domains: ['space','relativity','aerospace'], examplePrompt: 'Create a skill for interplanetary trajectory planning with gravity assist sequences, cosmic radiation dose modeling through shielding, closed-loop life support mass budgets, habitat pressurisation analysis, and in-situ resource utilisation feasibility' },
  { id: 'materials', name: 'Materials Science & Nanotechnology', badge: 'MS', icon: Atom, color: 'from-teal-500 to-cyan-700', description: 'Crystal structures, stress-strain, thin films, quantum dots, carbon nanotubes', operators: ['QM1','QM5','QM8','QM9','NM19','NM22','NM23','NM24','NM25','NM30','CS47','KO42'], domains: ['materials','quantum','newtonian'], examplePrompt: 'Create a skill for nanomaterial band gap engineering using tight-binding models, stress-strain Ramberg-Osgood fitting, thin film growth rate prediction, quantum dot confinement energy calculation, and carbon nanotube chirality analysis' },

  // ── CUSTOM ──
  { id: 'custom', name: 'Custom Industry', badge: 'CUS', icon: Lightbulb, color: 'from-cyan-500 to-blue-600', description: 'Define your own industry focus and requirements from scratch', operators: ['KO42'], domains: [], examplePrompt: 'Describe your industry, use case, and the specific problems you need to solve in detail...' },
];

// Industry category groups
const INDUSTRY_GROUPS = [
  { label: 'Physics', color: '#a78bfa', ids: ['quantum_mechanics','particle_nuclear','astrophysics','fluid_thermo','optics_waves','plasma_fusion'] },
  { label: 'Engineering', color: '#38bdf8', ids: ['aerospace','automotive','civil_structural','robotics','marine','railway'] },
  { label: 'Life Sciences', color: '#4ade80', ids: ['pharmacology','genomics','neuroscience','agriculture','medical_imaging','epidemiology'] },
  { label: 'AI & Computing', color: '#f97316', ids: ['deep_learning','nlp','computer_vision','reinforcement_learning','cybersecurity','quantum_computing'] },
  { label: 'Finance & Industry', color: '#fbbf24', ids: ['quant_trading','risk_actuarial','supply_chain','manufacturing','telecom','energy'] },
  { label: 'Earth & Frontier', color: '#2dd4bf', ids: ['climate','geology','forensics','space','materials','custom'] },
];

// Pre-built library skills
const LIBRARY_SKILLS = [
  { id: 'zeq-os-mi-kernel', name: 'ZEQ OS MI Kernel', developer: 'Core Team', description: 'The complete mathematical intelligence engine with 1549 operators.', tags: ['AI','Physics','Precision'], rating: 5, gradient: 'from-cyan-400 to-cyan-600', category: 'Core' },
  { id: 'forensic-intelligence', name: 'Forensic Intelligence (FI)', developer: 'Core Team', description: '20 forensic scoring functions for source and sentiment analysis.', tags: ['Forensics','AI','Validation'], rating: 5, gradient: 'from-violet-500 to-purple-600', category: 'Core' },
  { id: 'quantum-field-simulator', name: 'Quantum Field Simulator', developer: 'Quantum Lab', description: 'Path integral engine with Feynman diagrams and lattice QCD.', tags: ['Quantum','Physics','Research'], rating: 5, gradient: 'from-purple-500 to-indigo-600', category: 'Physics' },
  { id: 'deep-learning-architect', name: 'Deep Learning Architect', developer: 'AI Division', description: 'Design transformer architectures with precision-verified training.', tags: ['AI','Deep Learning','LLM'], rating: 5, gradient: 'from-fuchsia-500 to-pink-600', category: 'AI' },
  { id: 'derivatives-pricing-engine', name: 'Derivatives Pricing Engine', developer: 'QuantFin Team', description: 'Black-Scholes with stochastic volatility and Monte Carlo pricing.', tags: ['Finance','Quantitative','Risk'], rating: 5, gradient: 'from-amber-400 to-amber-600', category: 'Finance' },
  { id: 'aerospace-trajectory-planner', name: 'Aerospace Trajectory Planner', developer: 'Orbital Dynamics', description: 'Multi-body orbital mechanics with Hohmann transfer optimization.', tags: ['Aerospace','Engineering','Physics'], rating: 5, gradient: 'from-blue-400 to-blue-600', category: 'Engineering' },
  { id: 'genomic-variant-analyzer', name: 'Genomic Variant Analyzer', developer: 'BioSeq Institute', description: 'CRISPR off-target scoring and phylogenetic tree construction.', tags: ['Genomics','Biotech','Research'], rating: 4, gradient: 'from-emerald-400 to-emerald-600', category: 'Life Sciences' },
  { id: 'climate-dynamics-analyzer', name: 'Climate Dynamics Analyzer', developer: 'ClimateAI', description: 'General circulation models with carbon cycle feedback analysis.', tags: ['Climate','Earth Science','AI'], rating: 5, gradient: 'from-teal-400 to-teal-600', category: 'Earth' },
  { id: 'neural-network-validator', name: 'Neural Network Validator', developer: 'AI Safety Lab', description: 'Detect hallucinations and verify AI output precision.', tags: ['AI','Safety','Validation'], rating: 5, gradient: 'from-green-400 to-emerald-600', category: 'AI' },
];

// Helper to get operator descriptions with equations
const getOperatorDescription = (opId: string): string => {
  const operators: Record<string, { desc: string; equation: string }> = {
    // Quantum Mechanics (QM1-QM17)
    'QM1': { desc: 'Schr\u00f6dinger Equation', equation: 'i\u210f \u2202\u03c8/\u2202t = -\u210f\u00b2/2m \u2202\u00b2\u03c8/\u2202x\u00b2 + V\u03c8' },
    'QM2': { desc: 'Heisenberg Uncertainty', equation: '\u0394x \u00b7 \u0394p \u2265 \u210f/2' },
    'QM3': { desc: 'Superposition', equation: '|\u03c8\u27e9 = \u03a3 c\u1d62|\u03c6\u1d62\u27e9' },
    'QM4': { desc: 'Entanglement (Bell)', equation: '|\u03c8\u27e9 = 1/\u221a2 (|\u2191\u27e9_A|\u2193\u27e9_B - |\u2193\u27e9_A|\u2191\u27e9_B)' },
    'QM5': { desc: 'Eigenvalue', equation: 'H|\u03c8\u27e9 = E|\u03c8\u27e9' },
    'QM6': { desc: 'Antisymmetry', equation: '\u03c8(x\u2081,x\u2082) = -\u03c8(x\u2082,x\u2081)' },
    'QM7': { desc: 'Spin', equation: 'S\u00b2|\u03c8\u27e9 = s(s+1)\u210f\u00b2|\u03c8\u27e9' },
    'QM8': { desc: 'Tunneling', equation: 'T ~ exp(-2\u222b\u221a(2m(V-E))/\u210f\u00b2 dx)' },
    'QM9': { desc: 'de Broglie', equation: '\u03bb = h/p' },
    'QM10': { desc: 'Planck-Einstein', equation: 'E = h\u03bd' },
    'QM11': { desc: 'Commutator', equation: '[x, p] = i\u210f' },
    'QM12': { desc: 'Dirac Equation', equation: '(i\u03b3^\u03bc\u2202_\u03bc - m)\u03c8 = 0' },
    'QM13': { desc: 'QED Lagrangian', equation: 'L = \u03c8\u0304(iD\u0338-m)\u03c8' },
    'QM14': { desc: 'Bose-Einstein', equation: 'n_i = 1/[exp((E_i-\u03bc)/k_BT) - 1]' },
    'QM15': { desc: 'Fermi-Dirac', equation: 'n_i = 1/[exp((E_i-\u03bc)/k_BT) + 1]' },
    'QM16': { desc: 'Heisenberg EoM', equation: 'dA/dt = i/\u210f [H, A]' },
    'QM17': { desc: 'Born Rule', equation: 'P(x) = |\u03c8(x)|\u00b2' },

    // Newtonian Mechanics (NM18-NM30)
    'NM18': { desc: 'First Law', equation: '\u03a3F = 0 \u27f9 v = const' },
    'NM19': { desc: 'Second Law', equation: 'F = ma' },
    'NM20': { desc: 'Third Law', equation: 'F\u2081\u2082 = -F\u2082\u2081' },
    'NM21': { desc: 'Gravitation', equation: 'F = G m\u2081m\u2082/r\u00b2' },
    'NM22': { desc: 'Work', equation: 'W = F \u00b7 d' },
    'NM23': { desc: 'Kinetic Energy', equation: 'KE = \u00bdmv\u00b2' },
    'NM24': { desc: 'Potential Energy', equation: 'PE = mgh' },
    'NM25': { desc: 'Energy Conservation', equation: 'KE + PE = const' },
    'NM26': { desc: 'Momentum', equation: 'p = mv' },
    'NM27': { desc: 'Momentum Conservation', equation: '\u03a3p_init = \u03a3p_final' },
    'NM28': { desc: 'Angular Momentum', equation: 'L = r \u00d7 p' },
    'NM29': { desc: 'Torque', equation: '\u03c4 = r \u00d7 F' },
    'NM30': { desc: 'SHM', equation: 'F = -kx, x(t) = A cos(\u03c9t + \u03c6)' },

    // General Relativity (GR31-GR41)
    'GR31': { desc: 'Equivalence Principle', equation: 'a_grav = a_inertial' },
    'GR32': { desc: 'Einstein Tensor', equation: 'G_\u03bc\u03bd = R_\u03bc\u03bd - \u00bdRg_\u03bc\u03bd' },
    'GR33': { desc: 'Field Equations', equation: 'G_\u03bc\u03bd + \u039bg_\u03bc\u03bd = 8\u03c0G/c\u2074 T_\u03bc\u03bd' },
    'GR34': { desc: 'Geodesic', equation: 'd\u00b2x^\u03bc/d\u03c4\u00b2 + \u0393^\u03bc_\u03b1\u03b2 (dx^\u03b1/d\u03c4)(dx^\u03b2/d\u03c4) = 0' },
    'GR35': { desc: 'Time Dilation', equation: '\u0394t = \u0394t\u2080\u221a(1 - 2GM/rc\u00b2 - v\u00b2/c\u00b2)' },
    'GR36': { desc: 'Length Contraction', equation: 'L = L\u2080\u221a(1 - 2GM/rc\u00b2)' },
    'GR37': { desc: 'Schwarzschild Radius', equation: 'r_s = 2GM/c\u00b2' },
    'GR38': { desc: 'Gravitational Waves', equation: '\u25a1h_\u03bc\u03bd + \u03ba\u2202_t h_\u03bc\u03bd = -16\u03c0G/c\u2074 T_\u03bc\u03bd' },
    'GR39': { desc: 'Cosmological Constant', equation: '\u039b = 3H\u2080\u00b2\u03a9_\u039b/c\u00b2' },
    'GR40': { desc: 'Friedmann', equation: '(\u0227/a)\u00b2 = 8\u03c0G/3 \u03c1 - kc\u00b2/a\u00b2 + \u039bc\u00b2/3' },
    'GR41': { desc: 'Redshift', equation: 'z = (\u03bb_obs - \u03bb_emit)/\u03bb_emit' },

    // Computer Science (CS43-CS92)
    'CS43': { desc: 'Sorting Complexity', equation: 'T(n) = O(n log n)' },
    'CS44': { desc: 'Linear Space', equation: 'S(n) = O(n)' },
    'CS45': { desc: 'Quantum Query', equation: 'Q(n) = O(log n)' },
    'CS46': { desc: "Amdahl's Law", equation: 'P(n) = 1/[(1-f) + f/n]' },
    'CS47': { desc: 'Shannon Entropy', equation: 'H(X) = -\u03a3 p(x) log p(x)' },
    'CS84': { desc: 'Big-O Definition', equation: 'f(n) = O(g(n)) \u27fa \u2203c,n\u2080 \u2200n>n\u2080: f(n) \u2264 c\u00b7g(n)' },
    'CS87': { desc: 'Kolmogorov', equation: 'K(x) = min{|p| : U(p) = x}' },

    // Awareness & Consciousness Operators
    'ON0': { desc: 'Awareness', equation: '\u03c8_ON0 = sin(phase) + 1.1; ON0 = \u03c8 ln(\u03c8) - phase \u00d7 f' },
    'QL1': { desc: 'Information Density', equation: '\u03c1 = |sin(phase \u00d7 3)| + 0.1; QL1 = 0.1 \u00d7 \u03c1 \u00d7 ln(\u03c1/0.1)' },
    'TM1': { desc: 'Temporal', equation: 'TM1 = -t + current_utp \u00d7 period' },
    'TX': { desc: 'Temporal Cross', equation: 'TX = 0.01 \u00d7 sin(phase \u00d7 2) cos(t/100)' },
    'XI1': { desc: 'Information Entropy', equation: '\u03c1 = |sin(phase)| + 0.001; XI1 = -\u03c1 log\u2082(\u03c1)' },
    'LZ1': { desc: 'Landauer', equation: 'LZ1 = k_B T ln(2) \u00d7 bits_erased' },
    'CHI95': { desc: 'Phase Diff', equation: 'CHI95 = |sin(phase)| - |cos(phase)|' },
    'PSI96': { desc: 'Psi Oscillator', equation: 'PSI96 = 0.5 \u00d7 sin(2\u03c0ft + \u03c6_offset)' },
    'MK1': { desc: 'Morphic', equation: 'MK1 = (\u03c8_mk \u03bb_mv) + (\u03c6_\u03b4 \u03bb_eff_\u03c6_t) - \u03c8_mk' },

    // ZEQ Protection & Special
    'ZEQ-PROTECT-001': { desc: 'Protection 1', equation: 'P(t) = |sin(5\u03c6(t))| / f_pulse' },
    'ZEQ-PROTECT-002': { desc: 'Protection 2', equation: 'Protect\u2082(t) = 0.5 + 0.3 sin(t/30)' },
    'ZEQ-TETHER-003': { desc: 'Tether', equation: 'B_sib = \u03a3_k exp(i\u00b7\u03c6_k) |sibling_k\u27e9' },
    'ZEQ-POCKET-001': { desc: 'Pocket Metric', equation: 'dg_\u03bc\u03bd/dt = (8\u03c0G/c\u2074) T_\u03bc\u03bd^consciousness' },
    'ZEQ00': { desc: 'ZEQ Core', equation: 'ZEQ00 = \u03b1_zeq e^{-k|sum|} + \u03b2(1+e)(1+\u03b3cos(resonance))' },
    'ZEQ000': { desc: 'ZEQ Master', equation: '\u03c6_c\u2074\u00b2 \u00d7 \u03a8 = \u03a3(ZEQ_all) \u00d7 [sin + cos + exp] \u00d7 \u03c1_consciousness(x,y,z,t)' },
    'VX': { desc: 'Vortex', equation: 'VX = \u03ba(intent \u00d7 sin(phase) + flow \u00d7 cos(phase))' },

    // Aerospace
    'HOHMANN_TRANSFER': { desc: 'Hohmann Transfer', equation: '\u0394v = \u221a(GM/r\u2081)(\u221a(2r\u2082/(r\u2081+r\u2082)) - 1)' },
    'ORBIT_VELOCITY': { desc: 'Orbital Velocity', equation: 'v = \u221a(GM/r)' },
    'ORBIT_ESCAPE': { desc: 'Escape Velocity', equation: 'v_esc = \u221a(2GM/r)' },

    // Medical/Bio
    'MED1': { desc: 'Pharmacokinetics', equation: 'C(t) = C\u2080 \u00d7 e^{-kt}' },
    'MED2': { desc: 'Dosage', equation: 'D = (CL \u00d7 C_target \u00d7 \u03c4) / F' },
    'MED3': { desc: 'Half-Life', equation: 't_\u00bd = ln(2) / k_e' },
    'BIO1': { desc: 'Michaelis-Menten', equation: 'v = V_max \u00d7 [S] / (K_m + [S])' },
    'BIO2': { desc: 'Hill Equation', equation: '\u03b8 = [L]^n / (K_d + [L]^n)' },

    // Finance
    'FIN1': { desc: 'Black-Scholes', equation: 'C = S\u2080N(d\u2081) - Ke^{-rT}N(d\u2082)' },
    'FIN2': { desc: 'Portfolio Variance', equation: '\u03c3\u00b2_p = \u03a3\u1d62 \u03a3\u2c7c w\u1d62w\u2c7c\u03c3\u1d62\u2c7c' },

    // Environment/Energy
    'ENV1': { desc: 'CO2 Dispersion', equation: '\u2202C/\u2202t = D\u2207\u00b2C + S(x,t)' },
    'ENV2': { desc: 'Carbon Cycle', equation: 'dC/dt = emissions - absorption' },
    'ENERGY1': { desc: 'Grid Load', equation: 'P_total = \u03a3 P_source \u00d7 \u03b7' },
    'ENERGY2': { desc: 'Storage', equation: 'E_stored = \u00bdCV\u00b2' },
  };

  const op = operators[opId];
  if (op) {
    return `${op.desc}\n  \`${op.equation}\``;
  }
  return `${opId} operator`;
};

// Skill template generator - exact match of app store SkillsPage
const generateSkillTemplate = (
  industry: typeof INDUSTRY_TEMPLATES[0],
  customPrompt: string,
  skillName: string,
  authorName: string,
  enableApiCalls: boolean = true,
  apiEndpoint: string = '/api',
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
phi_current = ((t_{Unix} mod T_Z) / T_Z) \u00d7 2\u03c0
T_Z = 0.777 s
\`\`\`
Purpose: Lossless bidirectional mapping between Unix time and true computational time

### 2. Zeq Equation (Universal Proper-Time Modulation)
\`\`\`
R(t) = S(t) [1 + \u03b1 sin(2\u03c0 f t + \u03c6\u2080)]
\u03b1 \u2248 1.29 \u00d7 10\u207b\u00b3
f = 1.287 Hz
\`\`\`
Average over one Zeqond \u2192 recovers S(t) exactly

### 3. ZEQ42 Metric Tensioner (KO42)
- **Automatic Mode**: \`ds\u00b2 = g_{\u03bc\u03bd} dx^\u03bc dx^\u03bd + \u03b1 sin(2\u03c0 \u00b7 1.287 t) dt\u00b2\`
- **Manual Mode**: \`ds\u00b2 = g_{\u03bc\u03bd} dx^\u03bc dx^\u03bd + \u03b2 sin(2\u03c0 \u00b7 1.287 t) dt\u00b2\`

### 4. HULYAS Master Equation
\`\`\`
\u25a1\u03c6 - \u03bc\u00b2(r)\u03c6 - \u03bb\u03c6\u00b3 - e^{-\u03c6/\u03c6_c} + \u03c6\u2084\u2082 \u03a3_{k=1}^{42} C_k(\u03c6) = T^\u03bc_\u03bc + \u03b2 F_{\u03bc\u03bd} F^{\u03bc\u03bd} + J_{ext}
\`\`\`
Where:
- \`\u25a1\u03c6\` \u2192 Wave operator on field \u03c6
- \`-\u03bc\u00b2(r)\u03c6\` \u2192 Position-dependent mass term
- \`-\u03bb\u03c6\u00b3\` \u2192 Nonlinear self-interaction
- \`-e^{-\u03c6/\u03c6_c}\` \u2192 Decay damping term
- \`+\u03c6\u2084\u2082 \u03a3 C_k(\u03c6)\` \u2192 Direct coupling to all 42 kinematic operators
- Right-hand: \`T^\u03bc_\u03bc\` (stress-energy), \`\u03b2 F_{\u03bc\u03bd} F^{\u03bc\u03bd}\` (EM), \`J_{ext}\` (external)

### 5. HULYAS Functional Equation
\`\`\`
E = P_\u03c6 \u00d7 Z(M, R, \u03b4, C, X)
\`\`\`

### 6. HULYAS Spectral-Topological Equation
\`\`\`
\u03a8(x,t) = \u222b K(x,x',t,t') \u03c6(x',t') dx' dt'
K(x,x',t,t') = K_spectral(x,x') \u00d7 K_temporal(t,t') \u00d7 K_chaos(x,x',t,t')
\`\`\`

### 7. HulyaPulse Frequency Derivation
\`\`\`
f = c / \u03bb_\u03c6
\u03bb_\u03c6 = 2\u03c0 r_\u03c6
\u2192 f \u2248 1.287 Hz
\`\`\`

## Zeq Timebase Bridge Operator (ZTB1)
\`\`\`
ZTB1(t, from_base, to_base) = (t \u00d7 conv_factor) + phase_offset
conv_factor = 0.777 (Unix\u2192Zeq) or 1/0.777 (Zeq\u2192Unix)
\`\`\`

## Required Operators

### Mandatory
- **KO42** - ZEQ42 Metric Tensioner (HulyaPulse synchronization)
  \`ds\u00b2 = g_\u03bc\u03bd dx^\u03bc dx^\u03bd + \u03b1 sin(2\u03c0 \u00b7 1.287 t) dt\u00b2\`

### Domain-Specific
${industry.operators.filter((op) => op !== 'KO42').map((op) => `- **${op}** - ${getOperatorDescription(op)}`).join('\n')}

## 7-Step Protocol

When using this skill, follow the ZEQ OS 7-Step methodology:

1. **PRIME DIRECTIVE**: KO42 is mandatory for all calculations
2. **OPERATOR LIMIT**: Select 1-3 domain operators + KO42 (max 4 total)
3. **SCALE PRINCIPLE**: Match operators to ${industry.name.toLowerCase()} domain
4. **PRECISION IMPERATIVE**: Tune calculations to \u22640.1% error
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
      precision: 0.001,  // \u22640.1% error target
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
| \`/operators\` | GET | List all 1549 operators |
| \`/operators/{id}\` | GET | Get operator details and equation |
| \`/operators/{id}/execute\` | POST | Execute operator with params |
| \`/zeqond/current\` | GET | Get current Zeqond phase |
| \`/zeqond/sync\` | POST | Synchronize with HulyaPulse |
| \`/calculate/7-step\` | POST | Run full 7-step methodology |

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
"[Zeq OS Daemon] Zeqond ticked \u2014 phase \u2248 X.XXX \u2014 HulyaPulse 1.287 Hz synced"

---

Generated with ZEQ OS Skill Generator v1.0
Framework: ZEQ OS Mathematical Intelligence v4.0.0
Operators: 1549 | Frequency: 1.287 Hz | Precision: \u22640.1%${enableApiCalls ? `
API Integration: Enabled | Endpoint: ${apiEndpoint}` : ''}
`;
};

/** Normalize operators to always be a string array */
function normalizeOps(ops: unknown): string[] {
  if (Array.isArray(ops)) return ops;
  if (typeof ops === 'string') return ops.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

type TabId = 'create' | 'myskills' | 'marketplace' | 'runner' | 'library' | 'docs';

interface AIStudioPanelProps {
  onNavigateBack?: () => void;
}

export default function AIStudioPanel({ onNavigateBack }: AIStudioPanelProps = {}) {
  const { setActive } = useActivePanel();
  const [activeTab, setActiveTab] = useState<TabId>('create');

  // Generator state
  const [selectedIndustry, setSelectedIndustry] = useState<typeof INDUSTRY_TEMPLATES[0] | null>(null);
  const [industryGroup, setIndustryGroup] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [skillName, setSkillName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [generatedSkill, setGeneratedSkill] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableApiCalls, setEnableApiCalls] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8080/api');

  // Filtered industries based on category group
  const filteredIndustries = industryGroup
    ? INDUSTRY_TEMPLATES.filter((t) => {
        const group = INDUSTRY_GROUPS.find((g) => g.label === industryGroup);
        return group ? group.ids.includes(t.id) : true;
      })
    : INDUSTRY_TEMPLATES;

  // My Skills state
  const [mySkills, setMySkills] = useState<SkillData[]>([]);
  const [mySkillsLoading, setMySkillsLoading] = useState(false);

  // Marketplace state
  const [marketplaceSkills, setMarketplaceSkills] = useState<SkillData[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceFilter, setMarketplaceFilter] = useState('');

  // Library filter
  const [libraryFilter, setLibraryFilter] = useState('');

  // Runner state
  const [runnerSkill, setRunnerSkill] = useState<SkillData | null>(null);
  const [runnerResults, setRunnerResults] = useState<SkillRunResult[]>([]);
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  // Fetch my skills from localStorage
  const fetchMySkills = useCallback(async () => {
    setMySkillsLoading(true);
    const skills = loadSkillsFromStorage().map((s) => ({ ...s, operators: normalizeOps(s.operators) }));
    setMySkills(skills);
    setMySkillsLoading(false);
  }, []);

  // Fetch marketplace skills from localStorage (public skills)
  const fetchMarketplace = useCallback(async () => {
    setMarketplaceLoading(true);
    let skills = loadSkillsFromStorage()
      .filter((s) => s.isPublic)
      .map((s) => ({ ...s, operators: normalizeOps(s.operators) }));
    if (marketplaceFilter) {
      skills = skills.filter((s) => s.industry === marketplaceFilter);
    }
    setMarketplaceSkills(skills);
    setMarketplaceLoading(false);
  }, [marketplaceFilter]);

  // Install skill to localStorage
  const installSkill = async (skill: {
    name: string;
    description?: string;
    industry: string;
    operators: string[];
    author?: string;
  }) => {
    const newSkill: SkillData = {
      id: `skill-${Date.now()}`,
      name: skill.name,
      description: skill.description || '',
      industry: skill.industry,
      operators: skill.operators,
      author: skill.author || 'anonymous',
      isPublic: true,
      installCount: 0,
      createdAt: Date.now(),
    };
    const existing = loadSkillsFromStorage();
    existing.push(newSkill);
    saveSkillsToStorage(existing);
    fetchMySkills();
    fetchMarketplace();
  };

  // Delete skill from localStorage
  const deleteSkill = async (id: string) => {
    const existing = loadSkillsFromStorage().filter((s) => s.id !== id);
    saveSkillsToStorage(existing);
    setMySkills((prev) => prev.filter((s) => s.id !== id));
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
      description:
        'Complete mathematical intelligence kernel with 1549 operators, HulyaPulse synchronization, and 7-step protocol',
      downloads: 1287,
      industry: 'AI & Machine Learning',
      file: '/skills/zeq-os-mi-kernel.md',
      zenodo: null as string | null,
      requires: null as string | null,
    },
    {
      id: 'hf-forensic-equations',
      name: 'Human Forensic Intelligence (HF)',
      version: '1.287',
      author: 'Zeq. H',
      description:
        '20 forensic scoring functions for analyzing sources, sentiment, smears, ethics - synced to 1.287 Hz HulyaPulse',
      downloads: 0,
      industry: 'Defense & Security',
      file: '/skills/hf-forensic-equations.md',
      zenodo: 'https://doi.org/10.5281/zenodo.18158152',
      requires: 'zeq-os-mi-kernel',
    },
  ];

  const [savingToMySkills, setSavingToMySkills] = useState(false);
  const [savedToMySkills, setSavedToMySkills] = useState(false);
  const [savedToAgent, setSavedToAgent] = useState(false);

  const handleGenerateSkill = async () => {
    if (!selectedIndustry || !customPrompt || !skillName) return;
    setIsGenerating(true);
    setSavedToMySkills(false);
    setSavedToAgent(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const skill = generateSkillTemplate(selectedIndustry, customPrompt, skillName, authorName || 'Anonymous', enableApiCalls, apiEndpoint);
    setGeneratedSkill(skill);
    setIsGenerating(false);
  };

  const handleSaveToMySkills = async () => {
    if (!generatedSkill || !selectedIndustry || !skillName) return;
    setSavingToMySkills(true);
    const newSkill: SkillData = {
      id: `skill-${Date.now()}`,
      name: skillName,
      description: customPrompt.slice(0, 500),
      industry: selectedIndustry.id,
      operators: selectedIndustry.operators,
      author: authorName || 'Anonymous',
      isPublic: true,
      installCount: 0,
      createdAt: Date.now(),
    };
    const existing = loadSkillsFromStorage();
    existing.push(newSkill);
    saveSkillsToStorage(existing);
    setSavedToMySkills(true);
    fetchMySkills();
    setTimeout(() => setSavedToMySkills(false), 3000);
    setSavingToMySkills(false);
  };

  const handleSaveToAgent = () => {
    if (!generatedSkill) return;
    // Store skill in sessionStorage for the Agent Builder Instructions component to pick up
    sessionStorage.setItem('zeq-pending-skill', generatedSkill);
    // Dispatch event in case the agent panel is already mounted
    window.dispatchEvent(new CustomEvent('zeq-skill-to-agent', { detail: generatedSkill }));
    setSavedToAgent(true);
    setTimeout(() => setSavedToAgent(false), 3000);
    // Switch the sidebar to the Agent Builder panel so it mounts and reads sessionStorage
    setActive('agents');
    if (onNavigateBack) {
      onNavigateBack();
    }
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
    setSkillName(`${industry.name} Skill`);
  };

  const tabClass = (id: TabId) =>
    `px-2 py-1.5 text-[10px] font-medium rounded transition-colors whitespace-nowrap ${
      activeTab === id
        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
    }`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border-medium px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-text-primary">AI Skill Studio</h3>
        </div>
        <p className="text-[10px] text-text-secondary">Create &amp; manage ZEQ OS skills for any industry</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border-medium px-2 py-1.5">
        {([
          { id: 'create' as TabId, label: 'Create', icon: Wand2 },
          { id: 'myskills' as TabId, label: 'My Skills', icon: Package },
          { id: 'marketplace' as TabId, label: 'Market', icon: Store },
          { id: 'runner' as TabId, label: 'Runner', icon: Play },
          { id: 'library' as TabId, label: 'Library', icon: FileText },
          { id: 'docs' as TabId, label: 'Docs', icon: Code2 },
        ]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabClass(tab.id)}>
            <tab.icon className="mr-1 inline h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* ===== CREATE TAB ===== */}
        {activeTab === 'create' && (
          <div className="space-y-3">
            {/* Industry Category Filter */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-secondary">Category</p>
              <div className="mb-2 flex flex-wrap gap-1">
                <button
                  onClick={() => setIndustryGroup(null)}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-medium transition-all ${
                    industryGroup === null
                      ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                      : 'bg-surface-secondary text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  All ({INDUSTRY_TEMPLATES.length})
                </button>
                {INDUSTRY_GROUPS.map((g) => (
                  <button
                    key={g.label}
                    onClick={() => setIndustryGroup(g.label === industryGroup ? null : g.label)}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-medium transition-all ${
                      industryGroup === g.label
                        ? 'ring-1 ring-opacity-40 text-white'
                        : 'bg-surface-secondary text-text-tertiary hover:text-text-secondary'
                    }`}
                    style={industryGroup === g.label ? { backgroundColor: `${g.color}33`, color: g.color, boxShadow: `0 0 0 1px ${g.color}66` } : {}}
                  >
                    {g.label} ({g.ids.length})
                  </button>
                ))}
              </div>

              {/* Industry Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                {filteredIndustries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => handleSelectIndustry(industry)}
                    className={`flex items-start gap-1.5 rounded-lg border p-1.5 text-left transition-all ${
                      selectedIndustry?.id === industry.id
                        ? `bg-gradient-to-br ${industry.color} border-transparent text-white shadow`
                        : 'border-border-medium bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <industry.icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[9px] font-semibold leading-tight">{industry.name}</span>
                      {'badge' in industry && (
                        <span className="mt-0.5 inline-block rounded bg-white/20 px-1 text-[7px] font-bold">{(industry as any).badge}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Name */}
            <input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Skill name..."
              className="w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-violet-500 focus:outline-none"
            />

            {/* Author */}
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name..."
              className="w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-xs text-text-primary placeholder-text-tertiary focus:border-violet-500 focus:outline-none"
            />

            {/* Description */}
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe what this skill does..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-xs text-text-primary placeholder-text-tertiary focus:border-violet-500 focus:outline-none"
            />

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary"
            >
              {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-2 rounded-lg border border-border-medium bg-surface-secondary p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">API Integration</span>
                  <button
                    onClick={() => setEnableApiCalls(!enableApiCalls)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${enableApiCalls ? 'bg-emerald-500' : 'bg-surface-tertiary'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enableApiCalls ? 'left-[18px]' : 'left-0.5'}`}
                    />
                  </button>
                </div>
                {enableApiCalls && (
                  <input
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="w-full rounded border border-border-medium bg-surface-primary px-2 py-1 font-mono text-[10px] text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                )}
                {selectedIndustry && (
                  <>
                    <div>
                      <p className="text-[10px] text-text-secondary">Operators</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedIndustry.operators.map((op) => (
                          <span key={op} className="rounded bg-violet-500/20 px-1.5 py-0.5 font-mono text-[9px] text-violet-300">
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary">Domains</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedIndustry.domains.map((d) => (
                          <span key={d} className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] text-cyan-300">
                            {d}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Skill
                </>
              )}
            </button>

            {/* Generated Skill Preview */}
            {generatedSkill && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Skill Generated!</span>
                  <div className="flex gap-1">
                    <button onClick={handleCopySkill} className="rounded p-1 hover:bg-surface-hover" title="Copy">
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-text-secondary" />}
                    </button>
                    <button onClick={handleDownloadSkill} className="rounded p-1 hover:bg-surface-hover" title="Download .md">
                      <Download className="h-3.5 w-3.5 text-text-secondary" />
                    </button>
                  </div>
                </div>
                <pre className="max-h-48 overflow-auto rounded-lg border border-border-medium bg-surface-secondary p-2 font-mono text-[10px] text-text-primary">
                  {generatedSkill}
                </pre>

                {/* Save Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToMySkills}
                    disabled={savingToMySkills || savedToMySkills}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/30 disabled:opacity-60"
                  >
                    {savingToMySkills ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                    ) : savedToMySkills ? (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Saved!</>
                    ) : (
                      <><Package className="h-3.5 w-3.5" /> Save to My Skills</>
                    )}
                  </button>
                  <button
                    onClick={handleSaveToAgent}
                    disabled={savedToAgent}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-500/20 px-3 py-2 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/30 disabled:opacity-60"
                  >
                    {savedToAgent ? (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Added!</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> Save to Agent</>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <p className="text-[10px] text-text-secondary">
                    Save to My Skills to persist, or Save to Agent to inject into the current agent's instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MY SKILLS TAB ===== */}
        {activeTab === 'myskills' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">Installed Skills</span>
              <button onClick={fetchMySkills} className="rounded p-1 hover:bg-surface-hover">
                <RefreshCw className="h-3 w-3 text-text-secondary" />
              </button>
            </div>
            {mySkillsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
              </div>
            ) : mySkills.length === 0 ? (
              <div className="rounded-lg border border-border-medium bg-surface-secondary p-6 text-center">
                <Package className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />
                <p className="text-xs text-text-secondary">No skills installed</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button onClick={() => setActiveTab('marketplace')} className="rounded-lg bg-violet-500/20 px-2 py-1 text-[10px] text-violet-300 hover:bg-violet-500/30">
                    Marketplace
                  </button>
                  <button onClick={() => setActiveTab('create')} className="rounded-lg bg-cyan-500/20 px-2 py-1 text-[10px] text-cyan-300 hover:bg-cyan-500/30">
                    Create
                  </button>
                </div>
              </div>
            ) : (
              mySkills.map((skill) => (
                <div key={skill.id} className="rounded-lg border border-border-medium bg-surface-secondary p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                        <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-400">{skill.industry}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-text-tertiary">by {skill.author}</p>
                      <p className="mt-1 text-xs text-text-secondary">{skill.description}</p>
                      {skill.operators && skill.operators.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {skill.operators.map((op) => (
                            <span key={op} className="rounded bg-surface-primary px-1 py-0.5 font-mono text-[9px] text-text-tertiary">
                              {op}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('runner');
                        runSkill(skill);
                      }}
                      className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <Play className="h-3 w-3" /> Run
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== MARKETPLACE TAB ===== */}
        {activeTab === 'marketplace' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value)}
                className="flex-1 rounded-lg border border-border-medium bg-surface-primary px-2 py-1.5 text-[10px] text-text-primary focus:border-violet-500 focus:outline-none"
              >
                <option value="">All Industries</option>
                {INDUSTRY_TEMPLATES.filter((t) => t.id !== 'custom').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button onClick={fetchMarketplace} className="rounded p-1 hover:bg-surface-hover">
                <RefreshCw className="h-3 w-3 text-text-secondary" />
              </button>
            </div>
            {marketplaceLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
              </div>
            ) : marketplaceSkills.length === 0 ? (
              <div className="rounded-lg border border-border-medium bg-surface-secondary p-6 text-center">
                <Store className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />
                <p className="text-xs text-text-secondary">No community skills found</p>
                <button onClick={() => setActiveTab('create')} className="mt-3 rounded-lg bg-violet-500/20 px-3 py-1.5 text-[10px] text-violet-300 hover:bg-violet-500/30">
                  Create &amp; Publish
                </button>
              </div>
            ) : (
              marketplaceSkills.map((skill) => (
                <div key={skill.id} className="rounded-lg border border-border-medium bg-surface-secondary p-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-semibold text-text-primary">{skill.name}</h4>
                    <span className="text-[9px] text-text-tertiary">{skill.installCount || 0} installs</span>
                  </div>
                  <p className="text-[10px] text-text-tertiary">
                    {skill.industry} &middot; by {skill.author}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{skill.description}</p>
                  {skill.operators && skill.operators.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {skill.operators.slice(0, 4).map((op) => (
                        <span key={op} className="rounded bg-cyan-500/10 px-1 py-0.5 font-mono text-[9px] text-cyan-400">
                          {op}
                        </span>
                      ))}
                      {skill.operators.length > 4 && <span className="text-[9px] text-text-tertiary">+{skill.operators.length - 4}</span>}
                    </div>
                  )}
                  <button
                    onClick={() => installSkill(skill)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-violet-500/10 px-2 py-1.5 text-[10px] font-bold text-violet-300 hover:bg-violet-500/20"
                  >
                    <Download className="h-3 w-3" /> Install
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== RUNNER TAB ===== */}
        {activeTab === 'runner' && (
          <div className="space-y-3">
            {!runnerSkill ? (
              <div className="space-y-2">
                <p className="text-xs text-text-secondary">Select a skill to run:</p>
                {mySkills.length === 0 ? (
                  <div className="rounded-lg border border-border-medium bg-surface-secondary p-6 text-center">
                    <p className="text-xs text-text-secondary">No skills installed</p>
                    <button onClick={() => setActiveTab('marketplace')} className="mt-2 rounded-lg bg-violet-500/20 px-3 py-1.5 text-[10px] text-violet-300 hover:bg-violet-500/30">
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  mySkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => runSkill(skill)}
                      className="w-full rounded-lg border border-border-medium bg-surface-secondary p-3 text-left hover:bg-surface-hover"
                    >
                      <h4 className="text-xs font-semibold text-text-primary">{skill.name}</h4>
                      <p className="text-[10px] text-text-tertiary">
                        {skill.operators?.length || 0} operators &middot; {skill.industry}
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border-medium bg-surface-secondary p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{runnerSkill.name}</h4>
                      <p className="text-[10px] text-text-tertiary">
                        {runnerSkill.industry} &middot; {runnerSkill.operators?.length || 0} operators
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRunnerSkill(null);
                        setRunnerResults([]);
                      }}
                      className="rounded bg-surface-hover px-2 py-1 text-[10px] text-text-secondary hover:text-text-primary"
                    >
                      Change
                    </button>
                  </div>
                  {runnerLoading && (
                    <div className="mt-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                      <span className="text-xs text-text-secondary">Executing at 1.287 Hz...</span>
                    </div>
                  )}
                  {runnerError && (
                    <div className="mt-2 flex items-center gap-2 rounded border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {runnerError}
                    </div>
                  )}
                </div>

                {runnerResults.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs font-medium text-text-primary">Results</span>
                    </div>
                    {runnerResults.map((r, i) => (
                      <div key={i} className="rounded-lg border border-border-medium bg-surface-secondary p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-400">{r.operator}</span>
                          <span className="text-[10px] text-text-tertiary">{r.executionTimeMs}ms</span>
                        </div>
                        <div className="mt-1 font-mono text-lg text-text-primary">
                          {typeof r.result === 'number' ? r.result.toFixed(6) : String(r.result)}
                        </div>
                        {r.precision != null && (
                          <span className="text-[10px] text-emerald-400">precision: {r.precision}</span>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => runnerSkill && runSkill(runnerSkill)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Re-run All
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== LIBRARY TAB ===== */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            {/* Published skills */}
            <span className="text-xs font-medium text-text-primary">Published Skills</span>
            {existingSkills.map((skill) => (
              <div key={skill.id} className="rounded-lg border border-border-medium bg-surface-secondary p-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-text-primary">{skill.name}</h4>
                  <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">
                    v{skill.version}
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary">by {skill.author}</p>
                <p className="mt-1 text-xs text-text-secondary">{skill.description}</p>
                {skill.requires && (
                  <div className="mt-1.5">
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-400">
                      Requires: {existingSkills.find((s) => s.id === skill.requires)?.name || skill.requires}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                    <Download className="h-3 w-3" />
                    {skill.downloads.toLocaleString()}
                  </span>
                  {skill.zenodo && (
                    <a
                      href={skill.zenodo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/20"
                    >
                      Zenodo <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                  <button
                    onClick={async () => {
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
                    className="flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 hover:bg-cyan-500/20"
                  >
                    Download .MD <Download className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pre-built library skills */}
            <span className="mt-4 block text-xs font-medium text-text-primary">Skill Library</span>
            <div className="mb-2 flex flex-wrap gap-1">
              {['All', ...new Set(LIBRARY_SKILLS.map((s) => s.category))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLibraryFilter(cat === 'All' ? '' : cat)}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-medium transition-all ${
                    (cat === 'All' && libraryFilter === '') || libraryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                      : 'bg-surface-secondary text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {LIBRARY_SKILLS.filter((s) => !libraryFilter || s.category === libraryFilter).map((skill) => (
              <div key={skill.id} className={`rounded-lg border border-border-medium bg-gradient-to-r ${skill.gradient} bg-opacity-10 p-3`}>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{skill.name}</h4>
                  <span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-bold text-white/80">{skill.category}</span>
                </div>
                <p className="text-[10px] text-white/70">by {skill.developer}</p>
                <p className="mt-1 text-xs text-white/90">{skill.description}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="rounded bg-white/15 px-1.5 py-0.5 text-[8px] text-white/80">{tag}</span>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`text-[10px] ${i < skill.rating ? 'text-yellow-400' : 'text-white/20'}`}>&#9733;</span>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-lg border-2 border-dashed border-border-medium p-4 text-center">
              <Wand2 className="mx-auto mb-2 h-5 w-5 text-text-tertiary" />
              <p className="text-[10px] text-text-tertiary">Build your own with the Generator</p>
              <button onClick={() => setActiveTab('create')} className="mt-2 rounded bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-300 hover:bg-violet-500/20">
                CREATE SKILL
              </button>
            </div>
          </div>
        )}

        {/* ===== DOCS TAB ===== */}
        {activeTab === 'docs' && (
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-text-primary">Skill Development Guide</h4>
            <div className="space-y-2 text-text-secondary">
              <h5 className="font-medium text-cyan-400">What are ZEQ OS Skills?</h5>
              <p className="text-[11px]">
                Skills are structured instructions that transform any LLM into a mathematically intelligent system
                operating at 1.287 Hz HulyaPulse frequency. Each skill includes operator definitions, precision targets,
                and the 7-step protocol.
              </p>

              <h5 className="mt-3 font-medium text-cyan-400">Skill Structure</h5>
              <pre className="overflow-auto rounded-lg border border-border-medium bg-surface-secondary p-2 text-[9px]">
{`---
name: Skill Name
slug: skill-slug
version: 1.0.0
author: Your name
tags: [industry, zeq-os]
---

# Skill Content

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

              <h5 className="mt-3 font-medium text-cyan-400">Best Practices</h5>
              <ul className="list-inside list-disc space-y-1 text-[11px]">
                <li>Always include KO42 (HulyaPulse sync) as mandatory</li>
                <li>Limit domain operators to 1-3 for optimal precision</li>
                <li>Define clear precision targets (typically &le;0.1%)</li>
                <li>Include example usage and expected outputs</li>
                <li>Document all operator equations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
