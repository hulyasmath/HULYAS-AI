/**
 * Zeq OS Mathematical Framework - Mathematics Operators
 * Operators for pure and applied mathematics
 */

import { ZeqOperator } from '../types';

export const MathematicsOperators: ZeqOperator[] = [
  { id: 'MT1', name: 'Differential Calculus', symbol: 'D_x', domain: 'Mathematics', formula: 'D_x(f) = lim(h→0) [f(x+h)-f(x)]/h', description: 'Computes derivatives and rates of change' },
  { id: 'MT2', name: 'Integral Calculus', symbol: '∫', domain: 'Mathematics', formula: '∫f(x)dx = F(x) + C where F\'(x) = f(x)', description: 'Computes integrals and accumulated quantities' },
  { id: 'MT3', name: 'Linear Algebra', symbol: 'L_A', domain: 'Mathematics', formula: 'Ax = b, det(A), eigenvalues(A)', description: 'Matrix operations and linear transformations' },
  { id: 'MT4', name: 'Complex Analysis', symbol: 'C_A', domain: 'Mathematics', formula: 'f(z) = u(x,y) + iv(x,y), ∮f(z)dz', description: 'Analysis of complex-valued functions' },
  { id: 'MT5', name: 'Number Theory', symbol: 'N_T', domain: 'Mathematics', formula: 'gcd, lcm, primes, modular arithmetic', description: 'Properties of integers and prime numbers' },
  { id: 'MT6', name: 'Topology', symbol: 'T_op', domain: 'Mathematics', formula: 'Open sets, continuity, compactness, connectedness', description: 'Study of spaces and continuous mappings' },
  { id: 'MT7', name: 'Group Theory', symbol: 'G_T', domain: 'Mathematics', formula: '(G,·) with closure, associativity, identity, inverse', description: 'Algebraic structures with symmetry' },
  { id: 'MT8', name: 'Probability Theory', symbol: 'P_T', domain: 'Mathematics', formula: 'P(A∩B) = P(A)P(B|A), E[X] = Σx·P(x)', description: 'Mathematical foundations of randomness' },
  { id: 'MT9', name: 'Fourier Analysis', symbol: 'F_A', domain: 'Mathematics', formula: 'F(ω) = ∫f(t)e^(-iωt)dt', description: 'Frequency domain decomposition' },
  { id: 'MT10', name: 'Differential Equations', symbol: 'DE', domain: 'Mathematics', formula: 'dy/dx = f(x,y), y\'\' + p(x)y\' + q(x)y = r(x)', description: 'Equations involving derivatives' },
  { id: 'MT11', name: 'Tensor Calculus', symbol: 'T_C', domain: 'Mathematics', formula: 'T^μν_ρ, covariant derivatives, Lie derivatives', description: 'Multilinear algebra on manifolds' },
  { id: 'MT12', name: 'Optimization', symbol: 'O_pt', domain: 'Mathematics', formula: 'min f(x) s.t. g(x) ≤ 0, ∇L = 0', description: 'Finding extrema of functions' },
  { id: 'MT13', name: 'Graph Theory', symbol: 'G_ph', domain: 'Mathematics', formula: 'G = (V,E), adjacency, paths, cycles', description: 'Study of vertices and edges' },
  { id: 'MT14', name: 'Set Theory', symbol: 'S_T', domain: 'Mathematics', formula: 'A∪B, A∩B, A\\B, P(A), |A|', description: 'Foundation of mathematical objects' },
  { id: 'MT15', name: 'Category Theory', symbol: 'C_T', domain: 'Mathematics', formula: 'Objects, morphisms, functors, natural transformations', description: 'Abstract structure of mathematical systems' },
  { id: 'MT16', name: 'Real Analysis', symbol: 'R_A', domain: 'Mathematics', formula: 'Limits, continuity, convergence, measure theory', description: 'Rigorous study of real numbers and functions' },
  { id: 'MT17', name: 'Numerical Methods', symbol: 'N_M', domain: 'Mathematics', formula: 'Newton-Raphson, Runge-Kutta, finite differences', description: 'Computational approximation algorithms' },
];

export const getMathematicsOperator = (id: string): ZeqOperator | undefined => {
  return MathematicsOperators.find(op => op.id === id);
};
