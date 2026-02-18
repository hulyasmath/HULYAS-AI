/**
 * Zeq OS Mathematical Framework - Engineering Operators
 * Operators for engineering design and analysis
 */

import { ZeqOperator } from '../types';

export const EngineeringOperators: ZeqOperator[] = [
  { id: 'EN1', name: 'Stress Analysis', symbol: 'σ', domain: 'Engineering', formula: 'σ = F/A, τ = VQ/It', description: 'Material stress calculations' },
  { id: 'EN2', name: 'Strain Analysis', symbol: 'ε', domain: 'Engineering', formula: 'ε = ΔL/L, σ = Eε (Hooke\'s Law)', description: 'Material deformation' },
  { id: 'EN3', name: 'Thermodynamics', symbol: 'T_D', domain: 'Engineering', formula: 'ΔU = Q - W, entropy, Carnot efficiency', description: 'Energy and heat transfer' },
  { id: 'EN4', name: 'Fluid Mechanics', symbol: 'F_M', domain: 'Engineering', formula: 'Bernoulli, Navier-Stokes, Reynolds number', description: 'Fluid flow analysis' },
  { id: 'EN5', name: 'Control Systems', symbol: 'C_S', domain: 'Engineering', formula: 'PID, transfer functions, stability', description: 'Feedback control design' },
  { id: 'EN6', name: 'Signal Processing', symbol: 'S_P', domain: 'Engineering', formula: 'FFT, filtering, modulation, sampling', description: 'Signal analysis and manipulation' },
  { id: 'EN7', name: 'Circuit Analysis', symbol: 'C_A', domain: 'Engineering', formula: 'V = IR, KVL, KCL, impedance', description: 'Electrical circuit analysis' },
  { id: 'EN8', name: 'Finite Element', symbol: 'FEM', domain: 'Engineering', formula: '[K]{u} = {F}, mesh, shape functions', description: 'Numerical structural analysis' },
  { id: 'EN9', name: 'CAD/CAM', symbol: 'CAD', domain: 'Engineering', formula: 'Parametric design, tolerancing, DFM', description: 'Computer-aided design' },
  { id: 'EN10', name: 'Materials Science', symbol: 'M_S', domain: 'Engineering', formula: 'Crystal structure, phase diagrams, properties', description: 'Material behavior' },
  { id: 'EN11', name: 'Safety Engineering', symbol: 'S_E', domain: 'Engineering', formula: 'FMEA, fault trees, reliability', description: 'System safety analysis' },
  { id: 'EN12', name: 'Manufacturing', symbol: 'M_F', domain: 'Engineering', formula: 'Process planning, quality control, lean', description: 'Production engineering' },
  { id: 'EN13', name: 'Robotics', symbol: 'R_B', domain: 'Engineering', formula: 'Kinematics, dynamics, path planning', description: 'Robot design and control' },
  { id: 'EN14', name: 'Systems Engineering', symbol: 'S_Eng', domain: 'Engineering', formula: 'Requirements → design → test → integrate', description: 'Complex system development' },
  { id: 'EN15', name: 'Optimization', symbol: 'O_PT', domain: 'Engineering', formula: 'min f(x) s.t. constraints, Pareto front', description: 'Design optimization methods' },
];

export const getEngineeringOperator = (id: string): ZeqOperator | undefined => {
  return EngineeringOperators.find(op => op.id === id);
};
