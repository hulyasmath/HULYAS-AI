/**
 * Zeq OS Mathematical Framework - Sports Operators
 * Operators for sports science and athletics
 */

import { ZeqOperator } from '../types';

export const SportsOperators: ZeqOperator[] = [
  { id: 'SP1', name: 'Biomechanics', symbol: 'B_M', domain: 'Sports', formula: 'Force, torque, kinematics of movement', description: 'Movement physics analysis' },
  { id: 'SP2', name: 'Exercise Physiology', symbol: 'E_P', domain: 'Sports', formula: 'VO2max, lactate threshold, energy systems', description: 'Body response to exercise' },
  { id: 'SP3', name: 'Performance Analysis', symbol: 'P_A', domain: 'Sports', formula: 'Statistics, video analysis, metrics', description: 'Athletic performance measurement' },
  { id: 'SP4', name: 'Training Periodization', symbol: 'T_P', domain: 'Sports', formula: 'Macrocycle → mesocycle → microcycle', description: 'Training phase planning' },
  { id: 'SP5', name: 'Sports Psychology', symbol: 'S_P', domain: 'Sports', formula: 'Motivation, focus, anxiety, flow state', description: 'Mental aspects of sport' },
  { id: 'SP6', name: 'Nutrition for Athletes', symbol: 'N_A', domain: 'Sports', formula: 'Macros, timing, hydration, supplements', description: 'Athletic diet planning' },
  { id: 'SP7', name: 'Injury Prevention', symbol: 'I_P', domain: 'Sports', formula: 'Risk factors → interventions → monitoring', description: 'Athletic injury reduction' },
  { id: 'SP8', name: 'Game Theory (Sports)', symbol: 'G_T', domain: 'Sports', formula: 'Strategy, tactics, optimal play', description: 'Strategic decision making' },
  { id: 'SP9', name: 'Motor Learning', symbol: 'M_L', domain: 'Sports', formula: 'Skill acquisition stages, practice types', description: 'Movement skill development' },
  { id: 'SP10', name: 'Recovery Science', symbol: 'R_S', domain: 'Sports', formula: 'Sleep, nutrition, modalities, adaptation', description: 'Post-exercise recovery' },
  { id: 'SP11', name: 'Sabermetrics', symbol: 'S_M', domain: 'Sports', formula: 'WAR, OPS+, advanced sports statistics', description: 'Baseball analytics methods' },
  { id: 'SP12', name: 'Team Dynamics', symbol: 'T_D', domain: 'Sports', formula: 'Cohesion, roles, communication, leadership', description: 'Group sports psychology' },
  { id: 'SP13', name: 'Talent Identification', symbol: 'T_I', domain: 'Sports', formula: 'Physical, psychological, technical markers', description: 'Athletic potential detection' },
  { id: 'SP14', name: 'Altitude Training', symbol: 'A_T', domain: 'Sports', formula: 'Live high/train low, EPO, adaptations', description: 'Hypoxic training methods' },
  { id: 'SP15', name: 'Sports Technology', symbol: 'S_T', domain: 'Sports', formula: 'Wearables, GPS, video analysis, sensors', description: 'Tech in athletic performance' },
];

export const getSportsOperator = (id: string): ZeqOperator | undefined => {
  return SportsOperators.find(op => op.id === id);
};
