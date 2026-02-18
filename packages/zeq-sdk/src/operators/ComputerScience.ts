/**
 * Zeq OS Mathematical Framework - Computer Science Operators
 * Operators for computation, algorithms, and information theory
 */

import { ZeqOperator } from '../types';

export const ComputerScienceOperators: ZeqOperator[] = [
  { id: 'CS1', name: 'Big-O Complexity', symbol: 'O(n)', domain: 'ComputerScience', formula: 'f(n) = O(g(n)) if ∃c,n₀: f(n) ≤ c·g(n) ∀n≥n₀', description: 'Asymptotic upper bound analysis' },
  { id: 'CS2', name: 'Information Entropy', symbol: 'H(X)', domain: 'ComputerScience', formula: 'H(X) = -Σ p(x)log₂p(x)', description: 'Shannon entropy of information' },
  { id: 'CS3', name: 'Turing Completeness', symbol: 'T_C', domain: 'ComputerScience', formula: 'Computable ↔ TuringMachine(halts)', description: 'Universal computation model' },
  { id: 'CS4', name: 'Halting Problem', symbol: 'H_P', domain: 'ComputerScience', formula: '¬∃ algorithm deciding halt(P,I) ∀P,I', description: 'Undecidability of halting' },
  { id: 'CS5', name: 'Graph Algorithms', symbol: 'G_A', domain: 'ComputerScience', formula: 'BFS, DFS, Dijkstra, A*, MST', description: 'Fundamental graph traversal' },
  { id: 'CS6', name: 'Sorting Algorithms', symbol: 'S_A', domain: 'ComputerScience', formula: 'Comparison: Ω(n log n), non-comparison: O(n)', description: 'Optimal sorting bounds' },
  { id: 'CS7', name: 'Dynamic Programming', symbol: 'D_P', domain: 'ComputerScience', formula: 'OPT(n) = max/min over subproblems', description: 'Optimal substructure solutions' },
  { id: 'CS8', name: 'NP-Completeness', symbol: 'NP_C', domain: 'ComputerScience', formula: 'NP-complete = NP ∩ NP-hard', description: 'Computational intractability class' },
  { id: 'CS9', name: 'Database Query', symbol: 'D_Q', domain: 'ComputerScience', formula: 'SELECT, JOIN, relational algebra', description: 'Relational database operations' },
  { id: 'CS10', name: 'Cryptography', symbol: 'C_R', domain: 'ComputerScience', formula: 'RSA, AES, hash functions, digital signatures', description: 'Secure communication protocols' },
  { id: 'CS11', name: 'Machine Learning', symbol: 'M_L', domain: 'ComputerScience', formula: 'argmin_θ L(y, f_θ(x)) + λR(θ)', description: 'Regularized empirical risk minimization' },
  { id: 'CS12', name: 'Neural Networks', symbol: 'N_N', domain: 'ComputerScience', formula: 'y = σ(W_L·σ(W_{L-1}·...σ(W_1·x)))', description: 'Deep feedforward networks' },
  { id: 'CS13', name: 'Distributed Systems', symbol: 'D_S', domain: 'ComputerScience', formula: 'CAP theorem, consensus, Paxos, Raft', description: 'Consistency in distributed computing' },
  { id: 'CS14', name: 'Compiler Theory', symbol: 'C_T', domain: 'ComputerScience', formula: 'Lexer → Parser → AST → IR → Codegen', description: 'Language translation pipeline' },
  { id: 'CS15', name: 'Operating Systems', symbol: 'O_S', domain: 'ComputerScience', formula: 'Scheduling, memory management, IPC', description: 'System resource management' },
];

export const getComputerScienceOperator = (id: string): ZeqOperator | undefined => {
  return ComputerScienceOperators.find(op => op.id === id);
};
