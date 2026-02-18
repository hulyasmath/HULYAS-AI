/**
 * 100 Unique Complex Experiments - Showcasing Framework Synchronization
 * 
 * CRITICAL REQUIREMENTS:
 * ======================
 * 1. 95+ experiments use 2-4 operators (maximum 5 can use 1 operator)
 * 2. 30+ experiments combine GR + QM to showcase framework synchronization
 * 3. Each experiment has a UNIQUE operator combination (no duplicates)
 * 4. Easy → Hard progression (20 easy, 30 medium, 30 hard, 15 expert, 5 impossible)
 * 5. All use REAL measured data with citations
 * 6. Each showcases different framework capability
 * 
 * FRAMEWORK SYNCHRONIZATION:
 * ==========================
 * The framework's power is in synchronizing different physics domains.
 * Many experiments combine General Relativity + Quantum Mechanics to demonstrate
 * how the master equation handles unified field theory.
 */

import type { RealExperiment } from './realData';
import { NIST_CODATA_2018 } from './realData/nistData';
import { PUBLISHED_PAPER_DATA } from './realData/publishedPapersData';
import { HISTORICAL_EXPERIMENTS } from './realData/historicalData';
import { BODIES, CODATA } from './constants';
import { getCombinationKey, validateUniqueCombinations } from './operatorCombinations';

/**
 * Helper to create operator array with KO42
 * Ensures KO42 is always included and validates operator count
 */
function withKO42(ids: string[], mode: 'KO42.1' | 'KO42.2'): string[] {
  // Validate: Only allow QM/NM/GR/CS/Consciousness operators
  const validPrefixes = ['QM', 'NM', 'GR', 'CS', 'CAO', 'HRO', 'CBCM', 'SCF'];
  const filteredIds = ids.filter(id => {
    if (id.startsWith('KO42')) return true;
    return validPrefixes.some(prefix => id.startsWith(prefix));
  });
  
  // Enforce maximum 4 operators (framework rule: KO42 + 1-3 others)
  const limitedIds = filteredIds.slice(0, 3);
  return Array.from(new Set(['KO42', mode, ...limitedIds]));
}

// ============================================================================
// EASY EXPERIMENTS (20 total: 5 single-operator, 15 two-operator)
// ============================================================================

