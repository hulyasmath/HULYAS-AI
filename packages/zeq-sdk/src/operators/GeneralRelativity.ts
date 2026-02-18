/**
 * Zeq OS Mathematical Framework - General Relativity Operators
 * Operators for spacetime geometry and gravitational physics
 */

import { ZeqOperator } from '../types';

export const GeneralRelativityOperators: ZeqOperator[] = [
  {
    id: 'GR31',
    name: 'Metric Tensor',
    symbol: 'Γ_μν',
    domain: 'GeneralRelativity',
    formula: 'ds² = g_μν dx^μ dx^ν',
    description: 'Defines spacetime geometry through metric tensor',
    associatedOperators: ['GR32', 'GR33'],
  },
  {
    id: 'GR32',
    name: 'Christoffel Symbols',
    symbol: 'Γ^λ_μν',
    domain: 'GeneralRelativity',
    formula: 'Γ^λ_μν = ½g^λσ(∂_μg_νσ + ∂_νg_μσ - ∂_σg_μν)',
    description: 'Connection coefficients for parallel transport',
    associatedOperators: ['GR31', 'GR34'],
  },
  {
    id: 'GR33',
    name: 'Riemann Curvature',
    symbol: 'R^ρ_σμν',
    domain: 'GeneralRelativity',
    formula: 'R^ρ_σμν = ∂_μΓ^ρ_νσ - ∂_νΓ^ρ_μσ + Γ^ρ_μλΓ^λ_νσ - Γ^ρ_νλΓ^λ_μσ',
    description: 'Measures spacetime curvature',
    associatedOperators: ['GR31', 'GR35'],
  },
  {
    id: 'GR34',
    name: 'Ricci Tensor',
    symbol: 'R_μν',
    domain: 'GeneralRelativity',
    formula: 'R_μν = R^λ_μλν',
    description: 'Contracted Riemann tensor for Einstein equations',
    associatedOperators: ['GR32', 'GR36'],
  },
  {
    id: 'GR35',
    name: 'Einstein Tensor',
    symbol: 'G_μν',
    domain: 'GeneralRelativity',
    formula: 'G_μν = R_μν - ½Rg_μν',
    description: 'Geometric side of Einstein field equations',
    associatedOperators: ['GR33', 'GR37'],
  },
  {
    id: 'GR36',
    name: 'Stress-Energy Tensor',
    symbol: 'T_μν',
    domain: 'GeneralRelativity',
    formula: 'T_μν = (ρ + p)u_μu_ν + pg_μν',
    description: 'Matter and energy distribution in spacetime',
    associatedOperators: ['GR34', 'GR38'],
  },
  {
    id: 'GR37',
    name: 'Einstein Field Equations',
    symbol: 'E_FE',
    domain: 'GeneralRelativity',
    formula: 'G_μν + Λg_μν = (8πG/c⁴)T_μν',
    description: 'Fundamental equations relating geometry to matter',
    associatedOperators: ['GR35', 'GR39'],
  },
  {
    id: 'GR38',
    name: 'Geodesic Equation',
    symbol: 'Γ_geo',
    domain: 'GeneralRelativity',
    formula: 'd²x^μ/dτ² + Γ^μ_νλ(dx^ν/dτ)(dx^λ/dτ) = 0',
    description: 'Path of free-falling particles in curved spacetime',
    associatedOperators: ['GR36', 'GR40'],
  },
  {
    id: 'GR39',
    name: 'Schwarzschild Metric',
    symbol: 'M_Sch',
    domain: 'GeneralRelativity',
    formula: 'ds² = -(1-2GM/rc²)c²dt² + (1-2GM/rc²)⁻¹dr² + r²dΩ²',
    description: 'Spacetime geometry around spherical mass',
    associatedOperators: ['GR37', 'GR41'],
  },
  {
    id: 'GR40',
    name: 'Gravitational Time Dilation',
    symbol: 'Τ_G',
    domain: 'GeneralRelativity',
    formula: 'Τ_G = t_∞√(1 - 2GM/rc²)',
    description: 'Time dilation in gravitational field',
    associatedOperators: ['GR38', 'GR31'],
  },
  {
    id: 'GR41',
    name: 'Gravitational Waves',
    symbol: 'Η_GW',
    domain: 'GeneralRelativity',
    formula: 'h_μν = (4G/c⁴r)Q̈_μν(t-r/c)',
    description: 'Ripples in spacetime from accelerating masses',
    associatedOperators: ['GR39', 'GR32'],
  },
];

export const getGeneralRelativityOperator = (id: string): ZeqOperator | undefined => {
  return GeneralRelativityOperators.find(op => op.id === id);
};
