export interface RegistryOperator {
  id: string;
  internalId?: string;
  category: string;
  description: string;
  equation?: string | null;
  equationLaTeX?: string;
}

// Load the local registry (1549 operators).
// Vite supports JSON imports in the browser (ESM).
import registry from '../../../operator-registry.json';

export interface OperatorCatalog {
  total: number;
  operators: RegistryOperator[];
  byId: Record<string, RegistryOperator>;
  categories: string[];
  byCategory: Record<string, RegistryOperator[]>;
}

const typedRegistry = registry as unknown as {
  total: number;
  operators: RegistryOperator[];
};

export function buildCatalog(): OperatorCatalog {
  const operators = (typedRegistry?.operators || []).map((op) => ({
    id: op.id,
    internalId: op.internalId,
    category: op.category,
    description: op.description,
    equation: op.equation ?? null,
    equationLaTeX: op.equationLaTeX,
  }));

  const byId: Record<string, RegistryOperator> = {};
  const byCategory: Record<string, RegistryOperator[]> = {};
  for (const op of operators) {
    byId[op.id] = op;
    if (!byCategory[op.category]) byCategory[op.category] = [];
    byCategory[op.category].push(op);
  }
  const categories = Object.keys(byCategory).sort();
  for (const c of categories) {
    byCategory[c].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }
  return { total: typedRegistry.total || operators.length, operators, byId, categories, byCategory };
}