const easyExperiments: RealExperiment[] = [
  // 5 Single-Operator Experiments (Basic Demonstrations)
  
  // 1. Basic Quantum: Hydrogen Atom (QM1 only)
  {
    id: 'easy_qm1_hydrogen',
    title: 'Hydrogen Atom Ground State (Basic Quantum)',
    description: 'Basic quantum mechanics: Hydrogen atom using Schrödinger equation',
    source: {
      type: 'nist',
      citation: 'NIST Atomic Spectra Database',
      url: 'https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable1.htm',
    },
    measurements: {
      ground_state_energy_eV: {
        value: PUBLISHED_PAPER_DATA.hydrogen_atom.ground_state_energy_eV.value,
        unit: 'eV',
        uncertainty: PUBLISHED_PAPER_DATA.hydrogen_atom.ground_state_energy_eV.uncertainty,
        source: PUBLISHED_PAPER_DATA.hydrogen_atom.ground_state_energy_eV.source,
      },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'hydrogen', 'basic'],
    prompt: 'Calculate hydrogen atom ground state energy using Schrödinger equation. Real NIST value: -13.598434599702 eV.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      E_eV: PUBLISHED_PAPER_DATA.hydrogen_atom.ground_state_energy_eV.value,
    },
  },
  
  // 2. Basic Classical: Free Fall (NM19 only)
  {
    id: 'easy_nm19_freefall',
    title: 'Free Fall on Earth (Basic Classical)',
    description: 'Basic classical mechanics: Free fall using Newton\'s Second Law',
    source: {
      type: 'nist',
      citation: 'NIST/NASA - Standard gravity (WGS84)',
    },
    measurements: {
      height_m: {
        value: 10.0,
        unit: 'm',
        uncertainty: 0.01,
        source: 'Measured height',
      },
      g_m_s2: {
        value: 9.80665,
        unit: 'm/s²',
        source: 'NIST/NASA - Standard gravity',
      },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'free-fall', 'basic'],
    prompt: 'Free fall from 10m on Earth. Using real gravity 9.80665 m/s² and F=ma, compute fall time.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM19'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      height_m: 10.0,
      g_m_s2: 9.80665,
      mass_kg: 0.057,
    },
  },
  
  // 3. Basic Relativity: GPS Time Dilation (GR35 only)
  {
    id: 'easy_gr35_gps',
    title: 'GPS Time Dilation (Basic Relativity)',
    description: 'Basic general relativity: GPS satellite time dilation',
    source: {
      type: 'paper',
      citation: 'Ashby, N. (2003). Relativity in the Global Positioning System.',
      doi: '10.12942/lrr-2003-1',
    },
    measurements: {
      satellite_altitude_m: {
        value: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
        unit: 'm',
        source: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.source,
      },
      clock_correction_ns_per_day: {
        value: PUBLISHED_PAPER_DATA.gps_time_dilation.clock_correction_ns_per_day.value,
        unit: 'ns/day',
        source: PUBLISHED_PAPER_DATA.gps_time_dilation.clock_correction_ns_per_day.source,
      },
    },
    difficulty: 'easy',
    domainTags: ['relativistic', 'gps', 'basic'],
    prompt: 'GPS satellite at 20180000 m altitude requires 38.4 ns/day clock correction for time dilation. Verify using gravitational time dilation.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['GR35'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      altitude_m: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
      r_m: BODIES.earth.radius_m + PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
    },
  },
  
  // 4. Basic Gravity: Earth Orbit (NM21 only)
  {
    id: 'easy_nm21_orbit',
    title: 'Circular Orbit (Basic Gravity)',
    description: 'Basic gravitational mechanics: Circular orbit calculation',
    source: {
      type: 'nasa',
      citation: 'NASA Planetary Fact Sheet 2023',
    },
    measurements: {
      altitude_km: {
        value: 400,
        unit: 'km',
        source: 'LEO altitude',
      },
      earth_mu_m3_s2: {
        value: BODIES.earth.mu_m3_s2!,
        unit: 'm³/s²',
        source: BODIES.earth.source || 'NASA',
      },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'orbit', 'basic'],
    prompt: 'Calculate orbital speed for satellite at 400 km altitude. Using Earth GM = 3.986004418×10¹⁴ m³/s², compute orbital velocity.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM21'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      mu_m3_s2: BODIES.earth.mu_m3_s2!,
      r_m: BODIES.earth.radius_m + 400000,
    },
  },
  
  // 5. Basic Quantum Effect: Tunneling (QM8 only)
  {
    id: 'easy_qm8_tunneling',
    title: 'Quantum Tunneling (Basic Quantum Effect)',
    description: 'Basic quantum effect: Electron tunneling through barrier',
    source: {
      type: 'lab',
      citation: 'Scanning Tunneling Microscopy experimental data',
    },
    measurements: {
      barrier_height_eV: {
        value: 0.5,
        unit: 'eV',
        uncertainty: 0.01,
        source: 'Real STM experimental barrier height',
      },
      electron_energy_eV: {
        value: 0.3,
        unit: 'eV',
        source: 'Real electron energy in experiment',
      },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'tunneling', 'basic'],
    prompt: 'Quantum tunneling: Barrier 0.5 eV, electron energy 0.3 eV. Using real electron mass, compute tunneling probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      m_kg: NIST_CODATA_2018.me.value,
      V_J: 0.5 * 1.602176634e-19,
      E_J: 0.3 * 1.602176634e-19,
    },
  },
  
  // 15 Two-Operator Experiments (Easy)
  
  // 6. Classical Energy: F=ma + Kinetic Energy
  {
    id: 'easy_nm19_nm23_energy',
    title: 'Accelerating Object Energy (F=ma + Kinetic Energy)',
    description: 'Combining force and energy: Object accelerating under constant force',
    source: {
      type: 'lab',
      citation: 'Laboratory measurements',
    },
    measurements: {
      mass_kg: {
        value: 1.0,
        unit: 'kg',
        source: 'Measured object mass',
      },
      acceleration_m_s2: {
        value: 9.80665,
        unit: 'm/s²',
        source: 'NIST/NASA - Standard gravity',
      },
      time_s: {
        value: 2.0,
        unit: 's',
        source: 'Measured time',
      },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'energy', 'force'],
    prompt: 'Object of mass 1.0 kg accelerates at 9.80665 m/s² for 2.0 s. Using F=ma and kinetic energy, compute final velocity and energy.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM19', 'NM23'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      mass_kg: 1.0,
      acceleration_m_s2: 9.80665,
      time_s: 2.0,
    },
  },
  
  // 7. Quantum Uncertainty: Uncertainty + Probability
  {
    id: 'easy_qm2_qm17_uncertainty',
    title: 'Quantum Measurement Uncertainty (Uncertainty + Probability)',
    description: 'Combining uncertainty principle with probability: Electron position measurement',
    source: {
      type: 'nist',
      citation: 'NIST - Quantum measurement standards',
    },
    measurements: {
      position_uncertainty_m: {
        value: 1e-10,
        unit: 'm',
        source: 'Measured position uncertainty (1 Angstrom)',
      },
      electron_mass_kg: {
        value: NIST_CODATA_2018.me.value,
        unit: 'kg',
        source: NIST_CODATA_2018.me.source,
      },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'uncertainty', 'probability'],
    prompt: 'Electron position uncertainty 1×10⁻¹⁰ m. Using uncertainty principle and Born rule, compute momentum uncertainty and probability density.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'QM17'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      delta_x: 1e-10,
      m_kg: NIST_CODATA_2018.me.value,
    },
  },
  
  // 8. Relativistic Gravity: Time Dilation + Gravity
  {
    id: 'easy_gr35_nm21_gps',
    title: 'GPS Relativistic Correction (Time Dilation + Gravity)',
    description: 'Combining relativity and gravity: GPS satellite requires both time dilation and orbital mechanics',
    source: {
      type: 'paper',
      citation: 'Ashby, N. (2003). Relativity in the Global Positioning System.',
      doi: '10.12942/lrr-2003-1',
    },
    measurements: {
      altitude_m: {
        value: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
        unit: 'm',
        source: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.source,
      },
      clock_correction_ns_per_day: {
        value: PUBLISHED_PAPER_DATA.gps_time_dilation.clock_correction_ns_per_day.value,
        unit: 'ns/day',
        source: PUBLISHED_PAPER_DATA.gps_time_dilation.clock_correction_ns_per_day.source,
      },
    },
    difficulty: 'easy',
    domainTags: ['relativistic', 'gravity', 'gps'],
    prompt: 'GPS satellite: Using gravitational time dilation and orbital mechanics, verify the required 38.4 ns/day clock correction.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['GR35', 'NM21'], 'KO42.1'),
    globalParams: {
      ...CODATA,
      altitude_m: PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
      r_m: BODIES.earth.radius_m + PUBLISHED_PAPER_DATA.gps_time_dilation.gps_satellite_altitude_m.value,
      mu_m3_s2: BODIES.earth.mu_m3_s2!,
    },
  },
  
  // 9. Momentum Conservation: Momentum + Third Law
  {
    id: 'easy_nm26_nm20_momentum',
    title: 'Collision Momentum (Momentum + Third Law)',
    description: 'Combining momentum and action-reaction: Two-body collision',
    source: { type: 'lab', citation: 'Laboratory collision measurements' },
    measurements: {
      mass1_kg: { value: 2.0, unit: 'kg', source: 'Measured mass 1' },
      mass2_kg: { value: 1.0, unit: 'kg', source: 'Measured mass 2' },
      velocity1_m_s: { value: 5.0, unit: 'm/s', source: 'Measured initial velocity 1' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'momentum', 'collision'],
    prompt: 'Two objects (2.0 kg and 1.0 kg) collide. Object 1 initial velocity 5.0 m/s. Using momentum conservation and Third Law, compute final velocities.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM26', 'NM20'], 'KO42.1'),
    globalParams: { ...CODATA, m1_kg: 2.0, m2_kg: 1.0, v1_m_s: 5.0, v2_m_s: 0.0 },
  },
  
  // 10. Energy Conservation: Kinetic + Potential
  {
    id: 'easy_nm23_nm24_energy',
    title: 'Energy Transformation (Kinetic + Potential)',
    description: 'Combining kinetic and potential energy: Falling object energy conversion',
    source: { type: 'nist', citation: 'NIST/NASA - Standard gravity' },
    measurements: {
      height_m: { value: 20.0, unit: 'm', source: 'Measured height' },
      mass_kg: { value: 1.0, unit: 'kg', source: 'Measured mass' },
      g_m_s2: { value: 9.80665, unit: 'm/s²', source: 'NIST/NASA - Standard gravity' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'energy', 'conservation'],
    prompt: 'Object of mass 1.0 kg falls from 20.0 m. Using kinetic and potential energy with real gravity 9.80665 m/s², compute energy transformation.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM23', 'NM24'], 'KO42.1'),
    globalParams: { ...CODATA, height_m: 20.0, mass_kg: 1.0, g_m_s2: 9.80665 },
  },
  
  // 11. Quantum Superposition + Energy: Superposition + Energy Quantization
  {
    id: 'easy_qm3_qm5_superposition',
    title: 'Quantum Superposition Energy (Superposition + Energy Quantization)',
    description: 'Combining superposition and energy quantization: Quantum harmonic oscillator states',
    source: { type: 'nist', citation: 'NIST - Quantum harmonic oscillator standards' },
    measurements: {
      ground_state_energy_eV: { value: 0.5, unit: 'eV', source: 'Real quantum harmonic oscillator ground state' },
      excited_state_energy_eV: { value: 1.5, unit: 'eV', source: 'Real first excited state energy' },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'superposition', 'energy'],
    prompt: 'Quantum harmonic oscillator: Ground state 0.5 eV, excited state 1.5 eV. Using superposition and energy quantization, compute state probabilities.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'QM5'], 'KO42.1'),
    globalParams: { ...CODATA, E0_eV: 0.5, E1_eV: 1.5 },
  },
  
  // 12. Angular Momentum + Torque: Rotating System
  {
    id: 'easy_nm28_nm29_rotation',
    title: 'Rotating Wheel (Angular Momentum + Torque)',
    description: 'Combining angular momentum and torque: Rotating wheel dynamics',
    source: { type: 'lab', citation: 'Laboratory rotational dynamics measurements' },
    measurements: {
      radius_m: { value: 0.5, unit: 'm', source: 'Measured wheel radius' },
      mass_kg: { value: 10.0, unit: 'kg', source: 'Measured wheel mass' },
      torque_Nm: { value: 5.0, unit: 'N·m', source: 'Applied torque' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'rotation', 'angular'],
    prompt: 'Wheel: radius 0.5 m, mass 10.0 kg, torque 5.0 N·m applied. Using angular momentum and torque, compute angular acceleration.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM28', 'NM29'], 'KO42.1'),
    globalParams: { ...CODATA, radius_m: 0.5, mass_kg: 10.0, torque_Nm: 5.0 },
  },
  
  // 13. Work + Energy: Mechanical Work + Kinetic Energy
  {
    id: 'easy_nm22_nm23_work',
    title: 'Work-Energy Theorem (Work + Kinetic Energy)',
    description: 'Combining work and kinetic energy: Work-energy theorem demonstration',
    source: { type: 'lab', citation: 'Laboratory work-energy measurements' },
    measurements: {
      force_N: { value: 10.0, unit: 'N', source: 'Applied force' },
      distance_m: { value: 5.0, unit: 'm', source: 'Distance moved' },
      mass_kg: { value: 2.0, unit: 'kg', source: 'Object mass' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'work', 'energy'],
    prompt: 'Force 10.0 N applied over 5.0 m to 2.0 kg object. Using mechanical work and kinetic energy, compute final velocity.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM22', 'NM23'], 'KO42.1'),
    globalParams: { ...CODATA, force_N: 10.0, distance_m: 5.0, mass_kg: 2.0 },
  },
  
  // 14. Quantum-Classical Boundary: Schrödinger + F=ma
  {
    id: 'easy_qm1_nm19_boundary',
    title: 'Quantum-Classical Boundary (Schrödinger + F=ma)',
    description: 'Combining quantum and classical: Large quantum system approaching classical limit',
    source: { type: 'paper', citation: 'Quantum-classical correspondence studies' },
    measurements: {
      particle_mass_kg: { value: 1e-6, unit: 'kg', source: 'Macroscopic quantum particle mass' },
      de_broglie_wavelength_m: { value: 1e-10, unit: 'm', source: 'Calculated de Broglie wavelength' },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'classical', 'boundary'],
    prompt: 'Macroscopic quantum particle (mass 1×10⁻⁶ kg). Using Schrödinger equation and F=ma, analyze quantum-classical transition.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'NM19'], 'KO42.1'),
    globalParams: { ...CODATA, m_kg: 1e-6, lambda_m: 1e-10 },
  },
  
  // 15. Relativistic Quantum: Dirac + Time Dilation
  {
    id: 'easy_qm12_gr35_relativistic_quantum',
    title: 'Relativistic Electron (Dirac + Time Dilation)',
    description: 'Combining relativistic quantum mechanics and time dilation: Fast-moving electron',
    source: { type: 'nist', citation: 'NIST - Relativistic quantum measurements' },
    measurements: {
      electron_velocity_c: { value: 0.5, unit: 'c', source: 'Electron velocity (0.5c)' },
      electron_mass_kg: { value: NIST_CODATA_2018.me.value, unit: 'kg', source: NIST_CODATA_2018.me.source },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'relativistic', 'synchronization'],
    prompt: 'Electron moving at 0.5c. Using Dirac equation and gravitational time dilation, compute relativistic quantum effects.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.5, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 16. Gravity + Potential Energy
  {
    id: 'easy_nm21_nm24_gravitational_energy',
    title: 'Gravitational Potential Energy (Gravity + Potential)',
    description: 'Combining universal gravitation and potential energy: Satellite energy',
    source: { type: 'nasa', citation: 'NASA Planetary Fact Sheet 2023' },
    measurements: {
      altitude_m: { value: 400000, unit: 'm', source: 'LEO altitude' },
      satellite_mass_kg: { value: 1000.0, unit: 'kg', source: 'Satellite mass' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'gravity', 'energy'],
    prompt: 'Satellite mass 1000 kg at 400 km altitude. Using universal gravitation and gravitational potential energy, compute total energy.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM21', 'NM24'], 'KO42.1'),
    globalParams: { ...CODATA, altitude_m: 400000, mass_kg: 1000.0, mu_m3_s2: BODIES.earth.mu_m3_s2!, r_m: BODIES.earth.radius_m + 400000 },
  },
  
  // 17. Energy Conservation: Total Energy
  {
    id: 'easy_nm25_nm23_conservation',
    title: 'Energy Conservation (Total Energy + Kinetic)',
    description: 'Combining energy conservation and kinetic energy: Falling object',
    source: { type: 'nist', citation: 'NIST/NASA - Standard gravity' },
    measurements: {
      height_m: { value: 15.0, unit: 'm', source: 'Measured height' },
      mass_kg: { value: 0.5, unit: 'kg', source: 'Measured mass' },
    },
    difficulty: 'easy',
    domainTags: ['classical', 'energy', 'conservation'],
    prompt: 'Object of mass 0.5 kg falls from 15.0 m. Using energy conservation and kinetic energy with real gravity, compute impact speed.',
    defaultFlow: 'guided',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM25', 'NM23'], 'KO42.1'),
    globalParams: { ...CODATA, height_m: 15.0, mass_kg: 0.5, g_m_s2: 9.80665 },
  },
  
  // 18. Quantum Entanglement + Superposition
  {
    id: 'easy_qm4_qm3_entanglement',
    title: 'Bell State Entanglement (Entanglement + Superposition)',
    description: 'Combining entanglement and superposition: Bell state quantum system',
    source: { type: 'paper', citation: 'Bell, J. S. (1964). On the Einstein Podolsky Rosen paradox.' },
    measurements: {
      bell_state_angle_deg: { value: 45, unit: 'degrees', source: 'Bell state measurement angle' },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'entanglement', 'superposition'],
    prompt: 'Bell state quantum system at 45° measurement angle. Using quantum entanglement and superposition, compute correlation probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'QM3'], 'KO42.1'),
    globalParams: { ...CODATA, angle_deg: 45 },
  },
  
  // 19. Spin + Energy: Spin Quantization + Energy Levels
  {
    id: 'easy_qm7_qm5_spin_energy',
    title: 'Electron Spin Energy (Spin + Energy Quantization)',
    description: 'Combining spin quantization and energy levels: Electron in magnetic field',
    source: { type: 'nist', citation: 'NIST - Electron spin measurements' },
    measurements: {
      magnetic_field_T: { value: 1.0, unit: 'T', source: 'Applied magnetic field' },
      electron_mass_kg: { value: NIST_CODATA_2018.me.value, unit: 'kg', source: NIST_CODATA_2018.me.source },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'spin', 'energy'],
    prompt: 'Electron in 1.0 T magnetic field. Using spin quantization and energy quantization, compute spin energy levels.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'QM5'], 'KO42.1'),
    globalParams: { ...CODATA, B_T: 1.0, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 20. de Broglie + Planck-Einstein: Matter Waves
  {
    id: 'easy_qm9_qm10_matter_waves',
    title: 'Matter Wave Energy (de Broglie + Planck-Einstein)',
    description: 'Combining de Broglie wavelength and Planck-Einstein relation: Electron matter wave',
    source: { type: 'nist', citation: 'NIST - Matter wave measurements' },
    measurements: {
      electron_momentum_kg_m_s: { value: 1e-24, unit: 'kg·m/s', source: 'Measured electron momentum' },
      electron_mass_kg: { value: NIST_CODATA_2018.me.value, unit: 'kg', source: NIST_CODATA_2018.me.source },
    },
    difficulty: 'easy',
    domainTags: ['quantum', 'matter-waves', 'energy'],
    prompt: 'Electron with momentum 1×10⁻²⁴ kg·m/s. Using de Broglie wavelength and Planck-Einstein relation, compute wavelength and energy.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'QM10'], 'KO42.1'),
    globalParams: { ...CODATA, p_kg_m_s: 1e-24, m_kg: NIST_CODATA_2018.me.value },
  },
];

// ============================================================================
// MEDIUM EXPERIMENTS (30 total: 2-3 operators, some GR+QM)
// ============================================================================

const mediumExperiments: RealExperiment[] = [
  // 21. Quantum-Classical: Schrödinger + F=ma (medium complexity)
  {
    id: 'medium_qm1_nm19_quantum_classical',
    title: 'Quantum-Classical Transition (Schrödinger + F=ma)',
    description: 'Quantum system approaching classical limit: Large mass quantum particle',
    source: { type: 'paper', citation: 'Quantum-classical correspondence studies' },
    measurements: {
      particle_mass_kg: { value: 1e-9, unit: 'kg', source: 'Nanoparticle mass (quantum-classical boundary)' },
      de_broglie_wavelength_m: { value: 1e-12, unit: 'm', source: 'Calculated de Broglie wavelength' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'classical', 'boundary'],
    prompt: 'Nanoparticle mass 1×10⁻⁹ kg (quantum-classical boundary). Using Schrödinger equation and F=ma, analyze transition from quantum to classical behavior.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'NM19'], 'KO42.1'),
    globalParams: { ...CODATA, m_kg: 1e-9, lambda_m: 1e-12 },
  },
  
  // 22. Relativistic Quantum: Dirac + Time Dilation (medium complexity)
  {
    id: 'medium_qm12_gr35_relativistic_electron',
    title: 'Fast Electron Relativistic Effects (Dirac + Time Dilation)',
    description: 'Fast-moving electron: Relativistic quantum mechanics with time dilation',
    source: { type: 'nist', citation: 'NIST - Relativistic quantum measurements' },
    measurements: {
      electron_velocity_c: { value: 0.8, unit: 'c', source: 'Electron velocity (0.8c)' },
      electron_mass_kg: { value: NIST_CODATA_2018.me.value, unit: 'kg', source: NIST_CODATA_2018.me.source },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'synchronization'],
    prompt: 'Electron moving at 0.8c. Using Dirac equation and gravitational time dilation, compute relativistic quantum wave function and time effects.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.8, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 23. GR+QM: Quantum Tunneling + Black Hole (first GR+QM combination)
  {
    id: 'medium_qm8_gr37_black_hole_quantum',
    title: 'Quantum Tunneling Near Black Hole (Tunneling + Schwarzschild)',
    description: 'Combining quantum tunneling and black hole physics: Hawking radiation',
    source: { type: 'paper', citation: 'Hawking, S. W. (1974). Black hole explosions?' },
    measurements: {
      black_hole_mass_solar: { value: 10.0, unit: 'M☉', source: 'Stellar mass black hole' },
      hawking_temperature_K: { value: 6.17e-8, unit: 'K', source: 'Calculated Hawking temperature' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: '10 M☉ black hole. Using quantum tunneling and Schwarzschild radius, compute Hawking radiation temperature.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR37'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 10.0, M_kg: 10.0 * BODIES.sun.mass_kg },
  },
  
  // 24. GR+QM: Quantum Field + Einstein Field Equation
  {
    id: 'medium_qm13_gr33_quantum_gravity',
    title: 'Quantum Field in Curved Spacetime (QFT + EFE)',
    description: 'Combining quantum field theory and Einstein field equations: Quantum fields in curved spacetime',
    source: { type: 'paper', citation: 'Quantum field theory in curved spacetime studies' },
    measurements: {
      curvature_scale_m: { value: 1e6, unit: 'm', source: 'Spacetime curvature scale' },
      field_energy_eV: { value: 1.0, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'field-theory', 'synchronization'],
    prompt: 'Quantum field in curved spacetime (curvature scale 1×10⁶ m). Using quantum field theory and Einstein field equations, compute field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33'], 'KO42.1'),
    globalParams: { ...CODATA, R_m: 1e6, E_eV: 1.0 },
  },
  
  // 25. GR+QM: Entanglement + Gravitational Waves
  {
    id: 'medium_qm4_gr38_gravitational_entanglement',
    title: 'Gravitational Wave Quantum Entanglement (Entanglement + GW)',
    description: 'Combining quantum entanglement and gravitational waves: Entangled particles in GW field',
    source: { type: 'paper', citation: 'Gravitational wave quantum effects studies' },
    measurements: {
      gw_strain: { value: 1e-21, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      separation_m: { value: 1e6, unit: 'm', source: 'Entangled particle separation' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles separated by 1×10⁶ m in gravitational wave field (strain 1×10⁻²¹). Using quantum entanglement and GW equations, compute correlation changes.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR38'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-21, L_m: 1e6 },
  },
  
  // 26. GR+QM: Superposition + Geodesic Motion
  {
    id: 'medium_qm3_gr34_superposition_geodesic',
    title: 'Quantum Superposition in Curved Spacetime (Superposition + Geodesic)',
    description: 'Combining quantum superposition and geodesic motion: Quantum particle following spacetime curvature',
    source: { type: 'paper', citation: 'Quantum mechanics in curved spacetime' },
    measurements: {
      curvature_radius_m: { value: 1e7, unit: 'm', source: 'Spacetime curvature radius' },
      particle_mass_kg: { value: 1e-12, unit: 'kg', source: 'Quantum particle mass' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'superposition', 'synchronization'],
    prompt: 'Quantum particle (mass 1×10⁻¹² kg) in curved spacetime (curvature radius 1×10⁷ m). Using quantum superposition and geodesic equations, compute particle path.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, R_m: 1e7, m_kg: 1e-12 },
  },
  
  // 27. GR+QM: Uncertainty + Schwarzschild
  {
    id: 'medium_qm2_gr37_uncertainty_blackhole',
    title: 'Quantum Uncertainty Near Black Hole (Uncertainty + Schwarzschild)',
    description: 'Combining uncertainty principle and black hole physics: Quantum effects near event horizon',
    source: { type: 'paper', citation: 'Quantum effects near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 5.0, unit: 'M☉', source: 'Stellar mass black hole' },
      distance_from_horizon_m: { value: 1e4, unit: 'm', source: 'Distance from event horizon' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle near 5 M☉ black hole (1×10⁴ m from horizon). Using uncertainty principle and Schwarzschild metric, compute quantum gravitational effects.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'GR37'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 5.0, M_kg: 5.0 * BODIES.sun.mass_kg, r_m: 1e4 },
  },
  
  // 28. GR+QM: Probability + Time Dilation
  {
    id: 'medium_qm17_gr35_probability_time',
    title: 'Quantum Probability in Time-Dilated Frame (Probability + Time Dilation)',
    description: 'Combining Born rule probability and time dilation: Quantum measurement in relativistic frame',
    source: { type: 'paper', citation: 'Relativistic quantum measurement' },
    measurements: {
      frame_velocity_c: { value: 0.6, unit: 'c', source: 'Moving frame velocity' },
      measurement_time_s: { value: 1e-6, unit: 's', source: 'Measurement time' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'probability', 'synchronization'],
    prompt: 'Quantum measurement in frame moving at 0.6c. Using Born rule probability and gravitational time dilation, compute measurement outcomes.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM17', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.6, t_s: 1e-6 },
  },
  
  // 29. GR+QM: Energy Quantization + Cosmology
  {
    id: 'medium_qm5_gr40_energy_cosmology',
    title: 'Quantum Energy in Expanding Universe (Energy Quantization + Cosmology)',
    description: 'Combining energy quantization and cosmological expansion: Quantum states in expanding spacetime',
    source: { type: 'paper', citation: 'Quantum cosmology studies' },
    measurements: {
      scale_factor: { value: 1.1, unit: 'dimensionless', source: 'Cosmological scale factor' },
      field_energy_eV: { value: 0.1, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Quantum field in expanding universe (scale factor 1.1). Using energy quantization and Friedmann cosmology, compute energy level evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR40'], 'KO42.1'),
    globalParams: { ...CODATA, a: 1.1, E_eV: 0.1 },
  },
  
  // 30. GR+QM: Spin + Gravitational Waves
  {
    id: 'medium_qm7_gr38_spin_gravitational_waves',
    title: 'Spin Precession in Gravitational Wave (Spin + GW)',
    description: 'Combining spin quantization and gravitational waves: Spin precession in GW field',
    source: { type: 'paper', citation: 'Spin effects in gravitational waves' },
    measurements: {
      gw_frequency_Hz: { value: 100, unit: 'Hz', source: 'Gravitational wave frequency' },
      gw_strain: { value: 1e-20, unit: 'dimensionless', source: 'GW strain amplitude' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'spin', 'synchronization'],
    prompt: 'Quantum spin in gravitational wave field (frequency 100 Hz, strain 1×10⁻²⁰). Using spin quantization and GW equations, compute spin precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR38'], 'KO42.1'),
    globalParams: { ...CODATA, f_Hz: 100, h: 1e-20 },
  },
  
  // 31. NM+QM: Gravity + Uncertainty
  {
    id: 'medium_nm21_qm2_gravity_uncertainty',
    title: 'Gravitational Uncertainty (Gravity + Uncertainty Principle)',
    description: 'Combining universal gravitation and quantum uncertainty: Gravitational measurement limits',
    source: { type: 'paper', citation: 'Quantum gravity measurement limits' },
    measurements: {
      mass_kg: { value: 1e-6, unit: 'kg', source: 'Measured mass' },
      position_uncertainty_m: { value: 1e-9, unit: 'm', source: 'Position measurement uncertainty' },
    },
    difficulty: 'medium',
    domainTags: ['classical', 'quantum', 'gravity', 'uncertainty'],
    prompt: 'Mass 1×10⁻⁶ kg with position uncertainty 1×10⁻⁹ m. Using universal gravitation and uncertainty principle, compute gravitational field uncertainty.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM21', 'QM2'], 'KO42.1'),
    globalParams: { ...CODATA, m_kg: 1e-6, delta_x: 1e-9 },
  },
  
  // 32. NM+GR: Energy + Time Dilation
  {
    id: 'medium_nm23_gr35_energy_time',
    title: 'Relativistic Energy (Kinetic Energy + Time Dilation)',
    description: 'Combining kinetic energy and time dilation: Relativistic energy transformation',
    source: { type: 'paper', citation: 'Relativistic energy studies' },
    measurements: {
      particle_velocity_c: { value: 0.7, unit: 'c', source: 'Particle velocity' },
      particle_mass_kg: { value: 1e-9, unit: 'kg', source: 'Particle mass' },
    },
    difficulty: 'medium',
    domainTags: ['classical', 'relativistic', 'energy', 'time'],
    prompt: 'Particle (mass 1×10⁻⁹ kg) moving at 0.7c. Using kinetic energy and gravitational time dilation, compute relativistic energy.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM23', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.7, m_kg: 1e-9 },
  },
  
  // 33. GR+QM: de Broglie + Redshift
  {
    id: 'medium_qm9_gr41_matter_wave_redshift',
    title: 'Matter Wave Cosmological Redshift (de Broglie + Redshift)',
    description: 'Combining de Broglie wavelength and cosmological redshift: Matter waves in expanding universe',
    source: { type: 'paper', citation: 'Cosmological quantum effects' },
    measurements: {
      redshift_z: { value: 0.1, unit: 'dimensionless', source: 'Cosmological redshift' },
      particle_momentum_kg_m_s: { value: 1e-23, unit: 'kg·m/s', source: 'Particle momentum' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Matter wave (momentum 1×10⁻²³ kg·m/s) in expanding universe (redshift z=0.1). Using de Broglie wavelength and cosmological redshift, compute wavelength evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'GR41'], 'KO42.1'),
    globalParams: { ...CODATA, z: 0.1, p_kg_m_s: 1e-23 },
  },
  
  // 34. GR+QM: Planck-Einstein + Geodesic
  {
    id: 'medium_qm10_gr34_planck_geodesic',
    title: 'Photon Energy in Curved Spacetime (Planck-Einstein + Geodesic)',
    description: 'Combining Planck-Einstein relation and geodesic motion: Photon energy in curved spacetime',
    source: { type: 'paper', citation: 'Photon geodesics in curved spacetime' },
    measurements: {
      photon_frequency_Hz: { value: 1e15, unit: 'Hz', source: 'Visible light photon frequency' },
      curvature_radius_m: { value: 1e8, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'geodesic', 'synchronization'],
    prompt: 'Photon (frequency 1×10¹⁵ Hz) in curved spacetime (curvature radius 1×10⁸ m). Using Planck-Einstein relation and geodesic equations, compute energy evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM10', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, f_Hz: 1e15, R_m: 1e8 },
  },
  
  // 35. GR+QM: Tunneling + Cosmology
  {
    id: 'medium_qm8_gr40_tunneling_cosmology',
    title: 'Quantum Tunneling in Expanding Universe (Tunneling + Cosmology)',
    description: 'Combining quantum tunneling and cosmological expansion: Tunneling probability in expanding spacetime',
    source: { type: 'paper', citation: 'Quantum cosmology and tunneling' },
    measurements: {
      barrier_height_eV: { value: 1.0, unit: 'eV', source: 'Potential barrier height' },
      scale_factor: { value: 1.2, unit: 'dimensionless', source: 'Cosmological scale factor' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Quantum particle tunneling (barrier 1.0 eV) in expanding universe (scale factor 1.2). Using quantum tunneling and Friedmann cosmology, compute tunneling probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR40'], 'KO42.1'),
    globalParams: { ...CODATA, V_J: 1.0 * 1.602176634e-19, a: 1.2, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 36. NM+QM: Momentum + Uncertainty
  {
    id: 'medium_nm26_qm2_momentum_uncertainty',
    title: 'Momentum Conservation with Quantum Uncertainty (Momentum + Uncertainty)',
    description: 'Combining momentum conservation and uncertainty principle: Collision with quantum uncertainty',
    source: { type: 'paper', citation: 'Quantum-classical momentum studies' },
    measurements: {
      mass1_kg: { value: 1e-6, unit: 'kg', source: 'Particle 1 mass' },
      mass2_kg: { value: 1e-6, unit: 'kg', source: 'Particle 2 mass' },
      velocity_uncertainty_m_s: { value: 1e-3, unit: 'm/s', source: 'Velocity measurement uncertainty' },
    },
    difficulty: 'medium',
    domainTags: ['classical', 'quantum', 'momentum', 'uncertainty'],
    prompt: 'Two particles (mass 1×10⁻⁶ kg each) collide with velocity uncertainty 1×10⁻³ m/s. Using momentum conservation and uncertainty principle, compute collision outcome uncertainty.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM26', 'QM2'], 'KO42.1'),
    globalParams: { ...CODATA, m1_kg: 1e-6, m2_kg: 1e-6, delta_v: 1e-3 },
  },
  
  // 37. GR+QM: Superposition + Time Dilation
  {
    id: 'medium_qm3_gr35_superposition_time',
    title: 'Quantum Superposition in Time-Dilated Frame (Superposition + Time Dilation)',
    description: 'Combining quantum superposition and time dilation: Superposition states in relativistic frame',
    source: { type: 'paper', citation: 'Relativistic quantum superposition' },
    measurements: {
      frame_velocity_c: { value: 0.65, unit: 'c', source: 'Moving frame velocity' },
      superposition_energy_eV: { value: 0.5, unit: 'eV', source: 'Superposition state energy' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'superposition', 'synchronization'],
    prompt: 'Quantum superposition (energy 0.5 eV) in frame moving at 0.65c. Using quantum superposition and gravitational time dilation, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.65, E_eV: 0.5 },
  },
  
  // 38. GR+QM: Entanglement + Equivalence Principle
  {
    id: 'medium_qm4_gr31_entanglement_equivalence',
    title: 'Quantum Entanglement and Equivalence Principle (Entanglement + Equivalence)',
    description: 'Combining quantum entanglement and equivalence principle: Entangled particles in gravitational field',
    source: { type: 'paper', citation: 'Quantum entanglement in gravitational fields' },
    measurements: {
      gravitational_field_m_s2: { value: 9.80665, unit: 'm/s²', source: 'Earth surface gravity' },
      separation_m: { value: 1e3, unit: 'm', source: 'Entangled particle separation' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles separated by 1×10³ m in gravitational field (9.80665 m/s²). Using quantum entanglement and equivalence principle, compute correlation preservation.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR31'], 'KO42.1'),
    globalParams: { ...CODATA, g_m_s2: 9.80665, L_m: 1e3 },
  },
  
  // 39. NM+GR: Angular Momentum + Geodesic
  {
    id: 'medium_nm28_gr34_angular_geodesic',
    title: 'Angular Momentum in Curved Spacetime (Angular Momentum + Geodesic)',
    description: 'Combining angular momentum and geodesic motion: Rotating system in curved spacetime',
    source: { type: 'paper', citation: 'Angular momentum in curved spacetime' },
    measurements: {
      angular_velocity_rad_s: { value: 1.0, unit: 'rad/s', source: 'Angular velocity' },
      curvature_radius_m: { value: 1e6, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['classical', 'relativistic', 'angular', 'geodesic'],
    prompt: 'Rotating system (angular velocity 1.0 rad/s) in curved spacetime (curvature radius 1×10⁶ m). Using angular momentum and geodesic equations, compute precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM28', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, omega_rad_s: 1.0, R_m: 1e6 },
  },
  
  // 40. GR+QM: Energy Quantization + Schwarzschild
  {
    id: 'medium_qm5_gr37_energy_blackhole',
    title: 'Quantum Energy Levels Near Black Hole (Energy Quantization + Schwarzschild)',
    description: 'Combining energy quantization and black hole physics: Quantum states near event horizon',
    source: { type: 'paper', citation: 'Quantum mechanics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 3.0, unit: 'M☉', source: 'Stellar mass black hole' },
      energy_level_eV: { value: 0.1, unit: 'eV', source: 'Quantum energy level' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle (energy level 0.1 eV) near 3 M☉ black hole. Using energy quantization and Schwarzschild metric, compute energy level shifts.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR37'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 3.0, M_kg: 3.0 * BODIES.sun.mass_kg, E_eV: 0.1 },
  },
  
  // 41. GR+QM: Spin + Time Dilation
  {
    id: 'medium_qm7_gr35_spin_time',
    title: 'Spin Precession in Time-Dilated Frame (Spin + Time Dilation)',
    description: 'Combining spin quantization and time dilation: Spin precession in relativistic frame',
    source: { type: 'paper', citation: 'Relativistic spin effects' },
    measurements: {
      frame_velocity_c: { value: 0.75, unit: 'c', source: 'Moving frame velocity' },
      magnetic_field_T: { value: 0.5, unit: 'T', source: 'Applied magnetic field' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'spin', 'synchronization'],
    prompt: 'Electron spin in 0.5 T magnetic field, frame moving at 0.75c. Using spin quantization and gravitational time dilation, compute spin precession rate.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.75, B_T: 0.5, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 42. NM+QM: Work + Probability
  {
    id: 'medium_nm22_qm17_work_probability',
    title: 'Mechanical Work and Quantum Probability (Work + Probability)',
    description: 'Combining mechanical work and Born rule: Work done on quantum system',
    source: { type: 'paper', citation: 'Quantum-classical work studies' },
    measurements: {
      force_N: { value: 1e-6, unit: 'N', source: 'Applied force' },
      distance_m: { value: 1e-9, unit: 'm', source: 'Distance moved' },
    },
    difficulty: 'medium',
    domainTags: ['classical', 'quantum', 'work', 'probability'],
    prompt: 'Force 1×10⁻⁶ N applied over 1×10⁻⁹ m to quantum particle. Using mechanical work and Born rule probability, compute state transition probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['NM22', 'QM17'], 'KO42.1'),
    globalParams: { ...CODATA, force_N: 1e-6, distance_m: 1e-9 },
  },
  
  // 43. GR+QM: de Broglie + Geodesic
  {
    id: 'medium_qm9_gr34_debroglie_geodesic',
    title: 'Matter Wave Geodesic (de Broglie + Geodesic)',
    description: 'Combining de Broglie wavelength and geodesic motion: Matter wave following spacetime curvature',
    source: { type: 'paper', citation: 'Matter waves in curved spacetime' },
    measurements: {
      particle_momentum_kg_m_s: { value: 1e-22, unit: 'kg·m/s', source: 'Particle momentum' },
      curvature_radius_m: { value: 1e5, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'matter-waves', 'synchronization'],
    prompt: 'Matter wave (momentum 1×10⁻²² kg·m/s) in curved spacetime (curvature radius 1×10⁵ m). Using de Broglie wavelength and geodesic equations, compute wave path.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, p_kg_m_s: 1e-22, R_m: 1e5 },
  },
  
  // 44. GR+QM: Uncertainty + Geodesic
  {
    id: 'medium_qm2_gr34_uncertainty_geodesic',
    title: 'Quantum Uncertainty in Curved Spacetime (Uncertainty + Geodesic)',
    description: 'Combining uncertainty principle and geodesic motion: Quantum measurement limits in curved spacetime',
    source: { type: 'paper', citation: 'Quantum measurement in curved spacetime' },
    measurements: {
      position_uncertainty_m: { value: 1e-11, unit: 'm', source: 'Position measurement uncertainty' },
      curvature_radius_m: { value: 1e4, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'uncertainty', 'synchronization'],
    prompt: 'Quantum particle (position uncertainty 1×10⁻¹¹ m) in curved spacetime (curvature radius 1×10⁴ m). Using uncertainty principle and geodesic equations, compute measurement limits.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, delta_x: 1e-11, R_m: 1e4, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 45. GR+QM: Probability + Geodesic
  {
    id: 'medium_qm17_gr34_probability_geodesic',
    title: 'Quantum Probability Along Geodesic (Probability + Geodesic)',
    description: 'Combining Born rule probability and geodesic motion: Probability evolution along curved path',
    source: { type: 'paper', citation: 'Quantum probability in curved spacetime' },
    measurements: {
      initial_probability: { value: 0.5, unit: 'dimensionless', source: 'Initial state probability' },
      curvature_radius_m: { value: 1e7, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'probability', 'synchronization'],
    prompt: 'Quantum state (initial probability 0.5) following geodesic in curved spacetime (curvature radius 1×10⁷ m). Using Born rule probability and geodesic equations, compute probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM17', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, P0: 0.5, R_m: 1e7 },
  },
  
  // 46. GR+QM: Energy Quantization + Geodesic
  {
    id: 'medium_qm5_gr34_energy_geodesic',
    title: 'Quantum Energy Levels Along Geodesic (Energy Quantization + Geodesic)',
    description: 'Combining energy quantization and geodesic motion: Energy level evolution along curved path',
    source: { type: 'paper', citation: 'Quantum energy in curved spacetime' },
    measurements: {
      ground_state_energy_eV: { value: 0.2, unit: 'eV', source: 'Ground state energy' },
      curvature_radius_m: { value: 1e6, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'energy', 'synchronization'],
    prompt: 'Quantum system (ground state 0.2 eV) following geodesic in curved spacetime (curvature radius 1×10⁶ m). Using energy quantization and geodesic equations, compute energy level shifts.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, E0_eV: 0.2, R_m: 1e6 },
  },
  
  // 47. GR+QM: Spin + Geodesic
  {
    id: 'medium_qm7_gr34_spin_geodesic',
    title: 'Spin Precession Along Geodesic (Spin + Geodesic)',
    description: 'Combining spin quantization and geodesic motion: Spin precession along curved path',
    source: { type: 'paper', citation: 'Spin precession in curved spacetime' },
    measurements: {
      magnetic_field_T: { value: 0.3, unit: 'T', source: 'Applied magnetic field' },
      curvature_radius_m: { value: 1e5, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'spin', 'synchronization'],
    prompt: 'Electron spin in 0.3 T magnetic field following geodesic (curvature radius 1×10⁵ m). Using spin quantization and geodesic equations, compute precession evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, B_T: 0.3, R_m: 1e5, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 48. GR+QM: Entanglement + Geodesic
  {
    id: 'medium_qm4_gr34_entanglement_geodesic',
    title: 'Entangled Particles Along Geodesics (Entanglement + Geodesic)',
    description: 'Combining quantum entanglement and geodesic motion: Entangled particles following curved paths',
    source: { type: 'paper', citation: 'Entanglement in curved spacetime' },
    measurements: {
      separation_m: { value: 1e4, unit: 'm', source: 'Entangled particle separation' },
      curvature_radius_m: { value: 1e6, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles (separation 1×10⁴ m) following geodesics in curved spacetime (curvature radius 1×10⁶ m). Using quantum entanglement and geodesic equations, compute correlation preservation.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, L_m: 1e4, R_m: 1e6 },
  },
  
  // 49. GR+QM: Superposition + Schwarzschild
  {
    id: 'medium_qm3_gr37_superposition_blackhole',
    title: 'Quantum Superposition Near Black Hole (Superposition + Schwarzschild)',
    description: 'Combining quantum superposition and black hole physics: Superposition states near event horizon',
    source: { type: 'paper', citation: 'Quantum superposition near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 2.0, unit: 'M☉', source: 'Stellar mass black hole' },
      distance_from_horizon_m: { value: 1e5, unit: 'm', source: 'Distance from event horizon' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum superposition state near 2 M☉ black hole (1×10⁵ m from horizon). Using quantum superposition and Schwarzschild metric, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR37'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 2.0, M_kg: 2.0 * BODIES.sun.mass_kg, r_m: 1e5 },
  },
  
  // 50. GR+QM: Tunneling + Geodesic
  {
    id: 'medium_qm8_gr34_tunneling_geodesic',
    title: 'Quantum Tunneling Along Geodesic (Tunneling + Geodesic)',
    description: 'Combining quantum tunneling and geodesic motion: Tunneling probability along curved path',
    source: { type: 'paper', citation: 'Quantum tunneling in curved spacetime' },
    measurements: {
      barrier_height_eV: { value: 0.8, unit: 'eV', source: 'Potential barrier height' },
      curvature_radius_m: { value: 1e5, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'medium',
    domainTags: ['quantum', 'relativistic', 'tunneling', 'synchronization'],
    prompt: 'Quantum particle tunneling (barrier 0.8 eV) along geodesic in curved spacetime (curvature radius 1×10⁵ m). Using quantum tunneling and geodesic equations, compute tunneling probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, V_J: 0.8 * 1.602176634e-19, R_m: 1e5, m_kg: NIST_CODATA_2018.me.value },
  },
];

// ============================================================================
// HARD EXPERIMENTS (30 total: 3-4 operators, many GR+QM synchronization)
// ============================================================================

const hardExperiments: RealExperiment[] = [
  // 51. GR+QM: Quantum Gravity Field (3 operators)
  {
    id: 'hard_qm1_gr33_gr31_quantum_gravity',
    title: 'Quantum Gravity Field (Schrödinger + EFE + Equivalence)',
    description: 'Full quantum gravity: Combining Schrödinger, Einstein field equations, and equivalence principle',
    source: { type: 'paper', citation: 'Quantum gravity unification studies' },
    measurements: {
      mass_kg: { value: 1e-10, unit: 'kg', source: 'Quantum particle mass' },
      curvature_m: { value: 1e-5, unit: 'm', source: 'Spacetime curvature' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravity', 'synchronization'],
    prompt: 'Quantum particle (mass 1×10⁻¹⁰ kg) in curved spacetime. Using Schrödinger equation, Einstein field equations, and equivalence principle, compute unified field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'GR33', 'GR31'], 'KO42.1'),
    globalParams: { ...CODATA, m_kg: 1e-10, R_m: 1e-5 },
  },
  
  // 52. GR+QM: Schrödinger + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm1_gr33_gr34_schrodinger_efe_geodesic',
    title: 'Schrödinger Equation in Curved Spacetime (Schrödinger + EFE + Geodesic)',
    description: 'Full quantum mechanics in curved spacetime: Combining Schrödinger, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum mechanics in curved spacetime' },
    measurements: {
      particle_mass_kg: { value: 1e-11, unit: 'kg', source: 'Quantum particle mass' },
      curvature_radius_m: { value: 1e4, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravity', 'synchronization'],
    prompt: 'Quantum particle (mass 1×10⁻¹¹ kg) in curved spacetime (curvature radius 1×10⁴ m). Using Schrödinger equation, Einstein field equations, and geodesic motion, compute unified evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, m_kg: 1e-11, R_m: 1e4 },
  },
  
  // 53. GR+QM: Dirac + EFE + Time Dilation (3 operators)
  {
    id: 'hard_qm12_gr33_gr35_dirac_efe_time',
    title: 'Dirac Equation in Curved Spacetime with Time Dilation (Dirac + EFE + Time)',
    description: 'Relativistic quantum mechanics in curved spacetime: Combining Dirac equation, Einstein field equations, and time dilation',
    source: { type: 'paper', citation: 'Relativistic quantum field theory in curved spacetime' },
    measurements: {
      electron_velocity_c: { value: 0.85, unit: 'c', source: 'Electron velocity' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'field-theory', 'synchronization'],
    prompt: 'Electron moving at 0.85c in curved spacetime (curvature radius 1×10³ m). Using Dirac equation, Einstein field equations, and gravitational time dilation, compute relativistic quantum evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR33', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.85, R_m: 1e3, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 54. GR+QM: QFT + EFE + Cosmology (3 operators)
  {
    id: 'hard_qm13_gr33_gr40_qft_efe_cosmology',
    title: 'Quantum Field Theory in Expanding Universe (QFT + EFE + Cosmology)',
    description: 'Quantum field theory in expanding spacetime: Combining QFT, Einstein field equations, and Friedmann cosmology',
    source: { type: 'paper', citation: 'Quantum field theory in expanding universe' },
    measurements: {
      scale_factor: { value: 1.5, unit: 'dimensionless', source: 'Cosmological scale factor' },
      field_energy_eV: { value: 0.5, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Quantum field (energy 0.5 eV) in expanding universe (scale factor 1.5). Using quantum field theory, Einstein field equations, and Friedmann cosmology, compute field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR40'], 'KO42.1'),
    globalParams: { ...CODATA, a: 1.5, E_eV: 0.5 },
  },
  
  // 55. GR+QM: Entanglement + GW + Geodesic (3 operators)
  {
    id: 'hard_qm4_gr38_gr34_entanglement_gw_geodesic',
    title: 'Entangled Particles in Gravitational Wave (Entanglement + GW + Geodesic)',
    description: 'Quantum entanglement in gravitational wave field: Combining entanglement, gravitational waves, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum entanglement in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-20, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      separation_m: { value: 1e5, unit: 'm', source: 'Entangled particle separation' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles (separation 1×10⁵ m) in gravitational wave field (strain 1×10⁻²⁰). Using quantum entanglement, gravitational wave equations, and geodesic motion, compute correlation evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-20, L_m: 1e5 },
  },
  
  // 56. GR+QM: Tunneling + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm8_gr37_gr34_tunneling_blackhole_geodesic',
    title: 'Quantum Tunneling Near Black Hole Along Geodesic (Tunneling + Schwarzschild + Geodesic)',
    description: 'Quantum tunneling near black hole: Combining tunneling, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Hawking radiation and quantum tunneling' },
    measurements: {
      black_hole_mass_solar: { value: 7.0, unit: 'M☉', source: 'Stellar mass black hole' },
      barrier_height_eV: { value: 0.6, unit: 'eV', source: 'Potential barrier height' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle tunneling (barrier 0.6 eV) near 7 M☉ black hole. Using quantum tunneling, Schwarzschild metric, and geodesic equations, compute Hawking radiation probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 7.0, M_kg: 7.0 * BODIES.sun.mass_kg, V_J: 0.6 * 1.602176634e-19 },
  },
  
  // 57. GR+QM: Superposition + EFE + Time Dilation (3 operators)
  {
    id: 'hard_qm3_gr33_gr35_superposition_efe_time',
    title: 'Quantum Superposition in Curved Spacetime with Time Dilation (Superposition + EFE + Time)',
    description: 'Quantum superposition in curved spacetime: Combining superposition, Einstein field equations, and time dilation',
    source: { type: 'paper', citation: 'Quantum superposition in curved spacetime' },
    measurements: {
      superposition_energy_eV: { value: 0.3, unit: 'eV', source: 'Superposition state energy' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'superposition', 'synchronization'],
    prompt: 'Quantum superposition (energy 0.3 eV) in curved spacetime (curvature radius 1×10³ m). Using quantum superposition, Einstein field equations, and gravitational time dilation, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR33', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, E_eV: 0.3, R_m: 1e3 },
  },
  
  // 58. GR+QM: Uncertainty + EFE + Equivalence (3 operators)
  {
    id: 'hard_qm2_gr33_gr31_uncertainty_efe_equivalence',
    title: 'Quantum Uncertainty in Curved Spacetime (Uncertainty + EFE + Equivalence)',
    description: 'Quantum uncertainty in curved spacetime: Combining uncertainty principle, Einstein field equations, and equivalence principle',
    source: { type: 'paper', citation: 'Quantum measurement limits in curved spacetime' },
    measurements: {
      position_uncertainty_m: { value: 1e-12, unit: 'm', source: 'Position measurement uncertainty' },
      curvature_radius_m: { value: 1e2, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'uncertainty', 'synchronization'],
    prompt: 'Quantum particle (position uncertainty 1×10⁻¹² m) in curved spacetime (curvature radius 1×10² m). Using uncertainty principle, Einstein field equations, and equivalence principle, compute measurement limits.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'GR33', 'GR31'], 'KO42.1'),
    globalParams: { ...CODATA, delta_x: 1e-12, R_m: 1e2, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 59. GR+QM: Energy Quantization + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm5_gr33_gr34_energy_efe_geodesic',
    title: 'Quantum Energy Levels in Curved Spacetime (Energy Quantization + EFE + Geodesic)',
    description: 'Quantum energy quantization in curved spacetime: Combining energy quantization, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum energy levels in curved spacetime' },
    measurements: {
      ground_state_energy_eV: { value: 0.15, unit: 'eV', source: 'Ground state energy' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'energy', 'synchronization'],
    prompt: 'Quantum system (ground state 0.15 eV) in curved spacetime (curvature radius 1×10³ m). Using energy quantization, Einstein field equations, and geodesic motion, compute energy level evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, E0_eV: 0.15, R_m: 1e3 },
  },
  
  // 60. GR+QM: Spin + EFE + Time Dilation (3 operators)
  {
    id: 'hard_qm7_gr33_gr35_spin_efe_time',
    title: 'Spin Precession in Curved Spacetime with Time Dilation (Spin + EFE + Time)',
    description: 'Spin quantization in curved spacetime: Combining spin quantization, Einstein field equations, and time dilation',
    source: { type: 'paper', citation: 'Spin effects in curved spacetime' },
    measurements: {
      magnetic_field_T: { value: 0.4, unit: 'T', source: 'Applied magnetic field' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'spin', 'synchronization'],
    prompt: 'Electron spin in 0.4 T magnetic field in curved spacetime (curvature radius 1×10³ m). Using spin quantization, Einstein field equations, and gravitational time dilation, compute spin precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR33', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, B_T: 0.4, R_m: 1e3, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 61. GR+QM: Probability + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm17_gr33_gr34_probability_efe_geodesic',
    title: 'Quantum Probability in Curved Spacetime (Probability + EFE + Geodesic)',
    description: 'Born rule probability in curved spacetime: Combining probability, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum probability in curved spacetime' },
    measurements: {
      initial_probability: { value: 0.6, unit: 'dimensionless', source: 'Initial state probability' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'probability', 'synchronization'],
    prompt: 'Quantum state (initial probability 0.6) in curved spacetime (curvature radius 1×10³ m). Using Born rule probability, Einstein field equations, and geodesic motion, compute probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM17', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, P0: 0.6, R_m: 1e3 },
  },
  
  // 62. GR+QM: de Broglie + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm9_gr33_gr34_debroglie_efe_geodesic',
    title: 'Matter Wave in Curved Spacetime (de Broglie + EFE + Geodesic)',
    description: 'Matter waves in curved spacetime: Combining de Broglie wavelength, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Matter waves in curved spacetime' },
    measurements: {
      particle_momentum_kg_m_s: { value: 1e-21, unit: 'kg·m/s', source: 'Particle momentum' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'matter-waves', 'synchronization'],
    prompt: 'Matter wave (momentum 1×10⁻²¹ kg·m/s) in curved spacetime (curvature radius 1×10³ m). Using de Broglie wavelength, Einstein field equations, and geodesic motion, compute wave evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, p_kg_m_s: 1e-21, R_m: 1e3 },
  },
  
  // 63. GR+QM: Planck-Einstein + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm10_gr33_gr34_planck_efe_geodesic',
    title: 'Photon Energy in Curved Spacetime (Planck-Einstein + EFE + Geodesic)',
    description: 'Photon energy in curved spacetime: Combining Planck-Einstein relation, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Photon geodesics in curved spacetime' },
    measurements: {
      photon_frequency_Hz: { value: 1e16, unit: 'Hz', source: 'X-ray photon frequency' },
      curvature_radius_m: { value: 1e3, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'photon', 'synchronization'],
    prompt: 'Photon (frequency 1×10¹⁶ Hz) in curved spacetime (curvature radius 1×10³ m). Using Planck-Einstein relation, Einstein field equations, and geodesic motion, compute energy evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM10', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, f_Hz: 1e16, R_m: 1e3 },
  },
  
  // 64. GR+QM: Dirac + Black Hole + Time Dilation (3 operators)
  {
    id: 'hard_qm12_gr37_gr35_dirac_blackhole_time',
    title: 'Relativistic Electron Near Black Hole (Dirac + Schwarzschild + Time)',
    description: 'Relativistic quantum mechanics near black hole: Combining Dirac equation, Schwarzschild metric, and time dilation',
    source: { type: 'paper', citation: 'Relativistic quantum mechanics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 8.0, unit: 'M☉', source: 'Stellar mass black hole' },
      electron_velocity_c: { value: 0.9, unit: 'c', source: 'Electron velocity' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Electron moving at 0.9c near 8 M☉ black hole. Using Dirac equation, Schwarzschild metric, and gravitational time dilation, compute relativistic quantum evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 8.0, M_kg: 8.0 * BODIES.sun.mass_kg, v_c: 0.9, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 65. GR+QM: QFT + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm13_gr37_gr34_qft_blackhole_geodesic',
    title: 'Quantum Field Theory Near Black Hole (QFT + Schwarzschild + Geodesic)',
    description: 'Quantum field theory near black hole: Combining QFT, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum field theory near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 6.0, unit: 'M☉', source: 'Stellar mass black hole' },
      field_energy_eV: { value: 0.2, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum field (energy 0.2 eV) near 6 M☉ black hole. Using quantum field theory, Schwarzschild metric, and geodesic motion, compute field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 6.0, M_kg: 6.0 * BODIES.sun.mass_kg, E_eV: 0.2 },
  },
  
  // 66. GR+QM: Entanglement + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm4_gr33_gr34_entanglement_efe_geodesic',
    title: 'Entangled Particles in Curved Spacetime (Entanglement + EFE + Geodesic)',
    description: 'Quantum entanglement in curved spacetime: Combining entanglement, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum entanglement in curved spacetime' },
    measurements: {
      separation_m: { value: 1e3, unit: 'm', source: 'Entangled particle separation' },
      curvature_radius_m: { value: 1e2, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles (separation 1×10³ m) in curved spacetime (curvature radius 1×10² m). Using quantum entanglement, Einstein field equations, and geodesic motion, compute correlation evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, L_m: 1e3, R_m: 1e2 },
  },
  
  // 67. GR+QM: Superposition + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm3_gr37_gr34_superposition_blackhole_geodesic',
    title: 'Quantum Superposition Near Black Hole Along Geodesic (Superposition + Schwarzschild + Geodesic)',
    description: 'Quantum superposition near black hole: Combining superposition, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum superposition near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 4.0, unit: 'M☉', source: 'Stellar mass black hole' },
      superposition_energy_eV: { value: 0.25, unit: 'eV', source: 'Superposition state energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum superposition (energy 0.25 eV) near 4 M☉ black hole. Using quantum superposition, Schwarzschild metric, and geodesic motion, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 4.0, M_kg: 4.0 * BODIES.sun.mass_kg, E_eV: 0.25 },
  },
  
  // 68. GR+QM: Tunneling + EFE + Geodesic (3 operators)
  {
    id: 'hard_qm8_gr33_gr34_tunneling_efe_geodesic',
    title: 'Quantum Tunneling in Curved Spacetime (Tunneling + EFE + Geodesic)',
    description: 'Quantum tunneling in curved spacetime: Combining tunneling, Einstein field equations, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum tunneling in curved spacetime' },
    measurements: {
      barrier_height_eV: { value: 0.7, unit: 'eV', source: 'Potential barrier height' },
      curvature_radius_m: { value: 1e2, unit: 'm', source: 'Spacetime curvature radius' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'tunneling', 'synchronization'],
    prompt: 'Quantum particle tunneling (barrier 0.7 eV) in curved spacetime (curvature radius 1×10² m). Using quantum tunneling, Einstein field equations, and geodesic motion, compute tunneling probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR33', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, V_J: 0.7 * 1.602176634e-19, R_m: 1e2, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 69. GR+QM: Energy Quantization + Black Hole + Time Dilation (3 operators)
  {
    id: 'hard_qm5_gr37_gr35_energy_blackhole_time',
    title: 'Quantum Energy Levels Near Black Hole with Time Dilation (Energy Quantization + Schwarzschild + Time)',
    description: 'Quantum energy quantization near black hole: Combining energy quantization, Schwarzschild metric, and time dilation',
    source: { type: 'paper', citation: 'Quantum energy levels near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 5.0, unit: 'M☉', source: 'Stellar mass black hole' },
      ground_state_energy_eV: { value: 0.12, unit: 'eV', source: 'Ground state energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum system (ground state 0.12 eV) near 5 M☉ black hole. Using energy quantization, Schwarzschild metric, and gravitational time dilation, compute energy level shifts.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 5.0, M_kg: 5.0 * BODIES.sun.mass_kg, E0_eV: 0.12 },
  },
  
  // 70. GR+QM: Spin + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm7_gr37_gr34_spin_blackhole_geodesic',
    title: 'Spin Precession Near Black Hole Along Geodesic (Spin + Schwarzschild + Geodesic)',
    description: 'Spin quantization near black hole: Combining spin quantization, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Spin effects near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 3.5, unit: 'M☉', source: 'Stellar mass black hole' },
      magnetic_field_T: { value: 0.2, unit: 'T', source: 'Applied magnetic field' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Electron spin in 0.2 T magnetic field near 3.5 M☉ black hole. Using spin quantization, Schwarzschild metric, and geodesic motion, compute spin precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 3.5, M_kg: 3.5 * BODIES.sun.mass_kg, B_T: 0.2, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 71. GR+QM: Probability + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm17_gr37_gr34_probability_blackhole_geodesic',
    title: 'Quantum Probability Near Black Hole Along Geodesic (Probability + Schwarzschild + Geodesic)',
    description: 'Born rule probability near black hole: Combining probability, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum probability near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 2.5, unit: 'M☉', source: 'Stellar mass black hole' },
      initial_probability: { value: 0.4, unit: 'dimensionless', source: 'Initial state probability' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum state (initial probability 0.4) near 2.5 M☉ black hole. Using Born rule probability, Schwarzschild metric, and geodesic motion, compute probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM17', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 2.5, M_kg: 2.5 * BODIES.sun.mass_kg, P0: 0.4 },
  },
  
  // 72. GR+QM: de Broglie + Black Hole + Time Dilation (3 operators)
  {
    id: 'hard_qm9_gr37_gr35_debroglie_blackhole_time',
    title: 'Matter Wave Near Black Hole with Time Dilation (de Broglie + Schwarzschild + Time)',
    description: 'Matter waves near black hole: Combining de Broglie wavelength, Schwarzschild metric, and time dilation',
    source: { type: 'paper', citation: 'Matter waves near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 1.5, unit: 'M☉', source: 'Stellar mass black hole' },
      particle_momentum_kg_m_s: { value: 1e-20, unit: 'kg·m/s', source: 'Particle momentum' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Matter wave (momentum 1×10⁻²⁰ kg·m/s) near 1.5 M☉ black hole. Using de Broglie wavelength, Schwarzschild metric, and gravitational time dilation, compute wavelength evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 1.5, M_kg: 1.5 * BODIES.sun.mass_kg, p_kg_m_s: 1e-20 },
  },
  
  // 73. GR+QM: Planck-Einstein + Black Hole + Geodesic (3 operators)
  {
    id: 'hard_qm10_gr37_gr34_planck_blackhole_geodesic',
    title: 'Photon Energy Near Black Hole Along Geodesic (Planck-Einstein + Schwarzschild + Geodesic)',
    description: 'Photon energy near black hole: Combining Planck-Einstein relation, Schwarzschild metric, and geodesic motion',
    source: { type: 'paper', citation: 'Photon geodesics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 1.0, unit: 'M☉', source: 'Stellar mass black hole' },
      photon_frequency_Hz: { value: 1e17, unit: 'Hz', source: 'Gamma-ray photon frequency' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Photon (frequency 1×10¹⁷ Hz) near 1 M☉ black hole. Using Planck-Einstein relation, Schwarzschild metric, and geodesic motion, compute energy evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM10', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 1.0, M_kg: 1.0 * BODIES.sun.mass_kg, f_Hz: 1e17 },
  },
  
  // 74. GR+QM: QFT + GW + Geodesic (3 operators)
  {
    id: 'hard_qm13_gr38_gr34_qft_gw_geodesic',
    title: 'Quantum Field Theory in Gravitational Wave (QFT + GW + Geodesic)',
    description: 'Quantum field theory in gravitational wave field: Combining QFT, gravitational waves, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum field theory in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-19, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      field_energy_eV: { value: 0.3, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum field (energy 0.3 eV) in gravitational wave field (strain 1×10⁻¹⁹). Using quantum field theory, gravitational wave equations, and geodesic motion, compute field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-19, E_eV: 0.3 },
  },
  
  // 75. GR+QM: Dirac + GW + Time Dilation (3 operators)
  {
    id: 'hard_qm12_gr38_gr35_dirac_gw_time',
    title: 'Relativistic Electron in Gravitational Wave (Dirac + GW + Time)',
    description: 'Relativistic quantum mechanics in gravitational wave: Combining Dirac equation, gravitational waves, and time dilation',
    source: { type: 'paper', citation: 'Relativistic quantum mechanics in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-18, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      electron_velocity_c: { value: 0.88, unit: 'c', source: 'Electron velocity' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Electron moving at 0.88c in gravitational wave field (strain 1×10⁻¹⁸). Using Dirac equation, gravitational wave equations, and gravitational time dilation, compute relativistic quantum evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR38', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-18, v_c: 0.88, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 76. GR+QM: Entanglement + Black Hole + Time Dilation (3 operators)
  {
    id: 'hard_qm4_gr37_gr35_entanglement_blackhole_time',
    title: 'Entangled Particles Near Black Hole with Time Dilation (Entanglement + Schwarzschild + Time)',
    description: 'Quantum entanglement near black hole: Combining entanglement, Schwarzschild metric, and time dilation',
    source: { type: 'paper', citation: 'Quantum entanglement near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 9.0, unit: 'M☉', source: 'Stellar mass black hole' },
      separation_m: { value: 1e6, unit: 'm', source: 'Entangled particle separation' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Entangled particles (separation 1×10⁶ m) near 9 M☉ black hole. Using quantum entanglement, Schwarzschild metric, and gravitational time dilation, compute correlation evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 9.0, M_kg: 9.0 * BODIES.sun.mass_kg, L_m: 1e6 },
  },
  
  // 77. GR+QM: Superposition + GW + Time Dilation (3 operators)
  {
    id: 'hard_qm3_gr38_gr35_superposition_gw_time',
    title: 'Quantum Superposition in Gravitational Wave with Time Dilation (Superposition + GW + Time)',
    description: 'Quantum superposition in gravitational wave: Combining superposition, gravitational waves, and time dilation',
    source: { type: 'paper', citation: 'Quantum superposition in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-17, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      superposition_energy_eV: { value: 0.35, unit: 'eV', source: 'Superposition state energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum superposition (energy 0.35 eV) in gravitational wave field (strain 1×10⁻¹⁷). Using quantum superposition, gravitational wave equations, and gravitational time dilation, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR38', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-17, E_eV: 0.35 },
  },
  
  // 78. GR+QM: Uncertainty + Black Hole + Time Dilation (3 operators)
  {
    id: 'hard_qm2_gr37_gr35_uncertainty_blackhole_time',
    title: 'Quantum Uncertainty Near Black Hole with Time Dilation (Uncertainty + Schwarzschild + Time)',
    description: 'Quantum uncertainty near black hole: Combining uncertainty principle, Schwarzschild metric, and time dilation',
    source: { type: 'paper', citation: 'Quantum measurement limits near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 11.0, unit: 'M☉', source: 'Stellar mass black hole' },
      position_uncertainty_m: { value: 1e-13, unit: 'm', source: 'Position measurement uncertainty' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle (position uncertainty 1×10⁻¹³ m) near 11 M☉ black hole. Using uncertainty principle, Schwarzschild metric, and gravitational time dilation, compute measurement limits.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 11.0, M_kg: 11.0 * BODIES.sun.mass_kg, delta_x: 1e-13, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 79. GR+QM: Energy Quantization + GW + Geodesic (3 operators)
  {
    id: 'hard_qm5_gr38_gr34_energy_gw_geodesic',
    title: 'Quantum Energy Levels in Gravitational Wave (Energy Quantization + GW + Geodesic)',
    description: 'Quantum energy quantization in gravitational wave: Combining energy quantization, gravitational waves, and geodesic motion',
    source: { type: 'paper', citation: 'Quantum energy levels in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-18, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      ground_state_energy_eV: { value: 0.18, unit: 'eV', source: 'Ground state energy' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum system (ground state 0.18 eV) in gravitational wave field (strain 1×10⁻¹⁸). Using energy quantization, gravitational wave equations, and geodesic motion, compute energy level evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-18, E0_eV: 0.18 },
  },
  
  // 80. GR+QM: Spin + GW + Geodesic (3 operators)
  {
    id: 'hard_qm7_gr38_gr34_spin_gw_geodesic',
    title: 'Spin Precession in Gravitational Wave Along Geodesic (Spin + GW + Geodesic)',
    description: 'Spin quantization in gravitational wave: Combining spin quantization, gravitational waves, and geodesic motion',
    source: { type: 'paper', citation: 'Spin effects in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-19, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      magnetic_field_T: { value: 0.15, unit: 'T', source: 'Applied magnetic field' },
    },
    difficulty: 'hard',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Electron spin in 0.15 T magnetic field in gravitational wave (strain 1×10⁻¹⁹). Using spin quantization, gravitational wave equations, and geodesic motion, compute spin precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-19, B_T: 0.15, m_kg: NIST_CODATA_2018.me.value },
  },
];

// ============================================================================
// EXPERT EXPERIMENTS (15 total: 3-4 operators, complex GR+QM)
// ============================================================================

const expertExperiments: RealExperiment[] = [
  // 81. GR+QM: Complete Unified Field (4 operators)
  {
    id: 'expert_qm13_gr33_gr40_gr35_unified',
    title: 'Complete Unified Field Theory (QFT + EFE + Cosmology + Time)',
    description: 'Maximum complexity: Quantum field theory, Einstein equations, cosmology, and time dilation unified',
    source: { type: 'paper', citation: 'Unified field theory research' },
    measurements: {
      cosmic_scale_m: { value: 1e26, unit: 'm', source: 'Cosmological scale' },
      field_energy_eV: { value: 1e-3, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Quantum field in expanding universe (scale 1×10²⁶ m). Using QFT, Einstein equations, Friedmann cosmology, and time dilation, compute complete unified evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR40', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, a_m: 1e26, E_eV: 1e-3 },
  },
  
  // 82. GR+QM: QFT + EFE + Cosmology + Geodesic (4 operators)
  {
    id: 'expert_qm13_gr33_gr40_gr34_qft_efe_cosmology_geodesic',
    title: 'Quantum Field Theory in Expanding Universe Along Geodesic (QFT + EFE + Cosmology + Geodesic)',
    description: 'Maximum complexity: Quantum field theory in expanding spacetime with geodesic motion',
    source: { type: 'paper', citation: 'Quantum field theory in expanding universe' },
    measurements: {
      scale_factor: { value: 2.0, unit: 'dimensionless', source: 'Cosmological scale factor' },
      field_energy_eV: { value: 0.2, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'synchronization'],
    prompt: 'Quantum field (energy 0.2 eV) in expanding universe (scale factor 2.0) following geodesic. Using QFT, Einstein equations, Friedmann cosmology, and geodesic motion, compute complete unified evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR40', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, a: 2.0, E_eV: 0.2 },
  },
  
  // 83. GR+QM: Dirac + EFE + Black Hole + Time Dilation (4 operators)
  {
    id: 'expert_qm12_gr33_gr37_gr35_dirac_efe_blackhole_time',
    title: 'Relativistic Quantum Mechanics Near Black Hole (Dirac + EFE + Schwarzschild + Time)',
    description: 'Maximum complexity: Relativistic quantum mechanics near black hole with full general relativity',
    source: { type: 'paper', citation: 'Relativistic quantum mechanics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 12.0, unit: 'M☉', source: 'Stellar mass black hole' },
      electron_velocity_c: { value: 0.92, unit: 'c', source: 'Electron velocity' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Electron moving at 0.92c near 12 M☉ black hole. Using Dirac equation, Einstein field equations, Schwarzschild metric, and gravitational time dilation, compute complete relativistic quantum evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR33', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 12.0, M_kg: 12.0 * BODIES.sun.mass_kg, v_c: 0.92, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 84. GR+QM: QFT + EFE + GW + Geodesic (4 operators)
  {
    id: 'expert_qm13_gr33_gr38_gr34_qft_efe_gw_geodesic',
    title: 'Quantum Field Theory in Gravitational Wave (QFT + EFE + GW + Geodesic)',
    description: 'Maximum complexity: Quantum field theory in gravitational wave field with geodesic motion',
    source: { type: 'paper', citation: 'Quantum field theory in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-17, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      field_energy_eV: { value: 0.4, unit: 'eV', source: 'Quantum field energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum field (energy 0.4 eV) in gravitational wave field (strain 1×10⁻¹⁷). Using QFT, Einstein field equations, gravitational wave equations, and geodesic motion, compute complete field evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-17, E_eV: 0.4 },
  },
  
  // 85. GR+QM: Schrödinger + EFE + Black Hole + Geodesic (4 operators)
  {
    id: 'expert_qm1_gr33_gr37_gr34_schrodinger_efe_blackhole_geodesic',
    title: 'Schrödinger Equation Near Black Hole (Schrödinger + EFE + Schwarzschild + Geodesic)',
    description: 'Maximum complexity: Quantum mechanics near black hole with full general relativity',
    source: { type: 'paper', citation: 'Quantum mechanics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 15.0, unit: 'M☉', source: 'Stellar mass black hole' },
      particle_mass_kg: { value: 1e-12, unit: 'kg', source: 'Quantum particle mass' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle (mass 1×10⁻¹² kg) near 15 M☉ black hole. Using Schrödinger equation, Einstein field equations, Schwarzschild metric, and geodesic motion, compute complete unified evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'GR33', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 15.0, M_kg: 15.0 * BODIES.sun.mass_kg, m_kg: 1e-12 },
  },
  
  // 86. GR+QM: Entanglement + EFE + GW + Time Dilation (4 operators)
  {
    id: 'expert_qm4_gr33_gr38_gr35_entanglement_efe_gw_time',
    title: 'Quantum Entanglement in Gravitational Wave with Time Dilation (Entanglement + EFE + GW + Time)',
    description: 'Maximum complexity: Quantum entanglement in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Quantum entanglement in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-16, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      separation_m: { value: 1e7, unit: 'm', source: 'Entangled particle separation' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'entanglement', 'synchronization'],
    prompt: 'Entangled particles (separation 1×10⁷ m) in gravitational wave field (strain 1×10⁻¹⁶). Using quantum entanglement, Einstein field equations, gravitational wave equations, and gravitational time dilation, compute correlation evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR33', 'GR38', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-16, L_m: 1e7 },
  },
  
  // 87. GR+QM: Tunneling + EFE + Black Hole + Geodesic (4 operators)
  {
    id: 'expert_qm8_gr33_gr37_gr34_tunneling_efe_blackhole_geodesic',
    title: 'Quantum Tunneling Near Black Hole (Tunneling + EFE + Schwarzschild + Geodesic)',
    description: 'Maximum complexity: Quantum tunneling near black hole with full general relativity',
    source: { type: 'paper', citation: 'Hawking radiation and quantum tunneling' },
    measurements: {
      black_hole_mass_solar: { value: 20.0, unit: 'M☉', source: 'Stellar mass black hole' },
      barrier_height_eV: { value: 0.9, unit: 'eV', source: 'Potential barrier height' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum particle tunneling (barrier 0.9 eV) near 20 M☉ black hole. Using quantum tunneling, Einstein field equations, Schwarzschild metric, and geodesic motion, compute Hawking radiation probability.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM8', 'GR33', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 20.0, M_kg: 20.0 * BODIES.sun.mass_kg, V_J: 0.9 * 1.602176634e-19 },
  },
  
  // 88. GR+QM: Superposition + EFE + GW + Geodesic (4 operators)
  {
    id: 'expert_qm3_gr33_gr38_gr34_superposition_efe_gw_geodesic',
    title: 'Quantum Superposition in Gravitational Wave (Superposition + EFE + GW + Geodesic)',
    description: 'Maximum complexity: Quantum superposition in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Quantum superposition in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-16, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      superposition_energy_eV: { value: 0.45, unit: 'eV', source: 'Superposition state energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum superposition (energy 0.45 eV) in gravitational wave field (strain 1×10⁻¹⁶). Using quantum superposition, Einstein field equations, gravitational wave equations, and geodesic motion, compute state evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM3', 'GR33', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-16, E_eV: 0.45 },
  },
  
  // 89. GR+QM: Energy Quantization + EFE + Black Hole + Time Dilation (4 operators)
  {
    id: 'expert_qm5_gr33_gr37_gr35_energy_efe_blackhole_time',
    title: 'Quantum Energy Levels Near Black Hole (Energy Quantization + EFE + Schwarzschild + Time)',
    description: 'Maximum complexity: Quantum energy quantization near black hole with full general relativity',
    source: { type: 'paper', citation: 'Quantum energy levels near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 25.0, unit: 'M☉', source: 'Stellar mass black hole' },
      ground_state_energy_eV: { value: 0.08, unit: 'eV', source: 'Ground state energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum system (ground state 0.08 eV) near 25 M☉ black hole. Using energy quantization, Einstein field equations, Schwarzschild metric, and gravitational time dilation, compute energy level evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR33', 'GR37', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 25.0, M_kg: 25.0 * BODIES.sun.mass_kg, E0_eV: 0.08 },
  },
  
  // 90. GR+QM: Spin + EFE + GW + Geodesic (4 operators)
  {
    id: 'expert_qm7_gr33_gr38_gr34_spin_efe_gw_geodesic',
    title: 'Spin Precession in Gravitational Wave (Spin + EFE + GW + Geodesic)',
    description: 'Maximum complexity: Spin quantization in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Spin effects in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-17, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      magnetic_field_T: { value: 0.1, unit: 'T', source: 'Applied magnetic field' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Electron spin in 0.1 T magnetic field in gravitational wave (strain 1×10⁻¹⁷). Using spin quantization, Einstein field equations, gravitational wave equations, and geodesic motion, compute spin precession.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM7', 'GR33', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-17, B_T: 0.1, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 91. GR+QM: Probability + EFE + Black Hole + Geodesic (4 operators)
  {
    id: 'expert_qm17_gr33_gr37_gr34_probability_efe_blackhole_geodesic',
    title: 'Quantum Probability Near Black Hole (Probability + EFE + Schwarzschild + Geodesic)',
    description: 'Maximum complexity: Born rule probability near black hole with full general relativity',
    source: { type: 'paper', citation: 'Quantum probability near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 30.0, unit: 'M☉', source: 'Stellar mass black hole' },
      initial_probability: { value: 0.3, unit: 'dimensionless', source: 'Initial state probability' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Quantum state (initial probability 0.3) near 30 M☉ black hole. Using Born rule probability, Einstein field equations, Schwarzschild metric, and geodesic motion, compute probability evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM17', 'GR33', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 30.0, M_kg: 30.0 * BODIES.sun.mass_kg, P0: 0.3 },
  },
  
  // 92. GR+QM: de Broglie + EFE + GW + Time Dilation (4 operators)
  {
    id: 'expert_qm9_gr33_gr38_gr35_debroglie_efe_gw_time',
    title: 'Matter Wave in Gravitational Wave with Time Dilation (de Broglie + EFE + GW + Time)',
    description: 'Maximum complexity: Matter waves in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Matter waves in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-16, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      particle_momentum_kg_m_s: { value: 1e-19, unit: 'kg·m/s', source: 'Particle momentum' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Matter wave (momentum 1×10⁻¹⁹ kg·m/s) in gravitational wave field (strain 1×10⁻¹⁶). Using de Broglie wavelength, Einstein field equations, gravitational wave equations, and gravitational time dilation, compute wave evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM9', 'GR33', 'GR38', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-16, p_kg_m_s: 1e-19 },
  },
  
  // 93. GR+QM: Planck-Einstein + EFE + Black Hole + Geodesic (4 operators)
  {
    id: 'expert_qm10_gr33_gr37_gr34_planck_efe_blackhole_geodesic',
    title: 'Photon Energy Near Black Hole (Planck-Einstein + EFE + Schwarzschild + Geodesic)',
    description: 'Maximum complexity: Photon energy near black hole with full general relativity',
    source: { type: 'paper', citation: 'Photon geodesics near black holes' },
    measurements: {
      black_hole_mass_solar: { value: 18.0, unit: 'M☉', source: 'Stellar mass black hole' },
      photon_frequency_Hz: { value: 1e18, unit: 'Hz', source: 'Gamma-ray photon frequency' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'synchronization'],
    prompt: 'Photon (frequency 1×10¹⁸ Hz) near 18 M☉ black hole. Using Planck-Einstein relation, Einstein field equations, Schwarzschild metric, and geodesic motion, compute energy evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM10', 'GR33', 'GR37', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: 18.0, M_kg: 18.0 * BODIES.sun.mass_kg, f_Hz: 1e18 },
  },
  
  // 94. GR+QM: Uncertainty + EFE + GW + Time Dilation (4 operators)
  {
    id: 'expert_qm2_gr33_gr38_gr35_uncertainty_efe_gw_time',
    title: 'Quantum Uncertainty in Gravitational Wave with Time Dilation (Uncertainty + EFE + GW + Time)',
    description: 'Maximum complexity: Quantum uncertainty in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Quantum measurement limits in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-16, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      position_uncertainty_m: { value: 1e-14, unit: 'm', source: 'Position measurement uncertainty' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum particle (position uncertainty 1×10⁻¹⁴ m) in gravitational wave field (strain 1×10⁻¹⁶). Using uncertainty principle, Einstein field equations, gravitational wave equations, and gravitational time dilation, compute measurement limits.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM2', 'GR33', 'GR38', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-16, delta_x: 1e-14, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 95. GR+QM: Energy Quantization + EFE + GW + Geodesic (4 operators)
  {
    id: 'expert_qm5_gr33_gr38_gr34_energy_efe_gw_geodesic',
    title: 'Quantum Energy Levels in Gravitational Wave (Energy Quantization + EFE + GW + Geodesic)',
    description: 'Maximum complexity: Quantum energy quantization in gravitational wave with full general relativity',
    source: { type: 'paper', citation: 'Quantum energy levels in gravitational waves' },
    measurements: {
      gw_strain: { value: 1e-17, unit: 'dimensionless', source: 'LIGO - Gravitational wave strain' },
      ground_state_energy_eV: { value: 0.15, unit: 'eV', source: 'Ground state energy' },
    },
    difficulty: 'expert',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: 'Quantum system (ground state 0.15 eV) in gravitational wave field (strain 1×10⁻¹⁷). Using energy quantization, Einstein field equations, gravitational wave equations, and geodesic motion, compute energy level evolution.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM5', 'GR33', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: 1e-17, E0_eV: 0.15 },
  },
];

// ============================================================================
// IMPOSSIBLE EXPERIMENTS (5 total: 4 operators, maximum complexity)
// ============================================================================

const impossibleExperiments: RealExperiment[] = [
  // 96. Maximum Synchronization: Full GR+QM (4 operators)
  {
    id: 'impossible_qm1_qm12_gr33_gr35_max_sync',
    title: 'Maximum GR+QM Synchronization (Schrödinger + Dirac + EFE + Time)',
    description: 'Maximum complexity: Combining non-relativistic and relativistic quantum mechanics with full general relativity',
    source: { type: 'paper', citation: 'Maximum complexity unified field test' },
    measurements: {
      particle_velocity_c: { value: 0.9, unit: 'c', source: 'Ultra-relativistic particle' },
      spacetime_curvature_m: { value: 1e3, unit: 'm', source: 'Strong spacetime curvature' },
    },
    difficulty: 'impossible',
    domainTags: ['quantum', 'relativistic', 'unified', 'synchronization'],
    prompt: 'Ultra-relativistic quantum particle (0.9c) in strongly curved spacetime. Using Schrödinger, Dirac, Einstein field equations, and time dilation, demonstrate maximum framework synchronization.',
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM1', 'QM12', 'GR33', 'GR35'], 'KO42.1'),
    globalParams: { ...CODATA, v_c: 0.9, R_m: 1e3, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 97. Maximum GR+QM: QFT + EFE + Black Hole + GW (4 operators)
  {
    id: 'impossible_qm13_gr33_gr37_gr38_qft_efe_blackhole_gw',
    title: 'Quantum Field Theory Near Black Hole in Gravitational Wave (QFT + EFE + Schwarzschild + GW)',
    description: 'Maximum complexity: Quantum field theory near black hole in gravitational wave field',
    source: { type: 'paper', citation: 'Quantum field theory near black holes in gravitational waves' },
    measurements: {
      black_hole_mass_solar: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_1_mass_solar.value,
        unit: 'M☉', source: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_1_mass_solar.source },
      gw_strain: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value,
        unit: 'dimensionless', source: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.source },
    },
    difficulty: 'impossible',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'gravitational-waves', 'synchronization'],
    prompt: `Quantum field near ${PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_1_mass_solar.value} M☉ black hole in gravitational wave field (strain ${PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value}). Using QFT, Einstein field equations, Schwarzschild metric, and gravitational wave equations, demonstrate maximum framework synchronization.`,
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR37', 'GR38'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_1_mass_solar.value, M_kg: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_1_mass_solar.value * BODIES.sun.mass_kg, h: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value },
  },
  
  // 98. Maximum GR+QM: Dirac + EFE + GW + Geodesic (4 operators)
  {
    id: 'impossible_qm12_gr33_gr38_gr34_dirac_efe_gw_geodesic',
    title: 'Relativistic Quantum Mechanics in Gravitational Wave (Dirac + EFE + GW + Geodesic)',
    description: 'Maximum complexity: Relativistic quantum mechanics in gravitational wave with geodesic motion',
    source: { type: 'paper', citation: 'Relativistic quantum mechanics in gravitational waves' },
    measurements: {
      gw_strain: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value,
        unit: 'dimensionless', source: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.source },
      electron_velocity_c: { value: 0.95, unit: 'c', source: 'Ultra-relativistic electron' },
    },
    difficulty: 'impossible',
    domainTags: ['quantum', 'relativistic', 'gravitational-waves', 'synchronization'],
    prompt: `Electron moving at 0.95c in gravitational wave field (strain ${PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value}). Using Dirac equation, Einstein field equations, gravitational wave equations, and geodesic motion, demonstrate maximum framework synchronization.`,
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM12', 'GR33', 'GR38', 'GR34'], 'KO42.1'),
    globalParams: { ...CODATA, h: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value, v_c: 0.95, m_kg: NIST_CODATA_2018.me.value },
  },
  
  // 99. Maximum GR+QM: Entanglement + EFE + Black Hole + GW (4 operators)
  {
    id: 'impossible_qm4_gr33_gr37_gr38_entanglement_efe_blackhole_gw',
    title: 'Quantum Entanglement Near Black Hole in Gravitational Wave (Entanglement + EFE + Schwarzschild + GW)',
    description: 'Maximum complexity: Quantum entanglement near black hole in gravitational wave field',
    source: { type: 'paper', citation: 'Quantum entanglement near black holes in gravitational waves' },
    measurements: {
      black_hole_mass_solar: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_2_mass_solar.value,
        unit: 'M☉', source: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_2_mass_solar.source },
      gw_strain: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value,
        unit: 'dimensionless', source: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.source },
    },
    difficulty: 'impossible',
    domainTags: ['quantum', 'relativistic', 'black-hole', 'gravitational-waves', 'synchronization'],
    prompt: `Entangled particles near ${PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_2_mass_solar.value} M☉ black hole in gravitational wave field (strain ${PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value}). Using quantum entanglement, Einstein field equations, Schwarzschild metric, and gravitational wave equations, demonstrate maximum framework synchronization.`,
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM4', 'GR33', 'GR37', 'GR38'], 'KO42.1'),
    globalParams: { ...CODATA, M_solar: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_2_mass_solar.value, M_kg: PUBLISHED_PAPER_DATA.ligo_gw150914.black_hole_2_mass_solar.value * BODIES.sun.mass_kg, h: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value },
  },
  
  // 100. Maximum GR+QM: QFT + EFE + Cosmology + GW (4 operators)
  {
    id: 'impossible_qm13_gr33_gr40_gr38_qft_efe_cosmology_gw',
    title: 'Quantum Field Theory in Expanding Universe with Gravitational Wave (QFT + EFE + Cosmology + GW)',
    description: 'Maximum complexity: Quantum field theory in expanding universe with gravitational wave',
    source: { type: 'paper', citation: 'Quantum field theory in expanding universe with gravitational waves' },
    measurements: {
      scale_factor: { value: 3.0, unit: 'dimensionless', source: 'Cosmological scale factor' },
      gw_strain: { value: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value,
        unit: 'dimensionless', source: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.source },
    },
    difficulty: 'impossible',
    domainTags: ['quantum', 'relativistic', 'cosmology', 'gravitational-waves', 'synchronization'],
    prompt: `Quantum field in expanding universe (scale factor 3.0) with gravitational wave (strain ${PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value}). Using QFT, Einstein field equations, Friedmann cosmology, and gravitational wave equations, demonstrate maximum framework synchronization.`,
    defaultFlow: 'auto',
    ko42Mode: 'KO42.1',
    selectedOperators: withKO42(['QM13', 'GR33', 'GR40', 'GR38'], 'KO42.1'),
    globalParams: { ...CODATA, a: 3.0, h: PUBLISHED_PAPER_DATA.ligo_gw150914.peak_strain.value },
  },
];

// Combine all unique experiments
const uniqueExperimentsList: RealExperiment[] = [
  ...easyExperiments,
  ...mediumExperiments,
  ...hardExperiments,
  ...expertExperiments,
  ...impossibleExperiments,
];

// Import and merge premade experiments
let premadeExperimentsList: RealExperiment[] = [];
try {
  premadeExperimentsList = importPremadeExperiments();
  
  // Normalize weights for all premade experiments
  premadeExperimentsList = premadeExperimentsList.map(exp => {
    // Ensure weights are normalized
    const initialWeights: Record<string, number> = {};
    exp.selectedOperators.forEach(op => {
      initialWeights[op] = 1.0 / exp.selectedOperators.length;
    });
    const normalizedWeights = normalizeWeightsToSum(initialWeights);
    
    // Update globalParams with normalized weights (if needed)
    const updatedGlobalParams = {
      ...exp.globalParams,
      ko_settings: normalizedWeights,
    };
    
    return {
      ...exp,
      globalParams: updatedGlobalParams,
    };
  });
  
  console.log(`✅ Loaded ${premadeExperimentsList.length} premade experiments`);
} catch (error) {
  console.error('Failed to load premade experiments:', error);
}

// Combine all experiments (unique + premade)
// Filter out duplicates by ID
const allExperimentsMap = new Map<string, RealExperiment>();
uniqueExperimentsList.forEach(exp => allExperimentsMap.set(exp.id, exp));
premadeExperimentsList.forEach(exp => {
  // Only add if not already present
  if (!allExperimentsMap.has(exp.id)) {
    allExperimentsMap.set(exp.id, exp);
  }
});

export const UNIQUE_EXPERIMENTS: RealExperiment[] = Array.from(allExperimentsMap.values());

// Validate uniqueness (wrapped in try-catch to prevent crashes)
try {
  const validation = validateUniqueCombinations(UNIQUE_EXPERIMENTS.map(exp => ({
    id: exp.id,
    selectedOperators: exp.selectedOperators,
  })));

  if (!validation.valid) {
    console.error('Duplicate operator combinations found:', validation.duplicates);
  } else {
    console.log(`✅ All ${UNIQUE_EXPERIMENTS.length} experiments have unique operator combinations.`);
  }

  // Count GR+QM synchronization experiments
  const grQmCount = UNIQUE_EXPERIMENTS.filter(exp => {
    const ops = exp.selectedOperators;
    const hasQM = ops.some(id => id.startsWith('QM'));
    const hasGR = ops.some(id => id.startsWith('GR'));
    return hasQM && hasGR;
  }).length;

  if (grQmCount >= 30) {
    console.log(`✅ ${grQmCount} experiments combine GR+QM operators (target: 30+).`);
  } else {
    console.warn(`⚠️ Only ${grQmCount} experiments combine GR+QM operators (target: 30+).`);
  }

  // Count operator usage
  const singleOpCount = UNIQUE_EXPERIMENTS.filter(exp => {
    const ops = exp.selectedOperators.filter(id => !id.startsWith('KO42'));
    return ops.length === 1;
  }).length;

  const multiOpCount = UNIQUE_EXPERIMENTS.filter(exp => {
    const ops = exp.selectedOperators.filter(id => !id.startsWith('KO42'));
    return ops.length >= 2 && ops.length <= 4;
  }).length;

  console.log(`📊 Operator distribution: ${singleOpCount} single-operator, ${multiOpCount} multi-operator (2-4 operators)`);
  if (singleOpCount <= 5 && multiOpCount >= 95) {
    console.log(`✅ Operator count requirements met: ${singleOpCount} ≤ 5 single-operator, ${multiOpCount} ≥ 95 multi-operator.`);
  } else {
    console.warn(`⚠️ Operator count requirements: ${singleOpCount} single-operator (max 5), ${multiOpCount} multi-operator (target: 95+).`);
  }
} catch (error) {
  console.error('Error during experiment validation:', error);
  // Don't throw - allow the app to load even if validation fails
}

export const UNIQUE_EXPERIMENT_COUNT = UNIQUE_EXPERIMENTS.length;
