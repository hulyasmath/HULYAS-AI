/**
 * Zeq OS Mathematical Framework - Psychology Operators
 * Operators for psychological theories and mental processes
 */

import { ZeqOperator } from '../types';

export const PsychologyOperators: ZeqOperator[] = [
  { id: 'PS1', name: 'Classical Conditioning', symbol: 'C_C', domain: 'Psychology', formula: 'CR = f(CS-US pairings)', description: 'Pavlovian learning model' },
  { id: 'PS2', name: 'Operant Conditioning', symbol: 'O_C', domain: 'Psychology', formula: 'P(behavior) = f(reinforcement history)', description: 'Skinnerian learning model' },
  { id: 'PS3', name: 'Signal Detection', symbol: 'S_D', domain: 'Psychology', formula: 'd\' = Z(Hit) - Z(FA), sensitivity', description: 'Perceptual decision theory' },
  { id: 'PS4', name: 'Weber-Fechner Law', symbol: 'W_F', domain: 'Psychology', formula: 'ΔS/S = k, sensation = k·log(stimulus)', description: 'Psychophysical intensity scaling' },
  { id: 'PS5', name: 'Cognitive Load', symbol: 'C_L', domain: 'Psychology', formula: 'Load = intrinsic + extraneous + germane', description: 'Working memory demand model' },
  { id: 'PS6', name: 'Dual Process', symbol: 'D_P', domain: 'Psychology', formula: 'Response = System1(fast) ∨ System2(slow)', description: 'Kahneman thinking systems' },
  { id: 'PS7', name: 'Big Five Traits', symbol: 'B_5', domain: 'Psychology', formula: 'Personality = (O, C, E, A, N)', description: 'OCEAN personality model' },
  { id: 'PS8', name: 'Attachment Theory', symbol: 'A_T', domain: 'Psychology', formula: 'Attachment = secure ∨ anxious ∨ avoidant', description: 'Bowlby attachment styles' },
  { id: 'PS9', name: 'Cognitive Dissonance', symbol: 'C_D', domain: 'Psychology', formula: 'Dissonance = f(cognition inconsistency)', description: 'Festinger dissonance reduction' },
  { id: 'PS10', name: 'Maslow Hierarchy', symbol: 'M_H', domain: 'Psychology', formula: 'Motivation = lowest unmet need level', description: 'Needs hierarchy model' },
  { id: 'PS11', name: 'Attribution Theory', symbol: 'A_Th', domain: 'Psychology', formula: 'Cause = internal × external × stable × unstable', description: 'Causal attribution dimensions' },
  { id: 'PS12', name: 'Social Learning', symbol: 'S_L', domain: 'Psychology', formula: 'Learning = observation + attention + retention + reproduction', description: 'Bandura modeling theory' },
  { id: 'PS13', name: 'Developmental Stages', symbol: 'D_S', domain: 'Psychology', formula: 'Stage_n → Stage_{n+1} via disequilibrium', description: 'Piaget cognitive development' },
  { id: 'PS14', name: 'Emotional Intelligence', symbol: 'E_I', domain: 'Psychology', formula: 'EI = perceive + use + understand + manage emotions', description: 'Mayer-Salovey EI model' },
  { id: 'PS15', name: 'Stress-Coping', symbol: 'S_C', domain: 'Psychology', formula: 'Stress = demands/resources, coping = problem/emotion-focused', description: 'Lazarus stress model' },
];

export const getPsychologyOperator = (id: string): ZeqOperator | undefined => {
  return PsychologyOperators.find(op => op.id === id);
};