export function defaultCuratedIds(): string[] {
  // 1549 operators: core physics + computational + industry + extended domains
  // Uses IDs present in the registry; if missing, they're filtered by the caller.
  const ids: string[] = [];

  // Core Physics (Original)
  // KO1..KO100 (kinematic)
  for (let i = 1; i <= 100; i++) ids.push(`KO${i}`);
  // KO42.* / KO42-*
  ids.push('KO42.1', 'KO42.2', 'KO42-5', 'KO42-6', 'KO42-7', 'KO42-8', 'KO42-9', 'KO42-10');
  // QM1..QM30 (quantum)
  for (let i = 1; i <= 30; i++) ids.push(`QM${i}`);
  // NM18..NM30 (newtonian)
  for (let i = 18; i <= 30; i++) ids.push(`NM${i}`);
  // GR31..GR50 (relativity)
  for (let i = 31; i <= 50; i++) ids.push(`GR${i}`);
  // CS43..CS92 (computational)
  for (let i = 43; i <= 92; i++) ids.push(`CS${i}`);

  // Extended Physics (v4.0)
  // TH1..TH15 (thermodynamics)
  for (let i = 1; i <= 15; i++) ids.push(`TH${i}`);
  // EM1..EM15 (electromagnetism)
  for (let i = 1; i <= 15; i++) ids.push(`EM${i}`);
  // FL1..FL10 (fluid dynamics)
  for (let i = 1; i <= 10; i++) ids.push(`FL${i}`);
  // OP1..OP10 (optics)
  for (let i = 1; i <= 10; i++) ids.push(`OP${i}`);
  // AC1..AC7 (acoustics)
  for (let i = 1; i <= 7; i++) ids.push(`AC${i}`);
  // NP1..NP5 (nuclear physics)
  for (let i = 1; i <= 5; i++) ids.push(`NP${i}`);
  // ST1..ST10 (statistics)
  for (let i = 1; i <= 10; i++) ids.push(`ST${i}`);

  // New Domain Operators (v4.0)
  // SP1..SP20 (signal processing)
  for (let i = 1; i <= 20; i++) ids.push(`SP${i}`);
  // CT1..CT20 (control systems)
  for (let i = 1; i <= 20; i++) ids.push(`CT${i}`);
  // GP1..GP20 (geophysics)
  for (let i = 1; i <= 20; i++) ids.push(`GP${i}`);
  // CHE1..CHE20 (chemical engineering)
  for (let i = 1; i <= 20; i++) ids.push(`CHE${i}`);
  // WM1..WM20 (wave mechanics)
  for (let i = 1; i <= 20; i++) ids.push(`WM${i}`);
  // PP1..PP20 (plasma physics)
  for (let i = 1; i <= 20; i++) ids.push(`PP${i}`);
  // CMP1..CMP20 (condensed matter)
  for (let i = 1; i <= 20; i++) ids.push(`CMP${i}`);
  // HEP1..HEP20 (high energy physics)
  for (let i = 1; i <= 20; i++) ids.push(`HEP${i}`);
  // APX1..APX25 (astrophysics)
  for (let i = 1; i <= 25; i++) ids.push(`APX${i}`);
  // OC1..OC15 (oceanography)
  for (let i = 1; i <= 15; i++) ids.push(`OC${i}`);
  // MET1..MET15 (meteorology)
  for (let i = 1; i <= 15; i++) ids.push(`MET${i}`);
  // PHO1..PHO15 (photonics)
  for (let i = 1; i <= 15; i++) ids.push(`PHO${i}`);
  // NE1..NE17 (nuclear engineering)
  for (let i = 1; i <= 17; i++) ids.push(`NE${i}`);
  // TRB1..TRB10 (tribology)
  for (let i = 1; i <= 10; i++) ids.push(`TRB${i}`);
  // RHE1..RHE10 (rheology)
  for (let i = 1; i <= 10; i++) ids.push(`RHE${i}`);
  // ACX1..ACX15 (acoustics extended)
  for (let i = 1; i <= 15; i++) ids.push(`ACX${i}`);
  // SZ1..SZ12 (seismology)
  for (let i = 1; i <= 12; i++) ids.push(`SZ${i}`);
  // HYD1..HYD20 (hydrology)
  for (let i = 1; i <= 20; i++) ids.push(`HYD${i}`);

  // Industry Operators (v4.0)
  ids.push(
    // Medical
    'MED_GFR', 'MED_DOSAGE', 'MED_BMI', 'MED_BSA', 'MED_CREATININE_CLEARANCE',
    'MED_ANION_GAP', 'MED_OSMOLALITY', 'MED_CORRECTED_CALCIUM',
    // Aerospace
    'ORBIT_PERIOD', 'ORBIT_VELOCITY', 'HOHMANN_TRANSFER', 'THRUST_SPECIFIC_IMPULSE',
    'THRUST_DELTA_V', 'ORBIT_ENERGY', 'ESCAPE_VELOCITY', 'ORBITAL_ELEMENTS',
    'LAUNCH_WINDOW', 'REENTRY_HEATING', 'DRAG_COEFFICIENT',
    // Engineering
    'BEAM_DEFLECTION', 'BEAM_STRESS', 'STRESS_VON_MISES', 'BUCKLING_EULER',
    'MOMENT_OF_INERTIA', 'FEA_ELEMENT_STIFFNESS', 'STRESS_CONCENTRATION',
    'FATIGUE_LIFE', 'THERMAL_STRESS', 'COMPOSITE_LAMINATE',
    // Energy
    'SOLAR_POWER', 'SOLAR_EFFICIENCY', 'WIND_POWER', 'POWER_FACTOR',
    'THERMO_CARNOT', 'THERMO_RANKINE', 'HEAT_EXCHANGER', 'BATTERY_CAPACITY',
    'FUEL_CELL_EFFICIENCY', 'GRID_STABILITY',
    // Finance
    'VAR_MONTE_CARLO', 'EXPECTED_SHORTFALL', 'BLACK_SCHOLES', 'BOND_DURATION',
    'SHARPE_RATIO', 'BETA_COEFFICIENT', 'CAPM', 'PORTFOLIO_OPTIMIZATION',
    'MONTE_CARLO_PRICING', 'VOLATILITY_SMILE',
    // Environmental
    'RADIATIVE_FORCING', 'CLIMATE_SENSITIVITY', 'CARBON_FOOTPRINT',
    'AIR_QUALITY_INDEX', 'WATER_QUALITY', 'BIODIVERSITY_INDEX',
    'ECO_FOOTPRINT', 'CARBON_SEQUESTRATION',
    // Material Science
    'CRYSTAL_LATTICE', 'MATERIAL_STRENGTH', 'THERMAL_CONDUCTIVITY',
    'ALLOY_COMPOSITION', 'HARDNESS_CONVERSION', 'NANO_PARTICLE_SIZE',
    'POLYMER_VISCOSITY', 'CORROSION_RATE',
    // Biotech
    'PROTEIN_FOLD', 'BINDING_AFFINITY', 'ENZYME_KINETICS', 'DNA_MELTING',
    'CELL_GROWTH', 'PCR_EFFICIENCY', 'BIO_REACTOR', 'GENE_EXPRESSION',
    // Quantum Computing
    'QUANTUM_SIM', 'ENTANGLEMENT_ENTROPY', 'QUBIT_FIDELITY', 'GROVER_SEARCH',
    'SHOR_FACTOR', 'QUANTUM_ERROR_RATE', 'DECOHERENCE_TIME',
    // Robotics
    'FORWARD_KINEMATICS', 'INVERSE_KINEMATICS', 'JACOBIAN', 'TORQUE_DYNAMICS',
    'PATH_PLANNING', 'TRAJECTORY_OPTIMIZATION',
    // Neuroscience
    'NEURAL_DYNAMICS', 'BRAIN_RHYTHMS', 'EEG_ANALYSIS', 'NEURON_MODEL',
    'SYNAPTIC_TRANSMISSION', 'SPIKE_TIMING',
    // Astronomy
    'STELLAR_EVOLUTION', 'GW_STRAIN', 'EXOPLANET_TRANSIT', 'KEPLER_ORBIT',
    'REDSHIFT', 'HUBBLE_LAW', 'BLACK_HOLE_MASS', 'COSMIC_DISTANCE'
  );

  return Array.from(new Set(ids));
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    // Core physics
    atmospheric_earth_system: 'Atmospheric/Earth',
    consciousness: 'Consciousness',
    cosmic: 'Cosmology',
    kinematic: 'Kinematic',
    quantum: 'Quantum',
    newtonian: 'Newtonian',
    relativity: 'Relativity',
    computational: 'Computer Science',
    differential: 'Differential Equations',
    temporal: 'Temporal',
    special: 'Special',
    // Industry domains (v4.0)
    aerospace: 'Aerospace',
    engineering: 'Engineering',
    energy: 'Energy',
    finance: 'Finance',
    medical: 'Medical',
    environmental: 'Environmental',
    material: 'Material Science',
    biotech: 'Biotechnology',
    quantum_computing: 'Quantum Computing',
    robotics: 'Robotics',
    neuroscience: 'Neuroscience',
    astronomy: 'Astronomy',
    // Extended physics (v4.0)
    signal_processing: 'Signal Processing',
    control_systems: 'Control Systems',
    geophysics: 'Geophysics',
    chemical_engineering: 'Chemical Engineering',
    wave_mechanics: 'Wave Mechanics',
    plasma_physics: 'Plasma Physics',
    condensed_matter: 'Condensed Matter',
    high_energy: 'High Energy Physics',
    astrophysics: 'Astrophysics',
    oceanography: 'Oceanography',
    meteorology: 'Meteorology',
    photonics: 'Photonics',
    nuclear_engineering: 'Nuclear Engineering',
    tribology: 'Tribology',
    rheology: 'Rheology',
    seismology: 'Seismology',
    hydrology: 'Hydrology',
  };
  return map[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

