/**
 * Zeq OS Mathematical Framework - Economics Operators
 * Operators for economic theory and financial analysis
 */

import { ZeqOperator } from '../types';

export const EconomicsOperators: ZeqOperator[] = [
  { id: 'EC1', name: 'Supply-Demand', symbol: 'S_D', domain: 'Economics', formula: 'P* where Q_d(P*) = Q_s(P*)', description: 'Market equilibrium determination' },
  { id: 'EC2', name: 'Utility Maximization', symbol: 'U_M', domain: 'Economics', formula: 'max U(x,y) s.t. p_x·x + p_y·y ≤ I', description: 'Consumer optimization problem' },
  { id: 'EC3', name: 'Profit Maximization', symbol: 'Π_M', domain: 'Economics', formula: 'max π = TR - TC, MR = MC', description: 'Firm optimization condition' },
  { id: 'EC4', name: 'Game Theory', symbol: 'G_T', domain: 'Economics', formula: 'Nash equilibrium: u_i(s_i*, s_{-i}*) ≥ u_i(s_i, s_{-i}*)', description: 'Strategic interaction analysis' },
  { id: 'EC5', name: 'Present Value', symbol: 'P_V', domain: 'Economics', formula: 'PV = Σ CF_t/(1+r)^t', description: 'Discounted cash flow valuation' },
  { id: 'EC6', name: 'CAPM', symbol: 'C_APM', domain: 'Economics', formula: 'E[R_i] = R_f + β_i(E[R_m] - R_f)', description: 'Asset pricing model' },
  { id: 'EC7', name: 'GDP Calculation', symbol: 'G_DP', domain: 'Economics', formula: 'Y = C + I + G + (X - M)', description: 'National income accounting' },
  { id: 'EC8', name: 'Money Multiplier', symbol: 'M_M', domain: 'Economics', formula: 'm = 1/rr, ΔM = m·ΔMB', description: 'Fractional reserve banking' },
  { id: 'EC9', name: 'Phillips Curve', symbol: 'P_C', domain: 'Economics', formula: 'π = π_e - β(u - u_n)', description: 'Inflation-unemployment tradeoff' },
  { id: 'EC10', name: 'Elasticity', symbol: 'E_l', domain: 'Economics', formula: 'ε = (ΔQ/Q)/(ΔP/P)', description: 'Price sensitivity measure' },
  { id: 'EC11', name: 'Comparative Advantage', symbol: 'C_A', domain: 'Economics', formula: 'Trade if OC_A < OC_B for good X', description: 'Ricardo trade theory' },
  { id: 'EC12', name: 'Auction Theory', symbol: 'A_T', domain: 'Economics', formula: 'Revenue equivalence, optimal bidding', description: 'Mechanism design for auctions' },
  { id: 'EC13', name: 'Option Pricing', symbol: 'B_S', domain: 'Economics', formula: 'C = S·N(d₁) - Ke^(-rT)·N(d₂)', description: 'Black-Scholes formula' },
  { id: 'EC14', name: 'Risk Assessment', symbol: 'R_A', domain: 'Economics', formula: 'VaR, Expected Shortfall, σ², β', description: 'Financial risk measures' },
  { id: 'EC15', name: 'Market Efficiency', symbol: 'M_E', domain: 'Economics', formula: 'P_t = E[P_{t+1}|Ω_t] / (1+r)', description: 'Efficient market hypothesis' },
];

export const getEconomicsOperator = (id: string): ZeqOperator | undefined => {
  return EconomicsOperators.find(op => op.id === id);
};
