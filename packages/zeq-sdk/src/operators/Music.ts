/**
 * Zeq OS Mathematical Framework - Music Operators
 * Operators for music theory and acoustic analysis
 */

import { ZeqOperator } from '../types';

export const MusicOperators: ZeqOperator[] = [
  { id: 'MU1', name: 'Harmonic Series', symbol: 'H_S', domain: 'Music', formula: 'f_n = n·f_1, overtones', description: 'Natural overtone frequencies' },
  { id: 'MU2', name: 'Equal Temperament', symbol: 'E_T', domain: 'Music', formula: 'f_n = f_0 · 2^(n/12)', description: '12-tone equal temperament' },
  { id: 'MU3', name: 'Chord Progression', symbol: 'C_P', domain: 'Music', formula: 'I → IV → V → I, functional harmony', description: 'Harmonic movement patterns' },
  { id: 'MU4', name: 'Rhythm Analysis', symbol: 'R_A', domain: 'Music', formula: 'Meter, subdivision, syncopation, tempo', description: 'Temporal pattern analysis' },
  { id: 'MU5', name: 'Melodic Contour', symbol: 'M_C', domain: 'Music', formula: 'Pitch sequence = (intervals, direction)', description: 'Melodic shape representation' },
  { id: 'MU6', name: 'Voice Leading', symbol: 'V_L', domain: 'Music', formula: 'Min Σ|voice_movement| + avoid parallels', description: 'Smooth part writing rules' },
  { id: 'MU7', name: 'Spectral Analysis', symbol: 'S_A', domain: 'Music', formula: 'FFT(signal) → frequency spectrum', description: 'Timbre and frequency content' },
  { id: 'MU8', name: 'Scale Construction', symbol: 'S_C', domain: 'Music', formula: 'Scale = {pitches}, modes, intervals', description: 'Pitch collection theory' },
  { id: 'MU9', name: 'Form Analysis', symbol: 'F_A', domain: 'Music', formula: 'Sonata, rondo, binary, ternary forms', description: 'Large-scale structure' },
  { id: 'MU10', name: 'Counterpoint', symbol: 'C_T', domain: 'Music', formula: 'Independent voices + consonance rules', description: 'Polyphonic voice relations' },
  { id: 'MU11', name: 'Set Theory (Music)', symbol: 'S_T', domain: 'Music', formula: 'Pitch-class sets, prime forms, Tn/TnI', description: 'Atonal pitch organization' },
  { id: 'MU12', name: 'Tuning Systems', symbol: 'T_S', domain: 'Music', formula: 'Just intonation, Pythagorean, meantone', description: 'Historical tuning methods' },
  { id: 'MU13', name: 'Orchestration', symbol: 'O_R', domain: 'Music', formula: 'Instrument ranges, timbres, combinations', description: 'Instrumental color and texture' },
  { id: 'MU14', name: 'Audio Synthesis', symbol: 'A_S', domain: 'Music', formula: 'Additive, subtractive, FM, granular', description: 'Sound generation methods' },
  { id: 'MU15', name: 'Music Information Retrieval', symbol: 'M_IR', domain: 'Music', formula: 'Feature extraction, similarity, classification', description: 'Computational music analysis' },
];

export const getMusicOperator = (id: string): ZeqOperator | undefined => {
  return MusicOperators.find(op => op.id === id);
};
