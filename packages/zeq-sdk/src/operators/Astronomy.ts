/**
 * Zeq OS Mathematical Framework - Astronomy Operators
 * Operators for celestial mechanics and astrophysics
 */

import { ZeqOperator } from '../types';

export const AstronomyOperators: ZeqOperator[] = [
  { id: 'AS1', name: 'Kepler\'s Laws', symbol: 'K_L', domain: 'Astronomy', formula: 'T² ∝ a³, elliptical orbits, equal areas', description: 'Planetary motion laws' },
  { id: 'AS2', name: 'Stellar Evolution', symbol: 'S_E', domain: 'Astronomy', formula: 'Main sequence → red giant → final state', description: 'Star lifecycle stages' },
  { id: 'AS3', name: 'Hertzsprung-Russell', symbol: 'H_R', domain: 'Astronomy', formula: 'Luminosity vs temperature diagram', description: 'Stellar classification' },
  { id: 'AS4', name: 'Hubble\'s Law', symbol: 'H_L', domain: 'Astronomy', formula: 'v = H₀d, cosmic expansion', description: 'Universe expansion rate' },
  { id: 'AS5', name: 'Black Hole Physics', symbol: 'B_H', domain: 'Astronomy', formula: 'Schwarzschild radius r_s = 2GM/c²', description: 'Event horizon and singularities' },
  { id: 'AS6', name: 'Cosmological Models', symbol: 'C_M', domain: 'Astronomy', formula: 'Friedmann equations, ΛCDM', description: 'Universe evolution models' },
  { id: 'AS7', name: 'Spectroscopy', symbol: 'S_P', domain: 'Astronomy', formula: 'Absorption/emission lines, redshift', description: 'Light analysis methods' },
  { id: 'AS8', name: 'Gravitational Lensing', symbol: 'G_L', domain: 'Astronomy', formula: 'θ = 4GM/(c²b), light bending', description: 'Mass-light interaction' },
  { id: 'AS9', name: 'Exoplanet Detection', symbol: 'E_D', domain: 'Astronomy', formula: 'Transit, radial velocity, direct imaging', description: 'Planet discovery methods' },
  { id: 'AS10', name: 'Nucleosynthesis', symbol: 'N_S', domain: 'Astronomy', formula: 'H → He → heavier elements', description: 'Element formation in stars' },
  { id: 'AS11', name: 'Galaxy Dynamics', symbol: 'G_D', domain: 'Astronomy', formula: 'Rotation curves, dark matter, morphology', description: 'Galaxy structure and motion' },
  { id: 'AS12', name: 'Cosmic Microwave Background', symbol: 'CMB', domain: 'Astronomy', formula: 'T = 2.725K, anisotropies', description: 'Early universe radiation' },
  { id: 'AS13', name: 'Pulsar Timing', symbol: 'P_T', domain: 'Astronomy', formula: 'Period, pulse profile, timing residuals', description: 'Neutron star observations' },
  { id: 'AS14', name: 'Astrometry', symbol: 'A_M', domain: 'Astronomy', formula: 'Parallax, proper motion, positions', description: 'Precision position measurement' },
  { id: 'AS15', name: 'Dark Energy', symbol: 'D_E', domain: 'Astronomy', formula: 'w = p/ρ, cosmic acceleration', description: 'Universe accelerating expansion' },
];

export const getAstronomyOperator = (id: string): ZeqOperator | undefined => {
  return AstronomyOperators.find(op => op.id === id);
};
